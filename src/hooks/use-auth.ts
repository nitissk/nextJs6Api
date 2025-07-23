"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "../types/types";
import { authApi, tokenService } from "../lib/api";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await authApi.getMe();

      if (apiError) {
        setError(apiError);
        logout();
        return;
      }

      if (data) {
        setUser(data);
      }
    } catch (err) {
      setError("Authentication check failed");
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.login({ username, password });

      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      if (result.data) {
        setUser(result.data);
        return { success: true };
      }

      setError("Unexpected response from server");
      return { success: false, error: "Unexpected response from server" };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    tokenService.clearTokens();
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    refreshAuth: checkAuth,
  };
};

export type AuthContextType = ReturnType<typeof useAuth>;
