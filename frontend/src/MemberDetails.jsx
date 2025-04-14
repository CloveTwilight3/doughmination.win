import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const MemberDetails = ({ members, defaultAvatar }) => {
  const { member_id } = useParams();
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        // First check if we already have the member data in props
        const existingMember = members?.find(m => 
          m.id === member_id || 
          m.name.toLowerCase() === member_id.toLowerCase()
        );
        
        if (existingMember) {
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
  }, [member_id, members]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-base text-black dark:text-white">Loading member data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-base text-red-500">{error}</p>
        <Link to="/" className="mt-3 inline-block px-3 py-1 bg-blue-500 text-white rounded text-sm">
          Back to Members
        </Link>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="p-4 text-center">
        <p className="text-base text-black dark:text-white">Member not found</p>
        <Link to="/" className="mt-3 inline-block px-3 py-1 bg-blue-500 text-white rounded text-sm">
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <img
          src={memberData.avatar_url || defaultAvatar}
          alt={memberData.name}
          className="w-10 h-10 mr-3 rounded-full"
        />
        <h1 className="text-xl font-bold text-black dark:text-white">{memberData.display_name || memberData.name}</h1>
      </div>
      
      {memberData.description && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold mb-1 text-black dark:text-white">About</h2>
          <p className="text-sm text-black dark:text-white">{memberData.description}</p>
        </div>
      )}
      
      {/* Display other member details as needed */}
      {memberData.pronouns && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold mb-1 text-black dark:text-white">Pronouns</h2>
          <p className="text-sm text-black dark:text-white">{memberData.pronouns}</p>
        </div>
      )}
      
      {/* Back button */}
      <Link to="/" className="mt-4 inline-block px-3 py-1 bg-blue-500 text-white rounded text-sm">
        Back to All Members
      </Link>
    </div>
  );
}

export default MemberDetails;