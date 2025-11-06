import React, { useState, useEffect } from 'react';
import { Settings, Zap, Shield, Clock, CheckCircle } from 'lucide-react';
import DependencyManager from './DependencyManager';
import WebContainerManager from './WebContainerManager';
import useDependencyWatcher from '../../hooks/useDependencyWatcher';

interface AutoDependencySystemProps {
  files: Record<string, string>;
  onDependenciesChange?: (deps: string[]) => void;
  onInstallComplete?: (result: any) => void;
  settings?: {
    autoInstall?: boolean;
    debounceMs?: number;
    useWebContainer?: boolean;
    showProgress?: boolean;
  };
}

export const AutoDependencySystem: React.FC<AutoDependencySystemProps> = ({
  files,
  onDependenciesChange,
  onInstallComplete,
  settings = {}
}) => {
  const {
    autoInstall = true,
    debounceMs = 2000,
    useWebContainer = false,
    showProgress = true
  } = settings;

  const [isEnabled, setIsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [installHistory, setInstallHistory] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalPackages: 0,
    successfulInstalls: 0,
    failedInstalls: 0,
    avgInstallTime: 0
  });

  // Use the dependency watcher hook
  const {
    allDependencies,
    isAnalyzing,
    isInstalling,
    watchFiles,
    manualInstall,
    getFileDependencies
  } = useDependencyWatcher({
    debounceMs,
    autoInstall: autoInstall && isEnabled,
    onDependenciesDetected: (deps) => {
      onDependenciesChange?.(deps);
      updateStats(deps);
    },
    onInstallComplete: (result) => {
      setInstallHistory(prev => [
        ...prev.slice(-9), // Keep last 10 entries
        {
          timestamp: new Date(),
          dependencies: result.dependencies || [],
          status: result.status,
          duration: result.duration || 0
        }
      ]);
      onInstallComplete?.(result);
    }
  });

  // Watch files for changes
  useEffect(() => {
    if (isEnabled && Object.keys(files).length > 0) {
      watchFiles(files);
    }
  }, [files, isEnabled, watchFiles]);

  const updateStats = (dependencies: string[]) => {
    setSystemStats(prev => ({
      ...prev,
      totalPackages: dependencies.length,
      // Other stats would be updated based on actual installation results
    }));
  };

  const handleManualInstall = async () => {
    if (allDependencies.length > 0) {
      await manualInstall(allDependencies);
    }
  };

  const handleToggleSystem = () => {
    setIsEnabled(!isEnabled);
  };

  const getSystemStatus = () => {
    if (!isEnabled) return { color: 'gray', text: 'Disabled' };
    if (isInstalling) return { color: 'blue', text: 'Installing' };
    if (isAnalyzing) return { color: 'yellow', text: 'Analyzing' };
    return { color: 'green', text: 'Ready' };
  };

  const status = getSystemStatus();

  return (
    <div className="space-y-4">
      {/* System Header */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Auto Dependency System</h3>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${status.color === 'green' ? 'bg-green-100 text-green-800' : ''}
              ${status.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
              ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${status.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
            `}>
              <div className={`w-2 h-2 rounded-full
                ${status.color === 'green' ? 'bg-green-500' : ''}
                ${status.color === 'blue' ? 'bg-blue-500 animate-pulse' : ''}
                ${status.color === 'yellow' ? 'bg-yellow-500 animate-pulse' : ''}
                ${status.color === 'gray' ? 'bg-gray-500' : ''}
              `} />
              {status.text}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleSystem}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors
                ${isEnabled 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }
              `}
            >
              {isEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{allDependencies.length}</div>
            <div className="text-xs text-gray-500">Dependencies</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{systemStats.successfulInstalls}</div>
            <div className="text-xs text-gray-500">Installed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{systemStats.failedInstalls}</div>
            <div className="text-xs text-gray-500">Failed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{installHistory.length}</div>
            <div className="text-xs text-gray-500">Sessions</div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Settings
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Auto Installation</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoInstall}
                  onChange={() => {/* Handle setting change */}}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm">WebContainer Isolation</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWebContainer}
                  onChange={() => {/* Handle setting change */}}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Debounce Delay</span>
              </div>
              <select 
                value={debounceMs}
                onChange={() => {/* Handle setting change */}}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={1000}>1 second</option>
                <option value={2000}>2 seconds</option>
                <option value={3000}>3 seconds</option>
                <option value={5000}>5 seconds</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Manager */}
      {isEnabled && allDependencies.length > 0 && (
        <DependencyManager
          dependencies={allDependencies}
          onInstallComplete={onInstallComplete}
          autoInstall={autoInstall}
        />
      )}

      {/* WebContainer Manager */}
      {isEnabled && useWebContainer && (
        <WebContainerManager
          files={files}
          onInstallComplete={onInstallComplete}
          onError={(error) => console.error('WebContainer error:', error)}
        />
      )}

      {/* Installation History */}
      {showProgress && installHistory.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Installations
          </h4>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {installHistory.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{entry.dependencies.length} packages</span>
                  <span className="text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs
                  ${entry.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                `}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Install Button */}
      {isEnabled && !autoInstall && allDependencies.length > 0 && (
        <button
          onClick={handleManualInstall}
          disabled={isInstalling}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isInstalling ? 'Installing...' : `Install ${allDependencies.length} Dependencies`}
        </button>
      )}
    </div>
  );
};

export default AutoDependencySystem;