// AdvertBanner.jsx
import React, { useState, useEffect } from 'react';
import { areCookiesAccepted, saveCookiePreferences } from './cookieService';

/**
 * AdvertBanner component that displays Google AdSense advertisements and cookie consent
 * 
 * @param {Object} props - Component props
 * @param {string} props.adSlot - The AdSense ad slot ID
 * @param {string} props.adFormat - The ad format (auto, horizontal, etc.)
 * @param {string} props.position - Where to position the ad (top, content, sidebar)
 * @param {boolean} props.responsive - Whether the ad should be responsive
 */
const AdvertBanner = ({ 
  adSlot = "7362645348", // Replace with your actual ad slot
  adFormat = "auto",
  position = "top",
  responsive = true
}) => {
  // State to manage cookie consent
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [showCookieNotice, setShowCookieNotice] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);
  
  // Initialize state based on saved preferences
  useEffect(() => {
    const accepted = areCookiesAccepted();
    setCookiesAccepted(accepted);
    setShowCookieNotice(!accepted);
    
    // Load Google AdSense script if cookies accepted
    if (accepted) {
      loadAdSenseScript();
    }
  }, []);
  
  // When cookiesAccepted changes, handle ad loading
  useEffect(() => {
    if (cookiesAccepted && !adLoaded) {
      // Small delay to ensure script is loaded first
      const timer = setTimeout(() => {
        initializeAds();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [cookiesAccepted, adLoaded]);
  
  // Function to handle cookie acceptance
  const handleAcceptCookies = () => {
    saveCookiePreferences(true);
    setCookiesAccepted(true);
    setShowCookieNotice(false);
    loadAdSenseScript();
  };
  
  // Function to load AdSense script
  const loadAdSenseScript = () => {
    // Only add script if it doesn't already exist
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2820378422214826';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log('AdSense script loaded');
        initializeAds();
      };
      document.head.appendChild(script);
    } else {
      initializeAds();
    }
  };
  
  // Function to initialize ads
  const initializeAds = () => {
  if (window.adsbygoogle && !adLoaded) {
    try {
      // Find this specific ad slot
      const adElement = document.querySelector(`ins[data-ad-slot="${adSlot}"]`);
      
      // Check if this ad is already initialized or has zero width
      if (adElement && !adElement.dataset.adInitialized && adElement.offsetWidth > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adElement.dataset.adInitialized = 'true';
        setAdLoaded(true);
      } else if (adElement && adElement.offsetWidth === 0) {
        console.log(`Ad container has zero width, delaying initialization for ad slot ${adSlot}`);
        // Try again after a slight delay to allow layout to complete
        setTimeout(initializeAds, 500);
      }
    } catch (e) {
      console.error('Error initializing AdSense:', e);
    }
  }
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
        <div className={`${getPositionClasses()} bg-gray-100 dark:bg-gray-800 overflow-hidden rounded shadow-sm`}>
          <div className="py-1 px-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Advertisement</p>
            
            {/* AdSense ad unit */}
            <ins 
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
            ></ins>
          </div>
        </div>
      )}

      {/* Cookie Notice - shown only if cookies haven't been accepted */}
      {showCookieNotice && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md p-3 z-50 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
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
      )}
    </>
  );
};

export default AdvertBanner;