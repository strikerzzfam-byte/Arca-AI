import { useState, useRef, useEffect } from 'react';
import { Terminal, Play } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: number;
}

interface VirtualTerminalProps {
  autoCommands?: string[];
}

export default function VirtualTerminal({ autoCommands }: VirtualTerminalProps = {}) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to Arca Terminal v1.0.0',
      timestamp: Date.now()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Track executed commands to prevent duplicates
  const [executedCommands, setExecutedCommands] = useState<Set<string>>(new Set());
  
  // Auto-execute commands when provided
  useEffect(() => {
    if (autoCommands && autoCommands.length > 0) {
      let delay = 1000;
      autoCommands.forEach((command, index) => {
        if (!executedCommands.has(command)) {
          setTimeout(() => {
            executeCommand(command);
            setExecutedCommands(prev => new Set([...prev, command]));
          }, delay + (index * 2000));
        }
      });
    }
  }, [autoCommands, executedCommands]);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const commandLine: TerminalLine = {
      id: crypto.randomUUID(),
      type: 'command',
      content: `$ ${command}`,
      timestamp: Date.now()
    };

    setLines(prev => [...prev, commandLine]);
    setCurrentCommand('');
    setIsRunning(true);

    // Simulate command execution
    setTimeout(() => {
      const output = simulateCommand(command.trim());
      const outputLine: TerminalLine = {
        id: crypto.randomUUID(),
        type: output.type,
        content: output.content,
        timestamp: Date.now()
      };
      setLines(prev => [...prev, outputLine]);
      setIsRunning(false);
    }, 500 + Math.random() * 1000);
  };

  const simulateCommand = (command: string): { type: 'output' | 'error'; content: string } => {
    const cmd = command.toLowerCase();
    
    if (cmd === 'help') {
      return {
        type: 'output',
        content: `Available commands:
  help              Show this help message
  ls                List files in current directory
  pwd               Show current directory
  
  Package Managers:
  npm install       Install Node.js dependencies
  npm start         Start development server
  npm build         Build for production
  pip install       Install Python packages
  
  Language Installations:
  install node      Install Node.js
  install python    Install Python
  install java      Install Java
  install go        Install Go
  install rust      Install Rust
  install php       Install PHP
  
  Version Checks:
  node --version    Check Node.js version
  python --version  Check Python version
  java --version    Check Java version
  
  Other:
  git status        Show git status
  clear             Clear terminal
  whoami            Show current user`
      };
    }
    
    if (cmd === 'ls') {
      return {
        type: 'output',
        content: `index.html    style.css     script.js     package.json
components/   assets/       README.md`
      };
    }
    
    if (cmd === 'pwd') {
      return {
        type: 'output',
        content: '/workspace/arca-project'
      };
    }
    
    if (cmd === 'npm install' || cmd.startsWith('npm install ')) {
      const packages = cmd === 'npm install' ? ['dependencies'] : cmd.substring(12).split(' ');
      const packageList = packages.map(pkg => `✓ ${pkg}@latest`).join('\n');
      return {
        type: 'output',
        content: `Installing ${packages.length > 1 ? 'packages' : 'dependencies'}...
${packageList}

Installation completed successfully!`
      };
    }
    
    if (cmd === 'npm start') {
      return {
        type: 'output',
        content: `Starting development server...
Local:   http://localhost:3000
Network: http://192.168.1.100:3000

Server ready in 1.2s`
      };
    }
    
    if (cmd === 'npm build' || cmd === 'npm run build') {
      return {
        type: 'output',
        content: `Building for production...
✓ Building client
✓ Optimizing assets
✓ Generating bundle

Build completed in 3.4s
Output: dist/`
      };
    }
    
    if (cmd === 'git status') {
      return {
        type: 'output',
        content: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   src/App.jsx
  modified:   src/style.css

Untracked files:
  src/components/NewComponent.jsx`
      };
    }
    
    if (cmd === 'clear') {
      setLines([]);
      return { type: 'output', content: '' };
    }
    
    if (cmd === 'whoami') {
      return {
        type: 'output',
        content: 'arca-user'
      };
    }
    
    // Language installations
    if (cmd === 'install node' || cmd === 'install nodejs') {
      return {
        type: 'output',
        content: `Installing Node.js...
✓ Downloading Node.js v20.10.0
✓ Installing Node.js runtime
✓ Installing npm package manager
✓ Setting up environment variables

Node.js v20.10.0 installed successfully!
npm v10.2.3 installed successfully!

Verify installation: node --version`
      };
    }
    
    if (cmd === 'install python') {
      return {
        type: 'output',
        content: `Installing Python...
✓ Downloading Python 3.11.7
✓ Installing Python interpreter
✓ Installing pip package manager
✓ Setting up virtual environment support

Python 3.11.7 installed successfully!
pip 23.3.1 installed successfully!

Verify installation: python --version`
      };
    }
    
    if (cmd === 'install java') {
      return {
        type: 'output',
        content: `Installing Java...
✓ Downloading OpenJDK 21
✓ Installing Java Runtime Environment (JRE)
✓ Installing Java Development Kit (JDK)
✓ Setting up JAVA_HOME environment variable

OpenJDK 21.0.1 installed successfully!
Javac compiler available

Verify installation: java --version`
      };
    }
    
    if (cmd === 'install go') {
      return {
        type: 'output',
        content: `Installing Go...
✓ Downloading Go 1.21.5
✓ Installing Go compiler and tools
✓ Setting up GOPATH and GOROOT
✓ Installing go modules support

Go 1.21.5 installed successfully!

Verify installation: go version`
      };
    }
    
    if (cmd === 'install rust') {
      return {
        type: 'output',
        content: `Installing Rust...
✓ Downloading Rust 1.75.0
✓ Installing rustc compiler
✓ Installing cargo package manager
✓ Installing rustup toolchain manager

Rust 1.75.0 installed successfully!
Cargo 1.75.0 installed successfully!

Verify installation: rustc --version`
      };
    }
    
    if (cmd === 'install php') {
      return {
        type: 'output',
        content: `Installing PHP...
✓ Downloading PHP 8.3.0
✓ Installing PHP interpreter
✓ Installing Composer package manager
✓ Setting up extensions

PHP 8.3.0 installed successfully!
Composer 2.6.5 installed successfully!

Verify installation: php --version`
      };
    }
    
    if (cmd === 'install ruby') {
      return {
        type: 'output',
        content: `Installing Ruby...
✓ Downloading Ruby 3.2.0
✓ Installing Ruby interpreter
✓ Installing RubyGems package manager
✓ Installing Bundler

Ruby 3.2.0 installed successfully!
Gem 3.4.10 installed successfully!

Verify installation: ruby --version`
      };
    }
    
    // Version checks
    if (cmd === 'node --version' || cmd === 'node -v') {
      return {
        type: 'output',
        content: 'v20.10.0'
      };
    }
    
    if (cmd === 'python --version' || cmd === 'python -v') {
      return {
        type: 'output',
        content: 'Python 3.11.7'
      };
    }
    
    if (cmd === 'java --version') {
      return {
        type: 'output',
        content: `openjdk 21.0.1 2023-10-17
OpenJDK Runtime Environment (build 21.0.1+12-29)
OpenJDK 64-Bit Server VM (build 21.0.1+12-29, mixed mode, sharing)`
      };
    }
    
    if (cmd === 'go version') {
      return {
        type: 'output',
        content: 'go version go1.21.5 linux/amd64'
      };
    }
    
    if (cmd === 'rustc --version') {
      return {
        type: 'output',
        content: 'rustc 1.75.0 (82e1608df 2023-12-21)'
      };
    }
    
    if (cmd === 'php --version') {
      return {
        type: 'output',
        content: `PHP 8.3.0 (cli) (built: Nov 23 2023 16:06:15) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.0, Copyright (c) Zend Technologies`
      };
    }
    
    // Python package installation
    if (cmd.startsWith('pip install ')) {
      const packageName = cmd.substring(12);
      return {
        type: 'output',
        content: `Collecting ${packageName}
  Downloading ${packageName}-1.0.0-py3-none-any.whl
Installing collected packages: ${packageName}
Successfully installed ${packageName}-1.0.0`
      };
    }
    
    // PHP Composer
    if (cmd.startsWith('composer install')) {
      const packages = cmd === 'composer install' ? ['dependencies'] : cmd.substring(17).split(' ');
      return {
        type: 'output',
        content: `Loading composer repositories with package information
Installing dependencies from lock file
${packages.map(pkg => `✓ Installing ${pkg}`).join('\n')}
Generating autoload files`
      };
    }
    
    // Ruby Gems
    if (cmd.startsWith('gem install ')) {
      const packages = cmd.substring(12).split(' ');
      return {
        type: 'output',
        content: `${packages.map(pkg => `Successfully installed ${pkg}-1.0.0`).join('\n')}
${packages.length} gem installed`
      };
    }
    
    // Go modules
    if (cmd.startsWith('go get ')) {
      const packageName = cmd.substring(7);
      return {
        type: 'output',
        content: `go: downloading ${packageName}
go: added ${packageName} v1.0.0`
      };
    }
    
    // Maven
    if (cmd === 'mvn install') {
      return {
        type: 'output',
        content: `[INFO] Scanning for projects...
[INFO] Building Maven Project
[INFO] Installing dependencies
[INFO] BUILD SUCCESS`
      };
    }
    
    if (cmd.startsWith('echo ')) {
      return {
        type: 'output',
        content: command.substring(5)
      };
    }
    
    return {
      type: 'error',
      content: `Command not found: ${command}. Type 'help' for available commands.`
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRunning) {
      executeCommand(currentCommand);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Could implement command history here
    }
  };

  return (
    <div className="h-full bg-black text-green-400 font-mono text-sm flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700">
        <Terminal className="w-4 h-4" />
        <span className="text-xs text-gray-300">Terminal</span>
        <div className="flex-1" />
        <button
          onClick={() => setLines([])}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 p-3 overflow-y-auto space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div key={line.id} className="whitespace-pre-wrap">
            <span className={
              line.type === 'command' ? 'text-blue-400' :
              line.type === 'error' ? 'text-red-400' :
              'text-green-400'
            }>
              {line.content}
            </span>
          </div>
        ))}
        
        <div className="flex items-center gap-2">
          <span className="text-blue-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            className="flex-1 bg-transparent outline-none text-green-400 placeholder-gray-500"
            placeholder={isRunning ? "Running..." : "Type a command..."}
            autoFocus
          />
          {isRunning && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Play className="w-3 h-3 animate-pulse" />
              <span className="text-xs">Running</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}