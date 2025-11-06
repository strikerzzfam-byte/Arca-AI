import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, ExternalLink, Clock, GitCommit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Deployment {
  id: string;
  repo: string;
  branch: string;
  commit: string;
  timestamp: Date;
  status: "success" | "failed" | "pending";
  url?: string;
}

export default function DeploymentHistory() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    // Load deployment history from localStorage
    const saved = localStorage.getItem("arca_deployments");
    if (saved) {
      const parsed = JSON.parse(saved).map((d: any) => ({
        ...d,
        timestamp: new Date(d.timestamp)
      }));
      setDeployments(parsed);
    }
  }, []);

  const addDeployment = (deployment: Omit<Deployment, "id" | "timestamp">) => {
    const newDeployment: Deployment = {
      ...deployment,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    
    const updated = [newDeployment, ...deployments].slice(0, 10); // Keep last 10
    setDeployments(updated);
    localStorage.setItem("arca_deployments", JSON.stringify(updated));
  };

  // Expose function globally for other components to use
  useEffect(() => {
    (window as any).addDeployment = addDeployment;
    return () => {
      delete (window as any).addDeployment;
    };
  }, [deployments]);

  if (deployments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Github className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No deployments yet</p>
            <p className="text-sm">Deploy your first project to see history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Deployments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deployments.map((deployment) => (
          <div
            key={deployment.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                <span className="font-medium text-sm">{deployment.repo}</span>
              </div>
              <Badge
                variant={
                  deployment.status === "success"
                    ? "default"
                    : deployment.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
                className="text-xs"
              >
                {deployment.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GitCommit className="h-3 w-3" />
              <span>{deployment.commit.slice(0, 7)}</span>
              <span>•</span>
              <span>{formatDistanceToNow(deployment.timestamp, { addSuffix: true })}</span>
              {deployment.url && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(deployment.url, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}