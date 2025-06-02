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
import MemberTagDisplay from './MemberTagDisplay';

const MemberTagManagement = () => {
  const [members, setMembers] = useState([]);
  const [subsystems, setSubsystems] = useState([]);
  const [memberTags, setMemberTags] = useState({});
  const [editingMember, setEditingMember] = useState(null);
  const [editTags, setEditTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Available tag options
  const availableTags = ['host', 'valorant', 'pets', 'vocaloids'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      // Fetch members, subsystems, and member tags
      const [membersRes, subsystemsRes, tagsRes] = await Promise.all([
        fetch('/api/members', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/subsystems', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/member-tags', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData || []);
      }

      if (subsystemsRes.ok) {
        const subsystemsData = await subsystemsRes.json();
        setSubsystems(subsystemsData.subsystems || []);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setMemberTags(tagsData.member_tags || {});
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    const currentTags = memberTags[member.name] || memberTags[member.id] || [];
    setEditTags([...currentTags]);
    setMessage(null);
    setError(null);
  };

  const handleTagToggle = (tag) => {
    if (editTags.includes(tag)) {
      setEditTags(editTags.filter(t => t !== tag));
    } else {
      setEditTags([...editTags, tag]);
    }
  };

  const handleSaveTags = async () => {
    if (!editingMember) return;
    
    setSaving(true);
    setMessage(null);
    setError(null);
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/api/member-tags/${editingMember.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editTags)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Successfully updated tags for ${editingMember.name}`);
        
        // Update local state
        setMemberTags(prev => ({
          ...prev,
          [editingMember.name]: editTags
        }));
        
        // Close editing modal
        setEditingMember(null);
        setEditTags([]);
        
        // Refresh data to get updated member info
        setTimeout(() => {
          fetchData();
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update tags');
      }
    } catch (err) {
      console.error('Error saving tags:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getMemberTags = (member) => {
    return member.tags || memberTags[member.name] || memberTags[member.id] || [];
  };

  if (loading) {
    return (
      <div className="mt-8 border-t pt-6 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Member Tag Management</h2>
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-lg">Loading member data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t pt-6 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Member Tag Management</h2>
      
      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          {error}
        </div>
      )}

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium mb-3">Member Tags</h3>
        
        {members.length === 0 ? (
          <p className="text-center py-4">No members found.</p>
        ) : (
          <div className="space-y-3">
            {members
              .filter(member => !member.is_cofront && !member.is_special) // Hide cofronts and special members
              .map((member) => {
                const tags = getMemberTags(member);
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">{member.display_name || member.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.name}</p>
                        <MemberTagDisplay tags={tags} className="mt-1" />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleEditMember(member)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Edit Tags
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Edit Tags Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Edit Tags for {editingMember.display_name || editingMember.name}</h3>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                {availableTags.map(tag => (
                  <label key={tag} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="capitalize font-medium">
                      {tag === 'host' && '🏠'} 
                      {tag === 'valorant' && '🔫'} 
                      {tag === 'pets' && '🐾'} 
                      {tag === 'vocaloids' && '🎤'} 
                      {' '}{tag}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <MemberTagDisplay tags={editTags} />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTags}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Tags'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Info Box */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Sub-system Information</h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p><strong>🏠 Host:</strong> System host members</p>
          <p><strong>🔫 Valorant:</strong> Members from the Valorant universe</p>
          <p><strong>🐾 Pets:</strong> Pet-like members or animal personas</p>
          <p><strong>🎤 Vocaloids:</strong> Vocaloid characters and music-related members</p>
        </div>
      </div>
    </div>
  );
};

export default MemberTagManagement;
