"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { User } from "../../types/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token) {
          router.push("/login");
          return;
        }

        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && typeof parsedUser === "object") {
            setUser(parsedUser);
          } else {
            throw new Error("Invalid user data format");
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user data"
        );
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No User Data</h2>
          <p className="text-gray-700 mb-4">Unable to load user profile.</p>
          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="text-center mb-8">
                <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full overflow-hidden mb-4 relative">
                  <Image
                    src={user.image || "/default-avatar.png"}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/default-avatar.png";
                    }}
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "First Name", value: user.firstName },
                    { label: "Last Name", value: user.lastName },
                    { label: "Username", value: user.username },
                    { label: "Email", value: user.email },
                    { label: "Gender", value: user.gender },
                    { label: "User ID", value: user.id },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                        {field.label === "Gender" &&
                        typeof field.value === "string"
                          ? field.value.charAt(0).toUpperCase() +
                            field.value.slice(1)
                          : field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}