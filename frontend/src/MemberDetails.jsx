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
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-base text-black dark:text-white">Loading member data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-base text-red-500 mb-4">{error}</p>
        <Link to="/" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          Back to Members
        </Link>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="p-8 text-center">
        <p className="text-base text-black dark:text-white mb-4">Member not found</p>
        <Link to="/" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 border rounded-lg shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col items-center mb-6">
        <img
          src={memberData.avatar_url || defaultAvatar}
          alt={memberData.name}
          className="w-24 h-24 mb-4 rounded-full shadow-md"
        />
        <h1 className="text-2xl font-bold text-black dark:text-white">{memberData.display_name || memberData.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memberData.description && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">About</h2>
            <p className="text-sm text-black dark:text-white">{memberData.description}</p>
          </div>
        )}
        
        {memberData.pronouns && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">Pronouns</h2>
            <p className="text-sm text-black dark:text-white">{memberData.pronouns}</p>
          </div>
        )}
      </div>
      
      {/* Back button */}
      <div className="mt-8 text-center">
        <Link to="/" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          Back to All Members
        </Link>
      </div>
    </div>
  );
}

export default MemberDetails;