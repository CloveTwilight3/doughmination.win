import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// Initialize the application
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Render the application with routing
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Fix for hover effects
document.addEventListener('DOMContentLoaded', function() {
  // Only apply in light mode
  function applyHoverEffects() {
    if (document.documentElement.classList.contains('dark')) return;
    
    // Find all buttons and links with color classes
    const elements = document.querySelectorAll('.bg-blue-500, .bg-purple-500, .bg-green-500, .bg-red-500, .bg-blue-600, button[type="submit"], .rounded-lg');
    
    elements.forEach(el => {
      // Remove any existing hover classes
      el.classList.remove('hover:bg-blue-600', 'hover:bg-purple-600', 'hover:bg-green-600', 'hover:bg-red-600');
      
      // Add mouseenter event
      el.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#db2777'; // Pink color
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      });
      
      // Add mouseleave event
      el.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '';
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    });
  }
  
  // Apply initially
  setTimeout(applyHoverEffects, 500); // Small delay to ensure DOM is fully loaded
  
  // Listen for theme changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class' && mutation.target === document.documentElement) {
        applyHoverEffects();
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
});