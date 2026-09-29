const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: any;
}

class ApiClient {
  private getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      // Access token is kept in memory in real app
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

    let response;
    try {
      response = await fetch(`${BASE_URL}${endpoint}`, {
        credentials: "include",
        ...options,
        headers,
      });
    } catch (err: any) {
      throw {
        status: 0,
        code: "NETWORK_ERROR",
        message: "Network error. Please check if the backend is running and CORS is configured.",
      } as ApiError;
    }

    if (response.status === 401) {
      // Refresh flow not implemented here yet
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const apiError: ApiError = {
        status: response.status,
        code: data?.error?.code || (typeof data?.error === 'string' ? data.error : null) || "UNKNOWN_ERROR",
        message: data?.error?.message || data?.message || "Something went wrong. Please try again.",
        details: data?.error?.details || data?.details,
      };
      throw apiError;
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
