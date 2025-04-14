import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const MemberDetails = ({ members, defaultAvatar }) => {
  const { member_id } = useParams(); // This will match :member_id in the Route
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
        
        // Otherwise fetch from API - using the correct endpoint path
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
      <div className="p-8 text-center">
        <p className="text-xl">Loading member data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-500">Error: {error}</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded">
          Back to Members
        </Link>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl">Member not found</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded">
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <img
          src={memberData.avatar_url || defaultAvatar}
          alt={memberData.name}
          className="w-16 h-16 mr-4 rounded-full"
        />
        <h1 className="text-2xl font-bold">{memberData.display_name || memberData.name}</h1>
      </div>
      
      {memberData.description && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-gray-700 dark:text-gray-300">{memberData.description}</p>
        </div>
      )}
      
      {/* Display other member details as needed */}
      {memberData.pronouns && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Pronouns</h2>
          <p className="text-gray-700 dark:text-gray-300">{memberData.pronouns}</p>
        </div>
      )}
      
      {/* Back button */}
      <Link to="/" className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded">
        Back to All Members
      </Link>
    </div>
  );
};

export default MemberDetails;