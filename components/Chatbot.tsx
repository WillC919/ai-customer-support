'use client';
import React, { useState, useCallback } from 'react';
import { Box, TextField, Typography, Paper, InputAdornment, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

interface Message {
  user: boolean;
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  const handleSendMessage = useCallback(() => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { user: true, text: input }];
    setMessages(newMessages);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = `AI: You said "${input}"`;
      setMessages((prevMessages) => [...prevMessages, { user: false, text: aiMessage }]);
    }, 500);

    setInput('');
  }, [input, messages]);

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
            <Box key={index} sx={{ textAlign: msg.user ? 'right' : 'left' }}>
              <Typography
                sx={{
                  display: 'inline-block',
                  bgcolor: msg.user ? 'primary.main' : 'grey.300',
                  color: msg.user ? 'white' : 'black',
                  borderRadius: 20,
                  p: 1,
                  paddingLeft: 3,
                  paddingRight: 3,
                  mb: 1,
                }}
              >
                {msg.text}
              </Typography>
            </Box>
          ))
        )}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
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
