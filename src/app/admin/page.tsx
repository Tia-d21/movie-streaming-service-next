"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, ShieldAlert, Trash, Edit, X } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  User,
} from "../services/adminApi";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalUser, setEditModalUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as "USER" | "ADMIN",
  });

  const { user, isLoading: isUserLoading } = useUserProfile();
  const router = useRouter();

  // --- Protect route: Only admins allowed ---
  useEffect(() => {
    if (!isUserLoading && user?.role !== "ADMIN") {
      router.push("/main/browse");
    }
  }, [user, isUserLoading, router]);

  // --- Fetch users ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.role === "ADMIN") fetchUsers();
  }, [user]);

  // --- Role change ---
  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    if (!user) return alert("Missing auth token");
    if (user.id === userId) return alert("You cannot change your own role.");

    try {
      const updatedUser = await updateUser(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    }
  };

  // --- Delete ---
  const handleDelete = async (userId: string) => {
    if (!user) return alert("Missing auth token");
    if (user.id === userId) return alert("You cannot delete your own account.");
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  // --- Add ---
  const handleAddUser = async () => {
    if (!user) return alert("Missing auth token");

    const name = prompt("Enter name:");
    const email = prompt("Enter email:");
    const password = prompt("Enter password:");
    const role = prompt("Enter role (USER/ADMIN):") as "USER" | "ADMIN";

    if (!name || !email || !password || !role)
      return alert("All fields are required");

    try {
      const newUser = await addUser({ name, email, password, role });
      setUsers((prev) => [...prev, newUser]);
    } catch (err) {
      console.error(err);
      alert("Failed to add user");
    }
  };

  // --- Edit ---
  const handleEditClick = (u: User) => {
    setEditModalUser(u);
    setFormData({ name: u.name, email: u.email, password: "", role: u.role });
  };

  const handleEditChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editModalUser) return;
    if (!user) return alert("Missing auth token");

    try {
      const updatedUser = await updateUser(editModalUser.id, formData);
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      setEditModalUser(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    }
  };

  // --- UI Loading ---
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

  // --- UI Access Denied ---
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

  // --- UI Admin Panel ---
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button
            onClick={handleAddUser}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition"
          >
            <UserPlus className="mr-2" size={18} /> Add New User
          </button>
        </div>

        {error && (
          <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">
            {error}
          </p>
        )}

        <div className="bg-gray-900 rounded-lg overflow-x-auto">
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
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleRoleChange(u.id, e.target.value as "USER" | "ADMIN")
                      }
                      className="bg-gray-700 text-white px-2 py-1 rounded-md"
                      disabled={u.id === user.id}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 px-2 py-1 rounded-md"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-400 px-2 py-1 rounded-md"
                      disabled={u.id === user.id}
                    >
                      <Trash size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-md p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button onClick={() => setEditModalUser(null)} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => handleEditChange("name", e.target.value)}
              className="px-3 py-2 rounded-md bg-gray-700 text-white w-full mb-3"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleEditChange("email", e.target.value)}
              className="px-3 py-2 rounded-md bg-gray-700 text-white w-full mb-3"
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleEditChange("password", e.target.value)}
              className="px-3 py-2 rounded-md bg-gray-700 text-white w-full mb-3"
            />

            <label htmlFor="edit-role" className="text-gray-300 mr-2">
              Role
            </label>
            <select
              id="edit-role"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value as "USER" | "ADMIN",
                }))
              }
              className="bg-gray-700 text-white px-2 py-1 rounded-md w-full mb-4"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <button
              onClick={handleEditSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
