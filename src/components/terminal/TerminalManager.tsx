import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Plus, X, Minimize2, Maximize2 } from 'lucide-react';
import XTerminal from './XTerminal';

interface TerminalTab {
  id: string;
  title: string;
  active: boolean;
}

interface TerminalManagerProps {
  webContainer?: any;
  theme?: 'dark' | 'light';
  className?: string;
}

export const TerminalManager: React.FC<TerminalManagerProps> = ({
  webContainer,
  theme = 'dark',
  className = ''
}) => {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: '1', title: 'Terminal 1', active: true }
  ]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRefs = useRef<Map<string, any>>(new Map());

  const addTab = () => {
    const newId = Date.now().toString();
    setTabs(prev => [
      ...prev.map(tab => ({ ...tab, active: false })),
      { id: newId, title: `Terminal ${prev.length + 1}`, active: true }
    ]);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== id);
      if (prev.find(tab => tab.id === id)?.active && filtered.length > 0) {
        filtered[0].active = true;
      }
      return filtered;
    });
    terminalRefs.current.delete(id);
  };

  const switchTab = (id: string) => {
    setTabs(prev => prev.map(tab => ({ ...tab, active: tab.id === id })));
  };

  const activeTab = tabs.find(tab => tab.active);

  return (
    <div className={`terminal-manager ${className} ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}>
      {/* Header */}
      <div className="terminal-header bg-gray-800 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          <div className="terminal-tabs bg-gray-700 flex items-center">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`tab flex items-center gap-2 px-3 py-1 text-sm cursor-pointer ${
                  tab.active ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => switchTab(tab.id)}
              >
                <span>{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="hover:bg-gray-500 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTab}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Terminal Content */}
          <div className="terminal-content flex-1">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`terminal-pane ${tab.active ? 'block' : 'hidden'}`}
                style={{ height: '100%' }}
              >
                <XTerminal
                  webContainer={webContainer}
                  theme={theme}
                  ref={(ref) => {
                    if (ref) terminalRefs.current.set(tab.id, ref);
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TerminalManager;