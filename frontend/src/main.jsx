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
 * It sets up the React root, wraps the app in a router, and adds custom
 * event listeners for enhanced UI effects.
 * 
 * Key features:
 * - React app initialization
 * - BrowserRouter setup for routing
 * - Custom hover effects for UI elements
 * - Theme change detection and handling
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// Initialize the application by creating a root React component
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Render the application with routing enabled via BrowserRouter
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Custom enhancement: Fix for hover effects
// This adds custom hover effects to buttons and interactive elements
document.addEventListener('DOMContentLoaded', function() {
  // Only apply hover effects in light mode
  function applyHoverEffects() {
    // Skip if in dark mode
    if (document.documentElement.classList.contains('dark')) return;
    
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
  
  // Watch for theme changes (light/dark mode toggle)
  // This allows hover effects to update when theme changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      // Check if the class attribute of the html element was modified
      if (mutation.attributeName === 'class' && mutation.target === document.documentElement) {
        applyHoverEffects();
      }
    });
  });
  
  // Start observing the html element for class changes
  observer.observe(document.documentElement, { attributes: true });
});