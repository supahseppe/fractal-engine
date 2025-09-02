// Calling
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const client = new Cerebras({
  apiKey: process.env['CEREBRAS_API_KEY'],
});

async function main() {
  const completionCreateResponse = await client.chat.completions.create({
    messages: [{ role: 'user', content: 'Hello!' }],
    model: 'llama3.1-8b',
  });

  console.log(completionCreateResponse);
}
main();

// Response
const res = {
  "id": "chatcmpl-292e278f-514e-4186-9010-91ce6a14168b",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "Hello! How can I assist you today?",
        "reasoning": "The user is asking for a simple greeting to the world. This is a straightforward request that doesn't require complex analysis. I should provide a friendly, direct response.",
        "role": "assistant"
    
      }
    }
  ],
  "created": 1723733419,
  "model": "llama3.1-8b",
  "system_fingerprint": "fp_70185065a4",
  "object": "chat.completion",
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 10,
    "total_tokens": 22
  },
  "time_info": {
    "queue_time": 0.000073161,
    "prompt_time": 0.0010744798888888889,
    "completion_time": 0.005658071111111111,
    "total_time": 0.022224903106689453,
    "created": 1723733419
  }
};