import React, { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import useTheme from './useTheme';
import MemberDetails from './MemberDetails.jsx';

function App() {
  const [members, setMembers] = useState([]);
  const [fronting, setFronting] = useState(null);
  const [theme, toggleTheme] = useTheme();
  
  const defaultAvatar = "https://clovetwilight3.co.uk/system.png";

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
      document.title = `Currently Fronting: ${fronting.members[0].display_name || fronting.members[0].name || 'Unknown'}`;
      
      const frontingAvatar = fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar;
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = frontingAvatar;
      document.head.appendChild(link);
    } else {
      document.title = "Doughmination System Server";
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = defaultAvatar;
      document.head.appendChild(link);
    }
  }, [fronting]);

  if (members.length === 0) return <div className="text-black dark:text-white">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">System Members</h1>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
      >
        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>

      {/* Fronting Member - Show on all pages */}
      {fronting && fronting.members && fronting.members.length > 0 && (
        <div className="mt-4 mb-6">
          <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">Currently Fronting:</h2>
          <div className="flex items-center">
            <img
              src={fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar}
              alt="Fronting member"
              className="w-10 h-10 mr-3 rounded-full"
            />
            <span className="text-base text-black dark:text-white">{fronting.members[0]?.display_name}</span>
          </div>
        </div>
      )}

      {/* Routes */}
      <Routes>
        {/* Main route with list of members */}
        <Route path="/" element={
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">Members:</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {members.map((member) => (
                <li key={member.id} className="p-3 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
                  <Link to={`/${member.name.toLowerCase()}`} className="flex items-center text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
                    <img
                      src={member.avatar_url || defaultAvatar}
                      alt={member.name}
                      className="w-10 h-10 mr-3 rounded-full"
                    />
                    <span className="text-base">{member.display_name || member.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        } />
        
        {/* Member details route */}
        <Route path="/:member_id" element={<MemberDetails members={members} defaultAvatar={defaultAvatar} />} />
      </Routes>
    </div>
  );
}

export default App;