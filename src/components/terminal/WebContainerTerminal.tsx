import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Settings } from 'lucide-react';
import XTerminal from './XTerminal';

interface WebContainerTerminalProps {
  files?: Record<string, string>;
  onProcessStart?: (process: any) => void;
  onProcessEnd?: (exitCode: number) => void;
  theme?: 'dark' | 'light';
}

export const WebContainerTerminal: React.FC<WebContainerTerminalProps> = ({
  files = {},
  onProcessStart,
  onProcessEnd,
  theme = 'dark'
}) => {
  const [webContainer, setWebContainer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProcess, setCurrentProcess] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const terminalRef = useRef<any>(null);

  // Initialize WebContainer
  useEffect(() => {
    const initWebContainer = async () => {
      try {
        setIsLoading(true);
        
        // Mock WebContainer for development
        const mockContainer = {
          mount: async (tree: any) => {
            console.log('Mounting files:', Object.keys(tree));
          },
          spawn: async (command: string, args: string[] = [], options: any = {}) => {
            console.log(`Spawning: ${command} ${args.join(' ')}`);
            
            const mockProcess = {
              input: {
                getWriter: () => ({
                  write: (data: Uint8Array) => {
                    console.log('Input:', new TextDecoder().decode(data));
                  }
                })
              },
              output: {
                pipeTo: (writable: WritableStream) => {
                  // Simulate command output
                  const writer = writable.getWriter();
                  
                  if (command === 'npm' && args[0] === 'install') {
                    setTimeout(() => writer.write(new TextEncoder().encode('Installing packages...\n')), 500);
                    setTimeout(() => writer.write(new TextEncoder().encode('✓ Packages installed\n')), 2000);
                  } else if (command === 'npm' && args[0] === 'run' && args[1] === 'dev') {
                    setTimeout(() => writer.write(new TextEncoder().encode('Starting dev server...\n')), 500);
                    setTimeout(() => writer.write(new TextEncoder().encode('Server running on http://localhost:3000\n')), 1500);
                  } else {
                    setTimeout(() => writer.write(new TextEncoder().encode(`${command}: command executed\n`)), 300);
                  }
                }
              },
              exit: new Promise(resolve => {
                setTimeout(() => resolve(0), 3000);
              }),
              kill: () => {
                console.log('Process killed');
              },
              resize: (size: { cols: number; rows: number }) => {
                console.log('Terminal resized:', size);
              }
            };
            
            return mockProcess;
          },
          fs: {
            writeFile: async (path: string, content: string) => {
              console.log(`Writing file: ${path}`);
            },
            readFile: async (path: string) => {
              return files[path] || '';
            }
          }
        };
        
        setWebContainer(mockContainer);
        setStatus('idle');
        
      } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
        setStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    initWebContainer();
  }, []);

  // Mount files when they change
  useEffect(() => {
    if (!webContainer || Object.keys(files).length === 0) return;

    const mountFiles = async () => {
      try {
        const fileTree: any = {};
        
        Object.entries(files).forEach(([filename, content]) => {
          const parts = filename.split('/');
          let current = fileTree;
          
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = { directory: {} };
            }
            current = current[parts[i]].directory;
          }
          
          current[parts[parts.length - 1]] = {
            file: { contents: content }
          };
        });
        
        await webContainer.mount(fileTree);
        terminalRef.current?.writeln('Files mounted successfully');
        
      } catch (error) {
        console.error('Failed to mount files:', error);
        terminalRef.current?.writeln(`Error mounting files: ${error}`);
      }
    };

    mountFiles();
  }, [webContainer, files]);

  const runCommand = async (command: string) => {
    if (!webContainer || !terminalRef.current) return;

    try {
      setStatus('running');
      const [cmd, ...args] = command.split(' ');
      
      const process = await webContainer.spawn(cmd, args);
      setCurrentProcess(process);
      onProcessStart?.(process);
      
      const exitCode = await process.exit;
      setStatus('idle');
      setCurrentProcess(null);
      onProcessEnd?.(exitCode);
      
    } catch (error) {
      setStatus('error');
      terminalRef.current.writeln(`Error: ${error}`);
    }
  };

  const stopProcess = () => {
    if (currentProcess) {
      currentProcess.kill();
      setCurrentProcess(null);
      setStatus('idle');
    }
  };

  const quickCommands = [
    { label: 'Install', command: 'npm install', icon: Play },
    { label: 'Dev Server', command: 'npm run dev', icon: Play },
    { label: 'Build', command: 'npm run build', icon: Settings },
    { label: 'Test', command: 'npm test', icon: Play }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Initializing WebContainer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="webcontainer-terminal h-full flex flex-col">
      {/* Toolbar */}
      <div className="toolbar bg-gray-800 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'idle' ? 'bg-green-500' :
            status === 'running' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="text-sm capitalize">{status}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {currentProcess && (
            <button
              onClick={stopProcess}
              className="p-1 hover:bg-gray-700 rounded"
              title="Stop Process"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => terminalRef.current?.clear()}
            className="p-1 hover:bg-gray-700 rounded"
            title="Clear Terminal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="quick-commands bg-gray-700 p-2 flex gap-2 overflow-x-auto">
        {quickCommands.map((cmd, index) => (
          <button
            key={index}
            onClick={() => runCommand(cmd.command)}
            disabled={status === 'running'}
            className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 rounded text-sm text-white whitespace-nowrap"
          >
            <cmd.icon className="w-3 h-3" />
            {cmd.label}
          </button>
        ))}
      </div>

      {/* Terminal */}
      <div className="flex-1">
        <XTerminal
          ref={terminalRef}
          webContainer={webContainer}
          theme={theme}
          onReady={(terminal) => {
            terminalRef.current = terminal;
          }}
        />
      </div>
    </div>
  );
};

export default WebContainerTerminal;