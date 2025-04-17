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

  useEffect(() => {
    // Fetch public data (members and fronters)
    const fetchPublicData = async () => {
      try {
        // Fetch members data
        const membersRes = await fetch("/api/members");
        if (membersRes.ok) {
          const data = await membersRes.json();
          console.log("Members data from backend:", data);
          // Sort members alphabetically by name
          const sortedMembers = [...data].sort((a, b) => {
            // Use display_name if available, otherwise use name
            const nameA = (a.display_name || a.name).toLowerCase();
            const nameB = (b.display_name || b.name).toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setMembers(sortedMembers);
        } else {
          console.error("Error fetching members:", membersRes.status);
        }

        // Fetch current fronting member (if available)
        const frontingRes = await fetch("/api/fronters");
        if (frontingRes.ok) {
          const data = await frontingRes.json();
          console.log("Fronting member data:", data);
          setFronting(data || { members: [] });
        } else {
          console.error("Error fetching fronters:", frontingRes.status);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    // Check if user is admin when logged in
    const checkAdminStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedIn(false);
        return false;
      }

      try {
        const res = await fetch("/api/is_admin", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setIsAdmin(!!data.isAdmin);
          setLoggedIn(true);
          return true;
        } else {
          // Token invalid or expired
          localStorage.removeItem("token");
          setLoggedIn(false);
          setIsAdmin(false); 
          return false;
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        localStorage.removeItem("token");
        setLoggedIn(false);
        setIsAdmin(false);
        return false;
      }
    };

    // Main initialization function
    const initialize = async () => {
      // First check auth status if there's a token
      if (localStorage.getItem("token")) {
        await checkAdminStatus();
      }
      
      // Then fetch public data regardless of auth status
      await fetchPublicData();
    };

    initialize();
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
    <div className="max-w-6xl mx-auto text-black dark:text-white">
      {/* IMPORTANT: Updated navbar structure */}
      <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-lg font-semibold">Doughmination System</Link>
          <nav>
            <ul className="flex items-center gap-3">
              <li>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm"
                >
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </li>
              {loggedIn ? (
                <>
                  {isAdmin && (
                    <li>
                      <Link 
                        to="/admin/dashboard"
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm"
                      >
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link 
                    to="/admin/login"
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm"
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Clear space for the fixed header */}
      <div className="pt-16"></div>

      <main className="container mx-auto px-4 pt-4">
        <h1 className="text-2xl font-bold mt-8 mb-6 text-center text-black dark:text-white">
          System Members: 
        </h1> 
        
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
                          className="block h-full border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 transform transition-all duration-300"
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
          <Route path="/admin/login" element={<Login onLogin={() => {
            setLoggedIn(true);
            // After login, check if user is admin
            fetch("/api/is_admin", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            })
            .then(res => res.json())
            .then(data => {
              setIsAdmin(!!data.isAdmin);
              if (data.isAdmin) {
                navigate('/admin/dashboard');
              } else {
                navigate('/');
              }
            })
            .catch(err => {
              console.error("Error checking admin status after login:", err);
              navigate('/');
            });
          }} />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminRequired={true} isAdmin={isAdmin} isLoggedIn={loggedIn}>
              <AdminDashboard fronting={fronting} />
            </ProtectedRoute>
          } />
          
          {/* Catch all for invalid routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* GitHub Footer */}
      <footer className="github-footer">
        <a href="https://github.com/clovetwilight3/plural-web" target="_blank" rel="noopener noreferrer" className="github-button">
          <svg className="github-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          View Source Code on GitHub.
        </a>
      </footer>
    </div>
  );
}

export default App;