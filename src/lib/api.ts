import { User, Product, LoginCredentials, ApiResponse } from "../types/types";

const API_BASE = "https://dummyjson.com";

// ========================
//! **Token Service**
// ========================

export const tokenService = {
  // Get access token
  getAccessToken: (): string | null => {
    if (typeof window !== "undefined") {
      try {
        return (
          localStorage.getItem("accessToken") ||
          JSON.parse(localStorage.getItem("user") || "{}")?.accessToken
        );
      } catch (error) {
        console.error("Unable to get access token:", error);
        return null;
      }
    }
    return null;
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    if (typeof window !== "undefined") { // Checks that it runs only in the browser (not during server-side rendering in Next.js)
      try {
        return localStorage.getItem("refreshToken");
      } catch (error) {
        console.error("Unable to get refresh token:", error);
        return null;
      }
    }
    return null;
  },

  // Set both tokens after login/refresh
  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      } catch (error) {
        console.error("Unable to set tokens:", error);
      }
    }
  },

  // Clear all tokens at logout
  clearTokens: (): void => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } catch (error) {
        console.error("Unable to clear tokens:", error);
      }
    }
  },
};

// ========================
//! **API Handler**
// ========================
// Enhanced to automatically refresh token on 401 and retry original request

let isRefreshing = false; // Prevent multiple refresh attempts
let queue: (() => void)[] = []; // Queue requests during refresh

const apiHandler = async <T>(
  endpoint: string,
  options?: RequestInit,
  isRetry = false
): Promise<ApiResponse<T>> => {
  try {
    let accessToken = tokenService.getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      ...(accessToken && !isRetry
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...(options?.headers || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // If unauthorized (token expired), try to refresh
    if (response.status === 401 && accessToken && !isRetry) {
      // If there's no refresh token, bail
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        tokenService.clearTokens();
        return { error: "Token expired and no refresh token available" };
      }
      // Prevent multiple refresh attempts
      if (isRefreshing) {
        // Enqueue this request to be retried after refresh
        return new Promise((resolve) => {
          queue.push(() => resolve(apiHandler<T>(endpoint, options, true) as Promise<ApiResponse<T>>));
        });
      }
      isRefreshing = true;
      // Attempt to refresh access token
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!refreshResponse.ok) {
        tokenService.clearTokens();
        return { error: "Failed to refresh token" };
      }
      const newTokens = await refreshResponse.json();
      // Store new tokens
      tokenService.setTokens(newTokens.accessToken, newTokens.refreshToken);
      isRefreshing = false;
      // Retry all queued requests
      const requests = [...queue];
      queue = [];
      await Promise.all(requests.map((fn) => fn()));
      // Retry the original request with the new token
      return apiHandler<T>(endpoint, options, true);
    }

    // Other errors
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

// ========================
//! **Auth API**
// ========================
// Login and refresh now handle both tokens

export const authApi = {
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<User & { accessToken: string; refreshToken?: string }>> => {
    // NOTE: DummyJSON only returns accessToken, but this is how you'd handle real OAuth2
    const result = await apiHandler<
      User & { accessToken: string; refreshToken?: string }
    >("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (result.data?.accessToken) {
      // Store both tokens if available (refreshToken would come from a real backend)
      tokenService.setTokens(
        result.data.accessToken,
        result.data.refreshToken || "fake-refresh-token" // Replace with real token in prod
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("user", JSON.stringify(result.data));
        } catch (error) {
          console.error("Unable to store user data:", error);
        }
      }
    }
    return result;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    return apiHandler<User>("/auth/me");
  },

  refreshToken: async (): Promise<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  > => {
    // This is what a real refresh endpoint would look like
    // For DummyJSON, this is only a simulation
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      return { error: "No refresh token found" };
    }
    // In a real app, this would return both new tokens
    // For example, in Express/OAuth2: return { accessToken, refreshToken }
    return apiHandler<{ accessToken: string; refreshToken: string }>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }
    );
  },
};

// ========================
//! **Products API**
// ========================
export const productsApi = {
  getAll: async (): Promise<ApiResponse<{ products: Product[]; total: number }>> =>
    apiHandler("/products"),

  getById: async (id: number): Promise<ApiResponse<Product>> =>
    apiHandler(`/products/${id}`),

  search: async (
    query: string
  ): Promise<ApiResponse<{ products: Product[]; total: number }>> =>
    apiHandler(`/products/search?q=${encodeURIComponent(query)}`),
};
