import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatPanel from "@/components/studio/ChatPanel";
import RightPanel from "@/components/studio/RightPanel";
import StudioHeader from "@/components/studio/StudioHeader";
import PublishDialog from "@/components/studio/PublishDialog";
import { handleGitHubCallback } from "@/lib/github";
import { StudioSession, createSession, loadSession, upsertSession } from "@/lib/session";

export default function Studio() {
  const [sp] = useSearchParams();
  const [session, setSession] = useState<StudioSession | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "logs" | "deployments">("preview");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState("");

  // establish or load session from query
  useEffect(() => {
    const existingId = sp.get("sid");
    let s = existingId ? loadSession(existingId) : undefined;
    if (!s) {
      s = createSession({
        prompt: sp.get("q") || "Create a modern web application",
        agent: sp.get("agent") || "claude",
        planEnabled: sp.get("plan") === "1",
      });
    }
    setSession(s);
    
    // Handle tab query parameter
    const tabParam = sp.get("tab");
    if (tabParam === "code" || tabParam === "preview" || tabParam === "logs" || tabParam === "deployments") {
      setActiveTab(tabParam);
    } else {
      setActiveTab("preview");
    }

    // Handle GitHub OAuth callback
    if (sp.get("code") && sp.get("state")) {
      handleGitHubCallback();
    }
  }, [sp]);

  const onSessionChange = useCallback((s: StudioSession) => {
    setSession(s);
    upsertSession(s);
  }, []);



  const content = useMemo(() => {
    if (!session) return null;
    return (
      <div className="h-screen flex flex-col">
        <StudioHeader
          session={session}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onPublishClick={() => setPublishDialogOpen(true)}
        />
        <ResizablePanelGroup direction="horizontal" className="hidden lg:flex flex-1 border-t">
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60} className="border-r">
            <ChatPanel session={session} onSessionChange={onSessionChange} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={40}>
            <RightPanel 
              session={session} 
              forceTab={activeTab} 
              hideTabs={true}
              onTabChange={(tab) => setActiveTab(tab)}
              onCodeChange={(code) => setCurrentCode(code)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
        <div className="lg:hidden flex-1 flex flex-col">
          {/* Mobile/Tablet: unified tabs */}
          <Tabs 
            value={activeTab === "code" ? "code" : activeTab === "logs" ? "logs" : activeTab === "preview" ? "preview" : activeTab === "deployments" ? "deployments" : "chat"} 
            className="flex-1 flex flex-col"
            onValueChange={(value) => {
              if (value === "code" || value === "logs" || value === "preview" || value === "deployments") {
                setActiveTab(value);
              }
            }}
          >
            <div className="px-2 py-2 border-b overflow-x-auto">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="chat" className="text-xs px-2">Chat</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs px-2">Preview</TabsTrigger>
                <TabsTrigger value="code" className="text-xs px-2">Code</TabsTrigger>
                <TabsTrigger value="logs" className="text-xs px-2">Logs</TabsTrigger>
                <TabsTrigger value="deployments" className="text-xs px-2">Deploy</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 p-0 m-0">
              <div className="h-[calc(100vh-120px)]">
                <ChatPanel session={session} onSessionChange={onSessionChange} />
              </div>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 p-0 m-0">
              <div className="h-[calc(100vh-120px)]">
                <RightPanel session={session} forceTab="preview" hideTabs onCodeChange={(code) => setCurrentCode(code)} />
              </div>
            </TabsContent>
            <TabsContent value="code" className="flex-1 p-0 m-0">
              <div className="h-[calc(100vh-120px)] flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <RightPanel session={session} forceTab="code" hideTabs onCodeChange={(code) => setCurrentCode(code)} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="logs" className="flex-1 p-0 m-0">
              <div className="h-[calc(100vh-120px)]">
                <RightPanel session={session} forceTab="logs" hideTabs onCodeChange={(code) => setCurrentCode(code)} />
              </div>
            </TabsContent>
            <TabsContent value="deployments" className="flex-1 p-0 m-0">
              <div className="h-[calc(100vh-120px)]">
                <RightPanel session={session} forceTab="deployments" hideTabs onCodeChange={(code) => setCurrentCode(code)} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }, [session, activeTab, onSessionChange]);

  return (
    <>
      {content}
      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        code={currentCode}
        projectName={session?.projectName || "Arca AI Project"}
      />
    </>
  );
}


