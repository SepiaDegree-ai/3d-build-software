import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Function to ensure the DOM is ready
const ensureDOMReady = () => {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve();
    } else {
      window.addEventListener("load", resolve);
    }
  });
};

// Main initialization function
const initializeApp = async () => {
  try {
    await ensureDOMReady();
    
    // Log the actual DOM structure for debugging
    console.log("Document ready state:", document.readyState);
    console.log("Document structure:", document.documentElement.outerHTML);
    
    const container = document.getElementById("root");
    if (!container) {
      throw new Error("Failed to find the root element");
    }

    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to initialize app:", error);
    throw error;
  }
};

// Start the initialization
initializeApp(); 