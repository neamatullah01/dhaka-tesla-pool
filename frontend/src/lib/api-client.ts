const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

class ApiClient {
  private getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      // Access token is kept in memory in real app, but for simplicity we might use a closure or store.
      // Zustand store will handle memory state. We'll expose a way to inject it.
      return (window as any).__accessToken || null;
    }
    return null;
  }

  public setAccessToken(token: string | null) {
    if (typeof window !== "undefined") {
      (window as any).__accessToken = token;
    }
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = this.getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Need to handle refresh token flow here. 
      // For now, throw error or trigger global auth logout
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw {
        status: response.status,
        ...data,
      };
    }

    return data;
  }

  get(endpoint: string, options?: RequestInit) {
    return this.fetchWithAuth(endpoint, { ...options, method: "GET" });
  }

  post(endpoint: string, body?: any, options?: RequestInit) {
    return this.fetchWithAuth(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch(endpoint: string, body?: any, options?: RequestInit) {
    return this.fetchWithAuth(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete(endpoint: string, options?: RequestInit) {
    return this.fetchWithAuth(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
