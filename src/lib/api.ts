import { User, Product, LoginCredentials, ApiResponse } from "../types/types";

const API_BASE = "https://dummyjson.com";

// Token management with proper TypeScript typing
export const tokenService = {
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      // First try to get token directly, then check user object
      return (
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.accessToken
      );
    }
    return null;
  },
  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },
  clearToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};

// Generic API handler to reduce repetition
const apiHandler = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

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

// Authentication API
export const authApi = {
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<User & { accessToken: string }>> => {
    const result = await apiHandler<User & { accessToken: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    if (result.data?.accessToken) {
      tokenService.setToken(result.data.accessToken);
      // Also store the full user data
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(result.data));
      }
    }

    return result;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const token = tokenService.getToken();
    if (!token) {
      return { error: "No authentication token found" };
    }

    return apiHandler<User>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  refreshToken: async (): Promise<ApiResponse<User>> => {
    const token = tokenService.getToken();
    if (!token) {
      return { error: "No authentication token found" };
    }

    return apiHandler<User>("/auth/refresh", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// Products API
export const productsApi = {
  getAll: async (): Promise<
    ApiResponse<{ products: Product[]; total: number }>
  > => apiHandler("/products"),

  getById: async (id: number): Promise<ApiResponse<Product>> =>
    apiHandler(`/products/${id}`),

  search: async (
    query: string
  ): Promise<ApiResponse<{ products: Product[]; total: number }>> =>
    apiHandler(`/products/search?q=${encodeURIComponent(query)}`),
};
