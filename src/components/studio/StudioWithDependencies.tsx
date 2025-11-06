import React, { useState, useEffect } from 'react';
import { Code, Play, Settings, Package } from 'lucide-react';
import AutoDependencySystem from './AutoDependencySystem';
import VirtualTerminal from './VirtualTerminal';

interface StudioWithDependenciesProps {
  initialFiles?: Record<string, string>;
  onFilesChange?: (files: Record<string, string>) => void;
}

export const StudioWithDependencies: React.FC<StudioWithDependenciesProps> = ({
  initialFiles = {},
  onFilesChange
}) => {
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const [activeFile, setActiveFile] = useState<string>('');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [showDependencyPanel, setShowDependencyPanel] = useState(true);
  const [terminalCommands, setTerminalCommands] = useState<string[]>([]);
  const [systemSettings, setSystemSettings] = useState({
    autoInstall: true,
    debounceMs: 2000,
    useWebContainer: false,
    showProgress: true
  });

  // Initialize with sample files if none provided
  useEffect(() => {
    if (Object.keys(files).length === 0) {
      const sampleFiles = {
        'App.jsx': `import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function App() {
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data');
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <h1>My App</h1>
      <button onClick={fetchData}>Fetch Data</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </motion.div>
  );
}

export default App;`,
        'package.json': `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`,
        'style.css': `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}`
      };
      
      setFiles(sampleFiles);
      setActiveFile('App.jsx');
    }
  }, []);

  // Handle file content changes
  const handleFileChange = (filename: string, content: string) => {
    const updatedFiles = { ...files, [filename]: content };
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  // Handle dependency changes
  const handleDependenciesChange = (deps: string[]) => {
    setDependencies(deps);
    
    // Generate terminal commands for detected dependencies
    const commands = [];
    if (deps.length > 0) {
      commands.push('# Dependencies detected:');
      commands.push(`npm install ${deps.join(' ')}`);
    }
    setTerminalCommands(commands);
  };

  // Handle installation completion
  const handleInstallComplete = (result: any) => {
    console.log('Installation completed:', result);
    
    // Add success commands to terminal
    if (result.status === 'success') {
      setTerminalCommands(prev => [
        ...prev,
        '✓ All dependencies installed successfully',
        'Ready to run your application!'
      ]);
    }
  };

  // File editor component
  const FileEditor = ({ filename, content }: { filename: string; content: string }) => (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
        <Code className="w-4 h-4" />
        <span className="font-medium">{filename}</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => handleFileChange(filename, e.target.value)}
        className="flex-1 p-4 font-mono text-sm border-none outline-none resize-none"
        placeholder="Start coding..."
      />
    </div>
  );

  // File tree component
  const FileTree = () => (
    <div className="bg-white border-r">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="font-medium text-sm">Files</h3>
      </div>
      <div className="p-2">
        {Object.keys(files).map(filename => (
          <button
            key={filename}
            onClick={() => setActiveFile(filename)}
            className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 ${
              activeFile === filename ? 'bg-blue-100 text-blue-700' : ''
            }`}
          >
            {filename}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Code Studio</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            <span>{dependencies.length} dependencies</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDependencyPanel(!showDependencyPanel)}
            className={`px-3 py-1 rounded text-sm ${
              showDependencyPanel 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Dependencies
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <Play className="w-4 h-4" />
            Run
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - File Tree */}
        <div className="w-64 bg-white border-r">
          <FileTree />
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {activeFile && files[activeFile] && (
            <FileEditor 
              filename={activeFile} 
              content={files[activeFile]} 
            />
          )}
        </div>

        {/* Right Panel - Dependencies & Terminal */}
        {showDependencyPanel && (
          <div className="w-96 bg-gray-50 border-l flex flex-col">
            {/* Dependency System */}
            <div className="flex-1 overflow-y-auto p-4">
              <AutoDependencySystem
                files={files}
                onDependenciesChange={handleDependenciesChange}
                onInstallComplete={handleInstallComplete}
                settings={systemSettings}
              />
            </div>

            {/* Terminal */}
            <div className="h-64 border-t">
              <VirtualTerminal
                commands={terminalCommands}
                onCommandExecute={(cmd) => {
                  console.log('Executing:', cmd);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioWithDependencies;