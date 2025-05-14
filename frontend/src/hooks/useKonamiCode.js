import { useEffect } from 'react';

export default function useKonamiCode(callback) {
  useEffect(() => {
    // The Konami Code sequence
    const konamiCode = [
      "ArrowUp", "ArrowUp", 
      "ArrowDown", "ArrowDown", 
      "ArrowLeft", "ArrowRight", 
      "ArrowLeft", "ArrowRight", 
      "b", "a"
    ];
    
    let konamiIndex = 0;
    
    function handleKeyDown(e) {
      // Get the key that was pressed
      const key = e.key;
      
      // Check if the key matches the next key in the Konami Code
      const requiredKey = konamiCode[konamiIndex];
      
      if (key.toLowerCase() === requiredKey.toLowerCase()) {
        // Move to the next key in the sequence
        konamiIndex++;
        
        // If the full sequence is completed
        if (konamiIndex === konamiCode.length) {
          // Reset the index for next time
          konamiIndex = 0;
          
          // Execute the callback function
          callback();
        }
      } else {
        // If wrong key, reset the sequence
        konamiIndex = 0;
      }
    }
    
    // Add event listener for keydown events
    window.addEventListener("keydown", handleKeyDown);
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [callback]);
}