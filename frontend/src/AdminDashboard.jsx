import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard({ fronting }) {
  const [newFront, setNewFront] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Fetch members on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
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
        setMembers(data || []);
        if (data && data.length > 0 && !newFront) {
          setNewFront(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching members:", err);
        setLoading(false);
      });
  }, []);

  function handleSwitchFront() {
    if (!newFront) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", content: "Authentication required." });
      return;
    }

    setMessage(null); // Clear previous message
    setLoading(true);
    
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
        setMessage({ type: "error", content: data.message || "Failed to switch fronting member." });
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

  if (loading && members.length === 0) {
    return <div className="text-center p-8">Loading...</div>;
  }

  const currentFronting = fronting?.members?.[0];

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}`}>
          {message.content}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="border-b pb-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Currently Fronting</h2>
          {currentFronting ? (
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                <img 
                  src={currentFronting.webhook_avatar_url || currentFronting.avatar_url || "/default-avatar.png"} 
                  alt={currentFronting.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg">{currentFronting.display_name || currentFronting.name}</span>
            </div>
          ) : (
            <p>No one is currently fronting</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Switch Fronting Member</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="member-select" className="block mb-2 text-sm font-medium">
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
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleSwitchFront}
              disabled={loading || !newFront || members.length === 0}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition-colors"
            >
              {loading ? "Switching..." : "Switch Front"}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <Link to="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}