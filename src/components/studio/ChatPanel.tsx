import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatMessage, StudioSession, upsertSession } from "@/lib/session";
import { generateWebsite, updateWebsite } from "@/lib/ai";
import { toast } from "sonner";
import gsap from "gsap";

type Props = {
  session: StudioSession;
  onSessionChange(session: StudioSession): void;
};

export default function ChatPanel({ session, onSessionChange }: Props) {
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
    if (session.messages.length > 0 && messageRefs.current[session.messages.length - 1]) {
      gsap.fromTo(messageRefs.current[session.messages.length - 1],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [session.messages.length]);

  function appendMessage(msg: ChatMessage) {
    const next = { ...session, messages: [...session.messages, msg] };
    onSessionChange(next);
    upsertSession(next);
  }

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const user: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    appendMessage(user);
    setInput("");
    fakeAssistant(trimmed);
  };

  async function fakeAssistant(prompt: string) {
    setStreaming(true);
    
    const assistant: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: session.generatedCode ? "Updating your website..." : "Generating your website...",
      createdAt: Date.now(),
    };
    appendMessage(assistant);

    try {
      let result;
      
      if (session.files) {
        // Update existing React app
        result = await updateWebsite(prompt, session.files);
      } else {
        // Generate new React app
        result = await generateWebsite(prompt);
      }
      
      const next = { ...session };
      const last = next.messages[next.messages.length - 1];
      if (last && last.id === assistant.id) {
        last.content = session.files 
          ? "I've updated your React application! Check the preview and code tabs to see the changes."
          : "I've generated your React application! Check the preview and code tabs to see the result.";
      }
      
      next.files = result.files;
      next.mainFile = result.mainFile;
      next.generatedCode = result.files["index.html"] || result.files[result.mainFile];
      next.logs = [...next.logs, session.files ? "React app updated successfully" : "React app generated successfully"];
      
      onSessionChange(next);
      upsertSession(next);
      toast.success(session.files ? "React app updated!" : "React app generated!");
    } catch (error) {
      const next = { ...session };
      const last = next.messages[next.messages.length - 1];
      if (last && last.id === assistant.id) {
        last.content = "Sorry, I encountered an error. Please try again.";
      }
      next.logs = [...next.logs, "Error: Failed to process request"];
      onSessionChange(next);
      upsertSession(next);
      toast.error("Failed to process request");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-medium">Chat</h2>
      </div>
      <ScrollArea ref={listRef} className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {session.messages.map((m, index) => (
            <div key={m.id} ref={el => messageRefs.current[index] = el} className="text-sm">
              <div className="text-muted-foreground mb-1">{m.role === "user" ? "You" : "Arca"}</div>
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              <Separator className="my-4" />
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 border-t space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Arca to build something..."
          className="min-h-[84px]"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send();
          }}
        />
        <div className="flex items-center justify-end gap-2">
          <Button onClick={send} disabled={!input.trim() || streaming}>Send</Button>
        </div>
      </div>
    </div>
  );
}


