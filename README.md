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
