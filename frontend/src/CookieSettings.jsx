import React, { useState, useEffect } from 'react';
import { resetAllCookieConsent } from './cookieService';

/**
 * CookieSettings component that adds a cookie settings button and modal to manage consent
 * This can be added to the footer or any part of the app
 */
const CookieSettings = () => {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for consent options
  const [consentState, setConsentState] = useState({
    necessary: true, // Always true
    analytics: false,
    advertising: false,
    preferences: false
  });
  
  // Load saved consent settings when component mounts
  useEffect(() => {
    const consentStatus = localStorage.getItem('cookieConsent');
    
    if (consentStatus) {
      try {
        const parsedConsent = JSON.parse(consentStatus);
        setConsentState(parsedConsent);
      } catch (e) {
        console.error('Error parsing stored consent:', e);
      }
    }
  }, []);
  
  // Toggle the modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  
  // Handle toggling individual consent options
  const handleToggleConsent = (category) => {
    if (category === 'necessary') return; // Cannot toggle necessary cookies
    
    setConsentState(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Save consent preferences
  const saveConsent = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(consentState));
    
    // Reload the page to apply new consent settings
    // This ensures that cookies are properly applied or removed
    window.location.reload();
  };
  
  // Handle reset all cookies
  const handleResetAllCookies = () => {
    if (window.confirm('Are you sure you want to reset all cookie preferences? This will remove all cookies and restart your consent choices.')) {
      resetAllCookieConsent();
      window.location.reload();
    }
  };
  
  return (
    <>
      {/* Cookie Settings Button */}
      <button
        onClick={toggleModal}
        className="text-blue-500 dark:text-blue-400 hover:underline text-sm"
        aria-label="Open Cookie Settings"
      >
        Cookie Settings
      </button>
      
      {/* Cookie Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Cookie Settings</h2>
                <button
                  onClick={toggleModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.
                Read our <a href="/cookies-policy" className="text-blue-500 hover:underline">Cookie Policy</a> and 
                <a href="/privacy-policy" className="text-blue-500 hover:underline ml-1">Privacy Policy</a> for more information.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium">Necessary Cookies</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">These cookies are required for the website to function properly.</p>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={consentState.necessary} 
                      disabled 
                      className="w-4 h-4 accent-blue-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium">Analytics Cookies</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">These cookies help us understand how visitors interact with our website.</p>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={consentState.analytics} 
                      onChange={() => handleToggleConsent('analytics')}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium">Advertising Cookies</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">These cookies are used to show you relevant advertisements on and off our site.</p>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={consentState.advertising} 
                      onChange={() => handleToggleConsent('advertising')}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium">Preference Cookies</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">These cookies remember your settings and preferences.</p>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={consentState.preferences} 
                      onChange={() => handleToggleConsent('preferences')}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4">
                  <button
                    onClick={handleResetAllCookies}
                    className="mt-3 sm:mt-0 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Reset All Cookie Preferences
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleModal}
                      className="px-4 py-2 text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveConsent}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieSettings;