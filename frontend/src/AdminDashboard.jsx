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
 * - Display of currently fronting members (supports multiple)
 * - Ability to switch fronting members
 * - User management interface (via the UserManagement component)
 * - Mental state management interface (via the MentalStateAdmin component)
 * - Member tag management interface (via the MemberTagManagement component)
 * 
 * The component handles API communication for fetching members and updating fronting status.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserManagement from './UserManagement'; // Import user management component
import MentalStateAdmin from './MentalStateAdmin'; // Import mental state management component
import MemberTagManagement from './MemberTagManagement'; // Import member tag management component
import MemberTagDisplay from './MemberTagDisplay'; // Import tag display component

export default function AdminDashboard({ fronting, onFrontingChanged }) {
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
        
        // Instead of reloading the page, use the onFrontingChanged prop to update state
        if (onFrontingChanged) {
          onFrontingChanged(newFront);
        }
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
    return member.avatar_url || "https://www.yuri-lover.win/pfp/fallback_avatar.png";
  };

  
/**
 * Expands cofront members into their individual component members for display
 */
const expandFrontingMembers = (frontingMembers) => {
  if (!frontingMembers || !Array.isArray(frontingMembers)) {
    return [];
  }

  const expandedMembers = [];

  frontingMembers.forEach(member => {
    if (member.is_cofront && member.component_members && member.component_members.length > 0) {
      // This is a cofront - expand it into individual component members
      member.component_members.forEach(componentMember => {
        expandedMembers.push({
          ...componentMember,
          // Mark that this member is part of a cofront for display purposes
          _isFromCofront: true,
          _cofrontName: member.name,
          _cofrontDisplayName: member.display_name || member.name
        });
      });
    } else {
      // This is a regular member or special member - add as-is
      expandedMembers.push(member);
    }
  });

  return expandedMembers;
}; 

  // Show loading indicator when fetching initial data
  if (loading && members.length === 0) {
    return <div className="text-center p-8">Loading...</div>;
  }

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
        {/* Current Fronting Details - Updated to show expanded members */}
{(() => {
  const expandedMembers = expandFrontingMembers(fronting?.members || []);
  
  return expandedMembers.length > 0 && (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Current Fronting Details</h3>
      <div className="space-y-2">
        {expandedMembers.map((member, index) => (
          <div key={member.id || `${member.name}-${index}`} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800 rounded-md">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                <img 
                  src={member.avatar_url || "https://www.yuri-lover.win/pfp/fallback_avatar.png"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium">{member.display_name || member.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {member.id}
                  {member.pronouns && ` • ${member.pronouns}`}
                  {member._isFromCofront && ` • From ${member._cofrontDisplayName}`}
                </div>
                {/* Display member tags */}
                <MemberTagDisplay tags={member.tags} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-1">
              {member._isFromCofront && (
                <span className="cofront-badge text-xs">Cofront</span>
              )}
              {member.is_special && (
                <span className="special-badge text-xs">
                  {member.original_name === "system" ? "Unsure" : "Sleeping"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {fronting?.timestamp && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Last switch: {new Date(fronting.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
})()}
        
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
        
        {/* Quick Actions Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all fronting members?")) {
                  const token = localStorage.getItem("token");
                  fetch("/api/switch", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ members: [] }),
                  })
                  .then(res => res.json())
                  .then(data => {
                    if (data.status === "success") {
                      setMessage({ type: "success", content: "Cleared all fronting members." });
                      if (onFrontingChanged) {
                        onFrontingChanged(null);
                      }
                    }
                  })
                  .catch(err => {
                    console.error("Error clearing front:", err);
                    setMessage({ type: "error", content: "Error clearing fronting members." });
                  });
                }
              }}
              className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Clear Front
            </button>
            
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                try {
                  const res = await fetch("/api/admin/refresh", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${token}`
                    }
                  });
                  
                  if (res.ok) {
                    setMessage({ type: "success", content: "Refresh broadcast sent to all clients." });
                  } else {
                    throw new Error("Failed to send refresh");
                  }
                } catch (err) {
                  console.error("Error sending refresh:", err);
                  setMessage({ type: "error", content: "Error sending refresh broadcast." });
                }
              }}
              className="py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors"
            >
              Force Refresh All Clients
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Use "Clear Front" to remove all fronting members. Use "Force Refresh" to update all connected browsers.
          </p>
        </div>
        
        {/* System Statistics */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">System Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{members.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {fronting?.members?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Currently Fronting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {members.filter(m => m.is_cofront).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cofronts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">
                {members.filter(m => m.is_special).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Special Members</div>
            </div>
          </div>
          
          {/* Sub-system breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <h4 className="text-md font-medium mb-2">Sub-system Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">
                  {members.filter(m => m.tags?.includes('host')).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">🏠 Host</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">
                  {members.filter(m => m.tags?.includes('valorant')).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">🔫 Valorant</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-400">
                  {members.filter(m => m.tags?.includes('pets')).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">🐾 Pets</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-400">
                  {members.filter(m => m.tags?.includes('vocaloids')).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">🎤 Vocaloids</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mental State Management Section */}
      <MentalStateAdmin />
      
      {/* Member Tag Management Section */}
      <MemberTagManagement />
      
      {/* User Management Section */}
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
