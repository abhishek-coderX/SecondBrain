import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import Content from "../model/content";
import User from "../model/user";
import { getEmbedding, cosineSimilarity } from "../utils/embeddings";
import { generateAnswer, ai } from "../utils/llm";
import { decrypt } from "../utils/crypto";
import ChatSession from "../model/chatSession";
import { GoogleGenAI } from "@google/genai";

const askRouter = Router();

askRouter.use(authMiddleware);

askRouter.post("/ask", async (req: AuthRequest, res) => {
  try {
    const { question, history, sessionId } = req.body;
    const userId = req.userId!;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: "Question is required." });
    }

    const user = await User.findById(userId);
    let customApiKey: string | undefined;
    if (user?.geminiApiKey) {
      try {
        customApiKey = decrypt(user.geminiApiKey);
      } catch (err) {
        console.error("Failed to decrypt user API key, using server default key:", err);
      }
    }
    const aiInstance = customApiKey ? new GoogleGenAI({ apiKey: customApiKey }) : ai;

    let classifyResponse: any = null;
    let classifyAttempts = 3;
    let classifyDelay = 1000;
    
    for (let i = 0; i < classifyAttempts; i++) {
      try {
        classifyResponse = await aiInstance.models.generateContent({
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
        break; // success
      } catch (err: any) {
        const isRetryable = err?.status === 503 || err?.status === 429 || 
                            err?.message?.includes("503") || err?.message?.includes("429");
        if (isRetryable && i < classifyAttempts - 1) {
          console.warn(`⏳ Classifier busy (Attempt ${i + 1}/${classifyAttempts}), retrying in ${classifyDelay / 1000}s...`);
          await new Promise((r) => setTimeout(r, classifyDelay));
          classifyDelay *= 2;
          continue;
        }
        throw err;
      }
    }

    if (!classifyResponse) {
      throw new Error("AI classifier failed to respond");
    }

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

    const conversationContext = (history || [])
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    if (category === 'GREETING') {
      const systemInstruction = `You are SecondBrain AI, a friendly personal knowledge assistant. 
         Respond naturally and briefly to this greeting or casual message.
         Previous conversation:\n${conversationContext || 'None'}`;
      const { text: greetingAnswer } = await generateAnswer(question, systemInstruction, false, customApiKey);
      
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

    const contents = await Content.find({ userId })
      .select("+embedding")
      .populate("tags", "name")
      .populate("userId", "username");

    if (category === 'META') {
      const allContents = contents.map((item: any, idx: number) =>
        `[${idx + 1}] Title: "${item.title}" | Type: ${item.type} | Description: ${item.description || 'No description'}`
      ).join('\n');

      const metaSystemInstruction = `You are SecondBrain AI. The user is asking about what they have saved in their personal knowledge base.

Here is a complete list of everything saved in their SecondBrain:
${allContents || 'Nothing saved yet.'}

Previous conversation:
${conversationContext || 'None'}

Instructions:
- Summarize what they have saved in a natural, conversational way
- Group by type if there are many items (videos, articles, tweets, thoughts)
- Be concise but complete
- Don't use internal field names like "type" or "description" — speak naturally`;

      const { text: metaAnswer } = await generateAnswer(question, metaSystemInstruction, false, customApiKey);

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

    if (category === "SPECIFIC" || category === "FOLLOWUP") {
      const queryEmbedding = await getEmbedding(question, customApiKey);

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

      let topMatches = scoredContents.slice(0, 3);
      if (topMatches.length >= 2 && topMatches[0].score - topMatches[1].score > 0.15) {
        topMatches = [topMatches[0]];
      }

      const contextString = topMatches
        .map((item, idx) => {
          return `[Source ${idx + 1}]\nTitle: ${item.title}\nType: ${item.type}\nDescription: ${item.description || "N/A"}`;
        })
        .join("\n\n");

      const hasBrainContext = topMatches.length > 0;

      const specificSystemInstruction = hasBrainContext
        ? `You are SecondBrain AI.
      
Context from user's SecondBrain:
${contextString}

Previous conversation:
${conversationContext || 'None'}

Rules:
1. Answer using the brain context provided
2. Cite sources inline like (Source: title)
3. Never mention tags, URLs, or metadata
4. Be concise and conversational
${category === "FOLLOWUP" ? "This is a follow-up query, so integrate previous conversation context naturally." : ""}
5. Start your response with exactly: "🧠 From your SecondBrain:\n\n"`
        : `You are SecondBrain AI. 
      
The user's SecondBrain has no saved content about this topic.
Previous conversation:
${conversationContext || 'None'}

Rules:
1. Search the web and answer from current information
2. Be helpful and accurate  
3. Start your response with exactly: "💡 Not in your SecondBrain, but here's what I know:\n\n"
4. Mention if the information might be outdated`;

      const { text: specificAnswer, groundingChunks } = await generateAnswer(
        question,
        specificSystemInstruction,
        !hasBrainContext,
        customApiKey
      );

      const webSources = (groundingChunks || [])
        .filter((chunk: any) => chunk?.web?.uri)
        .slice(0, 3)
        .map((chunk: any) => ({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri
        }));

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
    }
  } catch (error: any) {
    // Check if it's an AI rate limit or busy error
    const msg = (error?.message || "").toLowerCase();
    const isAiQuota = 
      error?.status === 429 || 
      error?.status === 503 || 
      msg.includes("429") || 
      msg.includes("503") || 
      msg.includes("quota") || 
      msg.includes("limit") || 
      msg.includes("busy") || 
      msg.includes("exhausted") || 
      msg.includes("overloaded");

    if (isAiQuota) {
      console.warn("⏳ Gemini API rate limit reached (429/503).");
      return res.status(429).json({ 
        message: "⏳ Gemini API rate limit reached.",
        rateLimit: true
      });
    }

    console.error("❌ Ask SecondBrain error:", error);
    res.status(500).json({ message: "Server error while processing request." });
  }
});

export default askRouter;

