import React, { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom"; // Importing Routes and Route
import useTheme from './useTheme';  // Import the custom hook

// Import MemberDetails component to handle individual member pages
import MemberDetails from './MemberDetails.jsx'; 

function App() {
  const [members, setMembers] = useState([]);
  const [fronting, setFronting] = useState(null);
  const [theme, toggleTheme] = useTheme();  // Use the custom theme hook

  const defaultAvatar = "https://clovetwilight3.co.uk/system.png";  // Default avatar URL

  useEffect(() => {
    // Fetch members data
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        console.log("Members data from backend:", data);
        setMembers(data);
      })
      .catch((err) => {
        console.error("Error fetching members data:", err);
      });

    // Fetch current fronting member (if available)
    fetch("/api/fronters")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fronting member data:", data);
        setFronting(data);
      })
      .catch((err) => {
        console.error("Error fetching fronting data:", err);
      });
  }, []);

  // Dynamically update the document title based on fronting member
  useEffect(() => {
    if (fronting && fronting.members && fronting.members.length > 0) {
      document.title = `Currently Fronting: ${fronting.members[0].display_name || 'Unknown'}`;
      
      const frontingAvatar = fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar;
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = frontingAvatar;
      document.head.appendChild(link);
    } else {
      document.title = "Doughmination System Server";  // Default title
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = defaultAvatar;
      document.head.appendChild(link);
    }
  }, [fronting]);

  if (members.length === 0) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">System Members</h1>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>

      {/* Fronting Member */}
      {fronting && fronting.members.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Currently Fronting:</h2>
          <div className="flex items-center">
            <img
              src={fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar}
              alt="Fronting member"
              className="w-10 h-10 mr-3 rounded-full"
            />
            <span>{fronting.members[0]?.display_name}</span>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Members:</h2>
        <ul>
          {members.map((member) => (
            <li key={member.id} className="mb-4 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
              <Link to={`/${member.username}`} className="flex items-center text-black dark:text-white no-underline hover:text-gray-700 dark:hover:text-gray-300">
                <img
                  src={member.avatar_url || defaultAvatar}
                  alt={member.name}
                  className="w-10 h-10 mr-3 rounded-full"
                />
                <span>{member.display_name || member.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Add your routes here */}
      <Routes>
        <Route path="/:member_username" element={<MemberDetails />} />
      </Routes>
    </div>
  );
}

export default App;
