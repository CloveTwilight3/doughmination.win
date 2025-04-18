import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', display_name: '', isAdmin: false });
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setMessage({ type: "error", content: "Error loading users" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password) {
      setMessage({ type: "error", content: "Username and password are required." });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", content: "Authentication required." });
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          display_name: newUser.display_name || undefined,
          is_admin: newUser.isAdmin
        }),
      });
      
      if (!res.ok) throw new Error("Failed to add user");
      const data = await res.json();
      
      setMessage({ type: "success", content: "User added successfully!" });
      setNewUser({ username: '', password: '', display_name: '', isAdmin: false });
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error("Error adding user:", err);
      setMessage({ type: "error", content: "Error adding user" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditUser = async (e) => {
    e.preventDefault();
    
    if (!editUser || !editUser.id) {
      setMessage({ type: "error", content: "No user selected for editing." });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          display_name: editUser.display_name
        }),
      });
      
      if (!res.ok) throw new Error("Failed to update user");
      const data = await res.json();
      
      setMessage({ type: "success", content: "User updated successfully!" });
      setEditUser(null);
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error("Error updating user:", err);
      setMessage({ type: "error", content: "Error updating user" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete user");
      
      setMessage({ type: "success", content: "User deleted successfully" });
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error("Error deleting user:", err);
      setMessage({ type: "error", content: "Error deleting user" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mt-8 border-t pt-6 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}`}>
          {message.content}
        </div>
      )}
      
      {/* Add User Form */}
      <form onSubmit={handleAddUser} className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Add New User</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium mb-1">
              Display Name (optional)
            </label>
            <input
              id="display_name"
              type="text"
              className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
              value={newUser.display_name}
              onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="is-admin"
              type="checkbox"
              className="mr-2"
              checked={newUser.isAdmin}
              onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
            />
            <label htmlFor="is-admin" className="text-sm font-medium">
              Admin Privileges
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
      
      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Edit User</h3>
            <form onSubmit={handleEditUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Username</label>
                <p className="p-2 bg-gray-100 dark:bg-gray-700 rounded">{editUser.username}</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit_display_name" className="block text-sm font-medium mb-1">
                  Display Name
                </label>
                <input
                  id="edit_display_name"
                  type="text"
                  className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
                  value={editUser.display_name || ''}
                  onChange={(e) => setEditUser({...editUser, display_name: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium mb-3">Existing Users</h3>
        
        {loading && users.length === 0 ? (
          <p className="text-center py-4">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-4">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Display Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.display_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_admin ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;