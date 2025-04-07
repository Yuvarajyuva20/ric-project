import React, { useEffect, useState } from "react";
import "./PaymentRequest.css";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const PaymentRequest = () => {
  const [allPayments, setAllPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [paidStatus, setPaidStatus] = useState("Pending");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const navigate = useNavigate();

  const fetchAllPayments = async () => {
    try {
      const response = await fetch("http://localhost:4000/all-payments");
      const result = await response.json();

      if (result.success) {
        setAllPayments(result.data);
      } else {
        console.error("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchPaymentsByDateRange = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      alert("End date must be after start date");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/payments-by-date?startDate=${startDate}&endDate=${endDate}`
      );
      const result = await response.json();

      if (result.success) {
        setAllPayments(result.data);
      } else {
        console.error("Failed to fetch payments by date range");
      }
    } catch (error) {
      console.error("Error fetching payments by date range:", error);
    }
  };

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const handleViewById = async () => {
    if (!selectedBookingId.trim()) {
      alert("Please enter a Booking ID");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/payment/${selectedBookingId}`
      );
      const result = await response.json();

      if (result.success && result.payment) {
        setAllPayments([result.payment]);
        setSelectedPayment(result.payment);
        setPaidStatus(result.payment.paid_status);
        setTransactionId(result.payment.transaction_id || "");
      } else {
        setAllPayments([]);
        setSelectedPayment(null);
        alert("No payment found with the given Booking ID.");
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
      alert("An error occurred while fetching the payment.");
    }
  };

  const handleViewAll = () => {
    setSelectedBookingId("");
    setSelectedPayment(null);
    setStartDate("");
    setEndDate("");
    fetchAllPayments();
  };

  const handleUpdateStatus = async () => {
    if (!selectedPayment) return;

    if (paidStatus === "Paid" && !transactionId.trim()) {
      alert("Please enter Transaction ID for paid payments");
      return;
    }

    const confirmUpdate = window.confirm(
      `Are you sure you want to update payment status for Booking ID: ${selectedPayment.booking_id}?`
    );

    if (!confirmUpdate) return;

    try {
      const response = await fetch(
        `http://localhost:4000/payment/${selectedPayment.booking_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paid_status: paidStatus,
            final_amount: selectedPayment.final_price,
            transaction_id: paidStatus === "Paid" ? transactionId : null,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Payment status updated successfully!");
        setSelectedPayment(result.payment);
        fetchAllPayments();
      } else {
        alert("Failed to update payment status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("An error occurred while updating the payment.");
    }
  };

  const exportToExcel = () => {
    // Filter only paid payments
    const paidPayments = allPayments.filter(payment => payment.paid_status === "Paid");
    
    if (paidPayments.length === 0) {
      alert("No paid payment data to export");
      return;
    }

    // Format data for Excel
    const formattedData = paidPayments.map((payment) => ({
      "Booking ID": payment.booking_id,
      "Member ID": payment.member_id || "N/A",
      "Base Amount": payment.amount.toFixed(2),
      "CGST (%)": payment.gst.cgst,
      "SGST (%)": payment.gst.sgst,
      "Total GST": (payment.gst.cgst + payment.gst.sgst).toFixed(2),
      "Total Amount": payment.total_amount.toFixed(2),
      "Discount (%)": payment.discount_percentage || 0,
      "Discount Amount": (
        payment.total_amount - payment.final_price
      ).toFixed(2),
      "Final Amount": payment.final_price.toFixed(2),
      "Transaction ID": payment.transaction_id || "N/A",
      "Created At": new Date(payment.createdAt).toLocaleString(),
      "Last Updated": payment.updatedAt
        ? new Date(payment.updatedAt).toLocaleString()
        : "N/A",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paid Payments");

    // Generate Excel file
    const fileName = `paid_payments_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="payment-requests">
      <div className="requests-header">
        <img
          src={require("../Components/Assets/back.png")}
          alt="Back"
          className="back-icon"
          onClick={() => navigate("/InstrumentRequest")}
        />
        <h1>Payment Requests</h1>
      </div>

      <div className="date-filter">
       
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="filter-button" onClick={fetchPaymentsByDateRange}>
            Filter
          </button>
          <button className="export-button" onClick={exportToExcel}>
            Export Paid Payments
          </button>


        <div className="booking-id-filter">
          <label className="booking-id-label">Enter Booking Id:</label>
          <input
            type="text"
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            placeholder="Enter Booking ID"
          />
          <button className="filter-button" onClick={handleViewById}>
            View
          </button>
          <button className="filter-button" onClick={handleViewAll}>
            All
          </button>
        </div>
      </div>

      <div className="requests-container">
        <div className="left-half">
          <h2>Payment Requests</h2>
          <div className="request-list">
            {allPayments.length > 0 ? (
              allPayments.map((payment, index) => (
                <div
                  key={index}
                  className={`request-item ${
                    selectedPayment?.booking_id === payment.booking_id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedPayment(payment);
                    setPaidStatus(payment.paid_status);
                    setTransactionId(payment.transaction_id || "");
                  }}
                >
                  <p>
                    {payment.member_id && <span className="golden-icon"></span>}
                    <strong>Booking ID:</strong> {payment.booking_id}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color:
                          payment.paid_status === "Paid"
                            ? "green"
                            : payment.paid_status === "Failed"
                            ? "red"
                            : "orange",
                      }}
                    >
                      {payment.paid_status}
                    </span>
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{payment.final_price.toFixed(2)}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No payment requests found.</p>
            )}
          </div>
        </div>

        <div className="right-half">
          {selectedPayment ? (
            <div className="request-details">
              <div className="header-with-buttons">
                <h2>Payment Details</h2>
                <div
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    fontSize: "20px",
                    color:
                      selectedPayment.paid_status === "Paid"
                        ? "green"
                        : selectedPayment.paid_status === "Failed"
                        ? "red"
                        : "orange",
                  }}
                >
                  Status: {selectedPayment.paid_status}
                </div>
              </div>

              <div className="status-box">
                <div className="form-group">
                  <label>
                    <strong>Update Payment Status:</strong>
                  </label>
                  <select
                    value={paidStatus}
                    onChange={(e) => setPaidStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                {paidStatus === "Paid" && (
                  <div className="form-group">
                    <label>
                      <strong>Transaction ID:</strong>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                    />
                  </div>
                )}

                <div>
                  <button
                    className="update-button"
                    onClick={handleUpdateStatus}
                  >
                    Update Status
                  </button>
                </div>
              </div>

              <div className="details-list">
                <p>
                  <strong>Booking ID:</strong> {selectedPayment.booking_id}
                </p>
                {selectedPayment.member_id && (
                  <p>
                    <strong>Member ID:</strong> {selectedPayment.member_id}
                  </p>
                )}
                {selectedPayment.transaction_id && (
                  <p>
                    <strong>Transaction ID:</strong> {selectedPayment.transaction_id}
                  </p>
                )}
                <p>
                  <strong>Base Amount:</strong> ₹
                  {selectedPayment.amount.toFixed(2)}
                </p>
                <p>
                  <strong>GST (CGST {selectedPayment.gst.cgst}% + SGST{" "}
                  {selectedPayment.gst.sgst}%):</strong> ₹
                  {(selectedPayment.gst.cgst + selectedPayment.gst.sgst).toFixed(2)}
                </p>
                <p>
                  <strong>Total Amount (Including GST):</strong> ₹
                  {selectedPayment.total_amount.toFixed(2)}
                </p>
                {selectedPayment.discount_percentage > 0 && (
                  <>
                    <p>
                      <strong>Discount Percentage:</strong>{" "}
                      {selectedPayment.discount_percentage}%
                    </p>
                    <p>
                      <strong>Discount Amount:</strong> ₹
                      {(
                        selectedPayment.total_amount -
                        selectedPayment.final_price
                      ).toFixed(2)}
                    </p>
                  </>
                )}
                <p>
                  <strong>Final Payable Amount:</strong> ₹
                  {selectedPayment.final_price.toFixed(2)}
                </p>
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        selectedPayment.paid_status === "Paid"
                          ? "green"
                          : selectedPayment.paid_status === "Failed"
                          ? "red"
                          : "orange",
                    }}
                  >
                    {selectedPayment.paid_status}
                  </span>
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(selectedPayment.createdAt).toLocaleString()}
                </p>
                {selectedPayment.updatedAt && (
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(selectedPayment.updatedAt).toLocaleString()}
                  </p>
                )}
                
                {selectedPayment.payment_proof && (
  <div className="payment-proof-section">
    <strong>Payment Proof:</strong>
    <div className="proof-container">
      {selectedPayment.payment_proof.endsWith('.pdf') ? (
        <iframe
          src={selectedPayment.payment_proof}
          title="Payment Proof"
          width="100%"
          height="400px"
          style={{ border: "1px solid #ccc", borderRadius: "5px", marginTop: "10px" }}
        />
      ) : (
        <img 
          src={selectedPayment.payment_proof} 
          alt="Payment Proof" 
          className="proof-image"
          onClick={() => window.open(selectedPayment.payment_proof, '_blank')}
        />
      )}
    </div>
    <div className="proof-actions">
      <button 
        onClick={() => {
          const link = document.createElement('a');
          link.href = selectedPayment.payment_proof;
          link.download = `payment-proof-${selectedPayment.booking_id}${selectedPayment.payment_proof.endsWith('.pdf') ? '.pdf' : '.jpg'}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        className="download-button"
      >
        Download Proof
      </button>
    </div>
  </div>
)}
 </div>
            </div>
          ) : (
            <p>Select a payment to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRequest;