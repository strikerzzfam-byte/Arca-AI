import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatMessage, StudioSession, upsertSession } from "@/lib/session";

type Props = {
  session: StudioSession;
  onSessionChange(session: StudioSession): void;
};

export default function ChatPanel({ session, onSessionChange }: Props) {
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
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

  function fakeAssistant(prompt: string) {
    setStreaming(true);
    const base = `Okay, I'll start scaffolding your project for: "${prompt}".`;
    const steps = [
      "Create project structure",
      "Install UI dependencies",
      "Generate landing components",
      "Prepare preview sandbox",
      "Write initial tests",
    ];
    let idx = 0;
    const assistant: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: base + "\n\n",
      createdAt: Date.now(),
    };
    appendMessage(assistant);
    const timer = setInterval(() => {
      idx++;
      const next = { ...session };
      const last = next.messages[next.messages.length - 1];
      if (last && last.id === assistant.id) {
        last.content += `• ${steps[idx - 1]}\n`;
      }
      next.logs = [...next.logs, `Step ${idx}: ${steps[idx - 1]}`];
      onSessionChange(next);
      upsertSession(next);
      if (idx >= steps.length) {
        clearInterval(timer);
        setStreaming(false);
      }
    }, 700);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-medium">Chat</h2>
      </div>
      <ScrollArea ref={listRef} className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {session.messages.map((m) => (
            <div key={m.id} className="text-sm">
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


