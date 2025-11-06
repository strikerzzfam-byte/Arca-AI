const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function updateWebsite(prompt: string, currentFiles: Record<string, string>): Promise<{ files: Record<string, string>; mainFile: string }> {
  try {
    const response = await fetch('http://localhost:3001/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Update the existing code: ${prompt}` })
    });
    
    const data = await response.json();
    
    if (data.type === 'files') {
      return {
        files: data.files,
        mainFile: data.mainFile,
        chatMessage: data.chatMessage,
        thinking: data.thinking,
        terminalCommands: data.terminalCommands,
        dependencies: data.dependencies
      };
    } else if (data.type === 'code') {
      return {
        files: { "index.html": data.content },
        mainFile: "index.html"
      };
    }
    
    throw new Error('Failed to generate code');
  } catch (error) {
    throw new Error('AI service unavailable');
  }
}

export async function generateWebsite(prompt: string): Promise<{ files: Record<string, string>; mainFile: string }> {
  try {
    const response = await fetch('http://localhost:3001/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.type === 'files' && data.files) {
      return {
        files: data.files,
        mainFile: data.mainFile,
        chatMessage: data.chatMessage,
        thinking: data.thinking,
        terminalCommands: data.terminalCommands,
        dependencies: data.dependencies
      };
    } else if (data.type === 'code' && data.content) {
      return {
        files: { "index.html": data.content },
        mainFile: "index.html"
      };
    }
    
    throw new Error('Invalid response from AI service');
  } catch (error) {
    console.error('AI generation error:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Backend server not running. Please start the backend server.');
    }
    throw new Error(error.message || 'AI service unavailable');
  }
}