import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema({
  chunkIndex: {
    type: Number,
    required: true
  },
  snippet: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['resume', 'jd']
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    min: 1,
    max: 10
  },
  citations: [citationSchema],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Chat', chatSchema);
