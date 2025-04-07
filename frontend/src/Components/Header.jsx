import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Layout.css";
import { Mic, MicOff } from "lucide-react";

const Header = ({ toggleAccessibilityMenu }) => {
  const [menu, setMenu] = useState("home");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null); // Store recognition instance

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log("Recognized:", transcript);
        handleVoiceCommand(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
      };

      recognitionRef.current = recognition; // Store instance in ref
    } else {
      console.error("Speech Recognition is not supported in this browser.");
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;

    setVoiceEnabled((prev) => {
      if (!prev) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
            console.log("Voice navigation enabled.");
          } catch (error) {
            console.error("Recognition already started.");
          }
        }
      } else {
        recognitionRef.current.stop();
        console.log("Voice navigation disabled.");
      }
      return !prev;
    });
  };

  const handleVoiceCommand = (command) => {
    if (command.includes("home")) {
      navigate("/");
      setMenu("home");
    } else if (command.includes("profile")) {
      navigate("/profile");
      setMenu("profile");
    } else if (command.includes("admin")) {
      navigate("/AdminPage");
      setMenu("admin");
    } else if (command.includes("status")) {
      navigate("/status");
      setMenu("status");
    } else if (command.includes("payment")) {
      navigate("/payment");
      setMenu("payment");
    } else if (command.includes("instruments")) {
      navigate("/NonmemberClub");
      setMenu("Instruments");
    } 
    else if (command.includes("mode")) {
      console.log("Opening Accessibility Menu...");
      toggleAccessibilityMenu(); // Call the function to toggle menu
    }else {
      console.log("Command not recognized");
    }
  };

  return (
    <header>
      <div className="logo">
        <img src={require("./Assets/logo1.png")} alt="CNRI Logo" />
        <span>CNRI</span>
      </div>
      <nav className="navbar">
        <Link onClick={() => setMenu("home")} to="/" style={{ color: menu === "home" ? "#e5cf2a" : "inherit" }}>
          Home
        </Link>
        <Link onClick={() => setMenu("profile")} to="/profile" style={{ color: menu === "profile" ? "#e5cf2a" : "inherit" }}>
          Profile
        </Link>
        <Link onClick={() => setMenu("admin")} to="/AdminPage" style={{ color: menu === "admin" ? "#e5cf2a" : "inherit" }}>
          Admin
        </Link>
        <Link onClick={() => setMenu("status")} to="/status" style={{ color: menu === "status" ? "#e5cf2a" : "inherit" }}>
          Status
        </Link>
        <Link onClick={() => setMenu("payment")} to="/payment" style={{ color: menu === "payment" ? "#e5cf2a" : "inherit" }}>
          Payment
        </Link>
        <Link onClick={() => setMenu("Instruments")} to="/NonmemberClub" style={{ color: menu === "Instruments" ? "#e5cf2a" : "inherit" }}>
          Instruments
        </Link>
      </nav>
      {/* Voice Navigation Toggle Button */}
      <button onClick={toggleVoice} className="voice-toggle">
  {voiceEnabled ? <Mic color="red" size={24} /> : <MicOff color="white" size={24} />}
</button>



    </header>
  );
};

export default Header;
