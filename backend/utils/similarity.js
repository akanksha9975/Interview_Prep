// Simple cosine similarity implementation (no external library needed)
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    console.error('Invalid vectors for similarity calculation');
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
};

export const findTopSimilarChunks = (queryEmbedding, documents, topK = 2) => {
  const allChunks = [];
  
  // Collect all chunks from all documents
  documents.forEach(doc => {
    doc.chunks.forEach((chunk, index) => {
      allChunks.push({
        text: chunk.text,
        embedding: chunk.embedding,
        type: doc.type,
        chunkIndex: index,
        docId: doc._id
      });
    });
  });
  
  // Calculate similarities
  const chunksWithScores = allChunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  // Sort by similarity and return top K
  return chunksWithScores
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};
