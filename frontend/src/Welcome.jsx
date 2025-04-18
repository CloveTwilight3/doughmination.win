import React, { useState, useEffect } from 'react';

const Welcome = ({ loggedIn, isAdmin }) => {
  const [displayName, setDisplayName] = useState('');
  
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
            setDisplayName(data.display_name || data.username);
          } else {
            // If API call fails, try to extract username from JWT token
            try {
              const token = localStorage.getItem('token');
              if (token) {
                // JWT tokens are in the format: header.payload.signature
                const payload = token.split('.')[1];
                // Decode the base64 payload
                const decodedPayload = JSON.parse(atob(payload));
                // Extract display_name or username from the payload
                setDisplayName(decodedPayload.display_name || decodedPayload.sub || 'User');
              }
            } catch (error) {
              console.error('Error parsing token:', error);
              setDisplayName('User'); // Fallback
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setDisplayName('User'); // Fallback
        }
      };
      
      fetchUserData();
    }
  }, [loggedIn]);
  
  if (!loggedIn) return null;
  
  return (
    <div className="welcome-message py-2 px-4 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <p className="text-lg">
        Welcome, <span className="font-bold">{displayName}</span>
        {isAdmin && !displayName.includes('Admin') && <span className="ml-2 text-purple-500 dark:text-purple-400">(Admin)</span>}
      </p>
    </div>
  );
};

export default Welcome;