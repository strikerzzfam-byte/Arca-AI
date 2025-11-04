import { getGitHubToken } from "./github";

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
}

interface GitHubFile {
  path: string;
  content: string;
  encoding?: "base64" | "utf-8";
}

export async function getUserRepos(): Promise<GitHubRepo[]> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error("GitHub token not found. Please connect your GitHub account.");
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/user/repos?per_page=100&sort=updated`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repos: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching repos:", error);
    throw error;
  }
}

export async function createRepository(
  name: string,
  description?: string,
  isPrivate: boolean = false
): Promise<GitHubRepo> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error("GitHub token not found. Please connect your GitHub account.");
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description: description || "",
        private: isPrivate,
        auto_init: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create repo: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating repo:", error);
    throw error;
  }
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error("GitHub token not found. Please connect your GitHub account.");
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const data = await response.json();
    return atob(data.content);
  } catch (error) {
    console.error("Error fetching file:", error);
    throw error;
  }
}

export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string = "Update file"
): Promise<void> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error("GitHub token not found. Please connect your GitHub account.");
  }

  // Get existing file to get SHA if it exists
  let sha: string | undefined;
  try {
    const existingFile = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (existingFile.ok) {
      const data = await existingFile.json();
      sha = data.sha;
    }
  } catch (error) {
    // File doesn't exist, will create new one
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: btoa(content),
        sha,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create/update file: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error creating/updating file:", error);
    throw error;
  }
}

export async function pushToRepository(
  owner: string,
  repo: string,
  files: GitHubFile[]
): Promise<void> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error("GitHub token not found. Please connect your GitHub account.");
  }

  try {
    // Create or update each file
    for (const file of files) {
      await createOrUpdateFile(
        owner,
        repo,
        file.path,
        file.content,
        `Update ${file.path}`
      );
    }
  } catch (error) {
    console.error("Error pushing files:", error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<{ login: string; name: string }> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error("GitHub token not found. Please connect your GitHub account.");
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

