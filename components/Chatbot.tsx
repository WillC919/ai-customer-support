'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Typography, Paper, InputAdornment, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ReactMarkdown from 'react-markdown';

// Define the shape of a message according to the OpenAI API schema
interface Message {
  role: string;
  content: string;
}

const MessageComponent: React.FC<{ message: Message }> = ({ message }) => (
  <Box sx={{ textAlign: message.role === 'user' ? 'right' : 'left' }}>
    <Typography
      sx={{
        display: 'inline-block',
        bgcolor: message.role === 'user' ? 'primary.main' : 'grey.300',
        color: message.role === 'user' ? 'white' : 'black',
        borderRadius: 3,
        p: 1,
        paddingLeft: 3,
        paddingRight: 3,
        mb: 1,
        wordBreak: 'break-word', // Ensure long words break appropriately
      }}
    >
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </Typography>
  </Box>
);

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);

    const userMessage = { role: 'user', content: input };
    setMessages((messages: Message[]) => [
      ...messages,
      userMessage,
      { role: 'Assistant', content: '...' },
    ]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userMessage.content),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        const otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: data.content || '' },
        ];
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages: Message[]) => [
        ...messages.slice(0, messages.length - 1),
        { role: 'Assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 2, width: '75%', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        AI Chatbot
      </Typography>
      <Paper sx={{ flex: 1, p: 2, overflowY: 'auto', mb: 2, maxHeight: '77%', boxShadow: 'none' }}>
        {messages.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'grey.500', flex: 1 }} aria-live="polite">
            Start the conversation by typing your message...
          </Typography>
        ) : (
          messages.map((msg, index) => (
            <MessageComponent key={index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !loading) handleSendMessage();
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
                <IconButton color="primary" onClick={handleSendMessage} disabled={loading}>
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
