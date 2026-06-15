# SecondBrain 🧠

A RAG-based personal knowledge management system. Save YouTube videos, tweets, articles, and thoughts — then semantically search and chat with your saved content using AI.

## Live Demo
🔗 [secondbrain-app.vercel.app](#) <!-- update after deployment -->

🎯 **Demo Account** — Username: `demo` | Password: `Demo@1234`

## Features
- 🧠 **Ask Your Brain** — RAG chat grounded in your saved content with Google Search fallback
- 🔍 **Semantic Search** — Search by meaning using Gemini embeddings, not just keywords
- 📦 **Capture Everything** — YouTube videos, tweets, articles, and raw thoughts
- 💬 **Chat History** — Persistent conversation sessions with search
- 🏷️ **Tag Filtering** — Organize and filter content by tags and type
- 🔗 **Share Brain** — Generate public share links for curated collections
- ✏️ **Full CRUD** — Edit cards with auto embedding regeneration
- 🌐 **Web Search Fallback** — Answers from web when brain has no context

## Tech Stack

**Backend:** Node.js · Express.js · TypeScript · MongoDB · Mongoose · JWT · Zod · Google Gemini API

**Frontend:** React · TypeScript · Vite · Tailwind CSS · Redux Toolkit · Axios · React Markdown · React Masonry CSS

## RAG Architecture
Save content

→ Build embedding text (title + description + type)

→ Generate Gemini embedding (3072 dimensions)

→ Store vector in MongoDB (select: false)
User asks question

→ Classify intent (GREETING / META / FOLLOWUP / SPECIFIC)

→ Embed query → Cosine similarity search

→ Feed top matches as context to Gemini 2.5 Flash

→ Grounded answer with source citations

→ Fallback to Google Search if brain has no context

→ Save to persistent chat session

## Local Setup

**Prerequisites:** Node.js 18+, MongoDB running locally

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Backend `.env`**

MONGO_URI=mongodb://localhost:27017/secondBrain

JWT_SECRET=your_jwt_secret_here

GEMINI_API_KEY=your_gemini_api_key_here

ALLOWED_ORIGIN=http://localhost:5173

NODE_ENV=development
**Frontend `.env`**
VITE_API_URL=http://localhost:4000

## Project Structure
SecondBrain/

├── backend/

│   ├── src/

│   │   ├── config/        # DB connection

│   │   ├── middlewares/   # Auth, validation

│   │   ├── model/         # MongoDB schemas

│   │   ├── routes/        # API endpoints

│   │   └── utils/         # Embeddings, LLM, helpers

│   └── package.json

├── frontend/

│   ├── src/

│   │   ├── components/    # UI components

│   │   ├── pages/         # Route pages

│   │   ├── store/         # Redux store

│   │   └── utils/         # API client

│   └── package.json

└── README.md

## Author
[abhishek-coderX](https://github.com/abhishek-coderX)
