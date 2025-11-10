"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login details:", form);
    // TODO: Replace console.log with actual authentication logic
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white/95 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold mb-8 text-center font-playfair-display text-gray-900">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="text-center text-sm text-gray-700 mt-4">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-black font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
