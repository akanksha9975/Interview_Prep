# AI-Powered Interview Prep App

A full-stack application for AI-powered job interview simulation using RAG (Retrieval-Augmented Generation) to generate personalized interview questions and evaluate responses.

## 🎯 Features

- **Authentication**: Secure signup/login with JWT and bcrypt
- **Document Upload**: Drag-and-drop PDF upload for resume and job descriptions (max 2MB)
- **AI Interview Questions**: Automatically generated questions from job descriptions using Google Gemini
- **Real-time Evaluation**: AI-powered response evaluation with scores (1-10) and feedback
- **RAG System**: Semantic search with HuggingFace embeddings for context-aware feedback
- **Citation System**: View referenced resume/JD chunks in responses
- **Responsive Design**: Mobile-first Tailwind CSS UI

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- React Router v6
- Axios
- React Hot Toast
- React Dropzone

### Backend
- Node.js & Express
- MongoDB Atlas
- JWT Authentication
- Cloudinary (file storage)
- Google Gemini AI
- HuggingFace Embeddings
- pdf-parse

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API key
- HuggingFace API key

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd ASSIGNMENT
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
npm install
\`\`\`

Create a \`.env\` file in the backend directory:

\`\`\`env
# Database
MONGODB_URI=your_mongodb_connection_string

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Service (Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Embeddings (HuggingFace)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
\`\`\`

Start the backend server:

\`\`\`bash
npm run dev
\`\`\`

Server will run on http://localhost:5000

### 3. Frontend Setup

\`\`\`bash
cd frontend
npm install
\`\`\`

Create a \`.env\` file in the frontend directory:

\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

Start the frontend:

\`\`\`bash
npm run dev
\`\`\`

App will run on http://localhost:3000

## 📁 Project Structure

\`\`\`
ASSIGNMENT/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── documents.js
│   │   └── chat.js
│   ├── services/
│   │   └── gemini.js
│   ├── utils/
│   │   ├── embeddings.js
│   │   └── similarity.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── api.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Login.jsx
    │   │   ├── Upload.jsx
    │   │   └── Chat.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
\`\`\`

## 🔑 API Endpoints

### Authentication
- \`POST /api/auth/signup\` - Create new account
- \`POST /api/auth/login\` - Login user

### Documents
- \`POST /api/documents/upload\` - Upload resume/JD (multipart/form-data)
- \`GET /api/documents/list\` - List user's documents
- \`DELETE /api/documents/:id\` - Delete document

### Chat
- \`POST /api/chat/start\` - Initialize chat with AI questions
- \`POST /api/chat/query\` - Send answer and get evaluation
- \`GET /api/chat/history\` - Get chat history

## 🎮 How to Use

1. **Sign Up / Login**: Create an account or login
2. **Upload Documents**: Upload your resume and job description (PDF, max 2MB each)
3. **Start Interview**: Navigate to chat page to see AI-generated questions
4. **Answer Questions**: Click on a question to select it, then type your answer
5. **Get Feedback**: Receive instant AI evaluation with scores and citations

## 🌐 Deployment

### Frontend (Vercel)

\`\`\`bash
cd frontend
npm run build
\`\`\`

Deploy to Vercel:
- Connect your GitHub repo
- Set build command: \`npm run build\`
- Set output directory: \`dist\`
- Add environment variable: \`VITE_API_URL=your-backend-url/api\`

### Backend (Render)

Create \`render.yaml\`:

\`\`\`yaml
services:
  - type: web
    name: ai-interview-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
\`\`\`

- Connect GitHub repo
- Add all environment variables from .env
- Deploy

## 🔒 Environment Variables

Make sure to set all environment variables in your deployment platform:

**Backend:**
- MONGODB_URI
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- GEMINI_API_KEY
- HUGGINGFACE_API_KEY
- JWT_SECRET
- FRONTEND_URL

**Frontend:**
- VITE_API_URL

## 📝 API Keys Setup

### MongoDB Atlas
1. Go to mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for development)
5. Get connection string

### Cloudinary
1. Sign up at cloudinary.com
2. Get Cloud Name, API Key, and API Secret from dashboard

### Google Gemini
1. Go to ai.google.dev
2. Get API key

### HuggingFace
1. Sign up at huggingface.co
2. Go to Settings → Access Tokens
3. Create new token

## 🧪 Testing

Test the application flow:
1. Signup with email/password
2. Upload resume PDF
3. Upload job description PDF
4. Start chat to see generated questions
5. Answer a question and receive evaluation

## 📊 Features Checklist

- ✅ JWT Authentication with bcrypt
- ✅ Protected routes
- ✅ PDF upload with validation (2MB limit)
- ✅ Cloudinary file storage
- ✅ PDF text extraction
- ✅ Text chunking (~500 words)
- ✅ HuggingFace embeddings
- ✅ MongoDB document storage
- ✅ AI question generation (Gemini)
- ✅ RAG-based evaluation
- ✅ Cosine similarity search
- ✅ Score system (1-10)
- ✅ Citation modal
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)

## 🤝 Contributing

This is an assignment project. Feel free to fork and modify.

## 📄 License

MIT

## 👤 Author

Your Name

---

**Note**: This project uses free tiers of all services. For production use, consider upgrading to paid plans for better performance and reliability.
