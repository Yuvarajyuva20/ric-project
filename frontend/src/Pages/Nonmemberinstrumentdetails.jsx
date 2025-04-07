import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "./Nonmemberinstrumentdetails.css";
import { useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";

const Nonmemberinstrumentdetails = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");  
  const [selectedType, setSelectedType] = useState("");
  const [selectedAmountType, setSelectedAmountType] = useState("");
  const [amount, setAmount] = useState(null);
  const [selectedElement, setSelectedElement] = useState([]);
  const [selectedElementAmountType, setSelectedElementAmountType] = useState("");
  const [elementAmount, setElementAmount] = useState(null);
  const [selectedCommonAmountType, setSelectedCommonAmountType] = useState("");
  const [commonAmount, setCommonAmount] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [hourBasis, setHourBasis] = useState(false);
  const [numOfSample, setNumOfSample] = useState("");
  const [numOfHour, setNumOfHour] = useState("");
  const [elementSamples, setElementSamples] = useState({}); 


const imageurl = instrument?.inst_image;
const instname = instrument?.instrumentName; 

// Calculate final amounts based on slot selection
const slotCount = selectedSlots.length || 1; // Default to 1 if no slots are required

const finalAmount = amount !== null ? amount * (hourBasis ? numOfHour || 1 : numOfSample || 1) : null;
const finalElementAmount = elementAmount !== null ? elementAmount * (hourBasis ? numOfHour || 1 : numOfSample || 1) : null;
const finalCommonAmount = commonAmount !== null ? commonAmount * (hourBasis ? numOfHour || 1 : numOfSample || 1) : null;


  useEffect(() => {
    const fetchInstrumentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/instrument/${id}`);
        if (response.data.success) {
          setInstrument(response.data.instrument);
          setHourBasis(response.data.instrument.hour_basis || false);
        } else {
          setError(response.data.message || "Failed to fetch instrument details.");
        }
      } catch (error) {
        console.error("Error fetching instrument details:", error);
        setError("Failed to fetch instrument details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstrumentDetails();
  }, [id]);

  useEffect(() => {
    if (selectedType) {
      setSelectedAmountType("");
      setAmount(null);
    }
  }, [selectedType]);

  useEffect(() => {
    if (selectedElement) {
      setSelectedElementAmountType("");
      setElementAmount(null);
    }
  }, [selectedElement]);

  useEffect(() => {
    if (selectedType && selectedAmountType && instrument) {
      const type = instrument.instrumentTypes.find(t => t.name === selectedType);
      if (type) {
        const amountType = type.amountTypes.find(a => a.name === selectedAmountType);
        setAmount(amountType ? amountType.amount : null);
      }
    }
  }, [selectedAmountType, selectedType, instrument]);
  
  useEffect(() => {
    if (selectedElement.length > 0 && selectedElementAmountType && instrument) {
      let totalElementAmount = 0;
      selectedElement.forEach((elementName) => {
        const element = instrument.elements.find((e) => e.name === elementName);
        if (element) {
          const amountType = element.amountTypes.find((a) => a.name === selectedElementAmountType);
          if (amountType) {
            const sampleCount = elementSamples[elementName] || 1; // Default to 1 if not set
            totalElementAmount += amountType.amount * sampleCount;
          }
        }
      });
      setElementAmount(totalElementAmount);
    } else {
      setElementAmount(null);
    }
  }, [selectedElementAmountType, selectedElement, instrument, elementSamples]);  
  
    
  useEffect(() => {
    if (selectedCommonAmountType && instrument) {
      const commonAmt = instrument.d_amountTypes.find(a => a.name === selectedCommonAmountType);
      setCommonAmount(commonAmt ? commonAmt.amount : null);
    }
  }, [selectedCommonAmountType, instrument]);

  useEffect(() => {
    if (instrument) {
      const formattedDate = selectedDate;
      const bookedSlots = instrument.bookedSlots.filter(slot => slot.date === formattedDate).map(slot => slot.slot);
      const available = instrument.defaultSlots.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(available);
    }
  }, [selectedDate, instrument]);


  const handleBookingClick = () => {
    if (
      (instrument.defaultSlots.length > 0 && selectedSlots.length === 0) || 
      (instrument.instrumentTypes.length > 0 && (!selectedType || !selectedAmountType)) || 
      (instrument.elements.length > 0 && (!selectedElement || !selectedElementAmountType)) || 
      (instrument.d_amountTypes.length > 0 && !selectedCommonAmountType)
    ) {
      alert("Unable to book. Please check that all the fields are entered correctly.");
      return;
    }  
    handleBooking(); // Proceed with booking if all fields are valid
  };

  const handleBooking = () => {
    // Store both memberId and token in localStorage
    navigate(`/NonMemberBooking/${id}`, {
      state: {
        id,
        imageurl,
        instname,
        selectedDate,
        selectedSlots,
        selectedType,
        selectedAmountType,
        finalAmount,
        selectedElement,
        selectedElementAmountType,
        finalElementAmount,
        selectedCommonAmountType,
        finalCommonAmount,
        numOfHour: hourBasis ? numOfHour : null,
        numOfSample: !hourBasis ? numOfSample : null,
        elementSamples: { ...elementSamples },
      },
    });
    
  };

  const toggleSlotSelection = (slot) => {
    setSelectedSlots((prevSelected) =>
      prevSelected.includes(slot)
        ? prevSelected.filter((s) => s !== slot) // Remove if already selected
        : [...prevSelected, slot] // Add if not selected
    );
  };

  const toggleElementSelection = (elementName) => {
    setSelectedElement((prevSelected) => {
      if (prevSelected.includes(elementName)) {
        const updatedElements = prevSelected.filter((e) => e !== elementName);
        const updatedSamples = { ...elementSamples };
        delete updatedSamples[elementName]; // Remove its sample count
        setElementSamples(updatedSamples);
        return updatedElements;
      }
      return [...prevSelected, elementName];
    });
  };

  const handleSampleChange = (elementName, sampleCount) => {
    setElementSamples((prevSamples) => ({
      ...prevSamples,
      [elementName]: sampleCount,
    }));
  };
  
  

  if (loading) return <p>Loading instrument details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!instrument) return <p>Instrument details not available.</p>;

  return (
    <div className="instrument-details-container">
        
    <img
    src={require("../Components/Assets/back.png")}
    alt="Back"
    className="back-icon"
    onClick={() => navigate("/NonmemberClub")}
  />
      {/* Left Section: Image and Name */}
      <div className="image-section">
        {instrument.inst_image && <img src={instrument.inst_image} alt={instrument.instrumentName} className="instrument-image" />}
        <h1 className="name-section">{instrument.instrumentName}</h1>
      </div>

      {/* Right Section: Details */}
      <div className="details-section">
        <h2>Instrument Details</h2>

       {/* Conditionally Render Instrument Type Section */}
{instrument.instrumentTypes && instrument.instrumentTypes.length > 0 && (
  <div className="amount-section">
    <h4>Select Instrument Type:</h4>
    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
      <option value="">Select Type</option>
      {instrument.instrumentTypes.map((type) => (
        <option key={type.name} value={type.name}>{type.name}</option>
      ))}
    </select>

    {selectedType && (
      <>
        <h4>Select Amount Type:</h4>
        <select 
          value={selectedAmountType} 
          onChange={(e) => setSelectedAmountType(e.target.value)}
        >
          <option value="">Select Type</option>
          {
            instrument.instrumentTypes.find(t => t.name === selectedType)?.amountTypes
              ? instrument.instrumentTypes.find(t => t.name === selectedType).amountTypes.map((amt) => (
                  <option key={amt.name} value={amt.name}>{amt.name}</option>
                ))
              : <option disabled>No amount types available</option>
          }
        </select>
      </>
    )}

    {amount !== null && (
      <p>
        <strong>Amount:</strong> 
        <span className="amount-highlight"> ₹{finalAmount}</span>
      </p>
    )}
  </div>
)}

        {/* Conditionally Render Element Type Section */}
        {instrument.elements && instrument.elements.length > 0 && (
          <div className="amount-section">
           <h4>Select Element Type:</h4>
           <div className="element-checkboxes">
          {instrument.elements.map((element) => (
            <div key={element.name} className="element-item">
              <label>
                <input
                  type="checkbox"
                  value={element.name}
                  checked={selectedElement.includes(element.name)}
                  onChange={() => toggleElementSelection(element.name)}
                />
                {element.name}
              </label>
              {selectedElement.includes(element.name) && (
              <div className="sample-input-container">
                <input
                  type="number"
                  min="1"
                  value={elementSamples[element.name] || ""}
                  onChange={(e) => handleSampleChange(element.name, Number(e.target.value))}
                  placeholder="sample count"
                  className="sample-input"
                />
              </div>
            )}

            </div>
          ))}
        </div>

            {selectedElement && (
              <>
                 <h4>Select Amount Type:</h4>
                <select value={selectedElementAmountType} onChange={(e) => setSelectedElementAmountType(e.target.value)}>
                  <option value="">Select Type</option>
                  {instrument.elements[0].amountTypes.map((amt) => ( // Use first element's amount types
                    <option key={amt.name} value={amt.name}>{amt.name}</option>
                  ))}
                </select>
              </>
            )}
            {selectedElement.length > 0 && selectedElementAmountType && (
             <p>
                <strong>Amount:</strong> 
                <span className="amount-highlight"> ₹{finalElementAmount}</span>
            </p>)}
          </div>
        )}

        {/* Conditionally Render Common Amount Types (d_amountTypes) */}
        {instrument.d_amountTypes && instrument.d_amountTypes.length > 0 && (
          <div className="amount-section">
            <h4>Select Common Amount Type:</h4>
            <select value={selectedCommonAmountType} onChange={(e) => setSelectedCommonAmountType(e.target.value)}>
            <option value="">Select Type</option>
              {instrument.d_amountTypes.map((amt) => (
                <option key={amt.name} value={amt.name}>{amt.name}</option>
              ))}
            </select>
            {commonAmount !== null &&  <p>
                <strong>Amount:</strong> 
                <span className="amount-highlight"> ₹{finalCommonAmount}</span>
            </p>}
          </div>
        )}

        {instrument.elements.length === 0 && ( // Only render if no elements exist
          <div className="input-section">
            {hourBasis ? (
              <span>
                <h4>No of Hours:</h4>
                <input
                  type="number"
                  value={numOfHour}
                  onChange={(e) => setNumOfHour(e.target.value)}
                  min="1"
                  required
                />
              </span>
            ) : (
              <span>
                <h4>No of Samples:</h4>
                <input
                  type="number"
                  value={numOfSample}
                  onChange={(e) => setNumOfSample(e.target.value)}
                  min="1"
                  required
                />
              </span>
            )}
          </div>
        )}



        <div className="slots-section">
        <h4>Select a Date:</h4>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
          className="date-picker"
        />

        {instrument.defaultSlots.length > 0 && availableSlots.length > 0 && (
          <>
            <h4>Slots:</h4>
            <div className="slots-container">
              {instrument.defaultSlots.map((slot, index) => {
                const isBooked = instrument.bookedSlots.some(
                  (bookedSlot) => bookedSlot.date === selectedDate && bookedSlot.slot === slot
                );
                const isSelected = selectedSlots.includes(slot);

                return (
                  <button
                    key={index}
                    className={`slot-button ${isBooked ? "booked" : isSelected ? "selected" : "available"}`}
                    onClick={() => !isBooked && toggleSlotSelection(slot)}
                    style={{ backgroundColor: isBooked ? "red" : isSelected ? "#4CAF50" : "" }}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

 {/* Feature Section */}
<div className="features-section">
  <p><strong>Features:</strong></p>
  <p className="features-content">{instrument.features || "N/A"}</p>
</div>

 {/* Book Instrument Button */}
 <div className="book-button-container">
 
 <button 
  className="book-instrument-btn" 
  onClick={handleBookingClick} 
>
  Book Instrument
</button>

        </div>
    </div>
    </div>
  );
};

export default Nonmemberinstrumentdetails;
