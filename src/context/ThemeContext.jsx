import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const fontOptions = [
  { name: 'Inter', family: "'Inter', sans-serif" },
  { name: 'Roboto', family: "'Roboto', sans-serif" },
  { name: 'Playfair Display', family: "'Playfair Display', serif" },
  { name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif" },
  { name: 'Montserrat', family: "'Montserrat', sans-serif" },
  { name: 'Lora', family: "'Lora', serif" },
  { name: 'EB Garamond', family: "'EB Garamond', serif" },
  { name: 'Outfit', family: "'Outfit', sans-serif" },
  { name: 'Merriweather', family: "'Merriweather', serif" },
  { name: 'Cinzel', family: "'Cinzel', serif" },
];

export const ThemeProvider = ({ children }) => {
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('magnotes_font') || fontOptions[3].family; // Default: Cormorant
  });

  useEffect(() => {
    localStorage.setItem('magnotes_font', fontFamily);
    
    // Apply dual-typography to the root
    const root = document.documentElement;
    root.style.setProperty('--magnotes-main-font', fontFamily);
    root.style.setProperty('--magnotes-sub-font', "'Montserrat', sans-serif"); // Fixed sub-font for now
    
    // Fallback for body
    document.body.style.fontFamily = fontFamily;
  }, [fontFamily]);

  return (
    <ThemeContext.Provider value={{ fontFamily, setFontFamily, fontOptions }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
