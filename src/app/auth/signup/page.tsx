"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../../app/hooks/useUserProfile";
// --- 1. IMPORT THE ICONS ---
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // --- 2. ADD STATE TO MANAGE PASSWORD VISIBILITY ---
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    terms: "",
  });

  const router = useRouter();
  const { login } = useUserProfile();

  const validate = () => {
    // ... validation logic remains the same
    const newErrors = { name: "", email: "", password: "", terms: "" };

    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      newErrors.name = "Name is required.";
    } else if (!nameRegex.test(name)) {
      newErrors.name = "Name can only contain letters and spaces.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const isPasswordValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password);

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!isPasswordValid) {
      newErrors.password =
        "Password must be 8+ characters and include uppercase, lowercase, a number, and a special symbol (!@#$%^&*).";
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the terms to sign up.";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== ""
    );

    if (hasErrors) {
      setErrors(validationErrors);
    } else {
      setErrors({ name: "", email: "", password: "", terms: "" });

      try {
        const newUser = { name, email, password };
        const usersJSON = localStorage.getItem("registeredUsers");
        type RegisteredUser = { name: string; email: string; password: string };
        const users: RegisteredUser[] = usersJSON ? JSON.parse(usersJSON) : [];

        const userExists = users.some(
          (user: RegisteredUser) => user.email === email
        );

        if (userExists) {
          setErrors((prev) => ({
            ...prev,
            email: "An account with this email already exists. Please log in.",
          }));
          return;
        }

        users.push(newUser);
        localStorage.setItem("registeredUsers", JSON.stringify(users));

        // Note: This will cause the TypeScript error you saw before,
        // because the UserProfile type now expects a `role` property.
        // login({ name, email });

        // A temporary fix is to manually add the role here for the local-only version:
        login({ name, email, role: "USER" });

        router.push("/main/browse");
      } catch (error) {
        console.error("Failed to sign up:", error);
      }
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

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prevErrors) => ({ ...prevErrors, name: "" }));
                  }
                }}
                placeholder="Name"
                required
                className={`w-full p-4 rounded bg-zinc-800 text-white border focus:outline-none focus:border-red-600 transition-colors ${
                  errors.name ? "border-red-500" : "border-zinc-700"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
                  }
                }}
                placeholder="Email address"
                required
                className={`w-full p-4 rounded bg-zinc-800 text-white border focus:outline-none focus:border-red-600 transition-colors ${
                  errors.email ? "border-red-500" : "border-zinc-700"
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
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      password: "",
                    }));
                  }
                }}
                placeholder="Add a password"
                required
                className={`w-full p-4 pr-12 rounded bg-zinc-800 text-white border focus:outline-none focus:border-red-600 transition-colors ${
                  errors.password ? "border-red-500" : "border-zinc-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className=" absolute inset-y-0 right-0 px-3 flex items-center text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1  mb-2">
                {errors.password}
              </p>
            )}

            <div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors((prevErrors) => ({ ...prevErrors, terms: "" }));
                    }
                  }}
                  className="mt-1 mr-2 h-4 w-4"
                  required
                />
                <label htmlFor="terms" className="text-sm text-zinc-400">
                  {" "}
                  I agree to the{" "}
                  <a href="#" className="text-blue-500 hover:underline">
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-500 hover:underline">
                    {" "}
                    Privacy Policy
                  </a>
                  .{" "}
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
              )}
            </div>
            <button
              type="submit"
              className="cursor-pointer w-full py-3 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition duration-200"
            >
              {" "}
              Sign Up{" "}
            </button>
          </form>
          <div className="mt-12 text-zinc-400">
            <p>
              {" "}
              Already have an account?{" "}
              <Link href="/auth/login" className="text-white hover:underline">
                Sign in
              </Link>{" "}
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
