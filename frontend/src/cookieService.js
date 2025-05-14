// cookieService.js
/**
 * Set a cookie with the given name, value and options
 */
export const setCookie = (name, value, options = {}) => {
  const defaults = {
    path: '/',
    maxAge: 86400 * 30, // 30 days in seconds
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
  return localStorage.getItem('cookiesAccepted') === 'true';
};

/**
 * Save cookie preferences
 */
export const saveCookiePreferences = (accepted = true) => {
  localStorage.setItem('cookiesAccepted', accepted.toString());
  
  // Set a cookie to track consent as well (for server-side verification if needed)
  if (accepted) {
    setCookie('cookie_consent', 'true', { maxAge: 86400 * 365 }); // 1 year
  } else {
    deleteCookie('cookie_consent');
  }
  
  return accepted;
};