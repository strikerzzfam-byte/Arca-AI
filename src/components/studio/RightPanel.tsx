import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";
import PreviewFrame from "./PreviewFrame";
import VirtualTerminal from "./VirtualTerminal";
import DeploymentHistory from "./DeploymentHistory";
import FileExplorer from "./FileExplorer";
import type { StudioSession } from "@/lib/session";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";

type Props = {
  session: StudioSession;
  forceTab?: "preview" | "code" | "logs" | "deployments";
  hideTabs?: boolean;
  onTabChange?: (tab: "preview" | "code" | "logs" | "deployments") => void;
  onCodeChange?: (code: string) => void;
  terminalCommands?: string[];
};

export default function RightPanel({ session, forceTab, hideTabs, onTabChange, onCodeChange, terminalCommands }: Props) {
  const [selectedFile, setSelectedFile] = useState<string>("index.html");
  const [currentCode, setCurrentCode] = useState(session.generatedCode || '<!-- Generated HTML will appear here -->');

  const handleCodeChange = (value: string) => {
    onCodeChange?.(value);
  };

  // Update current code when session changes
  useEffect(() => {
    if (session.files && session.files[selectedFile]) {
      setCurrentCode(session.files[selectedFile]);
    } else if (selectedFile === "index.html" && session.generatedCode) {
      setCurrentCode(session.generatedCode);
    } else if (session.generatedCode && selectedFile === "index.html") {
      setCurrentCode(session.generatedCode);
    }
  }, [session.files, session.generatedCode, selectedFile]);

  // Auto-select index.html when code is generated
  useEffect(() => {
    if (session.generatedCode && !session.files) {
      setSelectedFile("index.html");
      setCurrentCode(session.generatedCode);
    }
  }, [session.generatedCode, session.files]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <Tabs 
          value={forceTab || "preview"} 
          className="h-full flex flex-col"
          onValueChange={(value) => {
            if (onTabChange && (value === "preview" || value === "code" || value === "logs" || value === "deployments")) {
              onTabChange(value);
            }
          }}
        >
          {!hideTabs && (
            <div className="px-4 py-3 border-b flex items-center">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="deployments" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Deployments
                </TabsTrigger>
              </TabsList>
            </div>
          )}
          <TabsContent value="preview" className="flex-1 p-0 m-0">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <PreviewFrame 
                  title="Arca Preview" 
                  prompt={session.prompt} 
                  generatedCode={session.generatedCode}
                />
              </div>
              <div className="h-32 lg:h-48 border-t">
                <VirtualTerminal autoCommands={terminalCommands} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="code" className="flex-1 p-0 m-0">
            <div className="h-full flex flex-col">
              <div className="flex-1 flex overflow-hidden">
                <div className="w-64 border-r overflow-y-auto">
                  <FileExplorer 
                    onFileSelect={(file) => {
                      setSelectedFile(file.name);
                      setCurrentCode(file.content || `// ${file.name}`);
                    }}
                    selectedFile={selectedFile}
                    sessionFiles={session.files}
                  />
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-3 py-2 border-b bg-secondary/20 text-sm text-muted-foreground">
                    {selectedFile}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CodeMirror
                      value={currentCode}
                      onChange={(value) => {
                        setCurrentCode(value);
                        handleCodeChange(value);
                      }}
                      height="calc(100vh - 280px)"
                      extensions={[
                        selectedFile.endsWith('.html') ? html() : 
                        selectedFile.endsWith('.css') ? css() :
                        javascript({ jsx: true, typescript: true }),
                        EditorView.lineWrapping,
                        EditorView.theme({
                          '&': {
                            fontSize: '14px'
                          },
                          '.cm-scroller': {
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                            overflow: 'auto !important'
                          },
                          '.cm-focused': {
                            outline: 'none'
                          }
                        })
                      ]}
                      theme={oneDark}
                      basicSetup={{
                        lineNumbers: true,
                        foldGutter: true,
                        autocompletion: true,
                        highlightSelectionMatches: false,
                        searchKeymap: true
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="h-32 lg:h-48 border-t">
                <VirtualTerminal autoCommands={terminalCommands} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="logs" className="flex-1 p-0 m-0">
            <ScrollArea className="h-full p-4">
              <ul className="text-xs space-y-2">
                {session.logs?.map((l, i) => (
                  <li key={i} className="font-mono opacity-80">{l}</li>
                )) || []}
              </ul>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="deployments" className="flex-1 p-4 m-0">
            <DeploymentHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}