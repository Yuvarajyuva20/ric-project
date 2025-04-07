import "./AddProduct.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
    // Get today's date in YYYY-MM-DD format
  const navigate = useNavigate();
  const [instrumentAmountTypes, setInstrumentAmountTypes] = useState([]); 
  const [elementAmountTypes, setElementAmountTypes] = useState([]);
  const [commonAmountTypes, setCommonAmountTypes] = useState([]); 
  const [instrumentTypes, setInstrumentTypes] = useState([]); // Will store array of strings
  const [elements, setElements] = useState([]); // Will store array of strings
  const [slots, setSlots] = useState([]); 
  const [gst, setGst] = useState({ sgst: "", cgst: "" });
  const [hourBasis, setHourBasis] = useState(false); // Default is false
  const [formData, setFormData] = useState({
    instrumentName: "",
    features: "",
    instImage: null,
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    setFormData({ ...formData, instImage: file });
    setError("");
  };

  const uploadImage = async (file) => {
    const fileData = new FormData();
    fileData.append("inst_image", file);

    try {
      const response = await fetch("http://localhost:4000/upload/images", {
        method: "POST",
        body: fileData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image.");
      }

      const result = await response.json();
      return result.success ? result.image_url : null;
    } catch (error) {
      console.error("Image upload error:", error);
      setError(error.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.instrumentName.trim()) return setError("Instrument Name is required.");
    if (!formData.features.trim()) return setError("Features are required.");
    if (!formData.instImage) return setError("Instrument Image is required.");
    setError("");

    const uploadedImageUrl = await uploadImage(formData.instImage);
    if (!uploadedImageUrl) return;

    if (!gst.sgst || !gst.cgst) return setError("Both SGST and CGST are required.");

    const productData = {
      ...formData,
      inst_image: uploadedImageUrl,
      instrumentTypes: instrumentTypes.map((type, i) => ({
        name: type,
        amountTypes: instrumentAmountTypes[i] || [],
      })),
      d_amountTypes: commonAmountTypes,
      elements:elements.map((type, i) => ({
        name: type,
        amountTypes: elementAmountTypes[i] || [],
      })) ,
      gst,
      defaultSlots: slots,
      hour_basis: hourBasis,
    };

    try {
      const response = await fetch("http://localhost:4000/add_instrument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const result = await response.json();
      if (result.success) {
        setSuccessMessage("Instrument added successfully!");
        setFormData({ instrumentName: "", features: "", instImage: null });
        setInstrumentAmountTypes([]);
        setElementAmountTypes([]);
        setCommonAmountTypes([]); 
        setInstrumentTypes([]);
        setElements([]);
        setSlots([]);
        setGst({ sgst: "", cgst: "" });
        setHourBasis(false);
      } else {
        throw new Error(result.message || "Failed to add instrument.");
      }
    } catch (error) {
      setError("Failed to add instrument. Please try again.");
    }
  };


  return (
    <div className="add-product-container">
 <div className="top-buttons-container">
  <button className="instrument-btn" onClick={() => navigate("/Allinstruments")}>
    Instrument
  </button>
  <img
    src={require("../Components/Assets/Instrumentrequest.png")}
    alt="Request Icon"
    className="booking-request-icon"
    onClick={() => navigate("/InstrumentRequest")}
  />
</div>
<img
    src={require("../Components/Assets/back.png")}
    alt="Back"
    className="back-icon"
    onClick={() => navigate("/instrument-manager")}
  />

      <h1 className="mml" style={{ paddingLeft: "100px" }}>Add Product</h1>
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="apform-group">
          <label>Instrument Name:</label>
          <input type="text" name="instrumentName" value={formData.instrumentName} onChange={handleChange} required />
        </div>

        {/* Instrument Types */}
        <div className="apform-group">
          <label>Instrument Types:</label>
          <button type="button" onClick={() => setInstrumentTypes([...instrumentTypes, ""])}>+ Add</button>
        </div>
        {instrumentTypes.map((type, i) => (
  <div key={i} className="apform-group">
    <input type="text" placeholder="Instrument Type" value={type} onChange={(e) => {
      const updated = [...instrumentTypes];
      updated[i] = e.target.value;
      setInstrumentTypes(updated);
    }} required />
    <button type="button" onClick={() => {
      const updated = [...instrumentTypes];
      updated.splice(i, 1);
      setInstrumentTypes(updated);
      const updatedAmounts = [...instrumentAmountTypes];
      updatedAmounts.splice(i, 1); // Remove associated amount types
      setInstrumentAmountTypes(updatedAmounts);
    }}>Remove</button>

    {/* Unique amount types for each instrument type */}
    <div className="amount-container">
      <button type="button" onClick={() => {
        const updated = [...instrumentAmountTypes];
        if (!updated[i]) updated[i] = []; // Initialize if not exists
        updated[i] = [...updated[i], { name: "", amount: "" }];
        setInstrumentAmountTypes(updated);
      }}>+ Add Amount</button>

      {instrumentAmountTypes[i]?.map((amt, j) => (
        <div key={j} className="apform-group">
          <input type="text" placeholder="Amount Name" value={amt.name} onChange={(e) => {
            const updated = [...instrumentAmountTypes];
            updated[i][j].name = e.target.value;
            setInstrumentAmountTypes(updated);
          }} required />
          <input type="number" placeholder="Amount (₹)" value={amt.amount} onChange={(e) => {
            const updated = [...instrumentAmountTypes];
            updated[i][j].amount = e.target.value;
            setInstrumentAmountTypes(updated);
          }} required />
          <button type="button" onClick={() => {
            const updated = [...instrumentAmountTypes];
            updated[i].splice(j, 1);
            setInstrumentAmountTypes(updated);
          }}>Remove</button>
        </div>
      ))}
    </div>
  </div>
))}


       {/* Element Types */}
<div className="apform-group">
  <label>Element Types:</label>
  <button type="button" onClick={() => setElements([...elements, ""])}>+ Add</button>
</div>

{elements.map((el, i) => (
  <div key={i} className="apform-group">
    <input type="text" placeholder="Element Name" value={el} onChange={(e) => {
      const updated = [...elements];
      updated[i] = e.target.value;
      setElements(updated);
    }} required />
    <button type="button" onClick={() => {
      const updated = [...elements];
      updated.splice(i, 1);
      setElements(updated);
      const updatedAmounts = [...elementAmountTypes];
      updatedAmounts.splice(i, 1); // Remove associated amount types
      setElementAmountTypes(updatedAmounts);
    }}>Remove</button>

    {/* Unique amount types for each Element Type */}
    <div className="amount-container">
      <button type="button" onClick={() => {
        const updated = [...elementAmountTypes];
        if (!updated[i]) updated[i] = []; // Initialize if not exists
        updated[i] = [...updated[i], { name: "", amount: "" }];
        setElementAmountTypes(updated);
      }}>+ Add Amount</button>

      {elementAmountTypes[i]?.map((amt, j) => (
        <div key={j} className="apform-group">
          <input type="text" placeholder="Amount Name" value={amt.name} onChange={(e) => {
            const updated = [...elementAmountTypes];
            updated[i][j].name = e.target.value;
            setElementAmountTypes(updated);
          }} required />
          <input type="number" placeholder="Amount (₹)" value={amt.amount} onChange={(e) => {
            const updated = [...elementAmountTypes];
            updated[i][j].amount = e.target.value;
            setElementAmountTypes(updated);
          }} required />
          <button type="button" onClick={() => {
            const updated = [...elementAmountTypes];
            updated[i].splice(j, 1);
            setElementAmountTypes(updated);
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
  ))
}
  {/* Slots */}
<div className="apform-group">
  <label>Slots:</label>
  <button type="button" onClick={() => setSlots([...slots, ""])}>+ Add</button>
</div>
{slots.map((slot, i) => (
  <div key={i} className="apform-group">
    <input
      type="text"
      placeholder="Slot Timing"
      value={slot}
      onChange={(e) => {
        const updated = [...slots];
        updated[i] = e.target.value;
        setSlots(updated);
      }}
      required
    />
    <button
      type="button"
      onClick={() => {
        const updated = [...slots];
        updated.splice(i, 1);
        setSlots(updated);
      }}
    >
      Remove
    </button>
  </div>
))}



        {/* GST */}
        <div className="apform-group">
          <label>SGST (%):</label>
          <input type="number" value={gst.sgst} onChange={(e) => setGst({ ...gst, sgst: e.target.value })} required />
        </div>
        <div className="apform-group">
          <label>CGST (%):</label>
          <input type="number" value={gst.cgst} onChange={(e) => setGst({ ...gst, cgst: e.target.value })} required />
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

        {/* Features */}
        <div className="apform-group">
          <label>Features:</label>
          <textarea name="features" value={formData.features} onChange={handleChange} required></textarea>
        </div>

            {/* Image */}
            <div className="apform-group">
          <label htmlFor="instImage">Instrument Image:</label>
          <input type="file" id="instImage" onChange={handleFileChange} required />
        </div>
        {formData.instImage && (
          <div className="image-preview">
            <img src={URL.createObjectURL(formData.instImage)} alt="Preview" width="100" />
          </div>)}

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <button className="sub-btn" type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
