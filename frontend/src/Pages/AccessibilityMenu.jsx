import React, { useState, useRef, useEffect } from 'react';
import './AccessibilityMenu.css';

const AccessibilityMenu = ({ toggleSetting, settings }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Track menu visibility
  const [position, setPosition] = useState({ top: 100, left: 20 });
  const menuRef = useRef(null);
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const [contentScale, setContentScale] = useState(100); // Default 100%
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [magnifiedText, setMagnifiedText] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [readingGuidePosition, setReadingGuidePosition] = useState({ top: null, left: null });
  const closeMenu = () => setIsVisible(false); // Hide menu
  const synth = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  
   
  useEffect(() => { 
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartPosition.current.x;
        const deltaY = e.clientY - dragStartPosition.current.y;

        const newLeft = position.left + deltaX;
        const newTop = position.top + deltaY;

        const menuWidth = menuRef.current.offsetWidth;
        const menuHeight = menuRef.current.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const boundedLeft = Math.max(0, Math.min(newLeft, windowWidth - menuWidth));
        const boundedTop = Math.max(0, Math.min(newTop, windowHeight - menuHeight));

        setPosition({ left: boundedLeft, top: boundedTop });
        dragStartPosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartPosition.current = { x: e.clientX, y: e.clientY };
  };

  const changeScale = (value) => {
    let newScale = contentScale + value;
    
    if (newScale < 50) newScale = 50; // Minimum 50%
    if (newScale > 200) newScale = 200; // Maximum 200%
  
    setContentScale(newScale);
    
    // Apply scaling evenly from the center
    document.body.style.transform = `scale(${newScale / 100})`;
    document.body.style.transformOrigin = 'center center';
  };
  


  useEffect(() => {
    const handleMouseMove = (e) => {
      if (settings.textMagnifier) {
        const target = e.target.closest("p, span, h1, h2, h3, h4, h5, h6, li, a"); // Apply to all text elements
        if (target) {
          setMagnifiedText(target.innerText);
          setMagnifierPosition({ x: e.clientX + 20, y: e.clientY + 20 });
        } else {
          setMagnifiedText("");
        }
      }
    };

    if (settings.textMagnifier) {
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      setMagnifiedText("");
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [settings.textMagnifier]);


  useEffect(() => {
    const updateCursorPosition = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
  
    if (settings.bigDarkCursor) {
      document.addEventListener("mousemove", updateCursorPosition);
    } else {
      setCursorPosition({ x: -100, y: -100 }); // Move off-screen when disabled
    }
  
    return () => {
      document.removeEventListener("mousemove", updateCursorPosition);
    };
  }, [settings.bigDarkCursor]);


  useEffect(() => {
    const handleMouseMove = (e) => {
      if (settings.readingGuide) {
        setReadingGuidePosition({ top: e.clientY - 6, left: e.clientX - 125 });
      }
    };

    if (settings.readingGuide) {
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      setReadingGuidePosition({ top: null, left: null });
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [settings.readingGuide]);

  const firstRender = useRef(true);
  useEffect(() => {

    if (firstRender.current) {
      firstRender.current = false; // Skip effect on first render
      return;
    }
    if (settings.cognitiveReading) {
      document.body.classList.add('cognitive-reading');
      applyBionicReading(); // Apply the effect to text content
    } else {
      document.body.classList.remove('cognitive-reading');
      removeBionicReading(); // Remove the effect when disabled
    }
  }, [settings.cognitiveReading]);
  
  const applyBionicReading = () => {
    document.querySelectorAll("p, h3, span, li, a").forEach((el) => {
      if (!el.dataset.original) {
        el.dataset.original = el.innerHTML; // Store original HTML
      }
      el.innerHTML = el.textContent
        .split(/\s+/) // Ensure proper word split
        .map((word) =>
          word.length > 3
            ? `<b>${word.slice(0, Math.min(3, word.length))}</b>${word.slice(3)}`
            : `<b>${word}</b>`
        )
        .join(" ");
        
    });
  };
  
  
  const removeBionicReading = () => {
    document.querySelectorAll('p, h3, span, li, a').forEach((el) => {
      if (el.dataset.original) {
        el.innerHTML = el.dataset.original; // Restore original text
        delete el.dataset.original;
      }
    });
  }; 


  useEffect(() => {
    if (settings.textToSpeech) {
      document.body.classList.add("text-to-speech-enabled");
      enableTextToSpeech();
    } else {
      document.body.classList.remove("text-to-speech-enabled");
      disableTextToSpeech();
    }
  
    return () => {
      disableTextToSpeech(); // Ensure cleanup on unmount
      document.body.classList.remove("text-to-speech-enabled");
    };
  }, [settings.textToSpeech]);
  
  const enableTextToSpeech = () => {
    document.addEventListener("mouseover", handleMouseOver);
  };
  
  const disableTextToSpeech = () => {
    document.removeEventListener("mouseover", handleMouseOver);
    if (synth.current) {
      synth.current.cancel(); // Stop any ongoing speech
    }
    utteranceRef.current = null; // Clear the reference
  };
  
  const handleMouseOver = (event) => {
    const target = event.target;
    if (target && target.innerText.trim()) {
      speakText(target.innerText);
    }
  };
  
  const speakText = (text) => {
    if (!synth.current) return;
  
    // Cancel any ongoing speech before speaking new text
    synth.current.cancel();
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // Set language
    utterance.rate = 1; // Adjust speed (1 is normal)
    synth.current.speak(utterance);
  };
  
  if (!settings || !isVisible) return null; // Hide menu if `isVisible` is false

  return (
    <div
    
      className="accessibility-menu"
      ref={menuRef}
      style={{ left: `${position.left}px`, top: `${position.top}px`, position: 'absolute' }}
      onMouseDown={startDrag}
    >
      {/* Header */}
      <div className="accessibility-menu-header">
        <h2 className="menu-title">Accessibility</h2>
        <button className="close-button" onClick={closeMenu}>
          &times;
        </button>
      </div>

     {/* Scrollable Content */}
<div className="accessibility-menu-content">
  <p>ACCESSIBILITY MODES</p>
  <div className="accessibility-options">
    {[
      { label: 'Epilepsy Safe Mode', key: 'epilepsySafe' },
      { label: 'Visually Impaired Mode', key: 'visuallyImpaired' },
      { label: 'Cognitive Disability Mode', key: 'cognitiveDisability' },
      { label: 'ADHD Friendly Mode', key: 'adhdFriendly' },
      { label: 'Blindness Mode', key: 'blindnessMode' },
    ].map(({ label, key }) => (
      <div className="accessibility-option" key={key}>
        <span className="toggle-label">{label}</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={() => toggleSetting(key)}
          />
          <span className="slider"></span>
        </label>
      </div>
    ))}
  </div>

  <hr className="section-divider" />

  <p>READABLE EXPERIENCE</p>
  <div className="readable-experience-options">

    {/* Content Scaling */}
    <div className="readable-experience-option">
            <div className="scaling-box">
              <button className="scale-button" onClick={() => changeScale(-5)}>-</button>
              <span className="scaling-text">Content Scaling</span>
              <button className="scale-button" onClick={() => changeScale(5)}>+</button>
            </div>
            <p className="scale-percentage">{contentScale}%</p>
          </div>     

    {/* Dyslexia Friendly Mode */}
    <div className="readable-experience-option">
      <span className="toggle-label">Dyslexia Friendly Mode</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={settings.dyslexiaFriendly}
          onChange={() => toggleSetting('dyslexiaFriendly')}
        />
        <span className="slider"></span>
      </label>
    </div>


 {/* Text Magnifier Mode Toggle */}
    <div className="readable-experience-option">
      <span className="toggle-label">Text Magnifier</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={settings.textMagnifier}
          onChange={() => toggleSetting('textMagnifier')}
        />
        <span className="slider"></span>
      </label>
    </div>

    {settings.textMagnifier && magnifiedText && (
        <div
          className="text-magnifier-box"
          style={{ left: `${magnifierPosition.x}px`, top: `${magnifierPosition.y}px` }}
        >
          {magnifiedText}
        </div>
      )}

 {/* Highlight Links  */}
<div className="readable-experience-option">
  <span className="toggle-label">Highlight Links</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={settings.highlightLinks}
      onChange={() => toggleSetting('highlightLinks')}
    />
    <span className="slider"></span>
  </label>
</div>

 {/* Center Aligned */}
<div className="readable-experience-option">
  <span className="toggle-label">Center Aligned Mode</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={settings.centerAligned}
      onChange={() => toggleSetting('centerAligned')}
    />
    <span className="slider"></span>
  </label>
</div>

{/* Readable Font */}
<div className="readable-experience-option">
  <span className="toggle-label">Readable Font</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={settings.readableFont}
      onChange={() => toggleSetting('readableFont')}
    />
    <span className="slider"></span>
  </label>
</div>     
  </div>

  <hr className="section-divider" />

<p>VISUALLY PLEASING EXPERIENCE</p>
<div className="visually-pleasing-options">

   {/* Dark Contrast Mode */}
   <div className="visually-pleasing-option">
    <span className="toggle-label">Dark Contrast Mode</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={settings.darkContrast}
        onChange={() => toggleSetting('darkContrast')}
      />
      <span className="slider"></span>
    </label>
  </div>

  {/* Bright Contrast Mode */}
  <div className="visually-pleasing-option">
    <span className="toggle-label">Bright Contrast Mode</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={settings.brightContrast}
        onChange={() => toggleSetting('brightContrast')}
      />
      <span className="slider"></span>
    </label>
  </div>

 {/* High Saturation Mode */}
 <div className="visually-pleasing-option">
    <span className="toggle-label">High Saturation Mode</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={settings.highSaturation}
        onChange={() => toggleSetting('highSaturation')}
      />
      <span className="slider"></span>
    </label>
  </div>

 {/* Low Saturation Mode */}
 <div className="visually-pleasing-option">
    <span className="toggle-label">Low Saturation Mode</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={settings.lowSaturation}
        onChange={() => toggleSetting('lowSaturation')}
      />
      <span className="slider"></span>
    </label>
  </div>

   {/* Monochrome Mode */}
   <div className="visually-pleasing-option">
    <span className="toggle-label">Monochrome Mode</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={settings.monochrome}
        onChange={() => toggleSetting('monochrome')}
      />
      <span className="slider"></span>
    </label>
  </div>

    {/* Low Brightness Mode */}
    <div className="visually-pleasing-option">
    <span className="toggle-label">Low Brightness Mode</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={settings.lowBrightness}
        onChange={() => toggleSetting('lowBrightness')}
      />
      <span className="slider"></span>
    </label>
  </div>


   {/* High Brightness Mode */}
   <div className="visually-pleasing-option">
    <span className="toggle-label">High Brightness Mode</span>
    <label className="switch">
      <input
        type="checkbox"
        checked={settings.highBrightness}
        onChange={() => toggleSetting('highBrightness')}
      />
      <span className="slider"></span>
    </label>
  </div>
</div>

<hr className="section-divider" />

<p>EASY ORIENTATION</p>
<div className="visually-pleasing-options"></div>


  {/* Hide Images Mode */}
<div className="visually-pleasing-option">
  <span className="toggle-label">Hide Images</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={settings.hideImages}
      onChange={() => toggleSetting('hideImages')}
    />
    <span className="slider"></span>
  </label>
</div>



{/* Highlight Hover Mode */}
<div className="visually-pleasing-option">
  <span className="toggle-label">Highlight Hover Mode</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={settings.highlightHover}
      onChange={() => toggleSetting('highlightHover')}
    />
    <span className="slider"></span>
  </label>
</div>


{/* Big Dark Cursor Mode */}
<div className="visually-pleasing-option">
  <span className="toggle-label">Big Dark Cursor Mode</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={settings.bigDarkCursor}
      onChange={() => toggleSetting('bigDarkCursor')}
    />
    <span className="slider"></span>
  </label>
</div>
{/* Custom Big Dark Cursor */}
{settings.bigDarkCursor && (
  <div
    className="custom-cursor"
    style={{
      left: `${cursorPosition.x}px`,
      top: `${cursorPosition.y}px`,
      position: "fixed",
    }}
  />
)}


{/* Reading Guide Mode */}
<div className="visually-pleasing-option">
  <span className="toggle-label">Reading Guide Mode</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={settings.readingGuide}
      onChange={() => toggleSetting('readingGuide')}
    />
    <span className="slider"></span>
  </label>
</div>

 {/* Reading Guide Bar */}
 {settings.readingGuide && readingGuidePosition.top !== null && (
        <div
          className="reading-guide-bar"
          style={{
            top: `${readingGuidePosition.top}px`,
            left: `${readingGuidePosition.left}px`,
          }}
        ></div>
      )}


{/* Cognitive Reading Mode */}
<div className="visually-pleasing-option">
  <span className="toggle-label">Cognitive Reading Mode</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={settings.cognitiveReading}
      onChange={() => toggleSetting('cognitiveReading')}
    />
    <span className="slider"></span>
  </label>
</div>

{/* Text to Speech Mode */}
<div className="visually-pleasing-option">
  <span className="toggle-label">Text to Speech Mode</span>
  <label className="switch">
    <input
      type="checkbox"
      checked={settings.textToSpeech}
      onChange={() => toggleSetting('textToSpeech')}
    />
    <span className="slider"></span>
  </label>
</div>
</div>

      {/* Footer */}
      <div className="accessibility-menu-footer">
        <button className="reset-button">Reset Settings</button>
        <button className="hide-button">Hide Forever</button>
      </div>
    </div>
  );
};

export default AccessibilityMenu;
