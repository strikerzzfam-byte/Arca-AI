import { Eye, Code, Database, Settings, Github, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { initiateGitHubAuth, isGitHubConnected, removeGitHubToken } from "@/lib/github";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import GitHubConnectionDialog from "./GitHubConnectionDialog";
import type { StudioSession } from "@/lib/session";

type Props = {
  session: StudioSession | null;
  activeTab: "preview" | "code" | "logs" | "deployments";
  onTabChange?: (tab: "preview" | "code" | "logs" | "deployments") => void;
  onPublishClick?: () => void;
  onSettingsClick?: () => void;
};

export default function StudioHeader({ session, activeTab, onTabChange, onPublishClick, onSettingsClick }: Props) {
  const projectName = session?.projectName || "Arca AI Project";
  const [isConnected, setIsConnected] = useState(isGitHubConnected());
  const [showGitHubDialog, setShowGitHubDialog] = useState(false);

  useEffect(() => {
    const handleGitHubConnected = () => {
      setIsConnected(true);
      toast.success("GitHub Connected!", {
        description: "You can now publish your code to GitHub repositories.",
      });
    };

    const handleGitHubError = (event: CustomEvent) => {
      toast.error("GitHub Connection Failed", {
        description: event.detail?.message || "Please try again.",
      });
    };

    window.addEventListener('github-connected', handleGitHubConnected);
    window.addEventListener('github-error', handleGitHubError as EventListener);

    return () => {
      window.removeEventListener('github-connected', handleGitHubConnected);
      window.removeEventListener('github-error', handleGitHubError as EventListener);
    };
  }, []);

  const handleGitHubClick = () => {
    if (isConnected) {
      // Show options: disconnect or view connected account
      toast.info("GitHub Connected", {
        description: "Click Publish to deploy your code to GitHub.",
        action: {
          label: "Disconnect",
          onClick: () => {
            removeGitHubToken();
            setIsConnected(false);
            toast.success("GitHub disconnected");
          },
        },
      });
    } else {
      setShowGitHubDialog(true);
    }
  };

  return (
    <div className="h-12 border-b border-border bg-background flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">b</span>
        </div>
        <span className="text-muted-foreground text-sm">/</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{projectName}</span>
          <Lock className="w-3 h-3 text-muted-foreground" />
        </div>
      </div>

      {/* Middle Section - Navigation Icons */}
      <div className="flex items-center gap-1 bg-secondary/50 rounded-md p-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            activeTab === "preview" && "bg-primary text-primary-foreground"
          )}
          onClick={() => onTabChange?.("preview")}
          title="Preview"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            activeTab === "code" && "bg-primary text-primary-foreground"
          )}
          onClick={() => onTabChange?.("code")}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            activeTab === "logs" && "bg-primary text-primary-foreground"
          )}
          onClick={() => onTabChange?.("logs")}
          title="Logs"
        >
          <Database className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            activeTab === "deployments" && "bg-primary text-primary-foreground"
          )}
          onClick={() => onTabChange?.("deployments")}
          title="Deployments"
        >
          <Clock className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onSettingsClick}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 transition-colors",
            isConnected ? "bg-green-100 text-green-700 hover:bg-green-200" : "hover:bg-muted"
          )}
          onClick={handleGitHubClick}
          title={isConnected ? "GitHub Connected - Click for options" : "Connect to GitHub"}
        >
          <Github className={cn("h-4 w-4", isConnected && "fill-current")} />
        </Button>
        <Button
          variant="outline"
          className="h-8 px-4 text-sm"
          onClick={onPublishClick}
        >
          Publish
        </Button>
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">T</span>
        </div>
      </div>
      
      <GitHubConnectionDialog 
        open={showGitHubDialog} 
        onOpenChange={setShowGitHubDialog} 
      />
    </div>
  );
}

