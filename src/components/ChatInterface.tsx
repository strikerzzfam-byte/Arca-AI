import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Send, Bot, User, Code } from 'lucide-react';
import { apiService } from '../lib/api';
import { useRealTimeData } from '../hooks/useRealTimeData';

interface Message {
  id: number;
  content: string;
  type: 'user' | 'ai';
}

interface ChatInterfaceProps {
  onCodeGenerated: (code: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onCodeGenerated }) => {
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: chats = [], refetch: refetchChats } = useRealTimeData(
    () => apiService.getChats(),
    2000
  );

  const messages = [
    ...userMessages,
    ...chats.map((chat: any) => ({
      id: chat.id,
      content: chat.message,
      type: 'ai' as const
    }))
  ].sort((a, b) => a.id - b.id);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: input,
      type: 'user'
    };

    setUserMessages(prev => [...prev, userMessage]);
    setLoading(true);
    const currentInput = input;
    setInput('');

    try {
      const data = await apiService.sendMessage(currentInput);

      if (data.type === 'code') {
        onCodeGenerated(data.content);
        const codeMessage: Message = {
          id: Date.now() + 1,
          content: `✅ Code generated and displayed in preview panel!`,
          type: 'ai'
        };
        setUserMessages(prev => [...prev, codeMessage]);
        refetchChats();
      } else {
        refetchChats();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: 'Sorry, there was an error processing your request. Please try again.',
        type: 'ai'
      };
      setUserMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Create a landing page",
    "Build a dashboard",
    "Generate a contact form",
    "Design a pricing section"
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          AI Web Developer
        </h2>
        <p className="text-sm text-gray-600">Generate HTML pages with Tailwind CSS & Flowbite UI!</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${
            message.type === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            <div className={`flex gap-2 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                {message.type === 'user' ? 
                  <User className="w-4 h-4 text-white" /> : 
                  <Bot className="w-4 h-4 text-white" />
                }
              </div>
              <Card className={`p-3 ${
                message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </Card>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="p-3 bg-white">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                  <p className="text-sm">Generating response...</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      {messages.length === 0 && (
        <div className="p-4 border-t bg-white">
          <p className="text-xs text-gray-500 mb-2">Quick prompts:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(prompt)}
                className="text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to create a landing page, dashboard, or any web component..."
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};