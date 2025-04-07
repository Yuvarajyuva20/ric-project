import { useState } from "react";
import axios from "axios";
import "./Status.css"; // Import the CSS file
import { useNavigate } from "react-router-dom";
const Status = () => {
  const [bookingId, setBookingId] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState("");
  const [showStatus, setShowStatus] = useState(false); // Control when status is displayed
  const navigate = useNavigate();
  const fetchBookingStatus = async () => {
    setError("");
    setBookingDetails(null);
    setShowStatus(false); // Hide status before fetching

    if (!bookingId.trim()) {
      setError("Please enter a valid Booking ID.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:4000/booking/${bookingId}`);

      if (response.data.success) {
        setBookingDetails(response.data.booking);
        setShowStatus(true); // Show status only after fetching
      } else {
        setError("No booking found with this ID.");
      }
    } catch (error) {
      console.error("Error fetching booking status:", error);
      setError("Failed to fetch booking status. Please try again.");
    }
  };

  // Calculate GST amount
  const calculateGST = (amount, totalGST) => {
    return amount ? (amount * totalGST) / 100 : 0;
  };

  // Calculate total amount including GST
  const calculateTotalAmountIncludingGST = (amount, totalGST) => {
    return amount + calculateGST(amount, totalGST);
  };
  return (
 
    <div className="page-container">
      
    <img
    src={require("../Components/Assets/back.png")}
    alt="Back"
    className="back-icon"
    onClick={() => navigate("/")}
  />
      
      <h2 className="page-title">Check Booking Status</h2>
     

      {/* Two-Column Container */}
      <div className="status-main-container">
        {/* Left: Enter Booking ID */}
        <div className="status-container">
          <div className="input-section">
            <div className="input-group">
              <label htmlFor="booking-id">Enter Booking ID :</label>
              <input
                type="text"
                id="booking-id"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
              />
            </div>
            <button className="status-btn" onClick={fetchBookingStatus}>Check Status</button>
          </div>

          {showStatus && bookingDetails && (
            <p className={`status-display status-${bookingDetails.status?.toLowerCase()}`}>
              Status: {bookingDetails.status}
            </p>
          )}

          {error && <p className="error-message">{error}</p>}
        </div>

        {/* Right: View Results */}
        {showStatus && bookingDetails && (
          <div className="view-results-container">
            <label className="view-results-label">View Results:</label>

            {/* Staff Incharge */}
            {bookingDetails.staff_incharge && (
              <p className="staff-name">
                <strong>Analysed By:</strong> {bookingDetails.staff_incharge}
              </p>
            )}

            {/* Report Download */}
            {bookingDetails.report && (
              <div className="report-download">
                <strong>Report:</strong>{" "}
                <a
                  href={bookingDetails.report}
                  download={`report_${bookingDetails.booking_id}.pdf`}
                  className="download-link"
                >
                  Download Report
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Details - This will always be below */}
      {bookingDetails && (
        <div className="booking-details-wrapper">
          <div className="booking-details">
            <h3>Booking Details</h3>
            <p><strong>Booking ID:</strong> {bookingDetails.booking_id}</p>
            <p><strong>Instrument Name:</strong> {bookingDetails.instrument_name}</p>
            {bookingDetails.instrument_type && (
              <p><strong>Instrument Type:</strong> {bookingDetails.instrument_type}</p>
            )}
            <p><strong>Date:</strong> {bookingDetails.date}</p>
            {bookingDetails.slots && bookingDetails.slots.length > 0 && (
              <p><strong>Slots:</strong> {bookingDetails.slots.join(", ")}</p>
            )}
            {bookingDetails.no_of_hours > 0 && (
              <p><strong>No. of Hours:</strong> {bookingDetails.no_of_hours}</p>
            )}
            {bookingDetails.no_of_samples > 0 && (
              <p><strong>No. of Samples:</strong> {bookingDetails.no_of_samples}</p>
            )}
            {bookingDetails.element_type && Array.isArray(bookingDetails.element_type) && bookingDetails.element_type.length > 0 && (
              <div>
                <p><strong>Element Type:</strong></p>
                {bookingDetails.element_type.map((element, i) => (
                  <p key={i}>{element.elementName} ({element.samples} samples)</p>
                ))}
              </div>
            )}
            {bookingDetails.amount && (
               <>
               <p><strong>Amount (Excluding GST):</strong> ₹{bookingDetails.amount.toFixed(2)}</p>
               <p><strong>GST ({bookingDetails.gst.sgst + bookingDetails.gst.cgst}%):</strong> ₹{calculateGST(bookingDetails.amount, bookingDetails.gst.sgst + bookingDetails.gst.cgst).toFixed(2)}</p>
               <p><strong>Total Amount (Including GST):</strong> ₹{calculateTotalAmountIncludingGST(bookingDetails.amount, bookingDetails.gst.sgst + bookingDetails.gst.cgst).toFixed(2)}</p>
             </>
            )}

            {/* Member Details */}
            {bookingDetails.member_id && <p><strong>Member ID:</strong> {bookingDetails.member_id}</p>}
            {bookingDetails.name && <p><strong>Name:</strong> {bookingDetails.name}</p>}
            {bookingDetails.designation && <p><strong>Designation:</strong> {bookingDetails.designation}</p>}
            {bookingDetails.department && <p><strong>Department:</strong> {bookingDetails.department}</p>}
            {bookingDetails.mobile_number && <p><strong>Mobile Number:</strong> {bookingDetails.mobile_number}</p>}
            {bookingDetails.email && <p><strong>Email:</strong> {bookingDetails.email}</p>}

            {/* Guide Details */}
            {bookingDetails.guide_name && <p><strong>Guide Name:</strong> {bookingDetails.guide_name}</p>}
            {bookingDetails.guide_email && <p><strong>Guide Email:</strong> {bookingDetails.guide_email}</p>}
            
            {bookingDetails.guide_approval_letter && (
              <div>
                <p><strong>Guide Approval Letter:</strong></p>
                <iframe
                  src={bookingDetails.guide_approval_letter}
                  title="Guide Approval Letter"
                  width="100%"
                  height="400px"
                  style={{ border: "1px solid #ccc", borderRadius: "5px" }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Status;