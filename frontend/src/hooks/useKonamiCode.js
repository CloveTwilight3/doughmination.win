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
      // Prevent default for arrow keys to avoid scrolling
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
      }
      
      // Get the key that was pressed
      const key = e.key;
      console.log('Key pressed:', key, 'Expected:', konamiCode[konamiIndex]);
      
      // Check if the key matches the next key in the Konami Code
      const requiredKey = konamiCode[konamiIndex];
      
      if (key.toLowerCase() === requiredKey.toLowerCase()) {
        // Move to the next key in the sequence
        konamiIndex++;
        console.log('Matched! New index:', konamiIndex);
        
        // If the full sequence is completed
        if (konamiIndex === konamiCode.length) {
          // Reset the index for next time
          konamiIndex = 0;
          console.log('KONAMI CODE ACTIVATED!');
          
          // Execute the callback function
          callback();
        }
      } else {
        // If wrong key, reset the sequence
        konamiIndex = 0;
        console.log('Sequence reset');
      }
    }
    
    // Add event listener for keydown events
    document.addEventListener("keydown", handleKeyDown);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [callback]);
}