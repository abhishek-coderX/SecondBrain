# SecondBrain — Project Roadmap & AI Implementation Guide

> **Last Updated:** 2026-06-04
> **Status:** Phase 1 (CRUD App & UI fixes) ✅ Complete | Phase 2 (AI/RAG Layer) 🔲 Not Started | Phase 4 (Razorpay) 🔲 Not Started
> **Current Checkpoint:** UI Refinements, Blended scrollable video, Cream theme dashboard, and white-themed modals are complete. Ready to begin Phase 2 (AI/RAG) and Phase 4 (Razorpay Payments) tomorrow.

---

## 📌 Quick Resume Guide

**Coming back after a break? Read this first:**

1. Check the [Task Checklist](#-task-checklist--checkpoints) below — find the last `[x]` item
2. The next `[ ]` item is where you pick up
3. If confused about any AI term, jump to [AI Glossary](#-ai--rag-terminology-glossary)
4. Start servers: `npm run dev` in both `/backend` and `/frontend`

---

## 1. What Is This Project?

**SecondBrain** is a personal knowledge management app where you save links, tweets, YouTube videos, articles, and raw thoughts — then use **AI to search and ask questions** about everything you've ever saved.

### The Vision

```
Regular Notes App:  Save stuff → Search by title → Find or lose it
SecondBrain:        Save stuff → Ask "what did I read about caching?" → AI finds it + summarizes
```

Think of it like **ChatGPT, but it only knows YOUR saved content**. It becomes smarter as you save more.

---

## 2. What's Built So Far (~65% Complete)

### Backend — `backend/src/`

| File | Purpose | Status |
|------|---------|--------|
| `index.ts` | Express server, CORS, middleware setup (port 4000) | ✅ Done |
| `config/db.ts` | MongoDB connection via Mongoose | ✅ Done |
| `model/user.ts` | User schema (username, hashed password) | ✅ Done |
| `model/content.ts` | Content schema (title, type, link, description, thumbnail, tags, userId) | ✅ Done |
| `model/tag.ts` | Tag schema (name, userId) with unique compound index | ✅ Done |
| `model/link.ts` | Share link schema (hash via nanoid, userId, contentIds) | ✅ Done |
| `routes/auth.ts` | POST /signup, /login, /logout, GET /profile | ✅ Done |
| `routes/contents.ts` | Full CRUD — POST, GET, PUT, DELETE /content | ✅ Done |
| `routes/tags.ts` | GET /tags — fetch user's tags | ✅ Done |
| `routes/share.ts` | POST /share, GET /share/:shareLink | ✅ Done |
| `middlewares/auth.ts` | JWT verification from httpOnly cookies | ✅ Done |
| `middlewares/validate.ts` | Zod schema validation middleware | ✅ Done |
| `utils/zodSchema.ts` | All validation schemas (signup, signin, content, share) | ✅ Done |

### Frontend — `frontend/src/`

| File | Purpose | Status |
|------|---------|--------|
| `App.tsx` | Routes + auth guard + session check on load | ✅ Done |
| `main.tsx` | React entry point with Redux Provider + Router | ✅ Done |
| `store/store.ts` | Redux store setup | ✅ Done |
| `store/authSlice.ts` | Auth state (user object) | ✅ Done |
| `types/type.ts` | TypeScript interfaces (Content, Tag, ContentType) | ✅ Done |
| `pages/LandingPage.tsx` | Video hero, features grid, scroll-reveal animations | ✅ Done |
| `pages/Login.tsx` | Login/Signup form with toggle | ✅ Done |
| `pages/ContentPage.tsx` | Dashboard — masonry cards, filtering, loading states | ✅ Done |
| `pages/MainLayout.tsx` | Sidebar + content area wrapper | ✅ Done |
| `pages/SharePage.tsx` | Public shared content view | ✅ Done |
| `components/Cards.tsx` | Content card (YouTube embed, tweet embed, article) | ✅ Done |
| `components/CreateContentModal.tsx` | Modal for adding new content | ✅ Done |
| `components/ShareModal.tsx` | Modal for selecting + sharing content | ✅ Done |
| `components/SideBar.tsx` | Navigation sidebar with type filters | ✅ Done |

### Content Types Supported

- `youtube` — YouTube video links (with embedded player)
- `twitter` — Tweet links (with react-tweet embed)
- `article` — Web article links
- `thought` — Raw text/ideas (no link required)

### What's NOT Built Yet (The AI Layer — ~35%)

| Feature | What It Does |
|---------|-------------|
| **Semantic Search** | Ask questions in natural language, find relevant saved content |
| **RAG Pipeline** | Retrieve your content + feed it to an AI to generate answers |
| **Embeddings** | Convert your saved content into vectors for meaning-based search |
| **AI Chat Interface** | "Ask your brain" — ChatGPT-style UI within the app |
| **Weekly/Monthly Recap** | AI-generated summary of what you saved |

---

## 3. 🧠 AI / RAG Terminology Glossary

### Embedding

**What:** Converting text into a list of numbers (called a vector) that captures its **meaning**.

**Analogy:** Imagine every sentence has a GPS coordinate in "meaning-space." Similar meanings = nearby coordinates.

```
"I love coding"        → [0.23, -0.15, 0.87, 0.42, ...]  (1536 numbers)
"I enjoy programming"  → [0.25, -0.13, 0.85, 0.44, ...]  ← VERY similar!
"The weather is nice"  → [0.91, 0.33, -0.72, 0.11, ...]  ← VERY different!
```

**How we use it:** Send your saved content's text to an Embedding API (like OpenAI), get back numbers, store them.

**Cost:** OpenAI `text-embedding-3-small` = $0.02 per 1 million tokens (~750k words). Practically free.

---

### Vector

**What:** Just a list of numbers. An embedding IS a vector.

- 2D vector: `[3, 4]` — a point on a flat map
- 1536D vector: `[0.12, 0.85, ..., 0.67]` — a point in meaning-space

We can't visualize 1536 dimensions, but math still works — we can calculate **distance** between any two.

---

### Vector Database / Vector Search

**What:** A database (or search feature) optimized for finding "nearby" vectors quickly.

**Regular DB query:** "Find content where title contains 'caching'" — exact text match
**Vector search query:** "Find content whose meaning is closest to 'how Netflix handles caching'" — meaning match

**What we'll use:** MongoDB Atlas Vector Search (built into MongoDB — no extra DB needed).

---

### Cosine Similarity

**What:** Math formula to measure how "similar" two vectors are. Score from -1 to 1.

```
similarity("I love dogs", "I adore puppies")  = 0.94  ← nearly identical meaning
similarity("I love dogs", "quantum physics")   = 0.12  ← totally unrelated
```

You don't implement this — the Vector DB does it for you automatically.

---

### LLM (Large Language Model)

**What:** The AI brain — GPT-4, Claude, Gemini, etc. It understands and generates human text.

**The problem:** LLMs only know their training data. They don't know YOUR saved content.

**The solution:** RAG.

---

### RAG (Retrieval-Augmented Generation)

**What:** A 3-step pattern that lets an LLM answer questions using YOUR data:

```
Step 1 — RETRIEVE:  Search your vector DB → find the 5 most relevant saved items
Step 2 — AUGMENT:   Paste those items into the prompt as "context"
Step 3 — GENERATE:  LLM reads the context and writes an answer

Example:
  User asks: "What did I save about system design?"

  Step 1: Vector search finds 3 matching items from your DB
  Step 2: Prompt becomes: "Given this context: [Article 1], [Tweet 2], [Video 3]..."
  Step 3: LLM says: "You saved an article about Netflix caching, a tweet about
           database sharding, and a video on microservices..."
```

**Why not just fine-tune the LLM on your data?**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Fine-tuning | Model "knows" your data | Expensive, slow retraining, can't remove data | ❌ Overkill |
| RAG | Cheap, instant updates, per-user isolation | Slightly slower (extra retrieval step) | ✅ Perfect |

---

### Chunking

**What:** Splitting long text into smaller pieces before creating embeddings.

A 5000-word article as one vector? Too vague. Split into 3-5 chunks of ~500 words each → each chunk gets its own precise vector → better search results.

---

### Token

**What:** The unit LLMs process. ~1 token ≈ 0.75 words.

- "Hello world" = 2 tokens
- 1000 words ≈ 1333 tokens
- You pay per token when using APIs

RAG is cost-effective: instead of sending ALL your data, you retrieve only 5-10 relevant chunks.

---

### Prompt Engineering

**What:** Crafting instructions for the LLM to get quality answers.

```
BAD:   "Answer the question."
GOOD:  "You are a knowledge assistant. Use ONLY the following context
        from the user's saved content. If the answer isn't in the
        context, say 'I couldn't find that in your saved content.'
        Always cite which saved item the info came from."
```

---

### The Two Pipelines (How It All Connects)

```
INGESTION (when user saves content):
  User saves article → Extract text → Generate embedding → Store vector in DB

QUERY (when user asks a question):
  User asks question → Embed the question → Vector search (find similar) →
  Retrieve top 5 matches → Build LLM prompt with context → LLM generates answer →
  Show answer with citations
```

---

## 4. Full MVP Roadmap

```
Phase 1: CRUD App ✅ COMPLETE
  ├── Auth (JWT + bcrypt + cookies)
  ├── Content CRUD (create, read, update, delete)
  ├── Tag system (auto-create, per-user)
  ├── Share system (nanoid hash links)
  ├── Frontend (Landing, Auth, Dashboard, Share pages)
  └── UI (dark theme, glassmorphism, animations)

Phase 2: AI / RAG Layer 🔲 NOT STARTED
  ├── 2A: Embedding Infrastructure
  ├── 2B: Vector Search
  ├── 2C: RAG + LLM Integration
  └── 2D: Frontend AI UI

Phase 3: Polish & Extras 🔲 NOT STARTED
  ├── Streaming responses
  ├── Deploy to production
  └── Performance optimization

Phase 4: Payment Gateway Integration (Razorpay) 🔲 NOT STARTED
  ├── 4A: Backend Order API (amount in paise, INR)
  ├── 4B: Frontend Checkout Script & Checkout Modal
  └── 4C: Signature Verification & User Plan Upgrade
```

---

## 5. ✅ Task Checklist & Checkpoints

### Phase 2A: Embedding Infrastructure

- [ ] **2A.1** Get an OpenAI API key (https://platform.openai.com/api-keys)
  - Create account, add $5 credit, generate API key
  - Add `OPENAI_API_KEY=sk-...` to `backend/.env`
  - Install: `npm install openai` in backend

- [ ] **2A.2** Create `backend/src/utils/embeddings.ts`
  - Helper function: takes text string → returns number array (vector)
  - Uses OpenAI `text-embedding-3-small` model (1536 dimensions)
  - Handle errors and rate limiting

- [ ] **2A.3** Add embedding field to Content model
  - Add `embedding: { type: [Number], default: [] }` to `model/content.ts`
  - This stores the vector alongside the content document

- [ ] **2A.4** Generate embedding on content creation
  - In `routes/contents.ts` POST handler:
  - After saving content → concatenate title + description + type
  - Call embedding helper → save vector to the content document

- [ ] **2A.5** Create backfill script for existing content
  - Script: `backend/src/scripts/backfill-embeddings.ts`
  - Finds all content without embeddings → generates and saves them
  - Run once to backfill, then new content gets embedded automatically

**🏁 Checkpoint 2A: All content has embeddings stored in MongoDB**

---

### Phase 2B: Vector Search

- [ ] **2B.1** Create MongoDB Atlas Vector Search Index
  - In Atlas dashboard → Search tab → Create vector index
  - Index on the `embedding` field, 1536 dimensions, cosine similarity
  - OR: if using local MongoDB, we'll use an alternative approach

- [ ] **2B.2** Create `backend/src/routes/search.ts`
  - GET `/search?q=your question here`
  - Embed the query → run vector search → return top 5-10 matching content
  - Filter by `userId` so users only search their own content

- [ ] **2B.3** Register search route in `backend/src/index.ts`
  - Import and mount: `app.use('/', searchRouter)`

- [ ] **2B.4** Test vector search via Postman/Thunder Client
  - Save 5-10 diverse content items
  - Search with various natural language queries
  - Verify results are semantically relevant (not just keyword matches)

**🏁 Checkpoint 2B: Semantic search works via API**

---

### Phase 2C: RAG + LLM Integration

- [ ] **2C.1** Create `backend/src/utils/llm.ts`
  - Helper function: takes prompt + context → returns AI-generated answer
  - Uses OpenAI `gpt-4o-mini` (cheap, fast, good enough)
  - Implement retry logic and error handling

- [ ] **2C.2** Create `backend/src/routes/ask.ts`
  - POST `/ask` with body: `{ question: "..." }`
  - Full RAG pipeline:
    1. Embed the question
    2. Vector search → get top 5 matching chunks
    3. Fetch full content from MongoDB
    4. Build system prompt with context
    5. Call LLM → return answer + content citations

- [ ] **2C.3** Design the system prompt
  - Role: "You are a personal knowledge assistant"
  - Rules: Only use provided context, cite sources, say "not found" if irrelevant
  - Format: Return structured JSON with answer + cited contentIds

- [ ] **2C.4** Register ask route in `backend/src/index.ts`
  - Import and mount: `app.use('/', askRouter)`

- [ ] **2C.5** Test RAG pipeline end-to-end
  - Save 10+ items about different topics
  - Ask questions that span multiple saved items
  - Verify answers reference the correct content

**🏁 Checkpoint 2C: Full RAG works — ask a question, get an AI answer based on YOUR saved content**

---

### Phase 2D: Frontend AI Interface

- [ ] **2D.1** Create `frontend/src/components/SearchBar.tsx`
  - Search input in the content dashboard header
  - Debounced input → calls GET `/search?q=...`
  - Shows matching content cards as results

- [ ] **2D.2** Create `frontend/src/components/AskBrain.tsx`
  - Chat-style panel/modal — "Ask your brain anything"
  - Text input → calls POST `/ask`
  - Shows AI answer with clickable citations to saved content
  - Chat history within the session

- [ ] **2D.3** Integrate into ContentPage
  - Add SearchBar to the page header
  - Add "Ask Brain" button that opens the AskBrain panel
  - Smooth transitions and loading states

- [ ] **2D.4** Polish the UI
  - Typing indicator while LLM responds
  - Citation cards that link to the original content
  - Empty state and error handling
  - Mobile responsive

**🏁 Checkpoint 2D: Users can search semantically AND ask their brain questions from the UI**

---

### Phase 3: Polish & Extras

- [ ] **3.1** Streaming responses (typewriter effect like ChatGPT)
- [ ] **3.2** Weekly/Monthly AI recap
- [ ] **3.3** Smart suggestions
- [ ] **3.4** Production deployment (Railway + Vercel + MongoDB Atlas)

**🏁 Final Checkpoint: Production-ready SecondBrain with AI features**

---

## 6. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  React + Vite + Tailwind + Redux                                │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Landing  │  │  Auth    │  │Dashboard │  │  Ask Brain   │    │
│  │  Page    │  │  Page    │  │  Page    │  │   (NEW)      │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
└───────────────────────┬──────────────────────────────────────────┘
                        │ HTTP + Cookies
┌───────────────────────▼──────────────────────────────────────────┐
│                         BACKEND                                  │
│  Express + TypeScript                                            │
│                                                                  │
│  ┌────────┐ ┌─────────┐ ┌───────┐ ┌────────┐ ┌──────┐         │
│  │ Auth   │ │ Content │ │ Tags  │ │ Share  │ │Search│ (NEW)    │
│  │ Routes │ │ Routes  │ │Routes │ │ Routes │ │& Ask │          │
│  └────────┘ └─────────┘ └───────┘ └────────┘ └──────┘         │
│                                                                  │
│  ┌────────────────┐  ┌──────────────────┐                       │
│  │ embeddings.ts  │  │    llm.ts        │  (NEW helpers)        │
│  │ text → vector  │  │ prompt → answer  │                       │
│  └───────┬────────┘  └────────┬─────────┘                       │
└──────────┼────────────────────┼──────────────────────────────────┘
           │                    │
    ┌──────▼──────┐    ┌───────▼────────┐
    │  OpenAI     │    │   OpenAI       │
    │  Embedding  │    │   GPT-4o-mini  │
    │  API        │    │   API          │
    └─────────────┘    └────────────────┘
           │
    ┌──────▼──────────────────────────────┐
    │           MongoDB                    │
    │  ┌──────┐ ┌───────┐ ┌────┐ ┌────┐  │
    │  │Users │ │Content│ │Tags│ │Link│  │
    │  │      │ │+vector│ │    │ │    │  │
    │  └──────┘ └───────┘ └────┘ └────┘  │
    │                                      │
    │  + Atlas Vector Search Index         │
    └──────────────────────────────────────┘
```

---

## 7. New Files to Create (Summary)

| File | Purpose |
|------|---------|
| `backend/src/utils/embeddings.ts` | **NEW** — Helper to generate embeddings via OpenAI |
| `backend/src/utils/llm.ts` | **NEW** — Helper to call LLM for RAG answers |
| `backend/src/routes/search.ts` | **NEW** — Semantic search endpoint |
| `backend/src/routes/ask.ts` | **NEW** — RAG "ask your brain" endpoint |
| `backend/src/scripts/backfill-embeddings.ts` | **NEW** — One-time script to embed existing content |
| `frontend/src/components/SearchBar.tsx` | **NEW** — Semantic search UI |
| `frontend/src/components/AskBrain.tsx` | **NEW** — Chat-style AI Q&A panel |

## 8. Files to Modify

| File | Change |
|------|--------|
| `backend/src/model/content.ts` | Add `embedding` vector field |
| `backend/src/routes/contents.ts` | Generate embedding on create |
| `backend/src/index.ts` | Register new search + ask routes |
| `frontend/src/pages/ContentPage.tsx` | Add search bar + ask brain button |

---

## 9. Quick Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Install new backend dependency
cd backend && npm install <package>

# Backfill embeddings (after Phase 2A is complete)
cd backend && npx ts-node src/scripts/backfill-embeddings.ts
```

---

## 10. Phase 4: Payment Gateway Integration (Razorpay)

### How Razorpay Integration Works in SecondBrain

We can use **Razorpay** as our payment gateway to charge for **Pro** and **Premium** plans in INR (₹).

#### Step-by-Step Integration Plan:

1. **Step 1: Set up Razorpay Account**
   - Register at [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Switch to **Test Mode** (no real KYC required for testing)
   - Generate API keys: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
   - Save these to `backend/.env`

2. **Step 2: Install SDK on Backend**
   - Install the SDK: `cd backend && npm install razorpay`
   - Import in routes: `import Razorpay from 'razorpay';`

3. **Step 3: Create Checkout Order Route (Backend)**
   - Create `backend/src/routes/payment.ts`
   - Route `POST /payment/order` that takes `{ planId, billingPeriod }` and generates a Razorpay Order:
     ```typescript
     const options = {
       amount: planId === 'pro' ? 29900 : 69900, // Amount in paise (e.g. ₹299 = 29900 paise)
       currency: "INR",
       receipt: `receipt_${Date.now()}`
     };
     const order = await razorpay.orders.create(options);
     res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
     ```

4. **Step 4: Load Razorpay Checkout Script (Frontend)**
   - Add Razorpay Checkout script to `frontend/index.html` or load it dynamically:
     `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`

5. **Step 5: Trigger Checkout Modal on Frontend**
   - In `LandingPage.tsx`, replace the mock credit card checkout flow with the real Razorpay checkout:
     ```javascript
     const handlePayment = async (plan) => {
       // 1. Call backend POST /payment/order to get orderId
       const res = await axios.post('/payment/order', { planId: plan.id });
       const { orderId, amount, currency } = res.data;
       
       // 2. Open Razorpay checkout modal
       const options = {
         key: "YOUR_RAZORPAY_KEY_ID",
         amount,
         currency,
         name: "SecondBrain",
         description: `${plan.name} Subscription`,
         order_id: orderId,
         handler: async function (response) {
           // 3. Verify signature on backend
           const verification = await axios.post('/payment/verify', {
             razorpay_order_id: response.razorpay_order_id,
             razorpay_payment_id: response.razorpay_payment_id,
             razorpay_signature: response.razorpay_signature
           });
           if (verification.data.success) {
             // Upgrade UI / redirect to content
           }
         },
         prefill: { email: user.email }
       };
       const rzp = new window.Razorpay(options);
       rzp.open();
     };
     ```

6. **Step 6: Signature Verification (Backend Security)**
   - Route `POST /payment/verify` to verify authenticity using crypto:
     ```typescript
     import crypto from 'crypto';
     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
     const body = razorpay_order_id + "|" + razorpay_payment_id;
     const expectedSignature = crypto
       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
       .update(body.toString())
       .digest('hex');
       
     if (expectedSignature === razorpay_signature) {
       // Payment is legitimate!
       // Update user document's active plan to 'pro' / 'premium'
       res.json({ success: true });
     } else {
       res.status(400).json({ success: false, message: "Signature verification failed" });
     }
     ```

### Phase 4 Checklist

- [ ] **4.1** Register at Razorpay Dashboard (https://dashboard.razorpay.com/) and grab Test API Keys
- [ ] **4.2** Add keys (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) to `backend/.env`
- [ ] **4.3** Install Razorpay SDK: `cd backend && npm install razorpay`
- [ ] **4.4** Create Order creation endpoint `POST /payment/order`
- [ ] **4.5** Include Razorpay Checkout script in `frontend/index.html`
- [ ] **4.6** Hook checkout button to trigger dynamic `window.Razorpay` modal checkout on Frontend
- [ ] **4.7** Create signature validation endpoint `POST /payment/verify` using SHA256 HMAC
- [ ] **4.8** Upgrade user's subscription model in MongoDB on payment success

**🏁 Checkpoint 4: Real-time INR checkout flows securely through Razorpay**

---

> **Key Reminder:** You're NOT building AI from scratch. You're calling 3 APIs:
> 1. **Embedding API** → text to numbers
> 2. **Vector DB** → find similar numbers
> 3. **LLM API** → read context and answer questions
>
> You already know how to call APIs with Express. This is the same thing.
