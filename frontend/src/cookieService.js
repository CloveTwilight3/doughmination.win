/**
 * Set a cookie with the given name, value and options
 */
export const setCookie = (name, value, options = {}) => {
  const defaults = {
    path: '/',
    maxAge: 86400 * 365, // 365 days in seconds (1 year)
    sameSite: 'Lax'
  };
  
  const cookieOptions = { ...defaults, ...options };
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  // Add options to cookie string
  if (cookieOptions.path) {
    cookieString += `; path=${cookieOptions.path}`;
  }
  
  if (cookieOptions.maxAge) {
    cookieString += `; max-age=${cookieOptions.maxAge}`;
  }
  
  if (cookieOptions.domain) {
    cookieString += `; domain=${cookieOptions.domain}`;
  }
  
  if (cookieOptions.secure) {
    cookieString += '; secure';
  }
  
  if (cookieOptions.sameSite) {
    cookieString += `; samesite=${cookieOptions.sameSite}`;
  }
  
  document.cookie = cookieString;
};

/**
 * Get a cookie by name
 */
export const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(encodeURIComponent(name) + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name, options = {}) => {
  // To delete a cookie, set its expiration to the past
  const defaults = { path: '/' };
  const cookieOptions = { ...defaults, ...options, maxAge: -1 };
  setCookie(name, '', cookieOptions);
};

/**
 * Check if cookies are accepted
 */
export const areCookiesAccepted = () => {
  const consent = localStorage.getItem('cookieConsent');
  if (consent) {
    try {
      const parsedConsent = JSON.parse(consent);
      // Any type of consent beyond necessary cookies
      return parsedConsent.advertising || parsedConsent.analytics || parsedConsent.preferences;
    } catch (e) {
      console.error('Error parsing cookie consent:', e);
      return false;
    }
  }
  return false;
};

/**
 * Check if a specific consent category is accepted
 */
export const isConsentCategoryAccepted = (category) => {
  if (category === 'necessary') return true; // Necessary cookies always accepted
  
  const consent = localStorage.getItem('cookieConsent');
  if (consent) {
    try {
      const parsedConsent = JSON.parse(consent);
      return !!parsedConsent[category];
    } catch (e) {
      console.error('Error parsing cookie consent:', e);
      return false;
    }
  }
  return false;
};

/**
 * Save cookie preferences
 */
export const saveCookiePreferences = (accepted = true) => {
  if (accepted) {
    // Only set this for backward compatibility
    setCookie('cookie_consent', 'true', { maxAge: 86400 * 365 }); // 1 year
  } else {
    deleteCookie('cookie_consent');
  }
  
  return accepted;
};

/**
 * Reset all cookie preferences and remove cookies
 */
export const resetAllCookieConsent = () => {
  // Clear consent from localStorage
  localStorage.removeItem('cookieConsent');
  
  // Remove consent cookie
  deleteCookie('cookie_consent');
  
  // Remove Google Analytics cookies
  deleteCookie('_ga');
  deleteCookie('_gid');
  deleteCookie('_gat');
  
  // Remove Google Advertisement cookies
  deleteCookie('__gads');
  deleteCookie('__gpi');
  
  // You can add more cookies to delete here as needed
};

/**
 * Show the cookie consent banner programmatically
 */
export const showConsentBanner = () => {
  // Dispatch a custom event that your CMP component can listen for
  const event = new CustomEvent('showCookieConsentBanner');
  document.dispatchEvent(event);
};

/**
 * Add a cookie consent button to the page
 * This is useful for creating a "Cookie Settings" button in your footer
 */
export const addCookieSettingsButton = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const button = document.createElement('button');
  button.innerText = 'Cookie Settings';
  button.className = 'cookie-settings-btn';
  button.addEventListener('click', showConsentBanner);
  
  container.appendChild(button);
};

// Export a default theme for cookie consent UI
export const consentTheme = {
  primary: '#8b5cf6', // Purple to match site theme
  secondary: '#4B5563',
  text: '#FFFFFF',
  background: '#1F2937',
  borderRadius: '0.5rem',
  fontSize: '0.875rem'
};