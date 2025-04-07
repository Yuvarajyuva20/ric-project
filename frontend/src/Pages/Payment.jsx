import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
  const [bookingId, setBookingId] = useState("");
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [riccoin, setRiccoin] = useState(null);
  const [memberIdFromBooking, setMemberIdFromBooking] = useState(null);
  const [discountFromBooking, setDiscountFromBooking] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (memberIdFromBooking) {
      const fetchCoins = async () => {
        try {
          const response = await axios.get(`http://localhost:4000/member/${memberIdFromBooking}`);
          setRiccoin(response.data?.riccoin || 0);
        } catch (error) {
          console.error("Error fetching RIC coins:", error);
          setRiccoin(0);
        }
      };
      fetchCoins();
    } else {
      setRiccoin(null);
    }
  }, [memberIdFromBooking]);

  const checkPaymentStatus = async () => {
    setError("");
    setPaymentDetails(null);
    setMemberIdFromBooking(null);
  
    if (!bookingId.trim()) {
      setError("Please enter a valid Booking ID.");
      return;
    }
  
    try {
      const bookingResponse = await axios.get(`http://localhost:4000/booking/${bookingId}`);
      if (!bookingResponse.data.success) {
        setError("No booking found with this ID.");
        return;
      }
      const booking = bookingResponse.data.booking;

      const paymentResponse = await axios.get(`http://localhost:4000/payment/${bookingId}`);
      if (!paymentResponse.data.success) {
        setError("No payment found with this Booking ID.");
        return;
      }
      
      if (booking.discount) {
        setDiscountFromBooking(booking.discount);
      }
  
      const payment = paymentResponse.data.payment;
      if (payment.paid_status.toLowerCase() !== "pending") {
        setError("Payment is only available for Pending payments.");
        return;
      }
  
      if (payment.member_id) {
        setMemberIdFromBooking(payment.member_id);
      }
  
      const sgstAmount = (payment.amount * payment.gst.sgst) / 100;
      const cgstAmount = (payment.amount * payment.gst.cgst) / 100;
      const totalAmount = payment.amount + sgstAmount + cgstAmount;
  
      setPaymentDetails({
        amount: payment.amount.toFixed(2),
        gst: {
          sgst: sgstAmount.toFixed(2),
          cgst: cgstAmount.toFixed(2),
          sgstPercentage: payment.gst.sgst,
          cgstPercentage: payment.gst.cgst,
        },
        total_amount: totalAmount.toFixed(2),
        user_discount_percentage: payment.discount_percentage || 0,
        riccoin_deduction: payment.riccoin_deduction || 0,
        discount_amount: payment.discount_amount ? payment.discount_amount.toFixed(2) : "0.00",
        final_price: payment.final_price ? payment.final_price.toFixed(2) : totalAmount.toFixed(2),
        paid_status: payment.paid_status,
        max_discount: booking.discount || 0,
        has_existing_discount: payment.discount_percentage > 0
      });
    } catch (error) {
      console.error("Error checking payment status:", error);
      setError("Check your status. Payment is available for Accepted Bookings.");
    }
  };
  
  const handleDiscountChange = (e) => {
    if (paymentDetails?.has_existing_discount) return;
  
    const enteredPercentage = parseFloat(e.target.value) || 0;
    const totalAmount = parseFloat(paymentDetails.total_amount);
    const maxPercentage = paymentDetails.max_discount > 0 ? paymentDetails.max_discount : 100;
    const percentageToUse = Math.min(enteredPercentage, maxPercentage);
    
    // Calculate RIC coin deduction (1 RIC coin = ₹1)
    const riccoinDeduction = Math.min(
      (riccoin * percentageToUse) / 100,
      totalAmount
    );
    
    // The discount amount equals the RIC coins deduction
    const discountAmount = riccoinDeduction;
    
    const finalPrice = Math.max(0, totalAmount - discountAmount);
  
    setPaymentDetails(prev => ({
      ...prev,
      user_discount_percentage: percentageToUse,
      riccoin_deduction: riccoinDeduction,
      discount_amount: discountAmount.toFixed(2),
      final_price: finalPrice.toFixed(2)
    }));
  };
  const handlePayment = async () => {
    if (!paymentDetails || !bookingId) {
      alert("Invalid payment details.");
      return;
    }
  
    setIsProcessingPayment(true);
  
    try {
      // Update payment record with all details except payment_proof
      // (since it's already uploaded separately)
      await axios.put(`http://localhost:4000/payment/${bookingId}`, {
        discount_percentage: paymentDetails.user_discount_percentage,
        discount_amount: paymentDetails.discount_amount,
        riccoin_deduction: paymentDetails.riccoin_deduction,
        paid_status: "Pending",
        final_amount: paymentDetails.final_price
      });
  
      // Open payment gateway
      const paymentWindow = window.open("https://pmny.in/PAYUMN/Mre6E4oVIy79", "_blank");
      
      if (!paymentWindow) {
        alert("Please allow popups for this site to proceed with payment.");
        setIsProcessingPayment(false);
      }
      
    } catch (error) {
      console.error("Payment processing failed:", error);
      alert("Failed to process payment. Please try again.");
      setIsProcessingPayment(false);
    }
  };


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('Uploading...');
    
    try {
      const formData = new FormData();
      formData.append('payment_proof', file);

      const response = await axios.post(
        'http://localhost:4000/upload/payment_proof',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setPaymentProof(response.data.report_url);
        setUploadStatus('Upload successful!');
        
        // Update payment record with the proof URL
        await axios.put(`http://localhost:4000/payment/${bookingId}`, {
          payment_proof: response.data.report_url
        });
      } else {
        setUploadStatus('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Upload failed');
    }
  };


  return (
    <div className="payment-page-container">
    <img
      src={require("../Components/Assets/back.png")}
      alt="Back"
      className="back-icon"
      onClick={() => navigate("/")}
    />
    <h2 className="payment-page-title">Proceed to Payment</h2>

    <div className="booking-id-container">
      <label htmlFor="booking-id" className="payment-page-label">Enter Booking ID</label>
      <div className="payment-page-input-section">
        <div className="payment-page-input-group">
          <input
            type="text"
            id="booking-id"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="payment-page-input"
          />
        </div>
        <button className="payment-page-button" onClick={checkPaymentStatus}>
          Check Status
        </button>
      </div>
      {error && <p className="payment-page-error-message">{error}</p>}
    </div>

    {paymentDetails && (
      <>
        <div className="payment-proof-upload">
          <h3>Upload Payment Proof</h3>
          <div className="file-upload-container">
            <label htmlFor="payment-proof" className="file-upload-label">
              Choose Payment Proof (Screenshot/Receipt)
            </label>
            <input
              type="file"
              id="payment-proof"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              disabled={isProcessingPayment}
              className="file-upload-input"
            />
            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
            {paymentProof && (
              <div className="proof-preview">
                <p>Proof uploaded: 
                  <a href={paymentProof} target="_blank" rel="noopener noreferrer">
                    View Proof
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
           
        <div className="payment-details-container">
          {memberIdFromBooking && riccoin > 0 && (
            <div className="coins-display">
              <img
                src={require("../Components/Assets/RIC.png")}
                alt="Coins Icon"
                className="coin-icon"
              />
              <span className="coin-count">{riccoin}</span>
            </div>
          )}


          <h3>Payment Details</h3>
          <div className="payment-page-details-row">
            <strong>Base Amount:</strong> <span>₹{paymentDetails.amount}</span>
          </div>
          <div className="payment-page-details-row">
            <strong>GST Breakdown:</strong>
          </div>
          <div className="payment-page-details-row">
            <span>SGST ({paymentDetails.gst.sgstPercentage}%):</span>
            <span>₹{paymentDetails.gst.sgst}</span>
          </div>
          <div className="payment-page-details-row">
            <span>CGST ({paymentDetails.gst.cgstPercentage}%):</span>
            <span>₹{paymentDetails.gst.cgst}</span>
          </div>
          <div className="payment-page-details-row total-amount">
            <strong>Total Amount:</strong> <span>₹{paymentDetails.total_amount}</span>
          </div>
          
          {memberIdFromBooking && riccoin > 0 && (
            <>
              <div className="payment-page-details-row">
                <label htmlFor="discount-input">
                  Use Percentage of RIC Coins{discountFromBooking > 0 && ` (Max: ${discountFromBooking}%)`}:
                </label>
               <input
                type="number"
                id="discount-input"
                value={paymentDetails.user_discount_percentage}
                onChange={handleDiscountChange}
                className="payment-page-input"
                min="0"
                max={discountFromBooking > 0 ? discountFromBooking : 100}
                disabled={paymentDetails.has_existing_discount || isProcessingPayment}
              />
                <span>%</span>
              </div>
              
              {/* Always show these values */}
              <div className="payment-page-details-row">
                <strong>RIC Coins Deduction:</strong>
                <span>{paymentDetails.riccoin_deduction.toFixed(2)} coins</span>
              </div>
              <div className="payment-page-details-row discount-amount">
                <strong>Discount Applied:</strong>
                <span>- ₹{paymentDetails.discount_amount}</span>
              </div>
              
              {paymentDetails.has_existing_discount && (
                <p className="payment-page-note">
                  Discount percentage has already been set and cannot be modified.
                </p>
              )}
            </>
          )}
          
          <div className="payment-page-details-row final-price">
            <strong>Final Amount to Pay:</strong>
            <span>₹{paymentDetails.final_price}</span>
          </div>

          <button 
          className="payment-page-button pay-now-button"
          onClick={handlePayment}
          disabled={isProcessingPayment}
        >
            {isProcessingPayment ? "Processing..." : "Pay Now"}
          </button>
        </div>
        </>
      )}
    </div>
  );
};

export default Payment;