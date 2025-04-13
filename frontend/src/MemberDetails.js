import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';  // Import useParams to access the URL parameter

function MemberDetails() {
  const { id } = useParams();  // Get the member id from the URL
  const [member, setMember] = useState(null);

  useEffect(() => {
    // Make a request to your backend API using the member ID
    fetch(`/api/member/${id}`)  // Backend endpoint adjusted to /api/member/:id
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
    <div className="p-4">
      <h2 className="text-2xl font-semibold">{member.display_name || member.name}</h2>
      <img
        src={member.avatar_url || 'https://clovetwilight3.co.uk/system.png'}  // Fallback to default avatar if none exists
        alt={member.display_name || member.name}
        className="w-32 h-32 rounded-full mt-4"
      />
      <p className="mt-4">{member.bio || 'No bio available.'}</p> {/* You can replace 'bio' with the correct property if it's different */}
      
      {/* Display other member information as needed */}
      <div className="mt-6">
        <h3 className="text-xl">Additional Information:</h3>
        <ul>
          {/* Update with actual fields you'd like to show */}
          <li><strong>System ID:</strong> {member.system_id}</li>
          <li><strong>Joined:</strong> {member.joined_at}</li>
        </ul>
      </div>
    </div>
  );
}

export default MemberDetails;
