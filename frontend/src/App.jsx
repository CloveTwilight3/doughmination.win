import React, { useEffect, useState } from "react";
import { Link, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import useTheme from './useTheme';
import MemberDetails from './MemberDetails.jsx';
import Login from './Login.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function App() {
  const [members, setMembers] = useState([]);
  const [fronting, setFronting] = useState({ members: [] });
  const [theme, toggleTheme] = useTheme();
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const defaultAvatar = "https://clovetwilight3.co.uk/system.png";
  // We're using direct API paths instead of env variables
  const API_URL = '';

  useEffect(() => {
    // For public access, we'll still fetch basic data regardless of login state
    const fetchPublicData = async () => {
      try {
        // Use the original working endpoints
        const membersRes = await fetch(`/api/members`);
        
        if (membersRes.ok) {
          const data = await membersRes.json();
          console.log("Members data from backend:", data);
          const sortedMembers = [...data].sort((a, b) => {
            const nameA = (a.display_name || a.name).toLowerCase();
            const nameB = (b.display_name || b.name).toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setMembers(sortedMembers);
        }
  
        // Use original working endpoint
        const frontingRes = await fetch(`/api/fronters`);
        
        if (frontingRes.ok) {
          const data = await frontingRes.json();
          console.log("Fronting member data:", data);
          setFronting(data || { members: [] });
        }
      } catch (err) {
        console.error("Error fetching public data:", err);
      } finally {
        setLoading(false);
      }
    };
  
    // Check authentication status if token exists
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        fetchPublicData();
        return;
      }
  
      try {
        // Check if logged in user is an admin
        const adminRes = await fetch(`/api/is_admin`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (adminRes.ok) {
          const data = await adminRes.json();
          setIsAdmin(!!data.isAdmin);
          setLoggedIn(true);
          
          // Now fetch the main data
          fetchPublicData();
        } else {
          // If admin check fails, logout
          localStorage.removeItem("token");
          setLoggedIn(false);
          fetchPublicData();
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
        localStorage.removeItem("token");
        setLoggedIn(false);
        // Fall back to public data
        fetchPublicData();
      }
    };
  
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (fronting && fronting.members && fronting.members.length > 0) {
      const frontingMember = fronting.members[0];
      document.title = `Currently Fronting: ${frontingMember.display_name || frontingMember.name || 'Unknown'}`;
      const frontingAvatar = frontingMember.webhook_avatar_url || frontingMember.avatar_url || defaultAvatar;
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
  }, [fronting, defaultAvatar]);

  function handleLogout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
  }

  if (loading) return <div className="text-black dark:text-white p-10 text-center">Loading...</div>;

  return (
    <div className="p-3 max-w-6xl mx-auto text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">System Members</h1>

      {/* Theme + Login/Logout buttons */}
      <div className="fixed top-4 right-4 flex gap-3">
        <button
          onClick={toggleTheme}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
        >
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        {loggedIn ? (
          <>
            {isAdmin && (
              <Link 
                to="/admin/dashboard"
                className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <Link 
            to="/admin/login"
            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
          >
            Login
          </Link>
        )}
      </div>

      {/* Fronting */}
      {fronting && fronting.members && fronting.members.length > 0 && (
        <div className="mb-6 p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3 text-center">Currently Fronting:</h2>
          <div className="fronting-member">
            <div className="avatar-container fronting-avatar">
              <img
                src={fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar}
                alt="Fronting member"
              />
            </div>
            <span className="fronting-member-name">
              {fronting.members[0]?.display_name || fronting.members[0]?.name || "Unknown"}
            </span>
          </div>
        </div>
      )}

      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Members:</h2>
            {members.length > 0 ? (
              <div className="grid member-grid gap-5">
                {members.map((member) => (
                  <div key={member.id} className="member-grid-item">
                    <div className="h-full w-full p-2">
                      <Link 
                        to={`/${member.name.toLowerCase()}`} 
                        className="block h-full border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex flex-col items-center justify-center h-full p-3">
                          <div className="avatar-container">
                            <img
                              src={member.avatar_url || defaultAvatar}
                              alt={member.name}
                            />
                          </div>
                          <span className="member-name">{member.display_name || member.name}</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center mt-8">No members found. Please check your connection.</p>
            )}
          </div>
        } />
        
        <Route path="/:member_id" element={<MemberDetails members={members} defaultAvatar={defaultAvatar} />} />
        <Route path="/admin/login" element={<Login onLogin={() => setLoggedIn(true)} />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminRequired={true} isAdmin={isAdmin} isLoggedIn={loggedIn}>
            <AdminDashboard fronting={fronting} />
          </ProtectedRoute>
        } />
        
        {/* Catch all for invalid routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;