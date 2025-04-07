import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Allinstruments.css";

const AllInstruments = () => {
  const [instruments, setInstruments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await fetch("http://localhost:4000/allinstrument");
        if (!response.ok) {
          throw new Error("Failed to fetch instruments");
        }
        const data = await response.json();
        setInstruments(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchInstruments();
  }, []);

  const handleView = (id) => {
    navigate(`/InstrumentUpdate/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this instrument?")) {
      try {
        const response = await fetch(`http://localhost:4000/instrument/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete instrument");
        }

        // Remove the deleted instrument from the UI
        setInstruments(instruments.filter((instrument) => instrument.ins_id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="all-instruments-container">
      <img
        src={require("../Components/Assets/back.png")}
        alt="Back"
        className="back-icon"
        onClick={() => navigate("/AddProduct")}
      />
      <h1>ALL INSTRUMENTS</h1>
      {error && <p className="error-message">{error}</p>}
      <ul className="viewinstrument-list">
        {instruments.map((instrument) => (
          <li key={instrument.ins_id} className="viewinstrument-item">
            <span className="viewinstrument-name">{instrument.instrumentName}</span>
            <button className="view-btns" onClick={() => handleView(instrument.ins_id)}>
              View
            </button>
            <button className="delete-btn" onClick={() => handleDelete(instrument.ins_id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllInstruments;
