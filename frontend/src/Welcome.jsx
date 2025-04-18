import React, { useState, useEffect } from 'react';

const Welcome = ({ loggedIn, isAdmin }) => {
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    if (loggedIn) {
      // Fetch user data when logged in
      const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await fetch('/api/user_info', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUsername(data.username || 'User');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      
      fetchUserData();
    }
  }, [loggedIn]);
  
  if (!loggedIn) return null;
  
  return (
    <div className="welcome-message py-2 px-4 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <p className="text-lg">
        Welcome, <span className="font-bold">{username}</span>!
        {isAdmin && <span className="ml-2 text-purple-500 dark:text-purple-400">(Admin)</span>}
      </p>
    </div>
  );
};

export default Welcome;