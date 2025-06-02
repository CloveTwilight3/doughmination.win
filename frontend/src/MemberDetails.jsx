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

/*
 * MemberDetails.jsx
 * 
 * This component displays detailed information about a specific system member.
 * It retrieves member data either from props or from the API based on the URL parameter.
 * 
 * Features:
 * - Display member avatar
 * - Show name, description, pronouns, and other member details
 * - Display member sub-system tags
 * - Loading states for data fetching
 * - Error handling for API failures
 * - Navigation back to the members list
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MemberTagDisplay from './MemberTagDisplay';

const MemberDetails = ({ members, defaultAvatar }) => {
  // Get member_id from URL parameters
  const { member_id } = useParams();
  
  // State management for the component
  const [memberData, setMemberData] = useState(null); // The member's data
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [error, setError] = useState(null); // Error state for API failures

  // Fetch member data on component mount
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        // First check if we already have the member data in props
        // This avoids unnecessary API calls if data is already available
        const existingMember = members?.find(m => 
          m.id === member_id || 
          m.name.toLowerCase() === member_id.toLowerCase()
        );
        
        if (existingMember) {
          // Use the data from props if available
          setMemberData(existingMember);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        const response = await fetch(`/api/member/${member_id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch member data: ${response.status}`);
        }
        const data = await response.json();
        setMemberData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching member data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [member_id, members]); // Re-fetch if member_id or members array changes

  // Loading state - displayed while fetching data
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-black dark:text-white">Loading member data...</p>
      </div>
    );
  }

  // Error state - displayed if data fetching fails
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors">
          Back to Members
        </Link>
      </div>
    );
  }

  // Member not found state
  if (!memberData) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-black dark:text-white mb-4">Member not found</p>
        <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors">
          ← Back to Members
        </Link>
      </div>
    );
  }

  // Main component render - displaying member details
  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 border rounded-lg shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* Member avatar and name section */}
      <div className="flex flex-col items-center mb-6">
        <div className="avatar-container member-details-avatar">
          <img
            src={memberData.is_private ? defaultAvatar : (memberData.avatar_url || defaultAvatar)}
            alt={memberData.is_private ? "Private Member" : memberData.name}
          />
        </div>
        <h1 className="text-2xl font-bold mt-2 text-black dark:text-white text-center">
          {memberData.is_private ? "PRIVATE" : (memberData.display_name || memberData.name)}
        </h1>
        
        {/* Display member tags */}
        {!memberData.is_private && memberData.tags && (
          <div className="mt-3">
            <MemberTagDisplay tags={memberData.tags} className="justify-center" />
          </div>
        )}
      </div>
      
      {/* Member details arranged in a grid - only show for non-private members */}
      {!memberData.is_private ? (
        <div className="space-y-5">
          {/* Basic Information Section */}
          {(memberData.pronouns || memberData.tags?.length > 0) && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">Information</h2>
              
              {memberData.pronouns && (
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pronouns</h3>
                  <p className="text-base text-black dark:text-white">{memberData.pronouns}</p>
                </div>
              )}
              
              {memberData.tags && memberData.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Sub-systems</h3>
                  <MemberTagDisplay tags={memberData.tags} />
                </div>
              )}
            </div>
          )}
          
          {/* Description section - only shown if there is a description */}
          {memberData.description && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">About</h2>
              <p className="text-base text-black dark:text-white leading-relaxed">{memberData.description}</p>
            </div>
          )}
          
          {/* Additional details section if there are other fields */}
          {(memberData.color || memberData.birthday) && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">Details</h2>
              
              {memberData.color && (
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Color</h3>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: memberData.color }}
                    ></div>
                    <span className="text-base text-black dark:text-white">{memberData.color}</span>
                  </div>
                </div>
              )}
              
              {memberData.birthday && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Birthday</h3>
                  <p className="text-base text-black dark:text-white">{memberData.birthday}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* For private members, show privacy notice */
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">Privacy Notice</h2>
          <p className="text-base text-black dark:text-white">
            This member's information is private.
          </p>
        </div>
      )}
      
      {/* Back button to return to members list */}
      <div className="mt-6 text-center">
        <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors text-base hover:bg-blue-600">
           ← Back to All Members
        </Link>
      </div>
    </div>
  );
}

export default MemberDetails;
