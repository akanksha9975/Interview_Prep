import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse-fork';
import { authenticateToken } from '../middleware/auth.js';
import Document from '../models/Document.js';
import cloudinary from '../config/cloudinary.js';
import { chunkText, getEmbedding } from '../utils/embeddings.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Upload document
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = req.body;
    
    if (!type || !['resume', 'jd'].includes(type)) {
      return res.status(400).json({ error: 'Invalid document type. Must be "resume" or "jd"' });
    }

    // Check if user already has a document of this type
    const existingDoc = await Document.findOne({ userId: req.userId, type });
    if (existingDoc) {
      // Delete old document from Cloudinary
      await cloudinary.uploader.destroy(existingDoc.cloudinaryPublicId);
      await Document.deleteOne({ _id: existingDoc._id });
    }

    // Extract text from PDF using pdf-parse-fork
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'interview-prep',
          public_id: `${req.userId}_${type}_${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Chunk the text
    const textChunks = chunkText(extractedText, 500);

    // Generate embeddings for each chunk
    const chunksWithEmbeddings = [];
    for (const chunk of textChunks) {
      try {
        const embedding = await getEmbedding(chunk);
        chunksWithEmbeddings.push({
          text: chunk,
          embedding: embedding
        });
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Embedding error for chunk:', error);
        // Continue with other chunks
      }
    }

    if (chunksWithEmbeddings.length === 0) {
      return res.status(500).json({ error: 'Failed to generate embeddings' });
    }

    // Save to database
    const document = new Document({
      userId: req.userId,
      type,
      filename: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      chunks: chunksWithEmbeddings
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        type: document.type,
        filename: document.filename,
        uploadedAt: document.uploadedAt,
        chunksCount: document.chunks.length
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload document' });
  }
});

// List documents
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId })
      .select('-chunks') // Exclude chunks for list view
      .sort({ uploadedAt: -1 });

    res.json({
      documents: documents.map(doc => ({
        id: doc._id,
        type: doc.type,
        filename: doc.filename,
        uploadedAt: doc.uploadedAt,
        chunksCount: doc.chunks?.length || 0
      }))
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(document.cloudinaryPublicId);

    // Delete from database
    await Document.deleteOne({ _id: document._id });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
