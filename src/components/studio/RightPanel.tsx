import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PreviewFrame from "./PreviewFrame";
import type { StudioSession } from "@/lib/session";

type Props = {
  session: StudioSession;
  forceTab?: "preview" | "code" | "logs";
  hideTabs?: boolean;
};

const starterCode = `// main.ts
import { createRoot } from 'react-dom/client'
import App from './App'
createRoot(document.getElementById('root')!).render(<App />)

// App.tsx
export default function App(){
  return <h1>Hello from Arca Studio</h1>
}
`;

export default function RightPanel({ session, forceTab, hideTabs }: Props) {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue={forceTab || "preview"} value={forceTab} className="flex-1 flex flex-col">
        {!hideTabs && (
          <div className="px-4 py-3 border-b flex items-center">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          </div>
        )}
        <TabsContent value="preview" className="flex-1 p-0 m-0">
          <div className="h-[calc(100vh-190px)] md:h-[calc(100vh-160px)]">
            <PreviewFrame title="Arca Preview" prompt={session.prompt} />
          </div>
        </TabsContent>
        <TabsContent value="code" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[calc(100vh-190px)] md:h-[calc(100vh-160px)] p-4">
            <pre className="text-xs md:text-sm whitespace-pre rounded-md border p-4 bg-secondary/30">
{starterCode}
            </pre>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="logs" className="flex-1 p-0 m-0">
          <ScrollArea className="h-[calc(100vh-190px)] md:h-[calc(100vh-160px)] p-4">
            <ul className="text-xs space-y-2">
              {session.logs.map((l, i) => (
                <li key={i} className="font-mono opacity-80">{l}</li>
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}


