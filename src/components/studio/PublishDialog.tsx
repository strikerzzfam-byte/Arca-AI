import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Globe } from "lucide-react";
import { toast } from "sonner";
import { isGitHubConnected } from "@/lib/github";
import GitHubManager from "./GitHubManager";
import GitHubConnectionDialog from "./GitHubConnectionDialog";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  projectName?: string;
}

export default function PublishDialog({ open, onOpenChange, code, projectName = "Arca AI Project" }: PublishDialogProps) {
  const [showGitHubManager, setShowGitHubManager] = useState(false);
  const [showGitHubConnection, setShowGitHubConnection] = useState(false);
  const isConnected = isGitHubConnected();

  const handleGitHubPublish = () => {
    if (!isConnected) {
      setShowGitHubConnection(true);
      return;
    }
    setShowGitHubManager(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Publish to GitHub</DialogTitle>
          <DialogDescription>
            {isConnected
              ? "Select a repository or create a new one to publish your code"
              : "Connect your GitHub account to publish your code"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3">
            <Button
              onClick={handleGitHubPublish}
              className="w-full h-12 text-left justify-start"
              variant="outline"
            >
              <Github className="h-5 w-5 mr-3" />
              <div>
                <div className="font-medium">Deploy to GitHub</div>
                <div className="text-xs text-muted-foreground">
                  {isConnected ? "Push to repository" : "Connect GitHub account"}
                </div>
              </div>
            </Button>
            
            <Button
              className="w-full h-12 text-left justify-start"
              variant="outline"
              disabled
            >
              <Globe className="h-5 w-5 mr-3" />
              <div>
                <div className="font-medium">Deploy to Web</div>
                <div className="text-xs text-muted-foreground">Coming soon</div>
              </div>
            </Button>
          </div>
        </div>
        
        <GitHubManager
          open={showGitHubManager}
          onOpenChange={setShowGitHubManager}
          code={code}
          projectName={projectName}
        />
        
        <GitHubConnectionDialog
          open={showGitHubConnection}
          onOpenChange={setShowGitHubConnection}
        />
      </DialogContent>
    </Dialog>
  );
}

