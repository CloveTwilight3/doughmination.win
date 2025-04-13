import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MemberDetails = () => {
  const { member_username } = useParams();  // Get username from the URL
  const [memberData, setMemberData] = useState(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        // Fetch data from your backend based on username
        const response = await fetch(`/api/members/${member_username}`);
        const data = await response.json();
        setMemberData(data);
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
    };

    fetchMemberData();
  }, [member_username]);  // Re-fetch if the username changes

  if (!memberData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{memberData.name}</h1>
      <p>{memberData.description}</p>  {/* Display member info */}
      {/* Render other member info here */}
    </div>
  );
};

export default MemberDetails;
