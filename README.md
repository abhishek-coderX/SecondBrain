# SecondBrain 🧠

A RAG-based personal knowledge management system. Save YouTube videos, tweets, articles, and thoughts — then semantically search and chat with your saved content using AI.

## Live Demo
[Coming soon](#)

## Features
- Save YouTube, Twitter, Articles, and Thoughts in one place
- Semantic search powered by Google Gemini embeddings
- Ask Your Brain — RAG chat grounded in your saved content
- Tag-based filtering and masonry grid layout
- Share curated content collections via public links
- Full CRUD with auto embedding regeneration on edit
- Chat session history with persistent conversations

## Tech Stack
**Backend:** Node.js, Express.js, TypeScript, MongoDB, Mongoose, JWT, Zod, Google Gemini API

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, Axios, React Markdown

## RAG Architecture

Save content → Generate Gemini embedding (3072d) → Store in MongoDB

Ask question → Embed query → Cosine similarity search → Feed top matches to Gemini → Grounded answer


## Local Setup

**Backend**
```bash
cd backend && npm install && npm run dev
```

**Frontend**
```bash
cd frontend && npm install && npm run dev
```

**Backend `.env`**

MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=

ALLOWED_ORIGIN=http://localhost:5173

NODE_ENV=development

**Frontend `.env`**

VITE_API_URL=http://localhost:4000

## Author
[abhishek-coderX](https://github.com/abhishek-coderX)