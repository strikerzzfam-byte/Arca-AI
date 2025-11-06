import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Package, Download } from 'lucide-react';

interface Dependency {
  name: string;
  version?: string;
  status: 'pending' | 'installing' | 'installed' | 'error';
  manager: 'npm' | 'pip' | 'composer' | 'gem' | 'go';
}

interface DependencyManagerProps {
  dependencies: string[];
  onInstallComplete?: (results: any) => void;
  autoInstall?: boolean;
}

export const DependencyManager: React.FC<DependencyManagerProps> = ({
  dependencies,
  onInstallComplete,
  autoInstall = true
}) => {
  const [deps, setDeps] = useState<Dependency[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (dependencies.length > 0) {
      const newDeps = dependencies.map(dep => ({
        name: dep,
        status: 'pending' as const,
        manager: detectPackageManager(dep)
      }));
      setDeps(newDeps);
      
      if (autoInstall) {
        installDependencies(newDeps);
      }
    }
  }, [dependencies, autoInstall]);

  const detectPackageManager = (dep: string): Dependency['manager'] => {
    const managerMap: Record<string, Dependency['manager']> = {
      'react': 'npm', 'vue': 'npm', 'express': 'npm', 'axios': 'npm',
      'django': 'pip', 'flask': 'pip', 'numpy': 'pip', 'pandas': 'pip',
      'laravel': 'composer', 'symfony': 'composer',
      'rails': 'gem', 'sinatra': 'gem',
      'gin': 'go', 'gorilla': 'go'
    };
    return managerMap[dep.toLowerCase()] || 'npm';
  };

  const installDependencies = async (depsToInstall: Dependency[]) => {
    setIsInstalling(true);
    setProgress(0);

    try {
      const response = await fetch('/api/dependencies/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependencies: depsToInstall.map(d => d.name) })
      });

      const result = await response.json();
      
      // Simulate installation progress
      for (let i = 0; i <= depsToInstall.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress((i / depsToInstall.length) * 100);
        
        if (i < depsToInstall.length) {
          setDeps(prev => prev.map((dep, idx) => 
            idx === i ? { ...dep, status: 'installing' } : dep
          ));
        }
      }

      // Mark all as installed
      setDeps(prev => prev.map(dep => ({ ...dep, status: 'installed' })));
      onInstallComplete?.(result);
      
    } catch (error) {
      setDeps(prev => prev.map(dep => ({ ...dep, status: 'error' })));
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const getStatusIcon = (status: Dependency['status']) => {
    switch (status) {
      case 'pending':
        return <Package className="w-4 h-4 text-gray-400" />;
      case 'installing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'installed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getManagerColor = (manager: Dependency['manager']) => {
    const colors = {
      npm: 'bg-red-100 text-red-800',
      pip: 'bg-blue-100 text-blue-800',
      composer: 'bg-purple-100 text-purple-800',
      gem: 'bg-green-100 text-green-800',
      go: 'bg-cyan-100 text-cyan-800'
    };
    return colors[manager];
  };

  if (deps.length === 0) return null;

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">Dependencies</h3>
          <span className="text-sm text-gray-500">({deps.length})</span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {isInstalling && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Installing packages...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        {deps.slice(0, showDetails ? deps.length : 4).map((dep, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            {getStatusIcon(dep.status)}
            <span className="text-sm font-mono flex-1 truncate">{dep.name}</span>
            <span className={`text-xs px-2 py-1 rounded ${getManagerColor(dep.manager)}`}>
              {dep.manager}
            </span>
          </div>
        ))}
      </div>

      {!showDetails && deps.length > 4 && (
        <div className="text-center">
          <button
            onClick={() => setShowDetails(true)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            +{deps.length - 4} more packages
          </button>
        </div>
      )}

      {!isInstalling && !autoInstall && (
        <button
          onClick={() => installDependencies(deps)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Install All Dependencies
        </button>
      )}
    </div>
  );
};

export default DependencyManager;