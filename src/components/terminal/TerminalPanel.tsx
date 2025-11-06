import React, { useState, useRef } from 'react';
import { Terminal, ChevronUp, ChevronDown, Settings, Search } from 'lucide-react';
import TerminalManager from './TerminalManager';
import WebContainerTerminal from './WebContainerTerminal';
import AutoDependencySystem from '../studio/AutoDependencySystem';

interface TerminalPanelProps {
  files?: Record<string, string>;
  theme?: 'dark' | 'light';
  className?: string;
  defaultHeight?: number;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  files = {},
  theme = 'dark',
  className = '',
  defaultHeight = 300
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [height, setHeight] = useState(defaultHeight);
  const [mode, setMode] = useState<'basic' | 'webcontainer'>('webcontainer');
  const [showDependencies, setShowDependencies] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startY.current = e.clientY;
    startHeight.current = height;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaY = startY.current - e.clientY;
    const newHeight = Math.max(100, Math.min(800, startHeight.current + deltaY));
    setHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div 
      ref={panelRef}
      className={`terminal-panel border-t bg-gray-900 ${className}`}
      style={{ 
        height: isVisible ? `${height}px` : '32px',
        transition: isResizing ? 'none' : 'height 0.2s ease'
      }}
    >
      {/* Resize Handle */}
      <div
        className="resize-handle h-1 bg-gray-600 hover:bg-blue-500 cursor-row-resize"
        onMouseDown={handleMouseDown}
      />

      {/* Header */}
      <div className="terminal-header bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleVisibility}
            className="flex items-center gap-2 hover:bg-gray-700 px-2 py-1 rounded"
          >
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-medium">Terminal</span>
            {isVisible ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          {isVisible && (
            <div className="flex items-center gap-2">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'basic' | 'webcontainer')}
                className="bg-gray-700 text-white text-sm px-2 py-1 rounded border-none outline-none"
              >
                <option value="basic">Basic Terminal</option>
                <option value="webcontainer">WebContainer</option>
              </select>
            </div>
          )}
        </div>

        {isVisible && (
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-700 rounded" title="Search">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Terminal Content */}
      {isVisible && (
        <div className="terminal-content" style={{ height: `${height - 48}px` }}>
          <div className="flex h-full">
            <div className="flex-1">
              {mode === 'basic' ? (
                <TerminalManager theme={theme} />
              ) : (
                <WebContainerTerminal 
                  files={files}
                  theme={theme}
                  onProcessStart={(process) => {
                    console.log('Process started:', process);
                  }}
                  onProcessEnd={(exitCode) => {
                    console.log('Process ended with code:', exitCode);
                  }}
                />
              )}
            </div>
            <div className="w-80 border-l bg-gray-50 dark:bg-gray-800 overflow-y-auto">
              <AutoDependencySystem
                files={files}
                settings={{
                  autoInstall: true,
                  debounceMs: 2000,
                  useWebContainer: mode === 'webcontainer',
                  showProgress: true
                }}
                onDependenciesChange={(deps) => {
                  console.log('Dependencies detected:', deps);
                }}
                onInstallComplete={(result) => {
                  console.log('Installation complete:', result);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalPanel;