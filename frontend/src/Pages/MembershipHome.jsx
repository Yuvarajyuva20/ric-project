import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API calls
import "./MembershipHome.css"; // CSS for styling

const MembershipHome = () => {
  const [members, setMembers] = useState([]); // State to store the members
  const navigate = useNavigate();

  // Fetch approved members from the API
  useEffect(() => {
    const fetchApprovedMembers = async () => {
      try {
        const response = await axios.get("http://localhost:4000/allmember");
        setMembers(response.data); // Save the approved members to state
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchApprovedMembers();
  }, []);

  const handleViewDetails = (memberId) => {
    navigate(`/MemberDetails/${memberId}`); // Navigate to MemberDetails page with the memberId
  };

  return (
    <div className="membership-home">
       <img
          src={require("../Components/Assets/back.png")}
          alt="Back"
          className="back-icon"
          onClick={() => navigate("/membership-manager")}
        />
      <h1 className="page-title">Membership List</h1>
      <img
        src={require("../Components/Assets/request.jpg")}
        alt="Request Icon"
        className="request-icon"
        onClick={() => navigate("/Request")} // Navigation to Request page
      />
      <div className="main-content">
        {/* Display approved members */}
        {members.length > 0 ? (
          <ul className="member-list">
            {members.map((member) => (
              <li key={member._id} className="member-item">
                <span>{member.name}</span> {/* Display member name */}
                <button
                  className="view-button"
                  onClick={() => handleViewDetails(member.memberId)}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No approved members found.</p>
        )}
      </div>
    </div>
  );
};

export default MembershipHome;
