import { Loader2, Code, Sparkles } from 'lucide-react';

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Code className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          Generating your application...
        </div>
        <div className="text-sm text-muted-foreground">
          AI is creating your files and dependencies
        </div>
      </div>
      
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}