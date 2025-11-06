import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Package, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WebContainerManagerProps {
  files: Record<string, string>;
  onInstallComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

interface InstallationStatus {
  package: string;
  status: 'pending' | 'installing' | 'success' | 'error';
  output?: string;
  error?: string;
}

export const WebContainerManager: React.FC<WebContainerManagerProps> = ({
  files,
  onInstallComplete,
  onError
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installations, setInstallations] = useState<InstallationStatus[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [containerReady, setContainerReady] = useState(false);
  
  const webcontainerRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Initialize WebContainer
  useEffect(() => {
    initializeWebContainer();
    return () => {
      if (webcontainerRef.current) {
        webcontainerRef.current.teardown?.();
      }
    };
  }, []);

  // Auto-detect and install dependencies when files change
  useEffect(() => {
    if (containerReady && Object.keys(files).length > 0) {
      detectAndInstallDependencies();
    }
  }, [files, containerReady]);

  const initializeWebContainer = async () => {
    try {
      addTerminalOutput('Initializing WebContainer...');
      
      // Simulate WebContainer initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, you would use:
      // const { WebContainer } = await import('@webcontainer/api');
      // webcontainerRef.current = await WebContainer.boot();
      
      webcontainerRef.current = {
        // Mock WebContainer API
        mount: async (tree: any) => {
          addTerminalOutput('Mounting file system...');
          await new Promise(resolve => setTimeout(resolve, 500));
        },
        spawn: async (command: string, args: string[] = []) => {
          addTerminalOutput(`$ ${command} ${args.join(' ')}`);
          
          // Simulate command execution
          return {
            output: {
              pipeTo: (writable: any) => {
                // Simulate streaming output
                setTimeout(() => {
                  if (command === 'npm' && args[0] === 'install') {
                    addTerminalOutput('Installing packages...');
                    addTerminalOutput('✓ Packages installed successfully');
                  }
                }, 1000);
              }
            },
            exit: Promise.resolve(0)
          };
        },
        fs: {
          writeFile: async (path: string, content: string) => {
            addTerminalOutput(`Writing ${path}`);
          },
          readFile: async (path: string) => {
            return 'file content';
          }
        }
      };
      
      setIsInitialized(true);
      setContainerReady(true);
      addTerminalOutput('WebContainer initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize WebContainer:', error);
      addTerminalOutput(`Error: ${error}`);
      onError?.('Failed to initialize WebContainer');
    }
  };

  const addTerminalOutput = (line: string) => {
    setTerminalOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
    
    // Auto-scroll terminal
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };

  const detectAndInstallDependencies = async () => {
    if (isInstalling || !webcontainerRef.current) return;
    
    try {
      setIsInstalling(true);
      addTerminalOutput('Analyzing dependencies...');
      
      // Analyze files for dependencies
      const response = await fetch('/api/dependencies/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files })
      });
      
      const { dependencies, frameworks } = await response.json();
      
      if (dependencies.length === 0) {
        addTerminalOutput('No external dependencies detected');
        setIsInstalling(false);
        return;
      }
      
      addTerminalOutput(`Found ${dependencies.length} dependencies: ${dependencies.join(', ')}`);
      
      // Initialize installation status
      const installStatuses = dependencies.map((dep: string) => ({
        package: dep,
        status: 'pending' as const
      }));
      setInstallations(installStatuses);
      
      // Mount files to WebContainer
      await mountFilesToContainer();
      
      // Install dependencies
      await installDependenciesInContainer(dependencies);
      
      onInstallComplete?.({ dependencies, frameworks });
      
    } catch (error) {
      console.error('Dependency installation failed:', error);
      addTerminalOutput(`Installation failed: ${error}`);
      onError?.('Dependency installation failed');
    } finally {
      setIsInstalling(false);
    }
  };

  const mountFilesToContainer = async () => {
    if (!webcontainerRef.current) return;
    
    addTerminalOutput('Mounting project files...');
    
    // Convert files to WebContainer tree structure
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
    
    await webcontainerRef.current.mount(fileTree);
    addTerminalOutput('Files mounted successfully');
  };

  const installDependenciesInContainer = async (dependencies: string[]) => {
    if (!webcontainerRef.current) return;
    
    // Group dependencies by package manager
    const npmDeps = dependencies.filter(dep => 
      !['django', 'flask', 'numpy', 'pandas'].includes(dep.toLowerCase())
    );
    
    if (npmDeps.length > 0) {
      await installNpmPackages(npmDeps);
    }
  };

  const installNpmPackages = async (packages: string[]) => {
    if (!webcontainerRef.current) return;
    
    try {
      addTerminalOutput(`Installing npm packages: ${packages.join(', ')}`);
      
      // Update installation status
      setInstallations(prev => prev.map(inst => 
        packages.includes(inst.package) 
          ? { ...inst, status: 'installing' }
          : inst
      ));
      
      // Create package.json if it doesn't exist
      if (!files['package.json']) {
        const packageJson = {
          name: 'webcontainer-project',
          version: '1.0.0',
          dependencies: {}
        };
        
        await webcontainerRef.current.fs.writeFile(
          '/package.json',
          JSON.stringify(packageJson, null, 2)
        );
      }
      
      // Run npm install
      const installProcess = await webcontainerRef.current.spawn('npm', [
        'install',
        ...packages
      ]);
      
      // Stream output
      installProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          addTerminalOutput(chunk.toString());
        }
      }));
      
      const exitCode = await installProcess.exit;
      
      if (exitCode === 0) {
        // Mark packages as successfully installed
        setInstallations(prev => prev.map(inst => 
          packages.includes(inst.package)
            ? { ...inst, status: 'success', output: 'Installed successfully' }
            : inst
        ));
        addTerminalOutput('✓ All packages installed successfully');
      } else {
        throw new Error(`npm install failed with exit code ${exitCode}`);
      }
      
    } catch (error) {
      // Mark packages as failed
      setInstallations(prev => prev.map(inst => 
        packages.includes(inst.package)
          ? { ...inst, status: 'error', error: error.toString() }
          : inst
      ));
      addTerminalOutput(`✗ Installation failed: ${error}`);
      throw error;
    }
  };

  const getStatusIcon = (status: InstallationStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Package className="w-4 h-4 text-gray-400" />;
      case 'installing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center gap-2">
        <Terminal className="w-5 h-5 text-gray-600" />
        <span className="font-medium">WebContainer Environment</span>
        <div className={`ml-auto w-2 h-2 rounded-full ${
          containerReady ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
      </div>

      {/* Installation Status */}
      {installations.length > 0 && (
        <div className="p-4 border-b">
          <h4 className="font-medium mb-2">Package Installation</h4>
          <div className="space-y-2">
            {installations.map((inst, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {getStatusIcon(inst.status)}
                <span className="font-mono">{inst.package}</span>
                {inst.status === 'installing' && (
                  <span className="text-blue-600">Installing...</span>
                )}
                {inst.status === 'success' && (
                  <span className="text-green-600">✓ Installed</span>
                )}
                {inst.status === 'error' && (
                  <span className="text-red-600">✗ Failed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div className="h-64 bg-black text-green-400 font-mono text-sm overflow-hidden">
        <div 
          ref={terminalRef}
          className="h-full overflow-y-auto p-4 space-y-1"
        >
          {terminalOutput.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
          {isInstalling && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebContainerManager;