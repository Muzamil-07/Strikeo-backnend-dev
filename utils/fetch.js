const fetch = require('node-fetch');
const generateEmbedding = async (body) => {
  try {
    const res = await fetch(`${process.env.EMBEDDING_SEARCH_URL}/embed-v2/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch embedding: ${res.statusText}`);
    }

    const data = await res.json();
    
    return data.embedding;

  } catch (error) {
    console.error("Error generating embedding:", error.message);
    return null; 
  }
};


module.exports = { generateEmbedding };
