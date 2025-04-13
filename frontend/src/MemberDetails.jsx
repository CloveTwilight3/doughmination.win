import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';  // Import useParams to access the URL parameter

function MemberDetails() {
  const { id } = useParams();  // Get the member id from the URL
  const [member, setMember] = useState(null);

  useEffect(() => {
    fetch(`/api/members/${id}`)  // Assuming your backend has an endpoint like /api/members/:id
      .then((res) => res.json())
      .then((data) => {
        setMember(data);
      })
      .catch((err) => {
        console.error('Error fetching member data:', err);
      });
  }, [id]);  // Effect will run again when the id changes

  if (!member) return <div>Loading...</div>;  // Show loading until data is fetched

  return (
    <div>
      <h2>{member.display_name || member.name}</h2>
      <img
        src={member.avatar_url || 'defaultAvatarURL'}
        alt={member.name}
        className="w-10 h-10 rounded-full"
      />
      <p>{member.bio}</p> {/* Replace with actual data you want to show */}
    </div>
  );
}

export default MemberDetails;
