import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import Content from "../model/content";
import { getEmbedding, cosineSimilarity } from "../utils/embeddings";
import { generateAnswer, ai } from "../utils/llm";
import ChatSession from "../model/chatSession";

const askRouter = Router();

askRouter.use(authMiddleware);

askRouter.post("/ask", async (req: AuthRequest, res) => {
  try {
    const { question, history, sessionId } = req.body;
    const userId = req.userId!;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: "Question is required." });
    }

    // ═══ STAGE 1: INTENT CLASSIFICATION ═══

    const classifyResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a message classifier. Classify the following user message into exactly ONE category. 
      
      Reply with ONLY the JSON object, no explanation, no markdown:
      {"category": "CATEGORY", "confidence": 0.95}
      
      Categories:
      - GREETING: casual conversation, greetings, thanks, how are you, bye, small talk
      - META: asking about what is saved/stored in brain, listing content, summarizing brain contents, "what do I have", "show everything"
      - FOLLOWUP: continuing a previous conversation, "tell me more", "explain further", "what about that", references to previous messages
      - SPECIFIC: asking about a specific topic, concept, person, technology that may or may not be in the brain
      
      Conversation history for context:
      ${(history || []).slice(-3).map((m: any) => `${m.role}: ${m.content}`).join('\n')}
      
      Current message: "${question}"`,
      config: { temperature: 0 }
    });

    let category = 'SPECIFIC';
    let confidence = 0.8;
    try {
      const raw = classifyResponse.text?.trim() || '{}';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      category = parsed.category || 'SPECIFIC';
      confidence = parsed.confidence || 0.8;
    } catch {
      category = 'SPECIFIC';
    }

    // ═══ STAGE 2: HANDLE BASED ON CATEGORY ═══

    // Build conversation context from history for all responses
    const conversationContext = (history || [])
      .slice(-6)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    // GREETING handler
    if (category === 'GREETING') {
      const systemInstruction = `You are SecondBrain AI, a friendly personal knowledge assistant. 
         Respond naturally and briefly to this greeting or casual message.
         Previous conversation:\n${conversationContext}`;
      const { text: greetingAnswer } = await generateAnswer(question, systemInstruction, false);
      
      if (sessionId) {
        await ChatSession.findByIdAndUpdate(sessionId, {
          $push: { messages: { $each: [
            { role: 'user', content: question },
            { 
              role: 'assistant', 
              content: greetingAnswer, 
              references: [],
              webSources: [],
              source: 'greeting'
            }
          ]}}
        });
      }
      
      return res.status(200).json({ answer: greetingAnswer, references: [], source: 'greeting' });
    }

    // Fetch all user content for other handlers
    const contents = await Content.find({ userId })
      .select("+embedding")
      .populate("tags", "name")
      .populate("userId", "username");

    // META handler — user asking about their brain contents
    if (category === 'META') {
      const allContents = contents.map((item: any, idx: number) =>
        `[${idx + 1}] Title: "${item.title}" | Type: ${item.type} | Description: ${item.description || 'No description'}`
      ).join('\n');

      const metaSystemInstruction = `You are SecondBrain AI. The user is asking about what they have saved in their personal knowledge base.

Here is a complete list of everything saved in their SecondBrain:
${allContents || 'Nothing saved yet.'}

Previous conversation:
${conversationContext}

Instructions:
- Summarize what they have saved in a natural, conversational way
- Group by type if there are many items (videos, articles, tweets, thoughts)
- Be concise but complete
- Don't use internal field names like "type" or "description" — speak naturally`;

      const { text: metaAnswer } = await generateAnswer(question, metaSystemInstruction, false);

      if (sessionId) {
        await ChatSession.findByIdAndUpdate(sessionId, {
          $push: { messages: { $each: [
            { role: 'user', content: question },
            { 
              role: 'assistant', 
              content: metaAnswer, 
              references: [],
              webSources: [],
              source: 'brain'
            }
          ]}}
        });
        const session = await ChatSession.findById(sessionId);
        if (session?.title === 'New Chat') {
          await ChatSession.findByIdAndUpdate(sessionId, {
            title: question.slice(0, 40)
          });
        }
      }

      return res.status(200).json({ answer: metaAnswer, references: [], source: 'brain' });
    }

    // FOLLOWUP handler — use conversation history as primary context
    if (category === 'FOLLOWUP') {
      const followupSystemInstruction = `You are SecondBrain AI. The user is continuing a previous conversation.

Previous conversation:
${conversationContext}

Brain content for reference:
${contents.slice(0, 10).map((item: any) => 
  `Title: "${item.title}" | Type: ${item.type} | Description: ${item.description || 'N/A'}`
).join('\n')}

Answer the follow-up naturally based on the conversation context. 
Cite brain sources if relevant using (Source: title).`;

      const { text: followupAnswer } = await generateAnswer(question, followupSystemInstruction, false);

      if (sessionId) {
        await ChatSession.findByIdAndUpdate(sessionId, {
          $push: { messages: { $each: [
            { role: 'user', content: question },
            { 
              role: 'assistant', 
              content: followupAnswer, 
              references: [],
              webSources: [],
              source: 'brain'
            }
          ]}}
        });
      }

      return res.status(200).json({ answer: followupAnswer, references: [], source: 'brain' });
    }

    // SPECIFIC handler — existing semantic search flow
    // 1. Get embedding for the user's question
    const queryEmbedding = await getEmbedding(question);

    // 2. Compute cosine similarity scores
    const scoredContents = contents
      .map((item: any) => {
        const itemObj = item.toObject();
        const similarity =
          item.embedding && item.embedding.length > 0
            ? cosineSimilarity(queryEmbedding, item.embedding)
            : 0;
        delete itemObj.embedding;
        return { ...itemObj, score: similarity };
      })
      .filter((item) => item.score > 0.6)
      .sort((a, b) => b.score - a.score);

    // 4. Retrieve top 3, prune to dominant result if gap > 0.15
    let topMatches = scoredContents.slice(0, 3);
    if (topMatches.length >= 2 && topMatches[0].score - topMatches[1].score > 0.15) {
      topMatches = [topMatches[0]];
    }

    // 5. Build lean context string (title + type + description only)
    const contextString = topMatches
      .map((item, idx) => {
        return `[Source ${idx + 1}]\nTitle: ${item.title}\nType: ${item.type}\nDescription: ${item.description || "N/A"}`;
      })
      .join("\n\n");

    // If brain has good matches, use brain context without web search
    // If brain has no matches, use web search
    const hasBrainContext = topMatches.length > 0;

    const specificSystemInstruction = hasBrainContext
      ? `You are SecondBrain AI.
      
Context from user's SecondBrain:
${contextString}

Previous conversation:
${conversationContext}

Rules:
1. Answer using the brain context provided
2. Cite sources inline like (Source: title)
3. Never mention tags, URLs, or metadata
4. Be concise and conversational
5. Start your response with exactly: "🧠 From your SecondBrain:\n\n"`
      : `You are SecondBrain AI. 
      
The user's SecondBrain has no saved content about this topic.
Previous conversation:
${conversationContext}

Rules:
1. Search the web and answer from current information
2. Be helpful and accurate  
3. Start your response with exactly: "💡 Not in your SecondBrain, but here's what I know:\n\n"
4. Mention if the information might be outdated`;

    const { text: specificAnswer, groundingChunks } = await generateAnswer(
      question,
      specificSystemInstruction,
      !hasBrainContext  // only use web search when brain has no context
    );

    // Build web sources from grounding chunks
    const webSources = (groundingChunks || [])
      .filter((chunk: any) => chunk?.web?.uri)
      .slice(0, 3)
      .map((chunk: any) => ({
        title: chunk.web.title || chunk.web.uri,
        url: chunk.web.uri
      }));

    // Save to session
    if (sessionId) {
      try {
        await ChatSession.findByIdAndUpdate(sessionId, {
          $push: {
            messages: {
              $each: [
                { role: 'user', content: question },
                { 
                  role: 'assistant', 
                  content: specificAnswer, 
                  references: hasBrainContext ? topMatches : [],
                  webSources: webSources,
                  source: hasBrainContext ? 'brain' : 'web'
                }
              ]
            }
          },
          $set: { updatedAt: new Date() }
        });

        const session = await ChatSession.findById(sessionId);
        if (session && session.title === 'New Chat' && session.messages.length <= 2) {
          await ChatSession.findByIdAndUpdate(sessionId, {
            title: question.slice(0, 40)
          });
        }
      } catch (err) {
        console.error("Failed to save to session:", err);
      }
    }

    return res.status(200).json({
      answer: specificAnswer,
      references: hasBrainContext ? topMatches : [],
      webSources: webSources,
      source: hasBrainContext ? 'brain' : 'web'
    });
  } catch (error) {
    console.error("❌ Ask SecondBrain error:", error);
    res.status(500).json({ message: "Server error while processing request." });
  }
});

export default askRouter;

