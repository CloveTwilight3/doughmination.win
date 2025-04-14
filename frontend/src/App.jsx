import React, { useEffect, useState } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import useTheme from './useTheme';
import MemberDetails from './MemberDetails.jsx';
import Login from './Login.jsx'; // you'll create this
import AdminDashboard from './AdminDashboard.jsx'; // Create this component

function App() {
  const [members, setMembers] = useState([]);
  const [fronting, setFronting] = useState(null);
  const [theme, toggleTheme] = useTheme();
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(false); // track admin status
  const navigate = useNavigate();

  const defaultAvatar = "https://clovetwilight3.co.uk/system.png";

  useEffect(() => {
    if (!loggedIn) return;

    // Fetch members data
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        const sortedMembers = [...data].sort((a, b) => {
          const nameA = (a.display_name || a.name).toLowerCase();
          const nameB = (b.display_name || b.name).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setMembers(sortedMembers);
      })
      .catch((err) => {
        console.error("Error fetching members data:", err);
      });

    // Fetch current fronting member
    fetch("/api/fronters")
      .then((res) => res.json())
      .then((data) => setFronting(data))
      .catch((err) => {
        console.error("Error fetching fronting data:", err);
      });

    // Check if logged in user is an admin (you may need to verify this from your backend)
    fetch("/api/is_admin")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch((err) => {
        console.error("Error checking admin status:", err);
      });
  }, [loggedIn]);

  useEffect(() => {
    if (fronting && fronting.members?.length > 0) {
      document.title = `Currently Fronting: ${fronting.members[0].display_name || fronting.members[0].name}`;
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

  function handleLogout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    navigate('/');
  }

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  if (members.length === 0) return <div className="text-black dark:text-white">Loading...</div>;

  return (
    <div className="p-3 max-w-6xl mx-auto text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">System Members</h1>

      {/* Theme + Logout buttons */}
      <div className="fixed top-4 right-4 flex gap-3">
        <button
          onClick={toggleTheme}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
        >
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        <button
          onClick={handleLogout}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
        >
          Logout
        </button>
      </div>

      {/* Fronting */}
      {fronting?.members?.length > 0 && (
        <div className="mb-6 p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3 text-center">Currently Fronting:</h2>
          <div className="fronting-member">
            <div className="avatar-container fronting-avatar">
              <img
                src={fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar}
                alt="Fronting member"
              />
            </div>
            <span className="fronting-member-name">{fronting.members[0]?.display_name || fronting.members[0].name}</span>
          </div>
        </div>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={(
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Members:</h2>
            <div className="grid member-grid gap-5">
              {members.map((member) => (
                <div key={member.id} className="member-grid-item">
                  <div className="h-full w-full p-2">
                    <Link 
                      to={`/${member.name.toLowerCase()}`} 
                      className="block h-full border rounded-lg shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transform transition-all duration-300 hover:scale-105"
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
          </div>
        )} />
        <Route path="/:member_id" element={<MemberDetails members={members} defaultAvatar={defaultAvatar} />} />
        {isAdmin && (
          <>
            <Route path="/admin/login" element={<Login onLogin={() => setLoggedIn(true)} />} />
            <Route path="/admin/dash" element={<AdminDashboard fronting={fronting} />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
