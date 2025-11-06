import { useState } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { CodeRenderer } from '../components/CodeRenderer';
import { Card } from '../components/ui/card';
import { Code, MessageSquare, Sparkles } from 'lucide-react';

const AiChat = () => {
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
  };

  const WelcomeScreen = () => (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="p-8 max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Code Generator</h2>
          <p className="text-gray-600">Ask me to create any UI component and watch it come to life!</p>
        </div>
        
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Code className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-sm">Generate Components</p>
              <p className="text-xs text-gray-600">"Create a modern button"</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-medium text-sm">Get Help</p>
              <p className="text-xs text-gray-600">"How do I use React hooks?"</p>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          Start chatting to see your code generated and previewed in real-time!
        </p>
      </Card>
    </div>
  );

  return (
    <div className="h-screen flex">
      <div className="w-1/3 border-r shadow-lg">
        <ChatInterface onCodeGenerated={handleCodeGenerated} />
      </div>
      <div className="flex-1">
        {generatedCode ? (
          <CodeRenderer code={generatedCode} />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default AiChat;