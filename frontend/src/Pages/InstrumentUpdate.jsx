import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./InstrumentUpdate.css";
import { useNavigate } from "react-router-dom";

const InstrumentUpdate = () => {
  const { id } = useParams();
  const [instrumentName, setInstrumentName] = useState("");
  const [instrumentTypes, setInstrumentTypes] = useState([]);
  const [elements, setElements] = useState([]);
  const [commonAmountTypes, setCommonAmountTypes] = useState([]);
  const [defaultSlots, setDefaultSlots] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [SDate, setSDate] = useState("");
  const [gst, setGst] = useState({ sgst: 0, cgst: 0 });
  const [features, setFeatures] = useState("");
  const [instImage, setInstImage] = useState(null); // Image file
  const [previewImage, setPreviewImage] = useState(""); // Preview URL
  const [successMessage, setSuccessMessage] = useState("");
  const [uncheckedSlots, setUncheckedSlots] = useState([]); // Holds booked slots
  const [generalAvailability, setGeneralAvailability] = useState(false);
  const [hourBasis, setHourBasis] = useState(false);
  const navigate = useNavigate();

  // Fetch instrument details
  useEffect(() => {
    const fetchInstrumentData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/instrument/${id}`);
        if (response.data.success) {
          setInstrumentName(response.data.instrument.instrumentName || "");
          setInstrumentTypes(response.data.instrument.instrumentTypes || []);
          setElements(response.data.instrument.elements || []);
          setCommonAmountTypes(response.data.instrument.d_amountTypes || []);
          setDefaultSlots(response.data.instrument.defaultSlots || []); // Setting default slot
          setSlots(response.data.instrument.defaultSlots.map(slot => ({ slot, isAvailable: true })));   
          setGst(response.data.instrument.gst || { sgst: 0, cgst: 0 });
          setFeatures(response.data.instrument.features || "");
          setPreviewImage(response.data.instrument.inst_image || ""); 
          setGeneralAvailability(response.data.instrument.generalAvailability || false);
          setHourBasis(response.data.instrument.hour_basis || false);
        } else {
          setError(response.data.message || "Failed to fetch instrument data.");
        }
      } catch (error) {
        console.error("Error fetching instrument data:", error);
        setError("Failed to fetch instrument data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstrumentData();
  }, [id]);

  // Fetch booked slots when user selects a date
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!SDate) return; 
    
      try {
        const response = await axios.get(
          `http://localhost:4000/booked-slots?instrumentId=${id}&date=${SDate}`
        );
    
        if (response.data.success) {
          const bookedSlots = response.data.bookedSlots || [];
    
          // Ensure each slot maintains the expected structure
          const updatedSlots = defaultSlots.map((slot) => ({
            slot, 
            isAvailable: !bookedSlots.some((booked) => booked.slot === slot), 
          }));
    
          setSlots(updatedSlots);
        } else {
          setError(response.data.message || "Failed to fetch booked slots.");
        }
      } catch (error) {
        console.error("Error fetching booked slots:", error);
        setError("Failed to fetch booked slots. Please try again.");
      }
    };    

    fetchBookedSlots();
  }, [SDate, id, defaultSlots]);  // Only fetch booked slots when SDate or id changes
  
  const updateInstrumentName = async () => {
    try {

      let uploadedImageUrl = previewImage; // Retain existing image if no new file is chosen

      if (instImage) {
        const fileData = new FormData();
        fileData.append("inst_image", instImage);
  
        const uploadResponse = await axios.post("http://localhost:4000/upload/images", fileData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        if (uploadResponse.data.success) {
          uploadedImageUrl = uploadResponse.data.image_url; // Store uploaded image URL
        } else {
          throw new Error("Image upload failed.");
        }
      }
      const response = await axios.put(`http://localhost:4000/updateinstrument/${id}`, {
        instrumentName,
        instrumentTypes,
        elements,
        d_amountTypes: commonAmountTypes,
        defaultSlots,
        gst,
        features,
        inst_image: uploadedImageUrl, 
        bookedSlots: uncheckedSlots,
        generalAvailability,
        hour_basis: hourBasis,
      });
  
      if (response.data.success) {
        setSuccessMessage("Instrument name updated successfully!");
      } else {
        setError("Failed to update instrument name.");
      }
    } catch (error) {
      console.error("Error updating instrument name:", error);
      setError("An error occurred while updating instrument name.");
    }
  };

  if (loading) return <p>Loading instrument details...</p>;
  if (error) return <p className="instrument-update-error">{error}</p>;
  return (
    <div className="instrument-update-container">
      <img
    src={require("../Components/Assets/back.png")}
    alt="Back"
    className="back-icon"
    onClick={() => navigate("/Allinstruments")}
  />
      <h2 className="instrument-update-title">Update Instrument</h2>
      <div className="apform-group">
        <label>Instrument Name:</label>
        <input
          type="text"
          className="instrument-update-input"
          value={instrumentName}
          onChange={(e) => setInstrumentName(e.target.value)}
        />
      </div>

      {/* Instrument Types */}
      <div className="apform-group">
        <label>Instrument Types:</label>
        <button type="button" onClick={() => setInstrumentTypes([...instrumentTypes, { name: "", amountTypes: [] }])}>+ Add</button>
      </div>
      {instrumentTypes.map((type, i) => (
        <div key={i} className="apform-group">
          <input type="text" placeholder="Instrument Type" value={type.name} onChange={(e) => {
            const updated = [...instrumentTypes];
            updated[i].name = e.target.value;
            setInstrumentTypes(updated);
          }} required />
          <button type="button" onClick={() => {
            const updatedTypes = [...instrumentTypes];
            updatedTypes.splice(i, 1);
            setInstrumentTypes(updatedTypes);
          }}>Remove</button>

          {/* Unique Amount Types for Each Instrument Type */}
          <div className="amount-container">
            <button type="button" onClick={() => {
              const updated = [...instrumentTypes];
              updated[i].amountTypes = [...updated[i].amountTypes, { name: "", amount: "" }];
              setInstrumentTypes(updated);
            }}>+ Add Amount</button>

            {type.amountTypes.map((amt, j) => (
              <div key={j} className="apform-group">
                <input type="text" placeholder="Amount Name" value={amt.name} onChange={(e) => {
                  const updated = [...instrumentTypes];
                  updated[i].amountTypes[j].name = e.target.value;
                  setInstrumentTypes(updated);
                }} required />
                <input type="number" placeholder="Amount (₹)" value={amt.amount} onChange={(e) => {
                  const updated = [...instrumentTypes];
                  updated[i].amountTypes[j].amount = e.target.value;
                  setInstrumentTypes(updated);
                }} required />
                <button type="button" onClick={() => {
                  const updated = [...instrumentTypes];
                  updated[i].amountTypes.splice(j, 1);
                  setInstrumentTypes(updated);
                }}>Remove</button>
              </div>
            ))}

          </div>
        </div>
      ))}

      {/* Elements */}
<div className="apform-group">
  <label>Elements:</label>
  <button type="button" onClick={() => setElements([...elements, { name: "", amountTypes: [] }])}>+ Add</button>
</div>
{elements.map((element, i) => (
  <div key={i} className="apform-group">
    <input type="text" placeholder="Element Name" value={element.name} onChange={(e) => {
      const updated = [...elements];
      updated[i].name = e.target.value;
      setElements(updated);
    }} required />
    <button type="button" onClick={() => {
      const updatedElements = [...elements];
      updatedElements.splice(i, 1);
      setElements(updatedElements);
    }}>Remove</button>

    {/* Unique Amount Types for Each Element */}
    <div className="amount-container">
      <button type="button" onClick={() => {
        const updated = [...elements];
        updated[i].amountTypes = [...updated[i].amountTypes, { name: "", amount: "" }];
        setElements(updated);
      }}>+ Add Amount</button>

      {element.amountTypes.map((amt, j) => (
        <div key={j} className="apform-group">
          <input type="text" placeholder="Amount Name" value={amt.name} onChange={(e) => {
            const updated = [...elements];
            updated[i].amountTypes[j].name = e.target.value;
            setElements(updated);
          }} required />
          <input type="number" placeholder="Amount (₹)" value={amt.amount} onChange={(e) => {
            const updated = [...elements];
            updated[i].amountTypes[j].amount = e.target.value;
            setElements(updated);
          }} required />
          <button type="button" onClick={() => {
            const updated = [...elements];
            updated[i].amountTypes.splice(j, 1);
            setElements(updated);
          }}>Remove</button>
        </div>
      ))}
    </div>
  </div>
))}

  {/* Common D-Amount Type Section */}
  {instrumentTypes.length === 0 && elements.length === 0 && (
        <div className="apform-group">
          <label>Common Amount Types:</label>
          <button type="button" onClick={() => setCommonAmountTypes([...commonAmountTypes, { name: "", amount: "" }])}>+ Add</button>
        </div>
      )}

      {instrumentTypes.length === 0 && elements.length === 0 &&
        commonAmountTypes.map((amt, i) => (
          <div key={i} className="apform-group">
            <input type="text" placeholder="Amount Name" value={amt.name} onChange={(e) => {
              const updated = [...commonAmountTypes];
              updated[i].name = e.target.value;
              setCommonAmountTypes(updated);
            }} required />
            <input type="number" placeholder="Amount (₹)" value={amt.amount} onChange={(e) => {
              const updated = [...commonAmountTypes];
              updated[i].amount = e.target.value;
              setCommonAmountTypes(updated);
            }} required />
            <button type="button" onClick={() => {
              const updated = [...commonAmountTypes];
              updated.splice(i, 1);
              setCommonAmountTypes(updated);
            }}>Remove</button>
          </div>
        ))}
{/* Default Slots */}
<div className="apform-group">
  <label>Default Slots:</label>
  <button
    type="button"
    onClick={() => setDefaultSlots((prevSlots) => [...prevSlots, ""])}
  >
    + Add Slot
  </button>
</div>

{defaultSlots.map((slot, i) => (
  <div key={i} className="apform-group">
    <input
      type="text"
      placeholder="Slot Timing"
      value={slot}
      onChange={(e) =>
        setDefaultSlots((prevSlots) =>
          prevSlots.map((s, index) => (index === i ? e.target.value : s))
        )
      }
      required
    />
    <button
      type="button"
      onClick={() =>
        setDefaultSlots((prevSlots) => prevSlots.filter((_, index) => index !== i))
      }
    >
      Remove
    </button>
  </div>
))}

   {/* Slot Availability */}
<div className="apform-group">
  <label>Slot Availability:</label>
</div>

{/* Common Date for all slots */}
<div className="apform-group">
  <label>Date:</label>
  <input
    type="date"
    value={SDate}
    onChange={(e) => setSDate(e.target.value)}
    required
  />
</div>

{/* Display Slot Availability */}
{slots.map((slot, i) => (
  <div key={i} className="apform-group">
    <input type="text" value={slot.slot} readOnly />
    <label>
      Available:
      <input
        type="checkbox"
        checked={slot.isAvailable}
        onChange={() => {
          setSlots((prevSlots) =>
            prevSlots.map((s, index) =>
              index === i ? { ...s, isAvailable: !s.isAvailable } : s
            )
          );

          // ✅ Update bookedSlots state when unchecking a slot (booking it)
          if (slot.isAvailable) {
            setUncheckedSlots((prev) => [
              ...prev,
              { date: SDate, slot: slot.slot, isBooked: true },
            ]);
          } else {
            // ✅ Remove from bookedSlots if checked again (making available)
            setUncheckedSlots((prev) =>
              prev.filter((s) => !(s.slot === slot.slot && s.date === SDate))
            );
          }
        }}
      />
    </label>
  </div>
))}

    {/* GST Section */}
<div className="apform-group">
  <label>SGST (%):</label>
  <input
    type="number"
    value={gst.sgst}
    onChange={(e) =>
      setGst((prevGst) => ({ ...prevGst, sgst: parseFloat(e.target.value) || 0 }))
    }
    required
  />
</div>
<div className="apform-group">
  <label>CGST (%):</label>
  <input
    type="number"
    value={gst.cgst}
    onChange={(e) =>
      setGst((prevGst) => ({ ...prevGst, cgst: parseFloat(e.target.value) || 0 }))
    }
    required
  />
</div>

        {/* Hopur Basis */}
        <div className="apform-group toggle-container">
          <label>Hour Basis:</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={hourBasis}
              onChange={() => setHourBasis(!hourBasis)}
            />
            <span className="slider"></span>
          </label>
        </div>


{/* Features Section */}
<div className="apform-group">
  <label htmlFor="features">Features:</label>
  <textarea
    id="features"
    name="features"
    value={features}
    onChange={(e) => setFeatures(e.target.value.trimStart())} // Prevents leading spaces
    rows="4"
    placeholder="Enter instrument features..."
    required
  ></textarea>
</div>
{/* Image Upload Section */}
<div className="apform-group">
  <label htmlFor="instImage">Instrument Image:</label>
  <input
    type="file"
    id="instImage"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setInstImage(file);
        setPreviewImage(URL.createObjectURL(file)); // Generate preview URL
      }
    }}
  />
</div>

{/* Image Preview */}
{previewImage && (
  <div className="image-preview">
    <img src={previewImage} alt="Instrument Preview" width="100" height="100" />

  </div>
)}
{/* General Availability */}
<div className="apform-group">
  <label>General Availability:</label>
  <input
    type="checkbox"
    checked={generalAvailability}
    onChange={() => setGeneralAvailability(!generalAvailability)}
  />
</div>


{error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <button type="button" onClick={updateInstrumentName}>Update</button>

    </div>
  );
};

export default InstrumentUpdate;
