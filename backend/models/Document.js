import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['resume', 'jd'],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  chunks: [{
    text: String,
    embedding: [Number]
  }],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Document', documentSchema);
