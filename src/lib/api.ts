const API_BASE_URL = 'http://localhost:3001/api';

export interface ProjectFile {
  name: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'jsx' | 'ts' | 'tsx';
}

export interface Project {
  _id?: string;
  name: string;
  description?: string;
  prompt?: string;
  files: ProjectFile[];
  generatedCode?: string;
  previewUrl?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(project: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async sendMessage(message: string): Promise<{ type: string; content: string }> {
    return this.request<{ type: string; content: string }>('/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getChats(): Promise<any[]> {
    return this.request<any[]>('/chats');
  }

  async getFrames(): Promise<any[]> {
    return this.request<any[]>('/frames');
  }
}

export const apiService = new ApiService();