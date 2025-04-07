import React, { useState, useEffect } from 'react';
import AccessibilityMenu from './AccessibilityMenu'; // The floating menu component
import './AccessibilityIcon.css'; // Optional styles

const AccessibilityIcon = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [settings, setSettings] = useState({
    epilepsySafe: false,
    visuallyImpaired: false,
    cognitiveDisability: false,
    adhdFriendly: false,
    blindnessMode: false,
    dyslexiaFriendly: false,
    textMagnifier: false,
    highlightLinks: false,
    centerAligned: false,
    readableFont: false,
    darkContrast: false,
    brightContrast: false,
    highSaturation: false,
    lowSaturation: false,
    monochrome: false,
    lowBrightness: false,
    highBrightness: false,
    hideImages: false,
    highlightHover: false,
    bigDarkCursor: false,
    cognitiveReading: false,
    textToSpeech:false,
    
  });

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const toggleSetting = (key) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: !prevSettings[key],
    }));
  };

  // Apply accessibility modes (like epilepsySafe, visuallyImpaired, etc.)
  useEffect(() => {
    // Apply Epilepsy Safe Mode class
    if (settings.epilepsySafe) {
      document.body.classList.add('epilepsy-safe-mode');
    } else {
      document.body.classList.remove('epilepsy-safe-mode');
    }

    // Apply Visually Impaired Mode class
    if (settings.visuallyImpaired) {
      document.body.classList.add('visually-impaired-mode');
    } else {
      document.body.classList.remove('visually-impaired-mode');
    }

    // Apply Cognitive Disability Mode class
if (settings.cognitiveDisability) {
  document.body.classList.add('cognitive-disability-mode');
} else {
  document.body.classList.remove('cognitive-disability-mode');
}

// Apply ADHD Friendly Mode class
if (settings.adhdFriendly) {
  document.body.classList.add('adhd-friendly-mode');
} else {
  document.body.classList.remove('adhd-friendly-mode');
}

 // Enable/Disable Reading Mask for ADHD & Dyslexia Modes
 if (settings.adhdFriendly) {
  enableReadingMask();
} else {
  disableReadingMask();
}

// Apply Blindness Mode class
if (settings.blindnessMode) {
  document.body.classList.add('blindness-mode');
} else {
  document.body.classList.remove('blindness-mode');
}

// Dyslexia Friendly mode class
  if (settings.dyslexiaFriendly) {
    document.body.classList.add('dyslexia-friendly-mode');
  } else {
    document.body.classList.remove('dyslexia-friendly-mode');
  }

  

  // Text Magnifier mode class
  if (settings.textmagnifier) {
    document.body.classList.add('text-magnifier');
  } else {
    document.body.classList.remove('text-magnifier');
  }


  // Apply Highlight Links Mode class
if (settings.highlightLinks) {
  document.body.classList.add('highlight-links-mode');
} else {
  document.body.classList.remove('highlight-links-mode');
}


// Apply Center Aligned Mode class
if (settings.centerAligned) {
  document.body.classList.add('center-aligned-mode');
} else {
  document.body.classList.remove('center-aligned-mode');
}

// Apply Readable Font Mode class
if (settings.readableFont) {
  document.body.classList.add('readable-font-mode');
} else {
  document.body.classList.remove('readable-font-mode');
}

// Apply Dark Contrast Mode class
if (settings.darkContrast) {
  document.body.classList.add('dark-contrast-mode');
} else {
  document.body.classList.remove('dark-contrast-mode');
}

// Apply Bright Contrast Mode class
if (settings.brightContrast) {
  document.body.classList.add('bright-contrast-mode');
} else {
  document.body.classList.remove('bright-contrast-mode');
}


// Apply High Saturation Mode class
if (settings.highSaturation) {
  document.body.classList.add('high-saturation-mode');
} else {
  document.body.classList.remove('high-saturation-mode');
}


// Apply Low Saturation Mode class
if (settings.lowSaturation) {
  document.body.classList.add('low-saturation-mode');
} else {
  document.body.classList.remove('low-saturation-mode');
}

// Apply Monochrome Mode class
if (settings.monochrome) {
  document.body.classList.add('monochrome-mode');
} else {
  document.body.classList.remove('monochrome-mode');
}


// Apply Low Brightness Mode class
if (settings.lowBrightness) {
  document.body.classList.add('low-brightness-mode');
} else {
  document.body.classList.remove('low-brightness-mode');
}


// Apply High Brightness Mode class
if (settings.highBrightness) {
  document.body.classList.add('high-brightness-mode');
} else {
  document.body.classList.remove('high-brightness-mode');
}


// Apply Hide Images Mode class
if (settings.hideImages) {
  document.body.classList.add('hide-images-mode');
} else {
  document.body.classList.remove('hide-images-mode');
}

// Apply Highlight Hover Mode class
if (settings.highlightHover) {
  document.body.classList.add('highlight-hover');
} else {
  document.body.classList.remove('highlight-hover');
}

// Apply Big Dark Cursor Mode class
if (settings.bigDarkCursor) {
  document.body.classList.add('big-dark-cursor');
} else {
  document.body.classList.remove('big-dark-cursor');
}

// Apply Reading Guide Mode class
if (settings.readingGuide) {
  document.body.classList.add('reading-guide');
} else {
  document.body.classList.remove('reading-guide');
}

// Apply Cognitive Reading Mode class
if (settings.cognitiveReading) {
  document.body.classList.add('cognitive-reading');
} else {
  document.body.classList.remove('cognitive-reading');
}



// Apply Text to Speech Mode class
if (settings.textToSpeech) {
  document.body.classList.add('text-to-speech');
} else {
  document.body.classList.remove('text-to-speech');
}

// Add other accessibility modes as needed, following the same pattern.
  }, [settings]);
 
  
  const enableReadingMask = () => {
    let overlay = document.querySelector('.reading-overlay');
    let mask = document.querySelector('.reading-mask');
  
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'reading-overlay';
      document.body.appendChild(overlay);
    }
  
    if (!mask) {
      mask = document.createElement('div');
      mask.className = 'reading-mask';
      document.body.appendChild(mask);
    }
  
    // Move the mask on mouse move
    document.addEventListener('mousemove', (e) => {
      mask.style.top = `${e.clientY - 40}px`; // Keeps it centered around the cursor
    });
  
    // Keep mask fixed while scrolling
    document.addEventListener('scroll', () => {
      const yOffset = window.scrollY;
      mask.style.top = `${window.innerHeight / 2 + yOffset - 40}px`; // Keeps it at middle of viewport
    });
  };
  
  const disableReadingMask = () => {
    document.querySelector('.reading-overlay')?.remove();
    document.querySelector('.reading-mask')?.remove();
  };
                                                                                



  return (
    <div>
      <div className="accessibility-icon" onClick={toggleMenu}>
        <span role="img" aria-label="Accessibility Icon">♿</span>
      </div>
      {menuVisible && (
        <AccessibilityMenu settings={settings} toggleSetting={toggleSetting} />
      )}
    </div>
  );
};

export default AccessibilityIcon;
