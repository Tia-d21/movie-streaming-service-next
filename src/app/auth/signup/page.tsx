"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!name || !email || !password) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed. Please try again.");
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
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
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <span className="text-red-600 font-bold text-4xl">NETSTREAM</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/80 p-8 rounded-md w-full max-w-md"
        >
          <h1 className="text-3xl font-bold mb-8">Sign Up</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-center text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-md text-center text-green-300">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                autoComplete="name"
                required
                className="w-full p-4 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                required
                className="w-full p-4 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Add a password"
                autoComplete="new-password"
                required
                className="w-full p-4 pr-12 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-red-600"
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
              disabled={isLoading || !!success}
              className="cursor-pointer w-full py-3 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition duration-200 disabled:bg-red-900 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
          <div className="mt-12 text-zinc-400">
            <p>
              Already have an account?{" "}
              <Link href="/auth/login" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
