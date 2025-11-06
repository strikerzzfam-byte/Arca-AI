import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc } from 'drizzle-orm';
import { chats, frames, projects } from './schema.js';
import { dependencySystem } from './dependency-system.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: !!process.env.DATABASE_URL,
    ai: !!process.env.GOOGLE_AI_API_KEY
  });
});

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

app.get('/api/chats', async (req, res) => {
  try {
    const result = await db.select().from(chats).orderBy(chats.createdAt);
    res.json(result);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/frames', async (req, res) => {
  try {
    const result = await db.select().from(frames).orderBy(frames.createdAt);
    res.json(result);
  } catch (error) {
    console.error('Error fetching frames:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/test-ai', async (req, res) => {
  try {
    console.log('Testing AI connection...');
    const result = await model.generateContent('Say hello');
    const response = result.response.text();
    console.log('AI Test Response:', response);
    res.json({ success: true, response, model: 'gemini-2.5-pro' });
  } catch (error) {
    console.error('AI Test Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('Received message:', message);
    
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('Google AI API key not configured');
      return res.status(500).json({ error: 'AI service not configured' });
    }
    
    const isReactRequest = /\b(react|jsx|component|hook|state|props)\b/i.test(message);
    
    const prompt = `You are an expert web developer. Create a complete, error-free web application with separate files.

User request: ${message}

First, analyze what dependencies are needed and list them:
<DEPENDENCIES>
[List all required dependencies like: react, express, axios, tailwindcss, etc.]
</DEPENDENCIES>

Then show your thinking process:
<THINKING>
Analyzing requirements...
Planning file structure...
Designing components...
Implementing features...
</THINKING>

Then provide a description:
<DESCRIPTION>
[Detailed description of the application, features, and files being created]
</DESCRIPTION>

${isReactRequest ? `
Generate a REACT PROJECT with these files:

<FILE:index.html>
[HTML with React CDN links and root div]
</FILE>

<FILE:App.jsx>
[Main React component with JSX]
</FILE>

<FILE:components/Header.jsx>
[Header React component]
</FILE>

<FILE:components/Footer.jsx>
[Footer React component]
</FILE>

<FILE:style.css>
[Complete CSS styling]
</FILE>

<FILE:script.js>
[React app initialization with ReactDOM.render]
</FILE>

<FILE:package.json>
{
  "name": "react-app",
  "version": "1.0.0",
  "description": "React application",
  "main": "index.html",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
</FILE>` : `
Generate VANILLA WEB PROJECT with these files:

<FILE:index.html>
[Complete HTML with proper DOCTYPE, meta tags, semantic structure, and external links]
</FILE>

<FILE:style.css>
[Complete CSS with modern styling, responsive design, and cross-browser compatibility]
</FILE>

<FILE:script.js>
[Complete JavaScript with proper error handling, modern ES6+ syntax, and functionality]
</FILE>

<FILE:package.json>
{
  "name": "generated-app",
  "version": "1.0.0",
  "description": "Generated web application",
  "main": "index.html"
}
</FILE>`}

REQUIREMENTS:
- NO syntax errors
- NO missing closing tags
- NO undefined variables
- NO broken functionality
- Fully responsive design
- Modern, clean code
- Cross-browser compatible
- Proper semantic HTML/JSX
- Accessible design`;
    
    console.log('Sending to AI...');
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('AI Response received, length:', response.length);
    
    // Extract dependencies from AI response
    const dependenciesMatch = response.match(/<DEPENDENCIES>([\s\S]*?)<\/DEPENDENCIES>/);
    let aiDependencies = [];
    if (dependenciesMatch) {
      aiDependencies = dependenciesMatch[1]
        .trim()
        .split('\n')
        .map(dep => dep.replace(/^[-*•]\s*/, '').trim())
        .filter(dep => dep.length > 0);
    }
    
    // Extract thinking process
    const thinkingMatch = response.match(/<THINKING>([\s\S]*?)<\/THINKING>/);
    let thinking = '';
    
    if (thinkingMatch) {
      thinking = thinkingMatch[1]
        .trim()
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s*/g, '')
        .replace(/`{1,3}/g, '');
    }
    
    // Extract description
    const descriptionMatch = response.match(/<DESCRIPTION>([\s\S]*?)<\/DESCRIPTION>/);
    let description = 'I\'ve created your web application with the following files:';
    
    if (descriptionMatch) {
      description = descriptionMatch[1]
        .trim()
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s*/g, '')
        .replace(/`{1,3}/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '• ')
        .replace(/^\s*\d+\.\s+/gm, '');
    }
    
    // Parse structured files from AI response
    const files = {};
    const fileRegex = /<FILE:([^>]+)>([\s\S]*?)<\/FILE>/g;
    let match;
    
    while ((match = fileRegex.exec(response)) !== null) {
      const filename = match[1].trim();
      let content = match[2].trim();
      
      // Remove all markdown code block labels
      content = content
        .replace(/```[a-zA-Z]*\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      files[filename] = content;
    }
    
    // Fallback: if no structured files found, treat as single HTML
    if (Object.keys(files).length === 0) {
      const cleanCode = response
        .replace(/```[a-zA-Z]*\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .trim();
      files['index.html'] = cleanCode;
    }
    
    // Fix React preview rendering
    if (isReactRequest && files['App.jsx']) {
      const appJsx = files['App.jsx'];
      const stylesCss = files['style.css'] || '';
      
      // Clean JSX and prepare for browser
      let cleanJsx = appJsx
        .replace(/export default\s+/g, '')
        .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
        .trim();
      
      // Ensure function declaration
      if (!cleanJsx.startsWith('function App') && !cleanJsx.startsWith('const App')) {
        cleanJsx = `function App() { return ${cleanJsx}; }`;
      }
      
      files['index.html'] = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>${stylesCss}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${cleanJsx}
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>`;
    }
    
    // Ensure we have at least index.html for non-React projects
    if (!files['index.html']) {
      files['index.html'] = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Generated Application</h1>
  <script src="script.js"></script>
</body>
</html>`;
    }
    
    // Generate terminal commands based on AI-detected dependencies
    const dependencies = [...aiDependencies];
    const terminalCommands = [];
    
    // Check package.json for additional dependencies
    if (files['package.json']) {
      try {
        const packageJson = JSON.parse(files['package.json']);
        if (packageJson.dependencies) {
          Object.keys(packageJson.dependencies).forEach(dep => {
            if (!dependencies.includes(dep)) dependencies.push(dep);
          });
        }
      } catch (e) {
        console.log('Could not parse package.json');
      }
    }
    
    // Use advanced dependency system
    const depResult = await dependencySystem.scanMultipleFiles(files);
    const allDetectedDeps = [...dependencies, ...depResult.dependencies];
    
    // Auto-install dependencies during code generation
    let installationResult = null;
    if (allDetectedDeps.length > 0) {
      try {
        console.log('Auto-installing dependencies:', allDetectedDeps);
        installationResult = await dependencySystem.batchInstall(allDetectedDeps);
        console.log('Installation completed:', installationResult.status);
      } catch (installError) {
        console.error('Auto-installation failed:', installError);
      }
    }
    
    // Generate terminal commands using dependency system
    const installCommands = dependencySystem.generateInstallCommands(allDetectedDeps);
    terminalCommands.push(...installCommands);
    
    // Create file generation progress with checkmarks
    const fileProgress = Object.keys(files).map(f => `✓ ${f}`).join('\n');
    const depProgress = allDetectedDeps.length > 0 ? `\n\nDependencies installed:\n${allDetectedDeps.map(d => `✓ ${d}`).join('\n')}` : '';
    const chatMessage = `${description}\n\nFiles generated:\n${fileProgress}${depProgress}`
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s*/g, '')
      .replace(/`{1,3}/g, '');
    
    // Save to Frame Table (DesignCode)
    try {
      await db.insert(frames).values({
        designCode: files['index.html']
      });
      console.log('Code saved to frames table');
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
    
    // Send structured response back to frontend
    res.json({ 
      type: 'files', 
      files: files,
      mainFile: 'index.html',
      chatMessage: chatMessage,
      thinking: thinking,
      terminalCommands: terminalCommands,
      dependencies: allDetectedDeps,
      fileProgress: Object.keys(files),
      autoInstall: true,
      installationStatus: installationResult?.status || 'pending',
      installedPackages: installationResult?.results || []
    });
    
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Projects endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const result = await db.select().from(projects).orderBy(desc(projects.updatedAt));
    res.json(result.map(p => ({ ...p, _id: p.id.toString() })));
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const result = await db.select().from(projects).where(eq(projects.id, parseInt(req.params.id)));
    if (result.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ ...result[0], _id: result[0].id.toString() });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, prompt, files, generatedCode, previewUrl, isPublic } = req.body;
    const result = await db.insert(projects).values({
      name,
      description,
      prompt,
      files,
      generatedCode,
      previewUrl,
      isPublic
    }).returning();
    res.json({ ...result[0], _id: result[0].id.toString() });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const { name, description, prompt, files, generatedCode, previewUrl, isPublic } = req.body;
    const result = await db.update(projects)
      .set({
        name,
        description,
        prompt,
        files,
        generatedCode,
        previewUrl,
        isPublic,
        updatedAt: new Date()
      })
      .where(eq(projects.id, parseInt(req.params.id)))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ ...result[0], _id: result[0].id.toString() });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const result = await db.delete(projects).where(eq(projects.id, parseInt(req.params.id))).returning();
    if (result.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dependency Management Endpoints
app.post('/api/dependencies/install', async (req, res) => {
  try {
    const { dependencies } = req.body;
    
    if (!dependencies || !Array.isArray(dependencies)) {
      return res.status(400).json({ error: 'Dependencies array is required' });
    }
    
    const result = await dependencySystem.batchInstall(dependencies);
    res.json(result);
  } catch (error) {
    console.error('Error installing dependencies:', error);
    res.status(500).json({ error: 'Installation failed', details: error.message });
  }
});

app.post('/api/dependencies/analyze', async (req, res) => {
  try {
    const { files } = req.body;
    
    if (!files || typeof files !== 'object') {
      return res.status(400).json({ error: 'Files object is required' });
    }
    
    const result = await dependencySystem.scanMultipleFiles(files);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing dependencies:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

app.get('/api/dependencies/check/:package', async (req, res) => {
  try {
    const packageName = decodeURIComponent(req.params.package);
    const exists = await dependencySystem.checkPackageExists(packageName);
    res.json({ package: packageName, exists });
  } catch (error) {
    console.error('Error checking package:', error);
    res.status(500).json({ error: 'Package check failed', details: error.message });
  }
});

app.get('/api/dependencies/progress', (req, res) => {
  try {
    const progress = dependencySystem.getInstallationProgress();
    res.json(progress);
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ error: 'Progress check failed' });
  }
});

app.post('/api/dependencies/watch', async (req, res) => {
  try {
    const { filename, content } = req.body;
    
    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content are required' });
    }
    
    const result = await dependencySystem.processFileChange(filename, content);
    res.json(result);
  } catch (error) {
    console.error('Error processing file change:', error);
    res.status(500).json({ error: 'File processing failed', details: error.message });
  }
});

// Startup checks
const startupChecks = () => {
  console.log('=== Arca Vision Nexus Backend Starting ===');
  console.log('Port:', port);
  console.log('Database URL configured:', !!process.env.DATABASE_URL);
  console.log('Google AI API Key configured:', !!process.env.GOOGLE_AI_API_KEY);
  console.log('Dependency System initialized:', !!dependencySystem);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not configured');
  }
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY not configured');
  }
  
  console.log('=== Server Ready ===');
};

// Cleanup on shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  dependencySystem.cleanup();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  dependencySystem.cleanup();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  startupChecks();
});