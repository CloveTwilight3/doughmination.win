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
 * AdminDashboard.jsx
 * 
 * This component provides an administrative interface for managing the PluralKit system.
 * It includes:
 * - Display of currently fronting member
 * - Ability to switch fronting members
 * - User management interface (via the UserManagement component)
 * 
 * The component handles API communication for fetching members and updating fronting status.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserManagement from './UserManagement'; // Import user management component

export default function AdminDashboard({ fronting }) {
  // State management
  const [newFront, setNewFront] = useState(""); // ID of the member to set as front
  const [members, setMembers] = useState([]); // All system members
  const [loading, setLoading] = useState(true); // Loading state
  const [message, setMessage] = useState(null); // Feedback message for user actions

  // Fetch members from API on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Early return if not authenticated
    
    fetch("/api/members", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch members");
        return res.json();
      })
      .then(data => {
        // Sort members alphabetically by name
        const sortedMembers = [...data].sort((a, b) => {
          const nameA = (a.display_name || a.name).toLowerCase();
          const nameB = (b.display_name || b.name).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setMembers(sortedMembers || []);
        // Set the first member as default selection if none is already selected
        if (sortedMembers && sortedMembers.length > 0 && !newFront) {
          setNewFront(sortedMembers[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching members:", err);
        setLoading(false);
      });
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Handle switching to a new fronting member
   * Makes API call to set the new fronting member
   */
  function handleSwitchFront() {
    if (!newFront) return; // Early return if no member selected
    
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", content: "Authentication required." });
      return;
    }

    setMessage(null); // Clear previous message
    setLoading(true);
    
    // Call the API to switch fronting member
    fetch("/api/switch_front", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ member_id: newFront }),
    })
    .then((res) => {
      if (!res.ok) throw new Error("Server responded with an error");
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        setMessage({ type: "success", content: "Fronting member switched successfully." });
        // Force refresh frontings after a brief delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ 
          type: "error", 
          content: data.message || "Failed to switch fronting member." 
        });
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      setMessage({ type: "error", content: "Error switching fronting member." });
    })
    .finally(() => {
      setLoading(false);
    });
  }

  /**
   * Gets the appropriate avatar for a member (handling cofronts)
   */
  const getMemberAvatar = (member) => {
    if (member.is_cofront && member.component_avatars && member.component_avatars.length > 0) {
      return member.component_avatars[0];
    }
    return member.avatar_url || "https://clovetwilight3.co.uk/system.png";
  };

  // Show loading indicator when fetching initial data
  if (loading && members.length === 0) {
    return <div className="text-center p-8">Loading...</div>;
  }

  // Get the first currently fronting member (if any)
  const currentFronting = fronting?.members?.[0];

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h1>
      
      {/* Display feedback messages */}
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === "success" 
            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
        }`}>
          {message.content}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Currently Fronting Section */}
        <div className="border-b pb-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Currently Fronting</h2>
          {currentFronting ? (
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                <img 
                  src={getMemberAvatar(currentFronting)}
                  alt={currentFronting.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg flex items-center">
                {currentFronting.display_name || currentFronting.name}
                {/* Add badges */}
                {currentFronting.is_cofront && (
                  <span className="ml-2 cofront-badge">Cofront</span>
                )}
                {currentFronting.is_special && (
                  <span className="ml-2 special-badge">
                    {currentFronting.original_name === "system" ? "Unsure" : "Sleeping"}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <p>No one is currently fronting</p>
          )}
        </div>
        
        {/* Switch Fronting Member Section */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Switch Fronting Member</h2>
          <div className="space-y-4">
            <div className="flex flex-col space-y-3">
              <label htmlFor="member-select" className="block text-sm font-medium">
                Select new fronting member:
              </label>
              <select 
                id="member-select"
                onChange={(e) => setNewFront(e.target.value)} 
                value={newFront}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                {!members.length && <option value="">No members available</option>}
                
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.display_name || member.name}
                    {member.is_cofront && ' (Cofront)'}
                    {member.is_special && ` (${member.original_name === "system" ? "Unsure" : "Sleeping"})`}
                  </option>
                ))}
              </select>
              
              <button 
                onClick={handleSwitchFront}
                disabled={loading || !newFront || members.length === 0}
                className="w-full py-2 px-4 bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
              >
                {loading ? "Switching..." : "Switch Front"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Management Section - Rendered from imported component */}
      <UserManagement />
      
      {/* Navigation back to home */}
      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <Link to="/" className="text-blue-500 dark:text-blue-400">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}