"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";
import Navbar from "../../../../app/components/layout/Navbar";
import Footer from "../../../../app/components/layout/Footer";
import { useUserProfile } from "../../../../app/hooks/useUserProfile";
import { fetchWithAuth } from "../../../../lib/apiHelper";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useUserProfile();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    const newErrors = { currentPassword: "", newPassword: "", confirmPassword: "" };

    if (!currentPassword) newErrors.currentPassword = "Current password is required.";

    const isPasswordValid =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[!@#$%^&*]/.test(newPassword);

    if (!newPassword) newErrors.newPassword = "New password is required.";
    else if (!isPasswordValid)
      newErrors.newPassword =
        "Must be 8+ characters and include uppercase, lowercase, a number, and a symbol (!@#$%^&*).";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your new password.";
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    const validationErrors = validate();
    const hasErrors = Object.values(validationErrors).some((err) => err !== "");

    if (hasErrors) {
      setErrors(validationErrors);
      return;
    }

    setErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });

    try {
      if (!user?.id) throw new Error("User not found");
 await fetchWithAuth(`/api/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });

      setSuccessMessage("Your password has been changed successfully!");
      setTimeout(() => router.push("/main/profile"), 2500);
    } catch (err: unknown) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        currentPassword: err instanceof Error ? err.message : "Password change failed",
      }));
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 pb-10 px-4 md:px-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/main/profile")}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2" size={16} />
            <span>Back to Profile</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-lg p-8"
        >
          <h1 className="text-3xl font-bold mb-8 text-center">Change Password</h1>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <input
              type="hidden"
              name="username"
              autoComplete="username"
              value={user?.name || ""}
            />

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
  id="currentPassword"
  type={showCurrent ? "text" : "password"}
  autoComplete="current-password"
  value={currentPassword}
  onChange={(e) => setCurrentPassword(e.target.value)}
  className={`w-full p-3 rounded bg-gray-800 text-white border focus:outline-none focus:ring-2 ${
    errors.currentPassword ? "border-red-500 ring-red-500" : "border-gray-700 focus:ring-red-500"
  }`}
  aria-invalid={Boolean(errors.currentPassword)}
  
  required
/>

                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"
                >
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-3 rounded bg-gray-800 text-white border focus:outline-none focus:ring-2 ${
                    errors.newPassword ? "border-red-500 ring-red-500" : "border-gray-700 focus:ring-red-500"
                  }`}
                aria-invalid={Boolean(errors.newPassword)} 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"
                >
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3 rounded bg-gray-800 text-white border focus:outline-none focus:ring-2 ${
                    errors.confirmPassword ? "border-red-500 ring-red-500" : "border-gray-700 focus:ring-red-500"
                  }`}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {successMessage && (
              <p className="text-green-400 text-sm text-center bg-green-900/50 p-3 rounded-md">{successMessage}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition duration-200 flex items-center justify-center"
            >
              <KeyRound className="mr-2" size={18} />
              Update Password
            </button>
          </form>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}