/*
MIT License

Copyright (c) 2025 Clove Twilight

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
 * Login.jsx
 * 
 * This component handles user authentication to the system.
 * It provides a login form and manages the authentication process,
 * including error handling and redirection after successful login.
 * 
 * Features:
 * - Username and password form
 * - Client-side validation
 * - Error display
 * - Loading state during authentication
 * - Redirection to original requested page after login
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login({ onLogin }) {
  // State management for form fields, errors, and loading state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Hooks for navigation and location tracking
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page the user was trying to access before being redirected to login
  // If there's no saved location, default to the home page
  const from = location.state?.from?.pathname || "/";

  /**
   * Handle form submission for user login
   * 
   * @param {Event} e - The form submit event
   */
  async function handleSubmit(e) {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Basic form validation
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    // Start loading state and clear any previous errors
    setLoading(true);
    setError("");

    try {
      // Send login credentials to the backend
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Format expected by FastAPI's OAuth flow
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store the JWT token in local storage for future API requests
        localStorage.setItem("token", data.access_token);
        onLogin(); // Notify parent component of successful login
        
        // Determine where to redirect the user
        // If they directly navigated to /admin/login, send them to dashboard
        // Otherwise, send them back to the page they were trying to access
        const redirectTo = from === "/admin/login" ? "/admin/dashboard" : from;
        navigate(redirectTo);
      } else {
        // Display error message from the server or a generic one
        setError(data.detail || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      // Handle network or unexpected errors
      console.error("Login error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      // Always clear loading state when done
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
      
      {/* Display error message if present */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Login form */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Username field */}
        <div>
          <label htmlFor="username" className="block mb-1 text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        
        {/* Password field */}
        <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        {/* Submit button with loading state */}
        <button 
          type="submit" 
          className="bg-blue-600 text-white p-2 rounded disabled:bg-blue-300 transition-colors"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}