import React, { useState, useEffect } from 'react';
import { Code, Play, Terminal as TerminalIcon, Package } from 'lucide-react';
import TerminalPanel from '../terminal/TerminalPanel';
import '../terminal/TerminalStyles.css';

interface StudioWithTerminalProps {
  initialFiles?: Record<string, string>;
  theme?: 'dark' | 'light';
}

export const StudioWithTerminal: React.FC<StudioWithTerminalProps> = ({
  initialFiles = {},
  theme = 'dark'
}) => {
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const [activeFile, setActiveFile] = useState<string>('');
  const [showTerminal, setShowTerminal] = useState(true);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);

  // Sample files for demo
  React.useEffect(() => {
    if (Object.keys(files).length === 0) {
      setFiles({
        'package.json': `{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}`,
        'src/App.jsx': `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>Hello World</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;`,
        'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`
      });
      setActiveFile('src/App.jsx');
    }
  }, []);

  const handleFileChange = (filename: string, content: string) => {
    setFiles(prev => ({ ...prev, [filename]: content }));
    
    // Auto-detect dependencies when files change
    detectDependencies({ ...files, [filename]: content });
  };
  
  const detectDependencies = async (fileMap: Record<string, string>) => {
    try {
      const response = await fetch('/api/dependencies/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: fileMap })
      });
      
      const result = await response.json();
      setDependencies(result.dependencies || []);
      
      // Auto-install if dependencies found
      if (result.dependencies?.length > 0) {
        installDependencies(result.dependencies);
      }
    } catch (error) {
      console.error('Dependency detection failed:', error);
    }
  };
  
  const installDependencies = async (deps: string[]) => {
    if (isInstalling) return;
    
    setIsInstalling(true);
    try {
      const response = await fetch('/api/dependencies/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependencies: deps })
      });
      
      const result = await response.json();
      console.log('Dependencies installed:', result);
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };
  
  // Initial dependency detection
  useEffect(() => {
    if (Object.keys(files).length > 0) {
      detectDependencies(files);
    }
  }, []);

  return (
    <div className={`studio-with-terminal h-screen flex flex-col ${theme}`}>
      {/* Header */}
      <div className="header bg-white dark:bg-gray-900 border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Code Studio</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span>{Object.keys(files).length} files</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>{dependencies.length} deps</span>
              {isInstalling && (
                <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
              showTerminal 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <TerminalIcon className="w-4 h-4" />
            Terminal
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <Play className="w-4 h-4" />
            Run
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r">
          <div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium text-sm">Files</h3>
          </div>
          <div className="p-2">
            {Object.keys(files).map(filename => (
              <button
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  activeFile === filename 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {filename}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {activeFile && (
              <>
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span className="font-medium">{activeFile}</span>
                </div>
                <textarea
                  value={files[activeFile] || ''}
                  onChange={(e) => handleFileChange(activeFile, e.target.value)}
                  className="flex-1 p-4 font-mono text-sm border-none outline-none resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Start coding..."
                />
              </>
            )}
          </div>

          {/* Terminal Panel */}
          {showTerminal && (
            <TerminalPanel
              files={files}
              theme={theme}
              defaultHeight={300}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioWithTerminal;