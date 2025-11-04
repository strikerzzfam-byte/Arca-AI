import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, ArrowRight, Github, Figma, Sparkles, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { generateWebsite } from "@/lib/ai";
import { createSession } from "@/lib/session";

type Agent = "claude" | "gpt" | "sonnet";

function isPromptValidLocal(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 10) return false;
  if (/[^\r\n\t\x20-\x7E]/.test(trimmed)) return false;
  return true;
}

export default function TryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [prompt, setPrompt] = useState<string>(searchParams.get("q") ?? "");
  const [agent, setAgent] = useState<Agent>((searchParams.get("agent") as Agent) || "claude");
  const [planEnabled, setPlanEnabled] = useState<boolean>(searchParams.get("plan") === "1");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // derived
  const promptIsValid = useMemo(() => isPromptValidLocal(prompt), [prompt]);

  // keep URL in sync (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (prompt) next.set("q", prompt); else next.delete("q");
      next.set("agent", agent);
      next.set("plan", planEnabled ? "1" : "0");
      setSearchParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(id);
  }, [prompt, agent, planEnabled]);

  // keyboard: Cmd/Ctrl+Enter => submit, Enter => newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!promptIsValid || submitting) return;
    setSubmitting(true);
    
    try {
      // Generate React application using AI
      const result = await generateWebsite(prompt);
      
      // Create session with generated files
      const session = createSession({
        prompt,
        agent,
        planEnabled,
        files: result.files,
        mainFile: result.mainFile,
        generatedCode: result.files["index.html"] || result.files[result.mainFile],
        messages: [
          {
            id: crypto.randomUUID(),
            role: "user",
            content: prompt,
            createdAt: Date.now()
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "I've generated your React application! Check the preview and code tabs.",
            createdAt: Date.now()
          }
        ]
      });
      
      // Navigate to studio with session ID
      navigate(`/studio?sid=${session.id}`);
    } catch (error) {
      console.error("Generation failed:", error);
      toast({ 
        title: "Generation failed", 
        description: "Please try again with a different prompt.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle radial/gradient background to match vibe */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <main className="relative z-10 container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">What will you <span className="neon-text">build</span> today?</h1>
            <p className="text-muted-foreground mt-3">Create stunning apps & websites by chatting with AI.</p>
          </div>

          <Card className="glass-strong rounded-2xl border-primary/20">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center mt-1">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      console.log("prompt_update", e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Let's build a customer portal where users can.."
                    className="min-h-[110px] text-base md:text-lg bg-secondary/40 border-primary/20 focus-visible:ring-primary/40"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="glass-card w-9 h-9 p-0" type="button" aria-label="Add-ons">
                          <span className="sr-only">Add-ons</span>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-60 p-0 overflow-hidden">
                        <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/60">
                          <input type="file" className="hidden" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              console.log("file_selected", { name: f.name, size: f.size, type: f.type });
                              toast({ title: "File attached", description: f.name });
                            }
                          }} />
                          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-muted-foreground"><path d="M6 2a2 2 0 0 0-2 2v12a6 6 0 0 0 12 0V6a4 4 0 1 0-8 0v10a2 2 0 1 0 4 0V7h-2v9a0 0 0 1 1 0 0 2 2 0 1 1-4 0V6a2 2 0 1 1 4 0v10a4 4 0 1 1-8 0V4a4 4 0 0 1 4-4h10v2z"/></svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm">Attach file</span>
                            <span className="text-xs text-muted-foreground">Max 10MB</span>
                          </div>
                        </label>
                      </PopoverContent>
                    </Popover>

                    <div className="flex items-center gap-2">
                      <Label htmlFor="agent" className="text-sm text-muted-foreground">Agent</Label>
                      <Select value={agent} onValueChange={(v) => setAgent(v as Agent)}>
                        <SelectTrigger id="agent" className="w-[160px]">
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude">Claude Agent</SelectItem>
                          <SelectItem value="gpt">GPT Agent</SelectItem>
                          <SelectItem value="sonnet">Sonnet Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 pl-2">
                      <Label htmlFor="plan" className="text-sm text-muted-foreground">Plan</Label>
                      <Switch id="plan" checked={planEnabled} onCheckedChange={setPlanEnabled} aria-label="Plan toggle" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1 md:mt-0">
                    <Button
                      className="gradient-accent px-6"
                      onClick={handleSubmit}
                      disabled={!promptIsValid || submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Build now <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>or import from</span>
                  <Button variant="outline" className="glass-card h-9 px-3" type="button">
                    <Figma className="w-4 h-4 mr-2" /> Figma
                  </Button>
                  <Button variant="outline" className="glass-card h-9 px-3" type="button">
                    <Github className="w-4 h-4 mr-2" /> GitHub
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


