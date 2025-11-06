// Automatic Dependency Detection and Installation System
import fs from 'fs/promises';
import path from 'path';

export class DependencySystem {
  constructor() {
    this.packageCache = new Map();
    this.installQueue = new Set();
    this.isInstalling = false;
    this.watchers = new Map();
    this.debounceTimers = new Map();
  }

  // 1. DEPENDENCY PARSER
  extractImports(code, fileExtension) {
    const imports = new Set();
    
    // JavaScript/TypeScript patterns
    if (['.js', '.ts', '.jsx', '.tsx', '.mjs'].includes(fileExtension)) {
      // ES6 imports
      const es6Imports = code.match(/import\s+(?:[\w*{}\s,]+\s+from\s+)?['"`]([^'"`]+)['"`]/g) || [];
      es6Imports.forEach(imp => {
        const match = imp.match(/['"`]([^'"`]+)['"`]/);
        if (match) imports.add(match[1]);
      });

      // CommonJS requires
      const cjsRequires = code.match(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g) || [];
      cjsRequires.forEach(req => {
        const match = req.match(/['"`]([^'"`]+)['"`]/);
        if (match) imports.add(match[1]);
      });

      // Dynamic imports
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

    // PHP imports
    if (fileExtension === '.php') {
      const phpRequires = code.match(/(?:require|include)(?:_once)?\s*\(?['"`]([^'"`]+)['"`]\)?/g) || [];
      phpRequires.forEach(req => {
        const match = req.match(/['"`]([^'"`]+)['"`]/);
        if (match) imports.add(match[1]);
      });
    }

    return this.filterExternalPackages(Array.from(imports));
  }

  filterExternalPackages(imports) {
    const builtins = new Set([
      // Node.js built-ins
      'fs', 'path', 'http', 'https', 'url', 'crypto', 'os', 'util', 'events',
      'stream', 'buffer', 'child_process', 'cluster', 'dgram', 'dns', 'net',
      'readline', 'repl', 'tls', 'tty', 'vm', 'zlib', 'assert', 'querystring',
      // Python built-ins
      'sys', 'os', 'json', 'datetime', 'math', 'random', 'collections', 're',
      'itertools', 'functools', 'operator', 'copy', 'pickle', 'sqlite3',
      // PHP built-ins
      'mysqli', 'pdo', 'curl', 'json', 'xml', 'gd', 'mbstring'
    ]);

    return imports.filter(imp => {
      // Filter out local imports (relative paths)
      if (imp.startsWith('./') || imp.startsWith('../') || imp.startsWith('/')) return false;
      
      // Filter out built-in modules
      if (builtins.has(imp)) return false;
      
      // Filter out scoped packages but keep the package name
      if (imp.startsWith('@')) {
        const parts = imp.split('/');
        return parts.length >= 2;
      }
      
      return true;
    });
  }

  // 2. PACKAGE DETECTION ENGINE
  async scanMultipleFiles(files) {
    const allDependencies = new Set();
    const frameworkInfo = { detected: [], specific: [] };

    for (const [filename, content] of Object.entries(files)) {
      const ext = path.extname(filename);
      const deps = this.extractImports(content, ext);
      deps.forEach(dep => allDependencies.add(dep));

      // Framework detection
      const frameworks = this.detectFrameworks(content, filename);
      frameworks.forEach(fw => {
        if (!frameworkInfo.detected.includes(fw.name)) {
          frameworkInfo.detected.push(fw.name);
          frameworkInfo.specific.push(...fw.dependencies);
        }
      });
    }

    // Parse package.json if exists
    if (files['package.json']) {
      try {
        const packageJson = JSON.parse(files['package.json']);
        if (packageJson.dependencies) {
          Object.keys(packageJson.dependencies).forEach(dep => allDependencies.add(dep));
        }
        if (packageJson.devDependencies) {
          Object.keys(packageJson.devDependencies).forEach(dep => allDependencies.add(dep));
        }
      } catch (e) {
        console.warn('Invalid package.json format');
      }
    }

    return {
      dependencies: Array.from(allDependencies),
      frameworks: frameworkInfo
    };
  }

  // 3. FRAMEWORK DETECTION
  detectFrameworks(code, filename) {
    const frameworks = [];
    
    // React detection
    if (code.includes('React') || code.includes('jsx') || filename.endsWith('.jsx') || filename.endsWith('.tsx')) {
      frameworks.push({
        name: 'React',
        dependencies: ['react', 'react-dom', '@types/react', '@types/react-dom']
      });
    }

    // Vue detection
    if (code.includes('Vue') || code.includes('<template>') || filename.endsWith('.vue')) {
      frameworks.push({
        name: 'Vue',
        dependencies: ['vue', '@vue/cli', 'vue-router', 'vuex']
      });
    }

    // Express detection
    if (code.includes('express') || code.includes('app.listen') || code.includes('app.get')) {
      frameworks.push({
        name: 'Express',
        dependencies: ['express', 'cors', 'helmet', 'morgan']
      });
    }

    // Next.js detection
    if (code.includes('next/') || filename === 'next.config.js') {
      frameworks.push({
        name: 'Next.js',
        dependencies: ['next', 'react', 'react-dom']
      });
    }

    // Angular detection
    if (code.includes('@angular/') || code.includes('@Component')) {
      frameworks.push({
        name: 'Angular',
        dependencies: ['@angular/core', '@angular/common', '@angular/cli']
      });
    }

    // Svelte detection
    if (code.includes('svelte') || filename.endsWith('.svelte')) {
      frameworks.push({
        name: 'Svelte',
        dependencies: ['svelte', '@sveltejs/kit', 'vite']
      });
    }

    return frameworks;
  }

  // 4. INSTALLATION MANAGER
  async batchInstall(dependencies, packageManager = 'npm') {
    if (this.isInstalling) {
      return { status: 'queued', message: 'Installation already in progress' };
    }

    this.isInstalling = true;
    const results = [];
    const startTime = Date.now();

    try {
      console.log(`Installing ${dependencies.length} dependencies...`);
      const grouped = this.groupByPackageManager(dependencies);
      
      for (const [manager, packages] of Object.entries(grouped)) {
        if (packages.length === 0) continue;
        
        console.log(`Installing ${packages.length} ${manager} packages:`, packages);
        const result = await this.installPackages(manager, packages);
        results.push(result);
      }

      const duration = Date.now() - startTime;
      console.log(`Installation completed in ${duration}ms`);

      return {
        status: 'success',
        results,
        installed: dependencies.length,
        duration
      };
    } catch (error) {
      console.error('Installation failed:', error);
      return {
        status: 'error',
        error: error.message,
        results,
        duration: Date.now() - startTime
      };
    } finally {
      this.isInstalling = false;
    }
  }

  groupByPackageManager(dependencies) {
    const packageManagers = {
      npm: [],
      pip: [],
      composer: [],
      gem: [],
      go: []
    };

    const managerMap = {
      // JavaScript/Node.js
      'react': 'npm', 'vue': 'npm', 'angular': 'npm', 'express': 'npm',
      'axios': 'npm', 'lodash': 'npm', 'moment': 'npm', 'dayjs': 'npm',
      'tailwindcss': 'npm', 'bootstrap': 'npm', 'jquery': 'npm',
      'typescript': 'npm', 'webpack': 'npm', 'vite': 'npm', 'rollup': 'npm',
      'eslint': 'npm', 'prettier': 'npm', 'jest': 'npm', 'mocha': 'npm',
      
      // Python
      'django': 'pip', 'flask': 'pip', 'fastapi': 'pip', 'tornado': 'pip',
      'numpy': 'pip', 'pandas': 'pip', 'matplotlib': 'pip', 'seaborn': 'pip',
      'requests': 'pip', 'urllib3': 'pip', 'beautifulsoup4': 'pip',
      'tensorflow': 'pip', 'pytorch': 'pip', 'scikit-learn': 'pip',
      
      // PHP
      'laravel': 'composer', 'symfony': 'composer', 'codeigniter': 'composer',
      'guzzle': 'composer', 'monolog': 'composer', 'phpunit': 'composer',
      
      // Ruby
      'rails': 'gem', 'sinatra': 'gem', 'rspec': 'gem', 'capybara': 'gem',
      
      // Go
      'gin': 'go', 'echo': 'go', 'gorilla': 'go', 'gorm': 'go'
    };

    dependencies.forEach(dep => {
      const manager = managerMap[dep.toLowerCase()] || 'npm';
      if (packageManagers[manager]) {
        packageManagers[manager].push(dep);
      }
    });

    return packageManagers;
  }

  async installPackages(manager, packages) {
    const commands = {
      npm: `npm install ${packages.join(' ')}`,
      pip: `pip install ${packages.join(' ')}`,
      composer: `composer require ${packages.join(' ')}`,
      gem: `gem install ${packages.join(' ')}`,
      go: packages.map(pkg => `go get ${pkg}`).join(' && ')
    };

    try {
      // Simulate WebContainer API call
      const result = await this.executeInContainer(commands[manager]);
      return {
        manager,
        packages,
        status: 'success',
        output: result
      };
    } catch (error) {
      return {
        manager,
        packages,
        status: 'error',
        error: error.message
      };
    }
  }

  // 5. FILE WATCHER SYSTEM
  watchFiles(files, callback) {
    Object.keys(files).forEach(filename => {
      if (this.watchers.has(filename)) {
        this.watchers.get(filename).close();
      }

      // Debounced file change handler
      const debouncedHandler = this.debounce(() => {
        const dependencies = this.extractImports(files[filename], path.extname(filename));
        callback(filename, dependencies);
      }, 2000);

      this.watchers.set(filename, { handler: debouncedHandler });
    });
  }

  debounce(func, wait) {
    return (...args) => {
      const key = args[0] || 'default';
      clearTimeout(this.debounceTimers.get(key));
      this.debounceTimers.set(key, setTimeout(() => func.apply(this, args), wait));
    };
  }

  // 6. ERROR HANDLING & RETRY LOGIC
  async executeInContainer(command, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Executing: ${command}`);
        // Simulate faster installation for better UX
        await new Promise(resolve => setTimeout(resolve, 500 + i * 200));
        
        // Higher success rate for auto-installation
        if (Math.random() > 0.05) { // 95% success rate
          console.log(`✓ ${command} completed successfully`);
          return `Successfully executed: ${command}`;
        } else {
          throw new Error(`Command failed: ${command}`);
        }
      } catch (error) {
        if (i === retries - 1) throw error;
        console.warn(`Retry ${i + 1}/${retries} for command: ${command}`);
      }
    }
  }

  // 7. PERFORMANCE OPTIMIZATION
  async checkPackageExists(packageName) {
    if (this.packageCache.has(packageName)) {
      return this.packageCache.get(packageName);
    }

    try {
      // Simulate package registry check
      const exists = Math.random() > 0.05; // 95% packages exist
      this.packageCache.set(packageName, exists);
      return exists;
    } catch (error) {
      return false;
    }
  }

  // 8. INTEGRATION METHODS
  async processFileChange(filename, content) {
    const ext = path.extname(filename);
    const dependencies = this.extractImports(content, ext);
    
    const newDeps = [];
    for (const dep of dependencies) {
      if (!this.installQueue.has(dep)) {
        const exists = await this.checkPackageExists(dep);
        if (exists) {
          newDeps.push(dep);
          this.installQueue.add(dep);
        }
      }
    }

    if (newDeps.length > 0) {
      return await this.batchInstall(newDeps);
    }

    return { status: 'no_new_dependencies' };
  }

  async processProjectCreation(files) {
    const { dependencies, frameworks } = await this.scanMultipleFiles(files);
    
    // Install framework-specific dependencies first
    const frameworkDeps = frameworks.specific;
    if (frameworkDeps.length > 0) {
      await this.batchInstall(frameworkDeps);
    }

    // Install remaining dependencies
    const remainingDeps = dependencies.filter(dep => !frameworkDeps.includes(dep));
    if (remainingDeps.length > 0) {
      await this.batchInstall(remainingDeps);
    }

    return {
      dependencies,
      frameworks: frameworks.detected,
      totalInstalled: dependencies.length
    };
  }

  // 9. UI INTEGRATION HELPERS
  generateInstallCommands(dependencies) {
    const grouped = this.groupByPackageManager(dependencies);
    const commands = [];

    Object.entries(grouped).forEach(([manager, packages]) => {
      if (packages.length === 0) return;
      
      switch (manager) {
        case 'npm':
          commands.push(`npm install ${packages.join(' ')}`);
          break;
        case 'pip':
          commands.push(`pip install ${packages.join(' ')}`);
          break;
        case 'composer':
          commands.push(`composer require ${packages.join(' ')}`);
          break;
        case 'gem':
          commands.push(`gem install ${packages.join(' ')}`);
          break;
        case 'go':
          packages.forEach(pkg => commands.push(`go get ${pkg}`));
          break;
      }
    });

    return commands;
  }

  getInstallationProgress() {
    return {
      isInstalling: this.isInstalling,
      queueSize: this.installQueue.size,
      cacheSize: this.packageCache.size
    };
  }

  // 10. CLEANUP
  cleanup() {
    this.watchers.forEach(watcher => {
      if (watcher.close) watcher.close();
    });
    this.watchers.clear();
    
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    this.installQueue.clear();
    this.packageCache.clear();
  }
}

// Export singleton instance
export const dependencySystem = new DependencySystem();