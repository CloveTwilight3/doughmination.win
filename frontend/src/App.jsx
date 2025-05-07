/*
MIT License

Copyright (c) 2025 Clove Twilight

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* ============================================================================
 * DOUGHMINATION SYSTEM SERVER - MAIN APP COMPONENT
 *
 * This is the root component of the application that handles:
 * - Routing between different views/pages
 * - User authentication state
 * - Theme toggling (light/dark mode)
 * - PluralKit API data fetching
 * - Navigation menu with hamburger button for all devices
 * - Member search functionality
 * ============================================================================
 */

import React, { useEffect, useState } from "react";
import { Link, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import useTheme from './useTheme';
import MemberDetails from './MemberDetails.jsx';
import Login from './Login.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Welcome from './Welcome.jsx';
import Metrics from './Metrics.jsx';
import UserProfile from './UserProfile.jsx';
import UserEdit from './UserEdit.jsx';

function App() {
  /* ============================================================================
   * STATE MANAGEMENT
   * Application-wide state variables
   * ============================================================================
   */
  const [members, setMembers] = useState([]); // All system members
  const [filteredMembers, setFilteredMembers] = useState([]); // Filtered members for search
  const [searchQuery, setSearchQuery] = useState(""); // Search query for members
  const [fronting, setFronting] = useState({ members: [] }); // Currently fronting members
  const [theme, toggleTheme] = useTheme(); // Light/dark mode state
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token")); // Authentication state
  const [isAdmin, setIsAdmin] = useState(false); // Admin privileges state
  const [loading, setLoading] = useState(true); // Initial data loading state
  const [menuOpen, setMenuOpen] = useState(false); // Menu toggle state for all devices
  const navigate = useNavigate(); // React Router navigation hook

  // Default avatar for members without one
  const defaultAvatar = "https://alextlm.co.uk/system.png";

  /* ============================================================================
   * DATA FETCHING AND INITIALIZATION
   * Initial data loading from PluralKit API and user authentication check
   * ============================================================================
   */
  useEffect(() => {
    // Function to fetch public data (members and fronters)
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
          setFilteredMembers(sortedMembers);
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

    // Function to check admin status when logged in
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

  /* ============================================================================
   * SEARCH FUNCTIONALITY
   * Filter members based on search query
   * ============================================================================
   */
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(member => {
        const name = member.name.toLowerCase();
        const displayName = (member.display_name || "").toLowerCase();
        const pronouns = (member.pronouns || "").toLowerCase();
        return name.includes(query) || 
               displayName.includes(query) || 
               pronouns.includes(query);
      });
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  /* ============================================================================
   * FRONTING MEMBER UPDATES
   * Updates favicon, title, and meta tags based on who's fronting
   * ============================================================================
   */
  useEffect(() => {
    if (fronting && fronting.members && fronting.members.length > 0) {
      const frontingMember = fronting.members[0];
      // If the fronting member is private (Alex)
      if (frontingMember.is_private) {
        document.title = `Currently Fronting: PRIVATE`;
        
        // Update favicon to default avatar for private members
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = defaultAvatar;
        document.head.appendChild(link);
        
        // Update apple-touch-icon for iOS
        const touchIcon = document.querySelector("link[rel='apple-touch-icon']") || document.createElement('link');
        touchIcon.rel = 'apple-touch-icon';
        touchIcon.href = defaultAvatar;
        document.head.appendChild(touchIcon);
        
        // Update meta tags with generic information
        updateMetaTags({
          display_name: "PRIVATE",
          name: "PRIVATE",
          avatar_url: defaultAvatar
        });
      } else {
        // Original code for non-private members
        document.title = `Currently Fronting: ${frontingMember.display_name || frontingMember.name || 'Unknown'}`;
        const frontingAvatar = frontingMember.webhook_avatar_url || frontingMember.avatar_url || defaultAvatar;
        
        // Update favicon
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = frontingAvatar;
        document.head.appendChild(link);
        
        // Update apple-touch-icon for iOS
        const touchIcon = document.querySelector("link[rel='apple-touch-icon']") || document.createElement('link');
        touchIcon.rel = 'apple-touch-icon';
        touchIcon.href = frontingAvatar;
        document.head.appendChild(touchIcon);
        
        // Update meta tags for better link sharing
        updateMetaTags(frontingMember);
      }
    } else {
      document.title = "Doughmination System Server";
      
      // Reset favicon
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = defaultAvatar;
      document.head.appendChild(link);
      
      // Reset apple-touch-icon
      const touchIcon = document.querySelector("link[rel='apple-touch-icon']") || document.createElement('link');
      touchIcon.rel = 'apple-touch-icon';
      touchIcon.href = defaultAvatar;
      document.head.appendChild(touchIcon);
      
      // Reset meta tags
      updateMetaTags();
    }
  }, [fronting, defaultAvatar]);

  /* ============================================================================
   * MENU HANDLING
   * Close menu when navigating to a new page and handle body scrolling
   * ============================================================================
   */
  useEffect(() => {
    if (menuOpen) {
      setMenuOpen(false);
      document.body.style.overflow = '';
    }
  }, [navigate]);
  
  // Cleanup function to ensure body scroll is restored when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  /* ============================================================================
   * HELPER FUNCTIONS
   * Utility functions for various tasks
   * ============================================================================
   */
  
  // Toggle menu function
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    
    // Control body scrolling when menu is open/closed
    if (!menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search query
  const clearSearch = () => {
    setSearchQuery("");
  };
  
  // Function to update meta tags for better link sharing
  const updateMetaTags = (frontingMember = null) => {
    // Update Open Graph title
    let metaTitle = document.querySelector('meta[property="og:title"]');
    if (!metaTitle) {
      metaTitle = document.createElement('meta');
      metaTitle.setAttribute('property', 'og:title');
      document.head.appendChild(metaTitle);
    }
    
    // Update Open Graph image
    let metaImage = document.querySelector('meta[property="og:image"]');
    if (!metaImage) {
      metaImage = document.createElement('meta');
      metaImage.setAttribute('property', 'og:image');
      document.head.appendChild(metaImage);
    }
    
    // Update description
    let metaDesc = document.querySelector('meta[property="og:description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('property', 'og:description');
      document.head.appendChild(metaDesc);
    }
    
    if (frontingMember) {
      // Custom meta data for current fronter
      metaTitle.setAttribute('content', `Currently Fronting: ${frontingMember.display_name || frontingMember.name}`);
      metaImage.setAttribute('content', frontingMember.webhook_avatar_url || frontingMember.avatar_url || defaultAvatar);
      metaDesc.setAttribute('content', `Learn more about ${frontingMember.display_name || frontingMember.name} and other system members`);
    } else {
      // Default meta data
      metaTitle.setAttribute('content', 'Doughmination System');
      metaImage.setAttribute('content', defaultAvatar);
      metaDesc.setAttribute('content', 'View current fronters and members of the Doughmination system.');
    }
    
    // Also update Twitter card tags
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    
    if (twitterTitle) twitterTitle.setAttribute('content', metaTitle.getAttribute('content'));
    if (twitterImage) twitterImage.setAttribute('content', metaImage.getAttribute('content'));
    if (twitterDesc) twitterDesc.setAttribute('content', metaDesc.getAttribute('content'));
  };

  // Logout handler
  function handleLogout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
  }

  // Show loading state while initializing
  if (loading) return <div className="text-black dark:text-white p-10 text-center">Loading...</div>;

  /* ============================================================================
   * COMPONENT RENDER
   * Main application layout and routing
   * ============================================================================
   */
  return (
    <div className="max-w-6xl mx-auto text-black dark:text-white">
      {/* ========== NAVIGATION BAR WITH HAMBURGER MENU ========== */}
      <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-lg font-semibold z-10">Doughmination System</Link>
          
          {/* Hamburger menu button - for ALL devices */}
          <button 
            className="flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Navigation overlay for all devices */}
        {menuOpen && (
          <div className="fixed inset-0 z-30 bg-black bg-opacity-50" onClick={toggleMenu}>
            <div 
              className="absolute right-0 top-[61px] w-64 max-w-[80vw] h-screen bg-white dark:bg-gray-800 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="flex flex-col p-4 gap-3">
                <li>
                  <button
                    onClick={() => {
                      toggleTheme();
                      toggleMenu();
                    }}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg text-sm flex justify-center"
                  >
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                </li>
                {loggedIn && (
                  <li>
                    <Link 
                      to="/admin/metrics"
                      className="block w-full px-4 py-3 bg-purple-500 text-white rounded-lg text-sm text-center"
                      onClick={toggleMenu}
                    >
                      Metrics
                    </Link>
                  </li>
                )}
                {loggedIn && (
                  <li>
                    <Link 
                      to="/admin/user"
                      className="block w-full px-4 py-3 bg-purple-500 text-white rounded-lg text-sm text-center"
                      onClick={toggleMenu}
                    >
                      My Profile
                    </Link>
                  </li>
                )}
                {loggedIn ? (
                  <>
                    {isAdmin && (
                      <li>
                        <Link 
                          to="/admin/dashboard"
                          className="block w-full px-4 py-3 bg-purple-500 text-white rounded-lg text-sm text-center"
                          onClick={toggleMenu}
                        >
                          Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={() => {
                          handleLogout();
                          toggleMenu();
                        }}
                        className="w-full px-4 py-3 bg-red-500 text-white rounded-lg text-sm text-center"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link 
                      to="/admin/login"
                      className="block w-full px-4 py-3 bg-green-500 text-white rounded-lg text-sm text-center"
                      onClick={toggleMenu}
                    >
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </header>

      {/* Space for fixed header */}
      <div className="pt-16"></div>

      {/* ========== MAIN CONTENT AREA ========== */}
      <main className="container mx-auto px-4 pt-4">
        {/* Welcome banner - only shown when logged in */}
        <Welcome loggedIn={loggedIn} isAdmin={isAdmin} />
        
        <h1 className="text-2xl font-bold mt-8 mb-6 text-center text-black dark:text-white">
          System Members: 
        </h1> 
        
        {/* Currently Fronting Section */}
        {fronting && fronting.members && fronting.members.length > 0 && (
          <div className="mb-6 p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-3 text-center">Currently Fronting:</h2>
            <div className="fronting-member">
              <div className="avatar-container fronting-avatar">
                {fronting.members[0]?.is_private ? (
                  // Display default avatar for private members (Alex)
                  <img
                    src={defaultAvatar} 
                    alt="Private member"
                    loading="eager"
                  />
                ) : (
                  <img
                    src={fronting.members[0]?.webhook_avatar_url || fronting.members[0]?.avatar_url || defaultAvatar}
                    alt="Fronting member"
                    loading="eager"
                  />
                )}
              </div>
              <span className="fronting-member-name">
                {fronting.members[0]?.is_private ? "PRIVATE" : (fronting.members[0]?.display_name || fronting.members[0]?.name || "Unknown")}
                {/* Add Host label for Clove when fronting */}
                {fronting.members[0] && 
                (fronting.members[0].name === "Clove" || fronting.members[0].display_name === "Clove") && 
                !fronting.members[0].is_private && (
                  <span className="host-badge ml-2">Host</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* ========== ROUTING SETUP ========== */}
        <Routes>
          {/* Home Page - Member Grid with Search */}
          <Route path="/" element={
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4 text-center">Members:</h2>
              
              {/* Search Bar */}
              <div className="relative max-w-md mx-auto mb-6">
                <div className="flex items-center border rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-sm">
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full p-3 bg-transparent outline-none text-black dark:text-white"
                  />
                  {searchQuery && (
                    <button 
                      onClick={clearSearch}
                      className="flex-shrink-0 p-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <div className="flex-shrink-0 p-3 text-gray-500 dark:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {filteredMembers.length > 0 ? (
                <div className="grid member-grid gap-5">
                  {filteredMembers.map((member) => (
                    // Skip private members and Sleeping in the grid
                    member.is_private || member.name === "Sleeping" ? null : (
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
                                  loading="lazy"
                                />
                              </div>
                              <span className="member-name">
                                {member.display_name || member.name}
                                {/* Add "Host" label for Clove */}
                                {(member.name === "Clove" || member.display_name === "Clove") && (
                                  <span className="host-badge">Host</span>
                                )}
                              </span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : searchQuery ? (
                <p className="text-center mt-8">No members found matching "{searchQuery}"</p>
              ) : (
                <p className="text-center mt-8">No members found. Please check your connection.</p>
              )}
            </div>
          } />
          
          {/* Member Detail Page */}
          <Route path="/:member_id" element={<MemberDetails members={members} defaultAvatar={defaultAvatar} />} />
          
          {/* Authentication */}
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
          
          {/* User Profile Routes (protected, but no admin required) */}
          <Route path="/admin/user" element={
            <ProtectedRoute adminRequired={false} isAdmin={isAdmin} isLoggedIn={loggedIn}>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/user/edit" element={
            <ProtectedRoute adminRequired={false} isAdmin={isAdmin} isLoggedIn={loggedIn}>
              <UserEdit />
            </ProtectedRoute>
          } />
          
          {/* Admin Dashboard (protected, admin required) */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminRequired={true} isAdmin={isAdmin} isLoggedIn={loggedIn}>
              <AdminDashboard fronting={fronting} />
            </ProtectedRoute>
          } />
          
          {/* Metrics Page (protected, but no admin required) */}
          <Route path="/admin/metrics" element={
            <ProtectedRoute adminRequired={false} isAdmin={isAdmin} isLoggedIn={loggedIn}>
              <Metrics />
            </ProtectedRoute>
          } />
          
          {/* Catch all for invalid routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* ========== FOOTER ========== */}
      <footer className="github-footer">
        <div className="flex flex-col items-center gap-2">
          <a href="https://github.com/clovetwilight3/plural-web" target="_blank" rel="noopener noreferrer" className="github-button">
            <svg className="github-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View Source Code on GitHub
          </a>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            &copy; Clove Twilight 2025
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;