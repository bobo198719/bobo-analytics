const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function test() {
  try {
    const response = await openai.models.list();
    console.log('✅ Key is valid!');
  } catch (e) {
    console.log('❌ Key is invalid:', e.message);
  }
}

test();
