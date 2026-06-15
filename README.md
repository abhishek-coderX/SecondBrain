# SecondBrain 🧠

A modern, RAG-based personal knowledge management system. Capture YouTube videos, tweets, web articles, and private thoughts — then semantically search and interact with your saved content using Google Gemini.

## 🚀 Live Demo

* **Frontend App:** [https://secondbrain-frontend-steel.vercel.app/](https://secondbrain-frontend-steel.vercel.app/) (Hosted on Vercel)
* **Backend API:** [https://secondbrain-backend-39l6.onrender.com/](https://secondbrain-backend-39l6.onrender.com/) (Hosted on Render)

---

## ✨ Features

- **Omnivorous Capture:** Save YouTube videos, Twitter tweets, web articles, and raw thoughts in one beautiful masonry dashboard.
- **Semantic Search:** Find saved content by meaning rather than exact keywords, powered by Google Gemini embeddings (`gemini-embedding-2`, 3072 dimensions).
- **Ask Your Brain:** Interactive chat assistant that retrieves your saved notes and answers queries in context using Retrieval-Augmented Generation (RAG).
- **Web Grounding Fallback:** When your SecondBrain doesn't have the answer, the assistant performs real-time Google Search grounding to provide accurate, up-to-date web information.
- **Persistent Chat History:** Multiple conversation sessions stored securely in MongoDB and organized inside an interactive chat sidebar.
- **Public Share Links:** Generate shareable, static collections to share your knowledge base with anyone.
- **Bento Grid Aesthetics:** Premium UI featuring glassmorphism, responsive masonry layouts, and smooth animations.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express, TypeScript, MongoDB + Mongoose, JSON Web Tokens (JWT) inside HttpOnly cookies, Zod, and Google Gen AI SDK.
* **Frontend:** React, Redux Toolkit (state management), Vite, Tailwind CSS, Axios, Lucide React, and React Markdown.

---

## 📐 RAG Architecture & Ingestion Pipeline

### 1. Ingestion Pipeline
```
[User Action] ➔ Save Content ➔ Extract Metadata ➔ Combine fields (Title + Desc + Link) ➔ Embed text (Gemini API) ➔ Store 3072d Vector in MongoDB
```

### 2. Retrieval & Q&A (RAG) Pipeline
```
[User Question] ➔ Intent Classifier ➔ Generate Search Vector ➔ Cosine Similarity Search ➔ Retrieve top matched items ➔ Feed context to Gemini-2.5-Flash ➔ Formulate Grounded Answer with Citations
```

---

## ⚙️ Environment Configuration

### Backend `.env`
```ini
MONGO_URI="your-mongodb-atlas-uri"
JWT_SECRET="your-jwt-signing-secret"
GEMINI_API_KEY="your-google-gemini-api-key"
ALLOWED_ORIGIN="https://secondbrain-frontend-steel.vercel.app"
NODE_ENV="production"
```

### Frontend `.env`
```ini
VITE_API_URL="https://secondbrain-backend-39l6.onrender.com"
```

---

## 💻 Local Development Setup

### 1. Clone & Setup Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 👤 Author
Developed with ❤️ by [abhishek-coderX](https://github.com/abhishek-coderX)
