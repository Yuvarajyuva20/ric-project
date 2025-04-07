import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./InstrumentBooking.css"; // Ensure you have styles for the card
import { useNavigate } from "react-router-dom";
const NonMemberBooking = () => {
  const location = useLocation();
  const bookingData = location.state || {}; 
  const ins_id = bookingData.id;
  const [gst, setGst] = useState({ sgst: 0, cgst: 0 });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const totalGST = gst.sgst + gst.cgst;

  // Calculate the base amount excluding GST
  const baseAmount =
    bookingData.finalAmount !== null
      ? bookingData.finalAmount
      : bookingData.finalElementAmount !== null
      ? bookingData.finalElementAmount
      : bookingData.finalCommonAmount !== null
      ? bookingData.finalCommonAmount
      : 0; // Default to 0 if no amount is entered

  // Calculate the inclusive GST amount
  const calculateInclusiveGST = (amount) => {
    return amount ? (amount * totalGST) / (100 + totalGST) : 0;
  };

  // Calculate the final total amount including GST
  const finalTotalAmount = baseAmount;

  // Calculate the base amount excluding GST
  const baseAmountExcludingGST = baseAmount - calculateInclusiveGST(baseAmount);

  useEffect(() => {
    if (ins_id) {
      axios.get(`http://localhost:4000/instrument/${ins_id}`) // Adjust URL if needed
        .then((response) => {
          if (response.data.success) {
            const { sgst, cgst } = response.data.instrument.gst;
            setGst({ sgst, cgst });
          }
        })
        .catch((error) => {
          console.error("Error fetching instrument GST:", error);
        });
    }
  }, [ins_id]); // Fetch when ins_id changes

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    department: "",
    mobile: "",
    email: "",
    guideName: "",
    guideEmail: "",
    numOfSample: bookingData.numOfSample || "", // Pre-fill if available
    numOfHours: bookingData.numOfHour || "",
    approvalLetter: null, // Store file object
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Upload file function
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("instrument_approval", file);

    console.log("Uploading file:", file); // Debugging

    try {
      setUploading(true);
      const response = await axios.post(
        "http://localhost:4000/upload/instrument_approval",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }, // Ensure correct headers
        }
      );

      setUploading(false);
      console.log("Upload Response:", response.data); // Debugging

      if (response.data.success && response.data.file_url) {
        console.log("Uploaded File URL:", response.data.file_url);
        return response.data.file_url; // Ensure this is returned
      } else {
        throw new Error("File upload failed.");
      }
    } catch (error) {
      setUploading(false);
      console.error("File upload error:", error);
      setError("Failed to upload Instrument Approval Letter.");
      return null;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF and image files (PNG, JPG, JPEG) are allowed.");
        e.target.value = ""; // Clear the file input
        return;
      }
      setFormData({ ...formData, approvalLetter: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.approvalLetter) {
      setError("Instrument Approval Letter is required.");
      return;
    }

    setError("");
    const uploadedFileUrl = await uploadFile(formData.approvalLetter);
    if (!uploadedFileUrl) {
      alert("File upload failed. Please try again.");
      return;
    }

    const elementTypes = bookingData.selectedElement
      ? bookingData.selectedElement.map((element) => ({
          elementName: element, // Get element name
          samples: bookingData.elementSamples?.[element] || 0, // Ensure samples exist
        }))
      : [];

    // Prepare the booking data
    const bookingDataToSend = {
      instrument_id: ins_id,
      instrument_name: bookingData.instname,
      slots: bookingData.selectedSlots || [],
      date: bookingData.selectedDate || "",
      no_of_hours: formData.numOfHours || null,
      no_of_samples: formData.numOfSample || 0,
      instrument_type: bookingData.selectedType || "",
      element_type: elementTypes,
      amount: baseAmountExcludingGST,
      gst: {
        sgst: gst.sgst || 0,
        cgst: gst.cgst || 0,
      },
      total_amount: finalTotalAmount || 0,
      name: formData.name,
      designation: formData.designation,
      department: formData.department,
      mobile_number: formData.mobile,
      email: formData.email,
      guide_name: formData.guideName,
      guide_email: formData.guideEmail,
      guide_approval_letter: uploadedFileUrl,
      status: "Pending",
      report: null,
      staff_incharge: "", // Change as required
    };

    try {
      console.log("Booking Data:", bookingDataToSend);
      
      // 🟢 Step 1: Book the instrument first
      const bookingResponse = await axios.post("http://localhost:4000/book_instrument", bookingDataToSend);

      if (bookingResponse.data.success) {
        // ✅ Instrument booked successfully, now book the slots
        const slotBookingPromises = bookingData.selectedSlots.map((slot) =>
          axios.post("http://localhost:4000/book-slot", {
            ins_id,
            date: bookingData.selectedDate,
            slot,
          })
        );

        // 🟢 Step 2: Wait for all slot bookings to complete
        const slotResponses = await Promise.all(slotBookingPromises);

        // ✅ Check if any slot booking failed
        const failedSlot = slotResponses.find((res) => !res.data.success);
        if (failedSlot) {
          setError("Instrument booked, but some slots could not be reserved.");
        } else {
          setSuccess("Instrument and slots booked successfully! ✅");
        }

        // ✅ Reset form after successful booking
        setFormData({
          name: "",
          designation: "",
          department: "",
          mobile: "",
          email: "",
          guideName: "",
          guideEmail: "",
          numOfSample: "",
          numOfHours: "",
          approvalLetter: null,
        });
      } else {
        setError("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error while booking:", error);
      setError("Error while booking the instrument.");
    }
  };

  return (
    <div className="booking-container">
       <img
    src={require("../Components/Assets/back.png")}
    alt="Back"
    className="back-icon"
    onClick={() => navigate("/Nonmemberclub")}
  />
      <div className="booking-card">        
        <div className="booking-content">
          {/* Left Section: Image and Name */}
          <div className="image-section">
            {bookingData.imageurl && <img src={bookingData.imageurl} alt={bookingData.instname} className="inst-img" />}
            <h3 className="inst-name">{bookingData.instname}</h3>
          </div>

          {/* Right Section: Booking Details */}
          <div className="details-section">
            <h3>Booking Summary</h3>
            {bookingData.selectedDate && <p><strong>Date:</strong> {bookingData.selectedDate}</p>}
            {bookingData.selectedSlots?.length > 0 && <p><strong>Slots:</strong> {bookingData.selectedSlots.join(", ")}</p>}
            {/* Conditionally display Number of Samples or Number of Hours */}
            {!bookingData.selectedElement && bookingData.numOfSample !== null && (
              <p><strong>Number of Samples:</strong> {bookingData.numOfSample}</p>
            )}
            {!bookingData.selectedElement && bookingData.numOfHour !== null && (
              <p><strong>Number of Hours:</strong> {bookingData.numOfHour}</p>
            )}
            {bookingData.selectedType && <p><strong>Instrument Type:</strong> {bookingData.selectedType}</p>}
            {bookingData.selectedAmountType && <p><strong>Amount Type:</strong> {bookingData.selectedAmountType}</p>}
            {bookingData.finalAmount !== null && (
              <>
                <p><strong>Amount (Excluding GST):</strong> ₹{baseAmountExcludingGST.toFixed(2)}</p>
                <p><strong>GST ({totalGST}%):</strong> ₹{calculateInclusiveGST(baseAmount).toFixed(2)}</p>
                <p><strong>Total Amount (Including GST):</strong> <span className="amount-highlight"> ₹{finalTotalAmount.toFixed(2)}</span></p>
              </>
            )}
            {/* Hide "Element Type" if Instrument Type OR Common Amount Type is selected */}
            {!bookingData.selectedType &&
              !bookingData.selectedCommonAmountType &&
              bookingData.selectedElement && (
                <p>
                  <strong>Element Type:</strong>{" "}
                  {bookingData.selectedElement
                    .map((element) => `${element} x ${bookingData.elementSamples[element] || 0}`)
                    .join(", ")}
                </p>
              )}
            {!bookingData.selectedType && !bookingData.selectedCommonAmountType && bookingData.selectedElementAmountType && (
              <p><strong>Amount Type:</strong> {bookingData.selectedElementAmountType}</p>
            )}
            {!bookingData.selectedType && !bookingData.selectedCommonAmountType && bookingData.finalElementAmount !== null && (
              <>
                <p><strong>Amount (Excluding GST):</strong> ₹{baseAmountExcludingGST.toFixed(2)}</p>
                <p><strong>GST ({totalGST}%):</strong> ₹{calculateInclusiveGST(baseAmount).toFixed(2)}</p>
                <p><strong>Total Amount (Including GST):</strong> <span className="amount-highlight"> ₹{finalTotalAmount.toFixed(2)}</span></p>
              </>
            )}
            {bookingData.selectedCommonAmountType && (
              <p><strong>Amount Type:</strong> {bookingData.selectedCommonAmountType}</p>
            )}
            {bookingData.finalCommonAmount !== null && (
              <>
                <p><strong>Amount (Excluding GST):</strong> ₹{baseAmountExcludingGST.toFixed(2)}</p>
                <p><strong>GST ({totalGST}%):</strong> ₹{calculateInclusiveGST(baseAmount).toFixed(2)}</p>
                <p><strong>Total Amount (Including GST):</strong> <span className="amount-highlight"> ₹{finalTotalAmount.toFixed(2)}</span></p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <form className="reg-form booking-form" onSubmit={handleSubmit}>
        <h3 className="heading-underline">Instrument Booking Form</h3>

        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Designation:</label>
          <input type="text" name="designation" value={formData.designation} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Department:</label>
          <input type="text" name="department" value={formData.department} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Mobile Number:</label>
          <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Guide Name:</label>
          <input type="text" name="guideName" value={formData.guideName} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Guide Email ID:</label>
          <input type="email" name="guideEmail" value={formData.guideEmail} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Instrument Approval Letter:
          <small className="file-info"> (Only PDF or image)</small></label>
          <input type="file" name="approvalLetter" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg, application/pdf" required />
        </div>
        {uploading && <p>Uploading file, please wait...</p>}
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>} {/* Show success message */}

        <button type="submit" className="register-btn">Submit Booking</button>
      </form>
    </div>
  );
};

export default NonMemberBooking;