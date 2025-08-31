"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../../app/hooks/useUserProfile";
// --- 1. IMPORT THE ICONS ---
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // --- 2. ADD STATE FOR PASSWORD VISIBILITY ---
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login } = useUserProfile();

  // Define User type for localStorage users
  interface User {
    name: string;
    email: string;
    password: string;
  }

  const validate = () => {
    // ... validation logic remains the same
    const newErrors = { email: "", password: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSignupPrompt(false);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.values(validationErrors).some((error) => error !== "")) {
      return;
    }

    try {
      const usersJSON = localStorage.getItem("registeredUsers");
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];

      const foundUser = users.find(
        (user: User) => user.email === email && user.password === password
      );

      if (foundUser) {
        // Note: This will cause the TypeScript error you saw before,
        // because the UserProfile type now expects a `role` property.
        // login({ name: foundUser.name, email: foundUser.email });

        // A temporary fix is to manually add the role here for the local-only version:
        login({ name: foundUser.name, email: foundUser.email, role: "USER" });

        router.push("/main/browse");
      } else {
        setShowSignupPrompt(true);
      }
    } catch (error) {
      console.error("Failed to log in:", error);
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

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  placeholder="Email or phone number"
                  required
                  className={`w-full p-4 rounded bg-gray-700 text-white border focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? "border-red-500 ring-red-500"
                      : "border-gray-600 focus:border-red-500 ring-transparent focus:ring-red-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  placeholder="Password"
                  required
                  className={`w-full p-4 pr-12 rounded bg-gray-700 text-white border focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? "border-red-500 ring-red-500"
                      : "border-gray-600 focus:border-red-500 ring-transparent focus:ring-red-500"
                  }`}
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}

              <button
                type="submit"
                className="cursor-pointer w-full py-3 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition duration-200"
              >
                Sign In
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

            <AnimatePresence>
              {showSignupPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 text-center bg-red-900/50 border border-red-500 p-4 rounded-md"
                >
                  <p className="text-red-300 mb-4">
                    Incorrect email or password. Please sign up first.
                  </p>
                  <Link href="/auth/signup">
                    <button className="py-2 px-6 rounded bg-white text-black font-medium hover:bg-gray-200 transition duration-200">
                      Sign Up Now
                    </button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

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
              <p className="mt-4 text-xs">
                This page is protected by Google reCAPTCHA to ensure
                you`&apos;`re not a bot.{" "}
                <a href="#" className="text-blue-500 hover:underline ml-1">
                  Learn more
                </a>
                .
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
