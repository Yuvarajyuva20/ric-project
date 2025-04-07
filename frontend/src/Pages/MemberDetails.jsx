import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MemberDetails.css"; // CSS for styling

const MemberDetails = () => {
  const navigate = useNavigate(); // For navigation
  const { memberId } = useParams(); // Get memberId from URL params
  const [member, setMember] = useState(null);
  const [ricCoinDelta, setRicCoinDelta] = useState(0);

  // Fetch member details when component mounts
  const fetchMemberDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:4000/member/${memberId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch member details: ${response.statusText}`);
      }
      const data = await response.json(); // Parse JSON response
      setMember(data); // Save the member details to state
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMemberDetails();
  }, [fetchMemberDetails]);

  const updateRicCoin = async () => {
    if (!ricCoinDelta) {
      alert("Please enter a valid amount to update.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/updateRicCoin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId, ricCoinDelta }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update RIC coins: ${response.statusText}`);
      }
      const data = await response.json(); // Parse JSON response
      alert(data.message); // Show success message
      fetchMemberDetails(); // Refresh member details
      setRicCoinDelta(0); // Reset the input field
    } catch (error) {
      console.error("Error updating RIC coins:", error);
      alert("Failed to update RIC coins. Please try again.");
    }
  };

  const remove_user = async (email) => {
    try {
      const response = await fetch("http://localhost:4000/removeuser", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error(`Failed to remove user: ${response.statusText}`);
      }
      // Alert and navigate back after successful deletion
      alert("User has been removed.");
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  if (!member) {
    return <p>Loading member details...</p>;
  }

  return (
    <div className="xxxx">
             <img
          src={require("../Components/Assets/back.png")}
          alt="Back"
          className="back-icon"
          onClick={() => navigate("/MembershipHome")}
        />
    <div className="member-details">
      <button className="remove-button" onClick={() => remove_user(member.email)}>
        Remove
      </button>
      <h1>Member Details</h1>
      <p>
        <span className="detail-label">Name:</span>{" "}
        <span className="detail-value">{member.name}</span>
      </p>
      <p>
        <span className="detail-label">Email:</span>{" "}
        <span className="detail-value">{member.email}</span>
      </p>
      <p>
        <span className="detail-label">Phone:</span>{" "}
        <span className="detail-value">{member.phone}</span>
      </p>
      <p>
        <span className="detail-label">Designation:</span>{" "}
        <span className="detail-value">{member.designation}</span>
      </p>
      <p>
        <span className="detail-label">Department:</span>{" "}
        <span className="detail-value">{member.department}</span>
      </p>
      <p>
        <span className="detail-label">Institution:</span>{" "}
        <span className="detail-value">{member.institution}</span>
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <p style={{ margin: 0 }}>
          <span className="detail-label">RIC coins:</span>{" "}
          <span className="detail-value">{member.riccoin}</span>
        </p>
        <div className="riccoin-update">
          <input
            type="number"
            value={ricCoinDelta}
            onChange={(e) => setRicCoinDelta(parseInt(e.target.value, 10) || 0)}
            placeholder="Enter amount"
            style={{ marginRight: "5px" }}
          />
          <button onClick={updateRicCoin} style={{ margin: 0 }}>
            Add
          </button>
        </div>
      </div>
      <p>
        <span className="detail-label">Member ID:</span>{" "}
        <span className="detail-value">{member.memberId}</span>
      </p>
      <h3>Guide Approval Letter:</h3>
      <iframe
        src={member.guideApprovalLetter}
        title="Guide Approval Letter"
        width="100%"
        height="500px"
        style={{ border: "1px solid #ccc", borderRadius: "5px" }}
      />
    </div>
    </div>
  );
};

export default MemberDetails;
