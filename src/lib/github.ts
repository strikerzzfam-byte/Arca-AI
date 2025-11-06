const GITHUB_TOKEN_KEY = "arca_github_token";
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || window.location.origin + "/studio";

export function initiateGitHubAuth() {
  const state = crypto.randomUUID();
  sessionStorage.setItem("github_oauth_state", state);
  
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: "repo",
    state: state,
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export function handleGitHubCallback(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const storedState = sessionStorage.getItem("github_oauth_state");

  if (!code || !state || state !== storedState) {
    return false;
  }

  sessionStorage.removeItem("github_oauth_state");
  
  // In a real implementation, exchange code for token via backend
  // For now, we'll store the code temporarily
  // TODO: Replace with actual token exchange via backend
  exchangeCodeForToken(code);
  
  // Clean up URL
  window.history.replaceState({}, document.title, window.location.pathname);
  
  return true;
}

async function exchangeCodeForToken(code: string) {
  try {
    // Exchange code for token using GitHub's token endpoint
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET || '',
        code: code,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    
    if (data.access_token) {
      setGitHubToken(data.access_token);
      // Show success message
      const event = new CustomEvent('github-connected');
      window.dispatchEvent(event);
    } else {
      throw new Error(data.error_description || 'Failed to get access token');
    }
  } catch (error) {
    console.error('Failed to exchange code for token:', error);
    // Show error message
    const event = new CustomEvent('github-error', { detail: error });
    window.dispatchEvent(event);
  }
}

export function setGitHubToken(token: string) {
  localStorage.setItem(GITHUB_TOKEN_KEY, token);
}

export function getGitHubToken(): string | null {
  return localStorage.getItem(GITHUB_TOKEN_KEY);
}

export function removeGitHubToken() {
  localStorage.removeItem(GITHUB_TOKEN_KEY);
}

export function isGitHubConnected(): boolean {
  return !!getGitHubToken();
}

