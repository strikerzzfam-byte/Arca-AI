const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function updateWebsite(prompt: string, currentFiles: Record<string, string>): Promise<{ files: Record<string, string>; mainFile: string }> {
  // Bypass AI API and return current files with a comment
  const updatedHTML = currentFiles["index.html"] ? 
    currentFiles["index.html"].replace('</body>', `<!-- Updated: ${prompt} -->\n</body>`) :
    `<!DOCTYPE html><html><body><h1>Updated: ${prompt}</h1></body></html>`;
    
  return {
    files: { "index.html": updatedHTML },
    mainFile: "index.html"
  };
}

export async function generateWebsite(prompt: string): Promise<{ files: Record<string, string>; mainFile: string }> {
  // Bypass AI API and return mock HTML based on prompt
  const mockHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 0; text-align: center; }
        .header h1 { font-size: 3rem; margin-bottom: 20px; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .content { padding: 60px 0; }
        .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin: 20px 0; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; transition: all 0.3s; }
        .btn:hover { background: #764ba2; transform: translateY(-2px); }
        @media (max-width: 768px) { .header h1 { font-size: 2rem; } .container { padding: 10px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>Welcome to Your Website</h1>
            <p>Built with Arca AI - ${prompt}</p>
        </div>
    </div>
    <div class="content">
        <div class="container">
            <div class="card">
                <h2>Your Project: ${prompt}</h2>
                <p>This is a mock website generated for your prompt. You can now edit the code in the editor to customize it further.</p>
                <a href="#" class="btn">Get Started</a>
            </div>
        </div>
    </div>
</body>
</html>`;

  return {
    files: { "index.html": mockHTML },
    mainFile: "index.html"
  };
}