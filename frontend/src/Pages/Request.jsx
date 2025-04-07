import React, { useEffect, useState } from "react";
import "./Request.css";
import { useNavigate } from "react-router-dom";

const Request = () => {
  const [allRequestUsers, setAllRequestUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const fetchInfo = async () => {
    try {
      const response = await fetch("http://localhost:4000/allrequestuser");
      const data = await response.json();
      setAllRequestUsers(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_user = async (email)=>{
    await fetch('http://localhost:4000/removeuser',{
      method:'POST',
      headers:{
        Accept:'application/json',
        'Content-Type':'application/json',
      },
      body:JSON.stringify({email:email})
    })
    await fetchInfo();
  }

const handleAccept = async () => {
    if (!selectedUser) return;
  
    try {
      const response = await fetch("http://localhost:4000/acceptuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: selectedUser.email }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        alert(`User ${selectedUser.name} accepted successfully with memberId: ${result.memberId}`);
  
        // Trigger the email sending function after accepting the user
        sendEmailNotification(selectedUser.email, result.memberId);
  
      } else {
        alert("Failed to accept the user.");
      }
    } catch (error) {
      console.error("Error accepting user:", error);
      alert("Error accepting the user.");
    }
  };
  
  // Email sending function using Nodemailer
  const sendEmailNotification = async (email, memberId) => {
    try {
      const response = await fetch("http://localhost:4000/sendemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, memberId }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        alert(`Confirmation email sent to ${email}`);
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email.");
    }
  };
  

  return (
    <div className="requests">
      <div className="requests-header">
        <img
          src={require("../Components/Assets/back.png")}
          alt="Back"
          className="back-icon"
          onClick={() => navigate("/MembershipHome")}
        />
        <h1>Membership Requests</h1>
      </div>
      <div className="requests-container">
        <div className="left-half">
          <h2>Request List</h2>
          <div className="request-list">
            {allRequestUsers.map((user, index) => (
              <div key={index} className="request-item">
                <p>{user.name}</p>
                <button className="view-btn" onClick={() => setSelectedUser(user)}>View</button>
              </div>
            ))}
          </div>
        </div>

        <div className="right-half">
          {selectedUser ? (
            <div className="user-details">
              <div className="header-with-buttons">
                <h2>User Details</h2>
                <div className="action-buttons">
                  <button className="accept-button" onClick={handleAccept}>
                    Accept
                  </button>
                  <button className="decline-button" onClick={()=>{remove_user(selectedUser.email)}}>
                    Decline
                  </button>
                </div>
              </div>
              <div className="details-list">
                <p><strong>Initials:</strong> {selectedUser.initials}</p>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                <p><strong>Designation:</strong> {selectedUser.designation}</p>
                <p><strong>Department:</strong> {selectedUser.department}</p>
                <p><strong>Institution:</strong> {selectedUser.institution}</p>
                <h3>Guide Approval Letter</h3>
                <iframe
                  src={selectedUser.guideApprovalLetter}
                  title="Guide Approval Letter"
                  width="100%"
                  height="500px"
                  style={{ border: "1px solid #ccc", borderRadius: "5px" }}
                />
              </div>
            </div>
          ) : (
            <p>Select a user to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Request;
