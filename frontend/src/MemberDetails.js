import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function MemberDetails() {
  const { id } = useParams();  // Get the member ID from the URL
  const [member, setMember] = useState(null);

  useEffect(() => {
    // Fetch the member info by ID
    fetch(`/api/members/${id}`)
      .then(res => res.json())
      .then(data => {
        setMember(data);
      })
      .catch(err => console.error("Error fetching member data:", err));
  }, [id]);  // Re-run the effect if member ID changes

  if (!member) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">{member.display_name || member.username}</h1>
      <div className="flex items-center mt-4">
        <img
          src={member.avatar_url}
          alt={member.username}
          className="w-20 h-20 rounded-full"
        />
        <div className="ml-4">
          <p>{member.bio}</p>
          {/* Add other member details here */}
        </div>
      </div>
    </div>
  );
}

export default MemberDetails;
