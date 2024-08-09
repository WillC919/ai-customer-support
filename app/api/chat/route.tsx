import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Configure OpenAI client with base URL and API key
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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', // Use environment variable for API key
});

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = 'You are an helpful customer support assistant';

// POST function to handle incoming requests
export async function POST(req) {
  // Parse the JSON body of the incoming request
  const data = await req.json();
  console.log(data)
  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...data, // Include user messages from the request
    ],
    model: 'meta-llama/llama-3.1-8b-instruct:free', // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
