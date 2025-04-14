import React, { useState } from 'react';

export default function AdminDashboard({ fronting }) {
  const [newFront, setNewFront] = useState("");

  function handleSwitchFront() {
    fetch("/api/switch_front", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ member_id: newFront }),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Fronting member switched successfully.");
      } else {
        alert("Failed to switch fronting member.");
      }
    })
    .catch((err) => {
      alert("Error switching fronting member.");
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <div>
        <h2>Currently Fronting: {fronting?.members?.[0]?.display_name || "None"}</h2>
        <div>
          <h3>Select new fronting member:</h3>
          <select onChange={(e) => setNewFront(e.target.value)} value={newFront}>
            {fronting.members?.map((member) => (
              <option key={member.id} value={member.id}>
                {member.display_name || member.name}
              </option>
            ))}
          </select>
          <button onClick={handleSwitchFront}>Switch Front</button>
        </div>
      </div>
    </div>
  );
}
