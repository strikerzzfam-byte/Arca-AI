# Automatic Dependency Detection and Installation System

A complete, production-ready dependency management system for web-based code editors like bolt.diy, featuring real-time detection, automatic installation, and WebContainer integration.

## 🚀 Features

### Core Components

- **🔍 Dependency Parser** - Extracts imports from JS/TS/JSX/TSX/Python/PHP files
- **🎯 Package Detection Engine** - Scans multiple files simultaneously with framework detection
- **📦 Installation Manager** - Batch installs with multiple package manager support
- **👀 File Watcher System** - Real-time monitoring with debounced change detection
- **🛠️ Framework Detection** - Auto-detects React, Vue, Express, Next.js, Angular, Svelte
- **🔒 WebContainer Integration** - Isolated execution environment
- **⚡ Performance Optimization** - Caching, deduplication, and smart resolution

### Supported Languages & Package Managers

| Language | Package Manager | Supported Patterns |
|----------|----------------|-------------------|
| JavaScript/TypeScript | npm, yarn, pnpm | `import`, `require()`, `import()` |
| Python | pip | `import`, `from ... import` |
| PHP | composer | `require`, `include` |
| Ruby | gem | `require` |
| Go | go modules | `import` |
| Java | maven | XML dependencies |

## 📁 File Structure

```
src/
├── components/studio/
│   ├── AutoDependencySystem.tsx     # Main integration component
│   ├── DependencyManager.tsx        # UI for dependency management
│   ├── WebContainerManager.tsx      # WebContainer integration
│   └── StudioWithDependencies.tsx   # Complete example
├── hooks/
│   └── useDependencyWatcher.ts      # React hook for file watching
backend/
└── dependency-system.js             # Core dependency detection engine
```

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install @webcontainer/api
```

2. **Import components:**
```tsx
import AutoDependencySystem from './components/studio/AutoDependencySystem';
import useDependencyWatcher from './hooks/useDependencyWatcher';
```

3. **Add backend endpoints:**
```javascript
import { dependencySystem } from './dependency-system.js';
```

## 🎯 Quick Start

### Basic Integration

```tsx
import React, { useState } from 'react';
import AutoDependencySystem from './components/studio/AutoDependencySystem';

function MyEditor() {
  const [files, setFiles] = useState({
    'App.jsx': `import React from 'react';
import axios from 'axios';

function App() {
  return <div>Hello World</div>;
}`
  });

  return (
    <div>
      {/* Your code editor */}
      <textarea 
        value={files['App.jsx']}
        onChange={(e) => setFiles({...files, 'App.jsx': e.target.value})}
      />
      
      {/* Automatic dependency system */}
      <AutoDependencySystem
        files={files}
        onDependenciesChange={(deps) => console.log('Dependencies:', deps)}
        onInstallComplete={(result) => console.log('Installed:', result)}
        settings={{
          autoInstall: true,
          debounceMs: 2000,
          useWebContainer: true
        }}
      />
    </div>
  );
}
```

### Using the Hook

```tsx
import useDependencyWatcher from './hooks/useDependencyWatcher';

function MyComponent() {
  const {
    allDependencies,
    isAnalyzing,
    isInstalling,
    watchFiles,
    manualInstall
  } = useDependencyWatcher({
    debounceMs: 2000,
    autoInstall: true,
    onDependenciesDetected: (deps) => {
      console.log('New dependencies detected:', deps);
    }
  });

  // Watch files for changes
  useEffect(() => {
    watchFiles(files);
  }, [files]);

  return (
    <div>
      <p>Dependencies: {allDependencies.length}</p>
      <p>Status: {isAnalyzing ? 'Analyzing' : isInstalling ? 'Installing' : 'Ready'}</p>
    </div>
  );
}
```

## 🔧 API Reference

### AutoDependencySystem Props

```tsx
interface AutoDependencySystemProps {
  files: Record<string, string>;           // File contents to analyze
  onDependenciesChange?: (deps: string[]) => void;  // Callback when deps change
  onInstallComplete?: (result: any) => void;        // Callback when install completes
  settings?: {
    autoInstall?: boolean;      // Auto-install detected dependencies
    debounceMs?: number;        // Debounce delay for file changes
    useWebContainer?: boolean;  // Use WebContainer for isolation
    showProgress?: boolean;     // Show installation progress
  };
}
```

### Backend API Endpoints

```javascript
// Install dependencies
POST /api/dependencies/install
{
  "dependencies": ["react", "axios", "lodash"]
}

// Analyze files for dependencies
POST /api/dependencies/analyze
{
  "files": {
    "App.jsx": "import React from 'react';"
  }
}

// Check if package exists
GET /api/dependencies/check/:package

// Get installation progress
GET /api/dependencies/progress

// Watch file changes
POST /api/dependencies/watch
{
  "filename": "App.jsx",
  "content": "import React from 'react';"
}
```

## 🎨 Customization

### Custom Package Manager Detection

```javascript
// In dependency-system.js
const customManagerMap = {
  'my-package': 'custom-manager',
  'special-lib': 'pip'
};

// Extend the groupByPackageManager method
groupByPackageManager(dependencies) {
  // Your custom logic here
}
```

### Custom Framework Detection

```javascript
// Add custom framework detection
detectFrameworks(code, filename) {
  const frameworks = [];
  
  // Custom framework detection
  if (code.includes('MyFramework')) {
    frameworks.push({
      name: 'MyFramework',
      dependencies: ['my-framework', 'my-framework-cli']
    });
  }
  
  return frameworks;
}
```

## 🔒 WebContainer Integration

The system supports WebContainer for isolated dependency installation:

```tsx
<AutoDependencySystem
  files={files}
  settings={{
    useWebContainer: true  // Enable WebContainer isolation
  }}
/>
```

WebContainer provides:
- ✅ Isolated execution environment
- ✅ Real npm/pip/composer installation
- ✅ File system isolation
- ✅ Network isolation
- ✅ Process isolation

## 📊 Performance Features

### Caching
- Package existence checks are cached
- Dependency analysis results are memoized
- Installation results are stored

### Debouncing
- File changes are debounced (default: 2 seconds)
- Prevents excessive API calls during rapid typing
- Configurable delay timing

### Batch Processing
- Multiple packages installed in single operation
- Grouped by package manager for efficiency
- Parallel installation when possible

## 🛡️ Error Handling

The system includes comprehensive error handling:

```tsx
// Automatic retry logic
const result = await dependencySystem.batchInstall(dependencies);

if (result.status === 'error') {
  // Handle installation failures
  console.error('Installation failed:', result.error);
  
  // Retry failed packages
  await dependencySystem.retryFailedInstalls();
}
```

### Error Types
- Network failures (with retry)
- Package not found
- Version conflicts
- Permission errors
- WebContainer failures

## 🔍 Monitoring & Analytics

Track system performance:

```tsx
const stats = dependencySystem.getInstallationProgress();
console.log({
  isInstalling: stats.isInstalling,
  queueSize: stats.queueSize,
  cacheSize: stats.cacheSize
});
```

## 🚀 Advanced Usage

### Custom Installation Logic

```javascript
class CustomDependencySystem extends DependencySystem {
  async installPackages(manager, packages) {
    // Custom installation logic
    if (manager === 'npm') {
      return await this.customNpmInstall(packages);
    }
    return super.installPackages(manager, packages);
  }
}
```

### Integration with Build Tools

```tsx
// Integrate with Vite/Webpack
const buildConfig = generateBuildConfig(dependencies);
await updateBuildTool(buildConfig);
```

## 📝 Examples

See `StudioWithDependencies.tsx` for a complete working example that demonstrates:
- File editing with real-time dependency detection
- Automatic installation with progress tracking
- WebContainer integration
- Terminal output
- Settings management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the examples in the codebase
- Review the API documentation

---

**Built for modern web development workflows** 🚀