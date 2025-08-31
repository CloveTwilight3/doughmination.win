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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserEdit = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    display_name: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  
  // Default avatar for fallback
  const defaultAvatar = "https://www.yuri-lover.win/pfp/fallback_avatar.png";

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    setImageError(false);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/user_info', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }
      
      const data = await response.json();
      setUserData(data);
      setFormData(prevData => ({
        ...prevData,
        display_name: data.display_name || ''
      }));

      if (data.avatar_url) {
        setAvatarPreview(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle image error
  const handleImageError = () => {
    console.error('Failed to load avatar image');
    setImageError(true);
    setAvatarPreview(defaultAvatar);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 2MB)
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 2) {
        setError("Image file is too large. Please select an image under 2MB.");
        e.target.value = ''; // Clear the file input
        return;
      }
      
      // Check file extension
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        setError(`Invalid file type. Allowed types are: ${allowedExtensions.join(', ')}`);
        e.target.value = ''; // Clear the file input
        return;
      }
      
      setAvatar(file);
      setImageError(false);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm("Are you sure you want to discard your changes?")) {
      navigate('/admin/user');
    }
  };

  const validateForm = () => {
    // Validate password change if attempted
    if (formData.new_password || formData.confirm_password) {
      if (!formData.current_password) {
        setError('Current password is required to set a new password');
        return false;
      }
      
      if (formData.new_password !== formData.confirm_password) {
        setError('New passwords do not match');
        return false;
      }
      
      if (formData.new_password.length < 6) {
        setError('New password must be at least 6 characters long');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    setMessage(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setSaving(false);
      return;
    }
    
    try {
      // First update profile info
      const profileUpdateData = {
        display_name: formData.display_name
      };
      
      // Add password change info if provided
      if (formData.new_password && formData.current_password) {
        profileUpdateData.current_password = formData.current_password;
        profileUpdateData.new_password = formData.new_password;
      }
      
      const profileResponse = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileUpdateData)
      });
      
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.detail || `Failed to update profile: ${profileResponse.status}`);
      }
      
      // Handle avatar upload if a file was selected
      if (avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);
        
        const avatarResponse = await fetch(`/api/users/${userData.id}/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!avatarResponse.ok) {
          // If we get a 413 error, show a specific message
          if (avatarResponse.status === 413) {
            throw new Error("The image file is too large. Please select an image under 2MB.");
          }
          throw new Error(`Failed to upload avatar: ${avatarResponse.status}`);
        }
        
        // Update avatar URL
        const avatarData = await avatarResponse.json();
        if (avatarData.avatar_url) {
          setAvatarPreview(avatarData.avatar_url);
        }
      }
      
      setMessage('Profile updated successfully');
      
      // Clear password fields
      setFormData(prevData => ({
        ...prevData,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      
      // Update user data
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Improved error messages
      if (error.message.includes("413")) {
        setError("The image file is too large. Please select an image under 2MB.");
      } else {
        setError(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-lg text-black dark:text-white">Loading user data...</p>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-black dark:text-white mb-4">User data not available</p>
        <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Profile</h1>
      
      {message && (
        <div className="mb-6 p-3 rounded bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-3 rounded bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
              {avatarPreview && !imageError ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar preview" 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <img 
                  src={defaultAvatar} 
                  alt="Default avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Upload new picture</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-purple-50 file:text-purple-700
                          dark:file:bg-purple-900 dark:file:text-purple-200
                          hover:file:bg-purple-100 dark:hover:file:bg-purple-800"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>
        </div>
        
        {/* Profile Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={userData.username}
              disabled
              className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600 dark:border-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Username cannot be changed
            </p>
          </div>
          
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
            />
          </div>
        </div>
        
        {/* Password Change */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          
          <div className="mb-4">
            <label htmlFor="current_password" className="block text-sm font-medium mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="new_password" className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
            />
          </div>
          
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
            />
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button 
            type="button" 
            onClick={handleDiscardChanges}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg transition-colors text-center"
          >
            Discard Changes
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-4 py-2 bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
      
      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <Link to="/" className="text-blue-500 dark:text-blue-400">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default UserEdit;