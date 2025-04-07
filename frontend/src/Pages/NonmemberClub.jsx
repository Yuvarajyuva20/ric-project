import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NonmemberClub.css";
import { useNavigate } from "react-router-dom";

const NonMemberClub = () => {
  const [instruments, setInstruments] = useState([]); // State to store all instruments
  const navigate = useNavigate();

  // Fetch Instruments
  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await axios.get("http://localhost:4000/allinstrument");
        setInstruments(response.data); // Set the fetched instruments in state
      } catch (error) {
        console.error("Error fetching instruments:", error);
      }
    };

    fetchInstruments();
  }, []);

  return (
    <div className="nonmemberclub-container">
      {/* Top Section with Member Link - Positioned at the top right */}
      <div className="nonmember-header">
        <p>If you are a MEMBER click this</p>
        <button className="yellow-btn" onClick={() => navigate("/LoginPage")}>
          Member
        </button>
      </div>

      {/* Welcome Message */}
      <main className="nonclub-content">
        <h1>Welcome to RIC Instrument Collection</h1>

        {/* Instrument List */}
        <div className="noninstrument-list">
          {instruments.map((instrument) => (
            <div
              key={instrument.ins_id}
              className="noninstrument-item"
              onClick={() => navigate(`/Nonmemberinstrumentdetails/${instrument.ins_id}`)}
            >
              <img
                style={{ width: "70%", height: "300px" }}
                src={instrument.inst_image}
                alt={instrument.instrumentName}
                className="noninstrument-image"
              />
              <h3 className="noninstrument-name">{instrument.instrumentName}</h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NonMemberClub;
