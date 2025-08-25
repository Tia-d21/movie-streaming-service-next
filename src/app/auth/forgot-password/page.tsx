'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would connect to password reset service in a real app
    console.log('Password reset requested for:', email);
    setSubmitted(true);
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
          {!submitted ? (
            <>
              <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>
              <p className="text-zinc-400 mb-8">
                We'll send you an email with instructions on how to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full p-4 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full py-3 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition duration-200"
                >
                  Send Reset Link
                </button>
                
                <div className="text-center">
                  <Link href="/auth/login" className="text-zinc-400 hover:text-white hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold mb-4">Email Sent</h1>
              <p className="text-zinc-400 mb-8">
                If an account exists with the email <span className="text-white">{email}</span>, 
                you will receive password reset instructions.
              </p>
              <Link href="/auth/login">
                <button className="py-3 px-6 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition duration-200">
                  Return to Sign In
                </button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}