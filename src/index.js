import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This is the entry point of your React application
// It tells React to render your App component inside the HTML element with id="root"

// Create a root element - this is the new way to do it in React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your App component
// React.StrictMode helps catch potential problems during development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 📚 Learning note: 
// This file is like the "bridge" between your HTML page and your React components
// When the browser loads your page, this code runs and puts your React app on the screen
