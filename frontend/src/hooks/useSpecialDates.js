import { useEffect } from 'react';
import { specialDates } from '../data/specialDates';
import { 
  addConfetti, 
  addSnowflakes, 
  addFireworks 
} from '../effects/seasonalEffects';

export default function useSpecialDates() {
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-11 (Jan-Dec)
    const day = now.getDate(); // 1-31
    
    let hasActiveDateFound = false;
    
    // Function to apply special effects - wrapped to handle timing
    const applyEffectsWhenReady = () => {
      const specialDateContainer = document.getElementById('special-date-container');
      
      if (!specialDateContainer) {
        // If container doesn't exist yet, try again after a short delay
        console.log('Special date container not found, retrying...');
        setTimeout(applyEffectsWhenReady, 100);
        return;
      }
      
      // Check for matching dates
      for (const specialDate of specialDates) {
        if (month === specialDate.month && 
            (day === specialDate.day || (specialDate.duration && day >= specialDate.day && day < specialDate.day + specialDate.duration))) {
          
          // Mark that we found an active date
          hasActiveDateFound = true;
          
          // Apply the effect based on the type
          applySpecialEffect(specialDate, specialDateContainer);
        }
      }
    };
    
    // Function to apply the special effect
    function applySpecialEffect(dateInfo, container) {
      // Create banner notification
      const banner = document.createElement('div');
      banner.id = `special-date-${dateInfo.id}`;
      banner.className = 'special-date-banner';
      banner.innerText = dateInfo.message;
      
      // Add general banner styling from CSS classes
      banner.classList.add('special-date-banner');
      
      // Add effect-specific classes
      banner.classList.add(`${dateInfo.effect}-banner`);
      
      // Style the banner based on the effect
      switch (dateInfo.effect) {
        case 'birthday':
          // Add body class
          document.body.classList.add('birthday-theme');
          
          // Add confetti effect for birthdays
          addConfetti();
          break;
          
        case 'halloween':
          document.body.classList.add('halloween-theme');
          break;
          
        case 'christmas':
          document.body.classList.add('christmas-theme');
          
          // Add snow effect
          addSnowflakes();
          break;
          
        case 'new-year':
          document.body.classList.add('new-year-theme');
          
          // Add fireworks effect
          addFireworks();
          break;
          
        case 'pride':
          document.body.classList.add('pride-theme');
          break;
      }
      
      // Add the banner if it doesn't already exist
      if (!document.getElementById(banner.id)) {
        container.appendChild(banner);
        
        // Make the banner closable
        banner.addEventListener('click', () => {
          banner.style.display = 'none';
        });
      }
    }
    
    // Start the process
    applyEffectsWhenReady();
    
    // Cleanup function
    return () => {
      // Remove any special effects when component unmounts
      const confettiContainer = document.getElementById('confetti-container');
      if (confettiContainer) confettiContainer.remove();
      
      const snowflakeContainer = document.getElementById('snowflake-container');
      if (snowflakeContainer) {
        clearInterval(parseInt(snowflakeContainer.dataset.intervalId));
        snowflakeContainer.remove();
      }
      
      const fireworksContainer = document.getElementById('fireworks-container');
      if (fireworksContainer) {
        clearInterval(parseInt(fireworksContainer.dataset.intervalId));
        fireworksContainer.remove();
      }
      
      // Remove style elements
      const styleIds = ['confetti-style', 'snowflake-style', 'fireworks-style'];
      styleIds.forEach(id => {
        const style = document.getElementById(id);
        if (style) style.remove();
      });
      
      // Remove special theme classes
      document.body.classList.remove(
        'birthday-theme',
        'halloween-theme', 
        'christmas-theme', 
        'new-year-theme',
        'pride-theme'
      );
    };
  }, []);
  
  // Return whether there's an active special date
  return { 
    hasActiveSpecialDate: document.querySelector('.special-date-banner') !== null 
  };
}