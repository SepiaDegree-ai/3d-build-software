import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Debug element to show initialization status
const debugDiv = document.createElement('div');
debugDiv.style.position = 'fixed';
debugDiv.style.top = '0';
debugDiv.style.left = '0';
debugDiv.style.padding = '10px';
debugDiv.style.background = 'yellow';
debugDiv.style.zIndex = '9999';
document.body.appendChild(debugDiv);

const updateDebug = (message) => {
  debugDiv.textContent = message;
};

// Function to ensure the DOM is ready
const ensureDOMReady = () => {
  updateDebug('Checking DOM ready state: ' + document.readyState);
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      updateDebug('DOM is already complete');
      resolve();
    } else {
      updateDebug('Waiting for DOM to load...');
      window.addEventListener("load", () => {
        updateDebug('DOM load event fired');
        resolve();
      });
    }
  });
};

// Main initialization function
const initializeApp = async () => {
  updateDebug('Initializing app...');
  try {
    await ensureDOMReady();
    
    updateDebug('DOM is ready, attempting to mount React');
    const container = document.getElementById("root");
    updateDebug('Root container: ' + (container ? 'found' : 'not found'));
    
    if (!container) {
      throw new Error("Failed to find the root element");
    }

    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    updateDebug('React app mounted successfully');
  } catch (error) {
    updateDebug('Error: ' + error.message);
    throw error;
  }
};

// Start the initialization
try {
  updateDebug('Starting app initialization');
  initializeApp();
} catch (error) {
  updateDebug('Top-level error: ' + error.message);
} 