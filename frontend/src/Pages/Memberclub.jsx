import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Memberclub.css";
import { useNavigate } from "react-router-dom";

const Memberclub = () => {
  const [riccoin, setRiccoin] = useState(0); // State to store coins
  const [instruments, setInstruments] = useState([]); // State to store all instruments
  const memberId = localStorage.getItem("memberId"); // Get memberId from localStorage
  const navigate = useNavigate();
  

  // Fetch RIC coins
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/user/${memberId}`);
        if (response.data.success) {
          setRiccoin(response.data.riccoin);
        } else {
          console.error("Failed to fetch coins:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching coins:", error);
      }
    };

    fetchCoins();
  }, [memberId]);

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
    <div className="memberclub-container">
      {/* RIC Coin Display */}
      <div className="coins-display">
        <img
          src={require("../Components/Assets/RIC.png")}
          alt="Coins Icon"
          className="coin-icon"
        />
        <span className="coin-count">{riccoin}</span>
      </div>

      {/* Welcome Message */}
      <main className="club-content">
        <h1>Welcome to RIC Membership Club</h1>

        {/* Instrument List */}
        <div className="instrument-list">
          {instruments.map((instrument) => (
          <div
          key={instrument.ins_id}
          className="instrument-item"
          onClick={() => navigate(`/instrumentdetails/${instrument.ins_id}`)}

          >
          <img style={{width: '75%', height: '350px'}}
            src={instrument.inst_image}
            alt={instrument.instrumentName}
            className="instrument-image"
           />
 <h3 className="instrument-name">{instrument.instrumentName}</h3>
</div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Memberclub;
