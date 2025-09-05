"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../../app/hooks/useUserProfile";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login } = useUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic client-side validation
    if (!email || !password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Login failed. Please check your credentials."
        );
      }

      // On successful login, save token and user data via the context
      login(data.token, data.user);
      router.push("/main/browse");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white">
      <div className="relative z-10 flex flex-col flex-grow">
        <header className="py-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/">
              <span className="text-red-600 font-bold text-3xl md:text-4xl">
                NETSTREAM
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black/80 p-8 rounded-lg shadow-2xl w-full max-w-md"
          >
            <h1 className="text-3xl font-bold mb-8">Sign In</h1>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-center text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  className="w-full p-4 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 transition-colors focus:border-red-500 ring-transparent focus:ring-red-500"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className="w-full p-4 pr-12 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 transition-colors focus:border-red-500 ring-transparent focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer w-full py-3 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition duration-200 disabled:bg-red-900 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
              <div className="flex items-center justify-between text-zinc-400 text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 text-red-600 focus:ring-red-500 rounded"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="hover:underline">
                  Need help?
                </Link>
              </div>
            </form>

            <div className="mt-12 text-zinc-400">
              <p>
                New to NetStream?{" "}
                <Link
                  href="/auth/signup"
                  className="text-white hover:underline"
                >
                  Sign up now
                </Link>
                .
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
