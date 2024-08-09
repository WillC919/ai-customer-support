'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Typography, Paper, InputAdornment, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

// Define the shape of a message according to the OpenAI API schema
interface Message {
  roles: string; // Indicates if the message is from the user or the bot
  content: string; // The text of the message
}

const Chatbot: React.FC = () => {
  // State for storing chat messages
  const [messages, setMessages] = useState<Message[]>([
    { roles: 'system', content: "Hi! I'm the Headstarter support assistant. How can I help you today?", },
  ]);

  // State for the input field
  const [input, setInput] = useState<string>('');

  // State for tracking if the bot is currently loading a response
  const [loading, setLoading] = useState<boolean>(false);

  // Ref to keep track of the end of the messages for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return; // Don't send if input is empty or if already loading

    setLoading(true); // Set loading to true while waiting for the response

    const userMessage = { roles: 'user', content: input }; // Create a user message object

    // Update messages state with the new user message and a placeholder for the bot's response
    setMessages((messages: Message[]) => [
      ...messages,
      userMessage,
      { roles: 'system', content: '' },
    ]);
    setInput(''); // Clear the input field

    try {
      // Send the messages to the backend for processing
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, userMessage]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok'); // Throw error if response is not OK
      }

      const reader = response.body!.getReader(); // Get the reader for the response body
      const decoder = new TextDecoder(); // Create a text decoder

      // Read the response body in chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // Exit loop if done
        const text = decoder.decode(value, { stream: true }); // Decode the chunk
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1]; // Get the last message (bot's placeholder)
          const otherMessages = messages.slice(0, messages.length - 1); // Get all messages except the last one
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text }, // Update the last message with the new text
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error); // Log any errors
      setMessages((messages: Message[]) => [
        ...messages.slice(0, messages.length - 1),
        { roles: 'system', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]); // Update the last message with an error message
    }

    setLoading(false); // Set loading to false once done
  };

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 2, width: '65%', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        AI Chatbot
      </Typography>
      <Paper sx={{ flex: 1, p: 2, overflowY: 'auto', mb: 2, maxHeight: '77%', boxShadow: 'none' }}>
        {messages.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'grey.500', flex: 1 }}>
            Start the conversation by typing your message...
          </Typography>
        ) : (
          messages.map((msg, index) => (
            <Box key={index} sx={{ textAlign: msg.roles === 'user' ? 'right' : 'left' }}>
              <Typography
                sx={{
                  display: 'inline-block',
                  bgcolor: msg.roles === 'user' ? 'primary.main' : 'grey.300',
                  color: msg.roles === 'user' ? 'white' : 'black',
                  borderRadius: 3,
                  p: 1,
                  paddingLeft: 3,
                  paddingRight: 3,
                  paddingTop: 1,
                  paddingBottom: 1,
                  mb: 1,
                }}
              >
                {msg.content}
              </Typography>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} /> {/* This div helps in auto-scrolling */}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !loading) handleSendMessage(); // Send message on Enter key press
          }}
          disabled={loading}
          sx={{
            borderRadius: 30,
            '& .MuiOutlinedInput-root': {
              borderRadius: 30,
              paddingLeft: 3,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={loading}
                >
                  <ArrowUpwardIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default Chatbot;
