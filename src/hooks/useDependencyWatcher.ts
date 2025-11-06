import { useState, useEffect, useCallback, useRef } from 'react';

interface DependencyWatcherOptions {
  debounceMs?: number;
  autoInstall?: boolean;
  onDependenciesDetected?: (deps: string[]) => void;
  onInstallComplete?: (result: any) => void;
}

interface FileWatcher {
  filename: string;
  content: string;
  dependencies: string[];
}

export const useDependencyWatcher = (options: DependencyWatcherOptions = {}) => {
  const {
    debounceMs = 2000,
    autoInstall = true,
    onDependenciesDetected,
    onInstallComplete
  } = options;

  const [watchers, setWatchers] = useState<Map<string, FileWatcher>>(new Map());
  const [allDependencies, setAllDependencies] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const dependencyCache = useRef<Map<string, string[]>>(new Map());

  // Extract imports from code
  const extractImports = useCallback((code: string, fileExtension: string): string[] => {
    const imports = new Set<string>();
    
    // JavaScript/TypeScript patterns
    if (['.js', '.ts', '.jsx', '.tsx', '.mjs'].includes(fileExtension)) {
      // ES6 imports: import x from 'package'
      const es6Imports = code.match(/import\s+(?:[\w*{}\s,]+\s+from\s+)?['"`]([^'"`]+)['"`]/g) || [];
      es6Imports.forEach(imp => {
        const match = imp.match(/['"`]([^'"`]+)['"`]/);
        if (match) imports.add(match[1]);
      });

      // CommonJS requires: require('package')
      const cjsRequires = code.match(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g) || [];
      cjsRequires.forEach(req => {
        const match = req.match(/['"`]([^'"`]+)['"`]/);
        if (match) imports.add(match[1]);
      });

      // Dynamic imports: import('package')
      const dynamicImports = code.match(/import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g) || [];
      dynamicImports.forEach(imp => {
        const match = imp.match(/['"`]([^'"`]+)['"`]/);
        if (match) imports.add(match[1]);
      });
    }

    // Python imports
    if (fileExtension === '.py') {
      const pythonImports = code.match(/(?:from\s+(\S+)\s+import|import\s+(\S+))/g) || [];
      pythonImports.forEach(imp => {
        const fromMatch = imp.match(/from\s+(\S+)\s+import/);
        const importMatch = imp.match(/import\s+(\S+)/);
        if (fromMatch) imports.add(fromMatch[1]);
        if (importMatch) imports.add(importMatch[1]);
      });
    }

    return filterExternalPackages(Array.from(imports));
  }, []);

  // Filter out local imports and built-ins
  const filterExternalPackages = useCallback((imports: string[]): string[] => {
    const builtins = new Set([
      // Node.js built-ins
      'fs', 'path', 'http', 'https', 'url', 'crypto', 'os', 'util', 'events',
      'stream', 'buffer', 'child_process', 'cluster', 'dgram', 'dns', 'net',
      'readline', 'repl', 'tls', 'tty', 'vm', 'zlib', 'assert', 'querystring',
      // Python built-ins
      'sys', 'os', 'json', 'datetime', 'math', 'random', 'collections', 're',
      'itertools', 'functools', 'operator', 'copy', 'pickle', 'sqlite3'
    ]);

    return imports.filter(imp => {
      // Filter out local imports (relative paths)
      if (imp.startsWith('./') || imp.startsWith('../') || imp.startsWith('/')) return false;
      
      // Filter out built-in modules
      if (builtins.has(imp)) return false;
      
      // Keep scoped packages
      if (imp.startsWith('@')) {
        const parts = imp.split('/');
        return parts.length >= 2;
      }
      
      return true;
    });
  }, []);

  // Debounced dependency analysis
  const analyzeDependencies = useCallback((filename: string, content: string) => {
    const timerId = debounceTimers.current.get(filename);
    if (timerId) {
      clearTimeout(timerId);
    }

    const newTimerId = setTimeout(async () => {
      setIsAnalyzing(true);
      
      try {
        const fileExtension = filename.substring(filename.lastIndexOf('.'));
        const dependencies = extractImports(content, fileExtension);
        
        // Update watcher
        setWatchers(prev => {
          const newWatchers = new Map(prev);
          newWatchers.set(filename, { filename, content, dependencies });
          return newWatchers;
        });

        // Cache dependencies for this file
        dependencyCache.current.set(filename, dependencies);
        
        // Recalculate all dependencies
        const allDeps = new Set<string>();
        dependencyCache.current.forEach(deps => {
          deps.forEach(dep => allDeps.add(dep));
        });
        
        const newAllDeps = Array.from(allDeps);
        setAllDependencies(newAllDeps);
        onDependenciesDetected?.(newAllDeps);

        // Auto-install if enabled
        if (autoInstall && newAllDeps.length > 0) {
          await installDependencies(newAllDeps);
        }
        
      } catch (error) {
        console.error('Error analyzing dependencies:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, debounceMs);

    debounceTimers.current.set(filename, newTimerId);
  }, [debounceMs, extractImports, autoInstall, onDependenciesDetected]);

  // Install dependencies
  const installDependencies = useCallback(async (dependencies: string[]) => {
    if (isInstalling || dependencies.length === 0) return;
    
    setIsInstalling(true);
    
    try {
      const response = await fetch('/api/dependencies/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependencies })
      });
      
      const result = await response.json();
      onInstallComplete?.(result);
      return result;
      
    } catch (error) {
      console.error('Failed to install dependencies:', error);
      throw error;
    } finally {
      setIsInstalling(false);
    }
  }, [isInstalling, onInstallComplete]);

  // Watch file changes
  const watchFile = useCallback((filename: string, content: string) => {
    analyzeDependencies(filename, content);
  }, [analyzeDependencies]);

  // Watch multiple files
  const watchFiles = useCallback((files: Record<string, string>) => {
    Object.entries(files).forEach(([filename, content]) => {
      watchFile(filename, content);
    });
  }, [watchFile]);

  // Remove file watcher
  const unwatchFile = useCallback((filename: string) => {
    const timerId = debounceTimers.current.get(filename);
    if (timerId) {
      clearTimeout(timerId);
      debounceTimers.current.delete(filename);
    }
    
    dependencyCache.current.delete(filename);
    
    setWatchers(prev => {
      const newWatchers = new Map(prev);
      newWatchers.delete(filename);
      return newWatchers;
    });

    // Recalculate dependencies without this file
    const allDeps = new Set<string>();
    dependencyCache.current.forEach(deps => {
      deps.forEach(dep => allDeps.add(dep));
    });
    
    const newAllDeps = Array.from(allDeps);
    setAllDependencies(newAllDeps);
    onDependenciesDetected?.(newAllDeps);
  }, [onDependenciesDetected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer));
      debounceTimers.current.clear();
    };
  }, []);

  // Manual dependency installation
  const manualInstall = useCallback(async (dependencies: string[]) => {
    return await installDependencies(dependencies);
  }, [installDependencies]);

  // Get dependencies for specific file
  const getFileDependencies = useCallback((filename: string): string[] => {
    return dependencyCache.current.get(filename) || [];
  }, []);

  // Check if package exists
  const checkPackageExists = useCallback(async (packageName: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/dependencies/check/${encodeURIComponent(packageName)}`);
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Error checking package:', error);
      return false;
    }
  }, []);

  return {
    // State
    watchers: Array.from(watchers.values()),
    allDependencies,
    isAnalyzing,
    isInstalling,
    
    // Actions
    watchFile,
    watchFiles,
    unwatchFile,
    manualInstall,
    getFileDependencies,
    checkPackageExists,
    
    // Utils
    extractImports,
    filterExternalPackages
  };
};

export default useDependencyWatcher;