import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatPanel from "@/components/studio/ChatPanel";
import RightPanel from "@/components/studio/RightPanel";
import { StudioSession, createSession, loadSession, upsertSession } from "@/lib/session";

export default function Studio() {
  const [sp] = useSearchParams();
  const [session, setSession] = useState<StudioSession | null>(null);

  // establish or load session from query
  useEffect(() => {
    const existingId = sp.get("sid");
    let s = existingId ? loadSession(existingId) : undefined;
    if (!s) {
      s = createSession({
        prompt: sp.get("q") || "",
        agent: sp.get("agent") || "claude",
        planEnabled: sp.get("plan") === "1",
      });
    }
    setSession(s);
  }, []);

  const onSessionChange = (s: StudioSession) => {
    setSession(s);
    upsertSession(s);
  };

  const content = useMemo(() => {
    if (!session) return null;
    return (
      <div className="h-screen">
        <ResizablePanelGroup direction="horizontal" className="hidden md:flex h-full border-t">
          <ResizablePanel defaultSize={32} minSize={24} maxSize={50} className="border-r">
            <ChatPanel session={session} onSessionChange={onSessionChange} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={68} minSize={40}>
            <RightPanel session={session} />
          </ResizablePanel>
        </ResizablePanelGroup>
        <div className="md:hidden h-full">
          {/* Mobile: unified tabs */}
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <div className="px-3 py-2 border-b">
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="chat" className="flex-1 p-0 m-0">
              <div className="h-[calc(100vh-140px)]">
                <ChatPanel session={session} onSessionChange={onSessionChange} />
              </div>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 p-0 m-0">
              <div className="h-[calc(100vh-140px)]">
                <RightPanel session={session} forceTab="preview" hideTabs />
              </div>
            </TabsContent>
            <TabsContent value="code" className="flex-1 p-0 m-0">
              <div className="h-[calc(100vh-140px)]">
                <RightPanel session={session} forceTab="code" hideTabs />
              </div>
            </TabsContent>
            <TabsContent value="logs" className="flex-1 p-0 m-0">
              <div className="h-[calc(100vh-140px)]">
                <RightPanel session={session} forceTab="logs" hideTabs />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }, [session]);

  return content;
}


