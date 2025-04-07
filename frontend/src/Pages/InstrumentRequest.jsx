import React, { useEffect, useState } from "react";
import "./InstrumentRequest.css";
import { useNavigate } from "react-router-dom";

const InstrumentRequest = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const [staffIncharge, setStaffIncharge] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [sliderValue, setSliderValue] = useState(0); // State for slider value

  const fetchRequests = async () => {
    try {
      let url = "http://localhost:4000/allbookingrequests";
      if (selectedDate) {
        url += `?date=${selectedDate}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setAllRequests(result.data);
      } else {
        console.error("Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleViewAll = () => {
    setSelectedDate(""); // Clear date filter
    setSelectedBookingId(""); // Clear booking ID search
    setSelectedRequest(null); // Clear selected request
    fetchRequests(); // Fetch all requests
  };

  const handleAction = async (action) => {
    if (!selectedRequest) return;

    if (action === "Reject") {
      const confirmDelete = window.confirm(
        `Are you sure you want to reject booking ID: ${selectedRequest.booking_id}?`
      );

      if (!confirmDelete) return;

      try {
        const response = await fetch(`http://localhost:4000/reject-booking/${selectedRequest.booking_id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          alert("Booking request rejected & slot removed successfully!");
          setAllRequests((prevRequests) =>
            prevRequests.filter((req) => req.booking_id !== selectedRequest.booking_id)
          );
          setSelectedRequest(null);
        } else {
          alert("Failed to reject booking. Please try again.");
        }
      } catch (error) {
        console.error("Error rejecting booking:", error);
        alert("An error occurred while rejecting the booking.");
      }
    } else if (action === "Accept") {
      const confirmAccept = window.confirm(
        `Are you sure you want to accept booking ID: ${selectedRequest.booking_id}?`
      );

      if (!confirmAccept) return;

      try {
        // Step 1: Accept the booking
        const acceptResponse = await fetch(`http://localhost:4000/accept-booking/${selectedRequest.booking_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ discount: selectedRequest.member_id ? sliderValue : 0 }),
        });

        const acceptResult = await acceptResponse.json();

        if (acceptResult.success) {
          alert("Booking request accepted successfully!");

          // Step 2: Create a payment entry
          const paymentData = {
            booking_id: selectedRequest.booking_id,
            member_id: selectedRequest.member_id || null,
            amount: selectedRequest.amount,
            gst: selectedRequest.gst,
            total_amount: calculateTotalAmountIncludingGST(selectedRequest.amount, selectedRequest.gst.sgst + selectedRequest.gst.cgst),
            discount: selectedRequest.member_id ? sliderValue : 0,
            paid_status: "Pending", // Default status
          };

          const paymentResponse = await fetch("http://localhost:4000/process_payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
          });

          const paymentResult = await paymentResponse.json();

          if (paymentResult.success) {
            alert("Payment entry created successfully!");

            // Update the status in the UI
            setSelectedRequest((prevRequest) => ({
              ...prevRequest,
              status: "Accepted",
            }));

            // Refresh the list of requests
            fetchRequests();
          } else {
            alert("Failed to create payment entry. Please try again.");
          }
        } else {
          alert("Failed to accept booking. Please try again.");
        }
      } catch (error) {
        console.error("Error accepting booking:", error);
        alert("An error occurred while accepting the booking.");
      }
    }
  };


  const handleStaffInchargeChange = (e) => {
    setStaffIncharge(e.target.value);
  };

  const handleReportFileChange = (e) => {
    setReportFile(e.target.files[0]);
  };

  const handleViewById = async () => {
    if (!selectedBookingId.trim()) {
      alert("Please enter a Booking ID");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/booking/${selectedBookingId}`);
      const result = await response.json();

      if (result.success && result.booking) {
        setAllRequests([result.booking]);
        setSelectedRequest(result.booking);
        setStatus(result.booking.status); // Set status from the database
        setStaffIncharge(result.booking.staff_incharge); // Set staff incharge from the database
        setReportFile(null); // Reset report file input
      } else {
        setAllRequests([]);
        setSelectedRequest(null);
        alert("No booking found with the given ID.");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      alert("An error occurred while fetching the booking.");
    }
  };

  const handleComplete = async () => {
    if (!selectedRequest) return;

    const confirmComplete = window.confirm(
      `Are you sure you want to mark booking ID: ${selectedRequest.booking_id} as completed?`
    );
    if (!confirmComplete) return;

    const formData = new FormData();
    formData.append("booking_id", selectedRequest.booking_id);
    formData.append("staff_incharge", staffIncharge);
    formData.append("status", "Completed");
    if (reportFile) {
      formData.append("report", reportFile); // Append the report file
    }

    try {
      const response = await fetch(`http://localhost:4000/complete-booking/${selectedRequest.booking_id}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
      // Step 2: Calculate and distribute RIC coins if this is a member booking
      if (selectedRequest.member_id || memberId) {
        const totalAmount = calculateTotalAmountIncludingGST(
          selectedRequest.amount,
          selectedRequest.gst.sgst + selectedRequest.gst.cgst
        );

        // Prepare RIC coin distributions
        const distributions = [];
        
        // Add 5% to the booking member (if exists)
        if (selectedRequest.member_id) {
          const ricCoinForBookingMember = totalAmount * 0.05;
          distributions.push({
            memberId: selectedRequest.member_id,
            ricCoinDelta: ricCoinForBookingMember
          });
        }

        // Add 10% to the entered member ID (if exists and different from booking member)
        if (memberId && memberId !== selectedRequest.member_id) {
          const ricCoinForEnteredMember = totalAmount * 0.10;
          distributions.push({
            memberId: memberId,
            ricCoinDelta: ricCoinForEnteredMember
          });
        }

        // Process all distributions
        for (const distribution of distributions) {
          const ricResponse = await fetch('http://localhost:4000/updateRicCoin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              memberId: distribution.memberId,
              ricCoinDelta: distribution.ricCoinDelta
            })
          });

          const ricResult = await ricResponse.json();
          if (!ricResult.success) {
            console.error(`Failed to update RIC coins for member ${distribution.memberId}`);
          }
        }
      }

        alert("Booking marked as completed successfully!");

        // Update the status and staff incharge in the UI
        setSelectedRequest((prevRequest) => ({
          ...prevRequest,
          status: "Completed",
          staff_incharge: staffIncharge,
          report: result.booking.report, // Update the report URL if uploaded
        }));

        // Refresh the list of requests
        fetchRequests();
      } else {
        alert("Failed to complete booking. Please try again.");
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      alert("An error occurred while completing the booking.");
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
    <div className="instrument-requests">
      <div className="requests-header">
        <img
          src={require("../Components/Assets/back.png")}
          alt="Back"
          className="back-icon"
          onClick={() => navigate("/Addproduct")}
        />
        <h1>Instrument Booking Requests</h1>
        <img
        src={require("../Components/Assets/payment.png")}
        alt="Request Icon"
        className="payment-request-icon"
        onClick={() => navigate("/PaymentRequest")}
        />
        </div>

      <div className="date-filter">
        <label>Select Date: </label>
        <input type="date" value={selectedDate} onChange={handleDateChange} />
        <button className="filter-button" onClick={handleViewAll}>All</button>

        <div className="booking-id-filter">
          <label className="booking-id-label">Enter Booking Id:</label>
          <input
            type="text"
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            placeholder="Enter ID"
          />
          <button className="filter-button" onClick={handleViewById}>View</button>
        </div>
      </div>

      <div className="requests-container">
        <div className="left-half">
          <h2>Booking Requests</h2>
          <div className="request-list">
            {allRequests.length > 0 ? (
              allRequests.map((request, index) => (
                <div
                  key={index}
                  className={`request-item ${selectedRequest?.booking_id === request.booking_id ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedRequest(request);
                    setStatus(request.status); // Set status from the database
                    setStaffIncharge(request.staff_incharge); // Set staff incharge from the database
                    setReportFile(null); // Reset report file input
                    setSliderValue(request.member_id ? 50 : 0);
                  }}
                >
                  <p>
                    {request.member_id && (
                      <span className="golden-icon"></span>
                    )}
                    <strong>ID:</strong> {request.booking_id}
                  </p>
                  <p>
                    <strong>Name:</strong> {request.name}
                  </p>
                  <p>
                    <strong>Date:</strong> {request.date}
                  </p>
                </div>
              ))
            ) : (
              <p>No requests found.</p>
            )}
          </div>
        </div>

        <div className="right-half">
          {selectedRequest ? (
            <div className="request-details">
              <div className="header-with-buttons">
                <h2>Request Details</h2>
                {/* Status Indicator */}
                <div
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    fontSize: "20px",
                    color:
                      selectedRequest.status === "Accepted"
                        ? "green"
                        : selectedRequest.status === "Rejected"
                        ? "red"
                        : selectedRequest.status === "Pending"
                        ? "orange"
                        : selectedRequest.status === "Completed"
                        ? "purple"
                        : "gray", // Default color if status is unknown
                  }}
                >
                  Status: {selectedRequest.status}
                </div>
                <div className="action-container">
                  <div className="action-buttons">
                    <button className="accept-button" onClick={() => handleAction("Accept")}>
                      Accept
                    </button>
                    <button className="decline-button" onClick={() => handleAction("Reject")}>
                      Reject
                    </button>
                  </div>
                  {selectedRequest?.member_id && (
                    <div className="discount-container">
                      <label><strong>Discount Value:</strong></label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={(e) => setSliderValue(e.target.value)}
                        className="discount-input"
                      />
                      <span>%</span>
                    </div>
                  )}
                </div>
              </div>  

              <div className="status-box">
                <div className="form-group">
                  <label><strong>Analysed By:</strong></label>
                  <input type="text" value={staffIncharge} onChange={handleStaffInchargeChange} />
                </div>
                <div className="form-group">
                  <label><strong>Member ID:</strong></label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="Enter Member ID"
                  />
                </div>

                <div className="form-group">
                  <label><strong>Upload Report:</strong></label>
                  <input type="file" onChange={handleReportFileChange} accept=".pdf,.doc,.docx" />
                </div>

                <div><button className="update-button" onClick={handleComplete}>Complete</button></div>
              </div>

              {/* Rest of the details */}
              <div className="details-list">
                {selectedRequest.booking_id && <p><strong>Booking ID:</strong> {selectedRequest.booking_id}</p>}
                {selectedRequest.instrument_id && <p><strong>Instrument ID:</strong> {selectedRequest.instrument_id}</p>}
                {selectedRequest.instrument_name && <p><strong>Instrument Name:</strong> {selectedRequest.instrument_name}</p>}
                {selectedRequest.instrument_type && <p><strong>Instrument Type:</strong> {selectedRequest.instrument_type}</p>}
                {selectedRequest.date && <p><strong>Booking Date:</strong> {selectedRequest.date}</p>}
                {selectedRequest.slots && selectedRequest.slots.length > 0 && (
                  <p><strong>Slots:</strong> {selectedRequest.slots.join(", ")}</p>
                )}
                {selectedRequest.no_of_hours > 0 && (
                  <p><strong>No. of Hours:</strong> {selectedRequest.no_of_hours}</p>
                )}
                {selectedRequest.no_of_samples > 0 && (
                  <p><strong>No. of Samples:</strong> {selectedRequest.no_of_samples}</p>
                )}
                {selectedRequest.element_type && Array.isArray(selectedRequest.element_type) && selectedRequest.element_type.length > 0 && (
                  <div>
                    <strong>Element Type:</strong>
                    {selectedRequest.element_type.map((element, i) => (
                      <p key={i}>{element.elementName} ({element.samples} samples)</p>
                    ))}
                  </div>
                )}
                {selectedRequest.amount && (
                  <>
                    <p><strong>Amount (Excluding GST):</strong> ₹{selectedRequest.amount.toFixed(2)}</p>
                    <p><strong>GST ({selectedRequest.gst.sgst + selectedRequest.gst.cgst}%):</strong> ₹{calculateGST(selectedRequest.amount, selectedRequest.gst.sgst + selectedRequest.gst.cgst).toFixed(2)}</p>
                    <p><strong>Total Amount (Including GST):</strong> ₹{calculateTotalAmountIncludingGST(selectedRequest.amount, selectedRequest.gst.sgst + selectedRequest.gst.cgst).toFixed(2)}</p>
                  </>
                )}
                {selectedRequest.member_id && <p><strong>Member ID:</strong> {selectedRequest.member_id}</p>}
                {selectedRequest.name && <p><strong>Name:</strong> {selectedRequest.name}</p>}
                {selectedRequest.designation && <p><strong>Designation:</strong> {selectedRequest.designation}</p>}
                {selectedRequest.department && <p><strong>Department:</strong> {selectedRequest.department}</p>}
                {selectedRequest.mobile_number && <p><strong>Mobile Number:</strong> {selectedRequest.mobile_number}</p>}
                {selectedRequest.email && <p><strong>Email:</strong> {selectedRequest.email}</p>}
                {selectedRequest.guide_name && <p><strong>Guide Name:</strong> {selectedRequest.guide_name}</p>}
                {selectedRequest.guide_email && <p><strong>Guide Email:</strong> {selectedRequest.guide_email}</p>}
                {selectedRequest.guide_approval_letter && (
                  <div>
                    <p><strong>Guide Approval Letter:</strong></p>
                    <iframe
                      src={selectedRequest.guide_approval_letter}
                      title="Guide Approval Letter"
                      width="100%"
                      height="500px"
                      style={{ border: "1px solid #ccc", borderRadius: "5px" }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>Select a request to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstrumentRequest;