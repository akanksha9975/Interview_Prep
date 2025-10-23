import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Document from '../models/Document.js';
import Chat from '../models/Chat.js';
import { generateInterviewQuestions, evaluateResponse } from '../services/gemini.js';
import { getEmbedding } from '../utils/embeddings.js';
import { findTopSimilarChunks } from '../utils/similarity.js';

const router = express.Router();

// Start chat session - Generate initial questions
router.post('/start', authenticateToken, async (req, res) => {
  try {
    // Check if both resume and JD are uploaded
    const documents = await Document.find({ userId: req.userId });
    const resume = documents.find(doc => doc.type === 'resume');
    const jd = documents.find(doc => doc.type === 'jd');

    if (!resume || !jd) {
      return res.status(400).json({ 
        error: 'Both resume and job description must be uploaded before starting chat' 
      });
    }

    // Get full JD text
    const jdText = jd.chunks.map(chunk => chunk.text).join(' ');

    // Generate interview questions
    const questionsText = await generateInterviewQuestions(jdText);

    // Delete existing chat and create new one to avoid version conflicts
    await Chat.deleteOne({ userId: req.userId });
    
    const chat = new Chat({ 
      userId: req.userId, 
      messages: [{
        role: 'assistant',
        content: questionsText,
        timestamp: new Date()
      }]
    });

    await chat.save();

    res.json({
      message: 'Chat session started',
      questions: questionsText,
      chatId: chat._id
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// Send query and get response
router.post('/query', authenticateToken, async (req, res) => {
  try {
    const { message, question } = req.body;

    if (!message || !question) {
      return res.status(400).json({ error: 'Message and question are required' });
    }

    // Get user's documents
    const documents = await Document.find({ userId: req.userId });
    const resume = documents.find(doc => doc.type === 'resume');
    const jd = documents.find(doc => doc.type === 'jd');

    if (!resume || !jd) {
      return res.status(400).json({ error: 'Documents not found' });
    }

    // Generate embedding for user's message
    const queryEmbedding = await getEmbedding(message);

    // Find top similar chunks from resume and JD
    const similarChunks = findTopSimilarChunks(queryEmbedding, documents, 2);

    // Evaluate response using Gemini
    const { score, feedback } = await evaluateResponse(
      question,
      message,
      similarChunks
    );

    // Prepare citations
    const citations = similarChunks.map((chunk, idx) => ({
      chunkIndex: chunk.chunkIndex,
      snippet: chunk.text.substring(0, 200) + '...',
      type: chunk.type
    }));

    // Use atomic update to avoid version conflicts
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    const assistantMessage = {
      role: 'assistant',
      content: feedback,
      score: score,
      citations: citations,
      timestamp: new Date()
    };

    // Push both messages atomically
    await Chat.findOneAndUpdate(
      { userId: req.userId },
      { 
        $push: { 
          messages: { 
            $each: [userMessage, assistantMessage] 
          } 
        } 
      },
      { upsert: true, new: true }
    );

    res.json({
      response: feedback,
      score: score,
      citations: citations
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.userId });
    
    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({
      messages: chat.messages
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;
