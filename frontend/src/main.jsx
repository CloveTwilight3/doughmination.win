/*
MIT License

Copyright (c) 2025 Clove Twilight

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
 * main.jsx
 * 
 * This is the application entry point that initializes the React app.
 * It sets up the React root, wraps the app in a router.
 * 
 * Key features:
 * - React app initialization
 * - BrowserRouter setup for routing
 * - Enhanced UI effects for the dark theme
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import './layout-fixes.css'; // Import our new layout fixes

// Initialize the application by creating a root React component
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Render the application with routing enabled via BrowserRouter
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Custom enhancement: Enhanced hover effects for dark mode
document.addEventListener('DOMContentLoaded', function() {
  // Apply custom hover effects for dark mode
  function applyHoverEffects() {
    // Find all buttons and links with color classes
    const elements = document.querySelectorAll('.bg-blue-500, .bg-purple-500, .bg-green-500, .bg-red-500, .bg-blue-600, button[type="submit"], .rounded-lg');
    
    elements.forEach(el => {
      // Remove any existing hover classes to prevent duplication
      el.classList.remove('hover:bg-blue-600', 'hover:bg-purple-600', 'hover:bg-green-600', 'hover:bg-red-600');
      
      // Add mouseenter event for hover effect
      el.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#db2777'; // Pink color on hover
        this.style.transform = 'translateY(-2px)'; // Slight lift effect
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)'; // Enhanced shadow
      });
      
      // Add mouseleave event to reset styles
      el.addEventListener('mouseleave', function() {
        this.style.backgroundColor = ''; // Reset to original color
        this.style.transform = ''; // Reset position
        this.style.boxShadow = ''; // Reset shadow
      });
    });
  }
  
  // Apply hover effects initially after a small delay
  // The delay ensures the DOM is fully loaded
  setTimeout(applyHoverEffects, 500);
  
  // Optional: Watch for any DOM changes if you have dynamic content
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        applyHoverEffects();
      }
    });
  });
  
  // Start observing for any DOM additions
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });

  // Apply additional layout fixes after DOM is loaded
  setTimeout(() => {
    // Make sure the content wrapper has the right structure
    const contentWrapper = document.querySelector('.content-wrapper');
    if (contentWrapper) {
      contentWrapper.style.display = 'flex';
      contentWrapper.style.flexDirection = 'column';
      
      // Move special date container to the right position if it exists
      const specialDateContainer = document.getElementById('special-date-container');
      if (specialDateContainer) {
        specialDateContainer.style.order = '1';
      }
      
      // Set order for welcome message
      const welcomeMessage = document.querySelector('.welcome-message');
      if (welcomeMessage) {
        welcomeMessage.style.order = '0';
      }
      
      // Set order for mental state banner
      const mentalStateBanner = document.querySelector('.mental-state-banner');
      if (mentalStateBanner) {
        mentalStateBanner.style.order = '2';
      }
      
      // Set order for fronting section
      const frontingSection = document.querySelector('.mb-6.p-4.border-b.dark\\:border-gray-700');
      if (frontingSection) {
        frontingSection.style.order = '3';
      }
    }
  }, 100);
});