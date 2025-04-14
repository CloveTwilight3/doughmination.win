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
    <div className="p-3 max-w-6xl mx-auto text-black dark:text-white">
      <h1 className="text-xl font-bold mb-4 text-center text-black dark:text-white">System Members</h1>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs"
      >
        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>

      {/* Fronting Member - Show on all pages */}
      {fronting && fronting.members && fronting.members.length > 0 && (
        <div className="mb-6 p-4 border-b dark:border-gray-700">
          <h2 className="text-sm font-semibold mb-2 text-center text-black dark:text-white">Currently Fronting:</h2>
          <div className="flex items-center justify-center">
            <img
              src={fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar}
              alt="Fronting member"
              className="h-10 w-10 mr-3 rounded-full shadow-md object-cover"
            />
            <span className="text-sm font-medium text-black dark:text-white">{fronting.members[0]?.display_name || fronting.members[0].name}</span>
          </div>
        </div>
      )}

      {/* Routes */}
      <Routes>
        {/* Main route with grid of members */}
        <Route path="/" element={
          <div className="mt-4">
            <h2 className="text-sm font-semibold mb-3 text-black dark:text-white">Members:</h2>

            {/* Grid layout with smaller items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {members.map((member) => (
                <div key={member.id} className="transition-all duration-300 hover:scale-105">
                  <Link 
                    to={`/${member.name.toLowerCase()}`} 
                    className="block p-2 border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 text-black dark:text-white hover:shadow-lg"
                  >
                    <div className="flex flex-col items-center">
                      <img
                        src={member.avatar_url || defaultAvatar}
                        alt={member.name}
                        className="h-10 w-10 mb-2 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-center">{member.display_name || member.name}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        } />
        
        {/* Member details route */}
        <Route path="/:member_id" element={<MemberDetails members={members} defaultAvatar={defaultAvatar} />} />
      </Routes>
    </div>
  );
}

export default App;
