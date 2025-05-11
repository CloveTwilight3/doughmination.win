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

import { useEffect } from 'react';

const useTheme = () => {
  // Theme is now always 'dark'
  const theme = 'dark';

  useEffect(() => {
    // Always apply dark theme
    document.documentElement.classList.add('dark');
    
    // Store dark theme in localStorage
    localStorage.setItem('theme', 'dark');
    
    // Dispatch a custom event to notify theme change
    const event = new CustomEvent('themeChanged', { detail: { theme: 'dark' } });
    document.dispatchEvent(event);
  }, []);

  // Return a dummy toggle function that doesn't do anything
  const toggleTheme = () => {
    // No operation - dark mode is permanent
  };

  return [theme, toggleTheme];
};

export default useTheme;