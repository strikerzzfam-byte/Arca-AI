import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, CheckCircle } from "lucide-react";
import { initiateGitHubAuth, isGitHubConnected } from "@/lib/github";

interface GitHubConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GitHubConnectionDialog({ open, onOpenChange }: GitHubConnectionDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const isConnected = isGitHubConnected();

  const handleConnect = () => {
    setIsConnecting(true);
    initiateGitHubAuth();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            {isConnected ? "GitHub Connected" : "Connect to GitHub"}
          </DialogTitle>
          <DialogDescription>
            {isConnected 
              ? "Your GitHub account is connected and ready to use."
              : "Connect your GitHub account to publish and manage your projects directly from Arca AI."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isConnected ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Successfully connected to GitHub</span>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>With GitHub connected, you can:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Create new repositories</li>
                  <li>Push code directly to GitHub</li>
                  <li>Manage your projects seamlessly</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                <Github className="h-4 w-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect with GitHub"}
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}