import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useTheme from './useTheme';  // Import the custom hook

function App() {
  const [members, setMembers] = useState([]);
  const [fronting, setFronting] = useState(null);
  const [theme, toggleTheme] = useTheme();  // Use the custom theme hook

  const defaultAvatar = "https://www.example.com/default-avatar.png";  // Replace this with your system's default avatar URL or a placeholder

  // Define link colors based on the current theme
  const linkClass = theme === 'light' ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-600';

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
      {fronting && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Currently Fronting:</h2>
          <div className="flex items-center">
            <img
              src={fronting.avatar_url || defaultAvatar}  // Use the default avatar if no avatar_url
              alt="Fronting member"
              className="w-10 h-10 mr-3 rounded-full"
            />
            <span>{fronting.name}</span>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Members:</h2>
        <ul>
          {members.map((member) => (
            <li key={member.id} className="mb-4 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
              <Link
                to={`/${member.username}`}
                className={`flex items-center ${linkClass}`}  // Use dynamic link class
              >
                <img
                  src={member.avatar_url || defaultAvatar}  // Use the default avatar if no avatar_url
                  alt={member.name}
                  className="w-10 h-10 mr-3 rounded-full"  // Adjusted size for Discord-like appearance
                />
                <span>{member.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
