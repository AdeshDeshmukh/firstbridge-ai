// Stores pgvector (AI vector database) configuration for ai memoty

export const pgvectorConfig = {
  dimensions: 1536,
  similarity: "cosine",
  table: "memory_embeddings",
};