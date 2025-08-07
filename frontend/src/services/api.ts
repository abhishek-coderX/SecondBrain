const API_URL = 'http://localhost:3000';

class ApiService {
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async signup(username: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Content
  async getContent() {
    return this.request('/content');
  }

  async createContent(data: { title: string; link: string; type: string; tags?: string[] }) {
    return this.request('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteContent(id: string) {
    return this.request(`/content/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();