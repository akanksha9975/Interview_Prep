import axios from 'axios';

// Using BAAI/bge-small-en-v1.5 which is better supported for feature extraction
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5';

export const getEmbedding = async (text, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.post(
        HUGGINGFACE_API_URL,
        { 
          inputs: text,
          options: { wait_for_model: true }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout for model loading
        }
      );
      
      // Check if model is loading
      if (response.data.error && response.data.error.includes('loading')) {
        console.log(`Model loading, waiting... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds
        continue;
      }
      
      // The response should be an array (embedding vector)
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Embedding error (attempt ${attempt + 1}):`, error.response?.data || error.message);
      
      if (error.response?.data?.error?.includes('loading') && attempt < retries - 1) {
        console.log('Model is loading, waiting 30 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        continue;
      }
      
      if (attempt === retries - 1) {
        throw new Error('Failed to generate embedding after retries');
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

export const chunkText = (text, maxWords = 500) => {
  const words = text.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += maxWords) {
    const chunk = words.slice(i, i + maxWords).join(' ');
    chunks.push(chunk);
  }
  
  return chunks;
};
