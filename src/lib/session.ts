const STORAGE_KEY = "arca_studio_sessions";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type StudioSession = {
  id: string;
  prompt: string;
  agent: string;
  planEnabled: boolean;
  messages: ChatMessage[];
  logs: string[];
  githubToken?: string;
  projectName: string;
  generatedCode?: string;
  files?: Record<string, string>;
  mainFile?: string;
};

function loadAll(): Record<string, StudioSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(map: Record<string, StudioSession>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function createSession(seed: Partial<StudioSession>): StudioSession {
  const id = crypto.randomUUID();
  const session: StudioSession = {
    id,
    prompt: seed.prompt || "Create a modern web application",
    agent: seed.agent || "claude",
    planEnabled: !!seed.planEnabled,
    messages: seed.messages || [],
    logs: seed.logs || ["Session created", "Ready to build your application"],
    githubToken: seed.githubToken,
    projectName: seed.projectName || "Arca AI Project",
    generatedCode: seed.generatedCode,
    files: seed.files,
    mainFile: seed.mainFile,
  };
  const all = loadAll();
  all[id] = session;
  saveAll(all);
  return session;
}

export function loadSession(id: string): StudioSession | undefined {
  return loadAll()[id];
}

export function upsertSession(session: StudioSession) {
  const all = loadAll();
  all[session.id] = session;
  saveAll(all);
}


