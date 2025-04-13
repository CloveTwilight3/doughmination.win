import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- Add this import
import App from './App';
import './index.css';  // This imports the Tailwind CSS styles

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <BrowserRouter> {/* Wrap your App component with BrowserRouter */}
    <App />
  </BrowserRouter>
);