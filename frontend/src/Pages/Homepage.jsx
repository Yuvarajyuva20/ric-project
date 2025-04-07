// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import arrowIcon from "../Components/Assets/arrow_icon.svg";
import ban from "../Components/Assets/bann.png";

const HomePage = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const fullText = "Turn your ideas valuable";

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="contents">
      <div className="banners">
        <div className="text-content">
          <h1>
            <span>Centre for</span>
            <span>Nanomaterials</span>
            <span>Research and</span>
            <span>Innovations</span>
          </h1>
          <button className="m-btn" id="m-btn" onClick={() => navigate("/LoginPage")}>
            Member
            <img
              style={{
                width: "25px",
                height: "25px",
                marginLeft: "15px",
                objectFit: "contain",
                verticalAlign: "middle",
                maxWidth: "100%",
                maxHeight: "100%",
                marginBottom: "2px",
              }}
              src={arrowIcon}
              alt="Arrow"
              className="arr_icon"
            />
          </button>
          <div className="bottom-quote">
            {typedText}
            <span className="cursor">|</span>
          </div>
        </div>
        <div className="image-container">
          <img src={ban} alt="Creative Idea" className="right-image" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;