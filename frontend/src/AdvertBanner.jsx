import React, { useState, useEffect, useRef } from 'react';
import { areCookiesAccepted, saveCookiePreferences } from './cookieService';

/**
 * AdvertBanner component that displays Google AdSense advertisements and handles cookie consent
 * 
 * @param {Object} props - Component props
 * @param {string} props.adSlot - The AdSense ad slot ID
 * @param {string} props.adFormat - The ad format (auto, horizontal, etc.)
 * @param {string} props.position - Where to position the ad (top, content, sidebar)
 * @param {boolean} props.responsive - Whether the ad should be responsive
 */
const AdvertBanner = ({ 
  adSlot = "7362645348", // Use your actual ad slot from Google
  adFormat = "auto",
  position = "top",
  responsive = true
}) => {
  // State to manage cookie consent
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [showCookieNotice, setShowCookieNotice] = useState(true);
  const insRef = useRef(null);
  const initialized = useRef(false);
  
  // Initialize state based on saved preferences
  useEffect(() => {
    const accepted = areCookiesAccepted();
    setCookiesAccepted(accepted);
    setShowCookieNotice(!accepted);
  }, []);
  
  // Initialize ads when component mounts and cookies are accepted
  useEffect(() => {
    // Only try to initialize if:
    // 1. Cookies are accepted
    // 2. The ins element exists
    // 3. We haven't already initialized this ad
    // 4. AdSense is loaded
    if (cookiesAccepted && insRef.current && !initialized.current && window.adsbygoogle) {
      try {
        // Wait a moment to ensure the element is properly in the DOM
        setTimeout(() => {
          // Check if element has width before initializing
          if (insRef.current.offsetWidth > 0) {
            // Push the ad
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            initialized.current = true;
            console.log(`AdSense ad initialized for slot: ${adSlot}`);
          } else {
            console.log(`Ad container has zero width, not initializing ad slot ${adSlot}`);
          }
        }, 200);
      } catch (e) {
        console.error('Error initializing AdSense:', e);
      }
    }
  }, [cookiesAccepted, adSlot]);
  
  // Function to handle cookie acceptance
  const handleAcceptCookies = () => {
    saveCookiePreferences(true);
    setCookiesAccepted(true);
    setShowCookieNotice(false);
  };
  
  // Get position-specific classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'w-full mb-4';
      case 'content':
        return 'w-full my-4';
      case 'sidebar':
        return 'hidden md:block md:w-72 lg:w-80 flex-shrink-0';
      default:
        return 'w-full';
    }
  };
  
  return (
    <>
      {/* Ad Banner - displays only if cookies are accepted */}
      {cookiesAccepted && (
        <div 
          className={`${getPositionClasses()} bg-gray-100 dark:bg-gray-800 overflow-hidden rounded shadow-sm`}
          style={{ minHeight: '100px', minWidth: '200px' }}
        >
          <div className="py-1 px-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Advertisement</p>
            
            {/* AdSense ad unit */}
            <ins 
              ref={insRef}
              className="adsbygoogle"
              style={{ 
                display: 'block',
                minHeight: '60px', 
                width: '100%',
                overflow: 'hidden'
              }}
              data-ad-client="ca-pub-2820378422214826"
              data-ad-slot={adSlot}
              data-ad-format={adFormat}
              data-full-width-responsive={responsive ? "true" : "false"}
            />
          </div>
        </div>
      )}

      {/* Cookie Notice - shown only if cookies haven't been accepted */}
      {showCookieNotice && (
        <div 
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-50 border-t border-gray-200 dark:border-gray-700 cookie-consent-banner"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            margin: 0,
            padding: 0
          }}
        >
          <div className="px-4 py-3 mx-auto" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                This website uses cookies to enhance your experience and display advertisements.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    saveCookiePreferences(false);
                    setShowCookieNotice(false);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 text-xs sm:text-sm py-1 px-3 rounded"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptCookies}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs sm:text-sm py-1 px-3 rounded"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvertBanner;