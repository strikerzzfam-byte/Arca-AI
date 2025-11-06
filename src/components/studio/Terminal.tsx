import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface TerminalLine {
  id: string;
  type: "command" | "output" | "error";
  content: string;
  timestamp: number;
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "1",
      type: "output",
      content: "Welcome to Arca Studio Terminal",
      timestamp: Date.now(),
    },
    {
      id: "2",
      type: "output",
      content: "Type 'help' for available commands",
      timestamp: Date.now(),
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const executeCommand = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    // Add command to history
    const newHistory = [...commandHistory, trimmed];
    setCommandHistory(newHistory);
    setHistoryIndex(newHistory.length);

    // Add command line
    const commandLine: TerminalLine = {
      id: crypto.randomUUID(),
      type: "command",
      content: trimmed,
      timestamp: Date.now(),
    };

    setLines((prev) => [...prev, commandLine]);

    // Simulate command execution
    setTimeout(() => {
      let output = "";
      const parts = trimmed.split(" ");
      const cmd = parts[0].toLowerCase();

      switch (cmd) {
        case "help":
          output = `Available commands:
  help          - Show this help message
  clear         - Clear the terminal
  echo <text>   - Echo text back
  ls            - List files (simulated)
  cd <dir>      - Change directory (simulated)
  pwd           - Print working directory
  npm <cmd>     - Run npm command (simulated)
  git <cmd>     - Run git command (simulated)
  exit          - Exit terminal (not implemented)`;
          break;

        case "clear":
          setLines([]);
          return;

        case "echo":
          output = parts.slice(1).join(" ") || "";
          break;

        case "ls":
          output = `src/
  components/
  pages/
  lib/
  assets/
  package.json
  tsconfig.json
  vite.config.ts`;
          break;

        case "cd":
          output = `Directory changed to: ${parts[1] || "~"}`;
          break;

        case "pwd":
          output = "/Users/arca/Projects/Arca-AI";
          break;

        case "npm":
          const npmCmd = parts[1] || "help";
          if (npmCmd === "run") {
            output = `Running: ${parts[2] || "dev"}\n> vite-react-typescript-starter@0.0.0 ${parts[2] || "dev"}\n> vite\n\nVITE v5.0.0  ready in 500 ms\n\n➜  Local:   http://localhost:5173/`;
          } else {
            output = `npm ${npmCmd} executed (simulated)`;
          }
          break;

        case "git":
          const gitCmd = parts[1] || "status";
          output = `git ${gitCmd} executed (simulated)`;
          break;

        default:
          output = `Command not found: ${cmd}. Type 'help' for available commands.`;
      }

      const outputLine: TerminalLine = {
        id: crypto.randomUUID(),
        type: output.includes("not found") ? "error" : "output",
        content: output,
        timestamp: Date.now(),
      };

      setLines((prev) => [...prev, outputLine]);
    }, 100);
  }, [commandHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(currentInput);
      setCurrentInput("");
      setHistoryIndex(commandHistory.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex <= 0 ? commandHistory.length - 1 : historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= commandHistory.length - 1) {
        setHistoryIndex(commandHistory.length);
        setCurrentInput("");
      } else {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-1">
          {lines.map((line) => (
            <div key={line.id} className="flex items-start gap-2">
              {line.type === "command" && (
                <span className="text-[#569cd6]">$</span>
              )}
              <span
                className={
                  line.type === "error"
                    ? "text-[#f48771]"
                    : line.type === "command"
                    ? "text-[#d4d4d4]"
                    : "text-[#9cdcfe]"
                }
              >
                {line.content}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-[#3e3e3e] p-2 flex items-center gap-2">
        <span className="text-[#569cd6]">$</span>
        <Input
          ref={inputRef}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command..."
          className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#d4d4d4] placeholder:text-[#6a6a6a]"
          autoFocus
        />
      </div>
    </div>
  );
}

