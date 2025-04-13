import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useTheme from './useTheme';  // Import the custom hook

function App() {
  const [members, setMembers] = useState([]);
  const [fronting, setFronting] = useState(null);
  const [theme, toggleTheme] = useTheme();  // Use the custom theme hook

  const defaultAvatar = "https://clovetwilight3.co.uk/system.png";  // Replace this with your system's default avatar URL or a placeholder

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

  // Function to create a circular favicon from an image URL
  const setFavicon = (imgUrl) => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
  
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 64;
  
      canvas.width = size;
      canvas.height = size;
  
      // Just draw the image directly, no clipping
      ctx.drawImage(img, 0, 0, size, size);
  
      link.href = canvas.toDataURL("image/png");
      document.head.appendChild(link);
    };
  
    img.src = imgUrl;
  };

  
  // Dynamically update the document title and favicon based on fronting member
  useEffect(() => {
    if (fronting && fronting.members && fronting.members.length > 0) {
      document.title = `Currently Fronting: ${fronting.members[0].display_name || 'Unknown'}`;
      
      // Set favicon to the fronting member's avatar (or default)
      const frontingAvatar = fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar;
      setFavicon(frontingAvatar);
    } else {
      document.title = "Doughmination System Server";  // Default title
      
      // Reset favicon to default
      setFavicon(defaultAvatar);
    }
  }, [fronting]); // Runs only when fronting changes

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
              src={fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar}  // Fallback to member avatar or default
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
              <Link
                to={`/${member.username}`}
                className={`flex items-center ${linkClass}`}  // Use dynamic link class
              >
                <img
                  src={member.avatar_url || defaultAvatar}  // Use the default avatar if no avatar_url
                  alt={member.name}
                  className="w-10 h-10 mr-3 rounded-full"  // Adjusted size for Discord-like appearance
                />
                <span>{member.display_name || member.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
