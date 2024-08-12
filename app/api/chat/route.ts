import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { NextResponse } from 'next/server';

// Initialize the BedrockRuntimeClient with your AWS region
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = 'You are a helpful assistant. Please do not ever speak hallucinate questions from users.';

// POST function to handle incoming requests
export async function POST(req: Request) {
  const data = await req.json();

  // Construct the conversation history
  // const conversationHistory = data.map((msg: { role: string, content: string }) => `${msg.role}: ${msg.content}`).join('\n');
  // const fullPrompt = `${systemPrompt}\n${conversationHistory}\nAssistant:`;
  console.log(data)
  const prompt = `
  <|begin_of_text|>
  <|start_header_id|>user<|end_header_id|>
  ${data}
  <|eot_id|>
  <|start_header_id|>assistant<|end_header_id|>
  `;

  const request = {
    prompt,
    // Optional inference parameters:
    max_gen_len: 512,
    temperature: 0.5,
    top_p: 0.9,
  };

  // Create a command to invoke the Meta Llama 3 model on Amazon Bedrock
  const command = new InvokeModelCommand({
    modelId: 'meta.llama3-8b-instruct-v1:0',
    body: JSON.stringify(request),
    contentType: 'application/json',
  });

  try {
    const response = await client.send(command);

    // Ensure response.body is available
    if (response.body) {
      const nativeResponse = JSON.parse(new TextDecoder().decode(response.body));
      return new NextResponse(JSON.stringify({ content: nativeResponse.generation || '' }), {
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
      });
    } else {
      throw new Error('Response body is not available');
    }
  } catch (error) {
    console.error('Error invoking model:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
