"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../hooks/useUserProfile";
import { getAllUsers, addUser, deleteUser, User } from "../services/adminApi";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Modal from "../components/ui/Modal";
import { motion } from "framer-motion";
// --- [MODIFICATION] Import the Eye and EyeOff icons ---
import { UserPlus, ShieldAlert, Trash2, Eye, EyeOff } from "lucide-react";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  // --- [MODIFICATION] Add state to manage password visibility in the modal ---
  const [showPassword, setShowPassword] = useState(false);

  const { user, isLoading: isUserLoading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user?.role !== "ADMIN") {
      router.push("/main/browse");
    }
  }, [user, isUserLoading, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [user]);

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await addUser({ ...newUser, role: newUser.role as "USER" | "ADMIN" });
      setIsAddUserModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "USER" });
      setShowPassword(false); // Also reset password visibility when closing the modal
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setError(null);
    try {
      await deleteUser(userToDelete.id);
      setIsDeleteConfirmModalOpen(false);
      setUserToDelete(null);
      setUsers((prevUsers) =>
        prevUsers.filter((u) => u.id !== userToDelete.id)
      );
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
      setIsDeleteConfirmModalOpen(false);
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div
          className="w-16 h-16 border-t-4 border-red-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-gray-400 mt-2">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              Admin Panel - User Management
            </h1>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
            >
              <UserPlus className="mr-2" size={18} />
              Add New User
            </button>
          </div>

          {error && (
            <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">
              {error}
            </p>
          )}

          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.role === "ADMIN"
                            ? "bg-green-800 text-green-200"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteClick(u)}
                        className="text-red-500 hover:text-red-400 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={user && user.id === u.id}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </main>

      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* --- [MODIFICATION] Password Input with Visibility Toggle --- */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full p-2 pr-10 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Add User
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        title="Confirm Deletion"
      >
        <div>
          <p className="text-gray-400 mb-6">
            Are you sure you want to delete the user{" "}
            <span className="font-bold text-white">{userToDelete?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              className="px-6 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteUser}
              className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
