export function createDoughnutRain() {
  // Check if doughnut rain is already active
  if (document.getElementById('doughnut-container')) return;
  
  console.log("🍩 Doughnut rain activated! 🍩");
  
  // Create container for doughnuts
  const doughnutContainer = document.createElement('div');
  doughnutContainer.id = 'doughnut-container';
  doughnutContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(doughnutContainer);
  
  // Create doughnuts
  const doughnutCount = 100; // Number of doughnuts to create
  const doughnutDuration = 120000; // Duration in ms (2 minutes)
  
  let activeDoughnuts = 0;
  const doughnutInterval = setInterval(() => {
    if (activeDoughnuts >= doughnutCount) {
      clearInterval(doughnutInterval);
      return;
    }
    createDoughnut();
    activeDoughnuts++;
  }, 300); // Create a new doughnut every 300ms
  
  // Remove the container after 2 minutes
  setTimeout(() => {
    const container = document.getElementById('doughnut-container');
    if (container) {
      // Add fade out animation
      container.style.transition = 'opacity 1s ease-out';
      container.style.opacity = '0';
      
      // Then remove after the animation completes
      setTimeout(() => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 1000);
    }
    clearInterval(doughnutInterval);
  }, doughnutDuration);
  
  // Function to create a single falling doughnut
  function createDoughnut() {
    const doughnut = document.createElement('div');
  
    // Random position, size, and animation duration
    const size = Math.floor(Math.random() * 30) + 20; // 20-50px
    const left = Math.random() * 100; // 0-100% of screen width
    const animationDuration = Math.random() * 7 + 3; // 3-10 seconds
    const delay = Math.random() * 5; // 0-5 second delay
    const rotation = Math.random() * 360; // Random rotation 0-360 degrees
    const rotationDirection = Math.random() > 0.5 ? 1 : -1; // Random rotation direction
  
    doughnut.innerHTML = '🍩';
    doughnut.style.cssText = `
      position: absolute;
      top: -${size}px;
      left: ${left}%;
      font-size: ${size}px;
      opacity: 0.9;
      will-change: transform;
      animation: fall-${left.toFixed(0)}-${Date.now()} ${animationDuration}s ease-in ${delay}s forwards;
      text-shadow: 0 0 5px rgba(0,0,0,0.3);
      z-index: 10000;
    `;
  
    // Create the keyframe animation dynamically with a unique name
    const styleElement = document.createElement('style');
    const uniqueAnimName = `fall-${left.toFixed(0)}-${Date.now()}`;
    styleElement.textContent = `
      @keyframes ${uniqueAnimName} {
        0% { transform: translateY(0) rotate(${rotation}deg); opacity: 0.9; }
        10% { transform: translateY(10vh) rotate(${rotation + 36 * rotationDirection}deg); opacity: 0.9; }
        20% { transform: translateY(20vh) rotate(${rotation + 72 * rotationDirection}deg); opacity: 0.9; }
        30% { transform: translateY(30vh) rotate(${rotation + 108 * rotationDirection}deg); opacity: 0.9; }
        40% { transform: translateY(40vh) rotate(${rotation + 144 * rotationDirection}deg); opacity: 0.9; }
        50% { transform: translateY(50vh) rotate(${rotation + 180 * rotationDirection}deg); opacity: 0.9; }
        60% { transform: translateY(60vh) rotate(${rotation + 216 * rotationDirection}deg); opacity: 0.9; }
        70% { transform: translateY(70vh) rotate(${rotation + 252 * rotationDirection}deg); opacity: 0.9; }
        80% { transform: translateY(80vh) rotate(${rotation + 288 * rotationDirection}deg); opacity: 0.9; }
        90% { transform: translateY(90vh) rotate(${rotation + 324 * rotationDirection}deg); opacity: 0.9; }
        100% { transform: translateY(110vh) rotate(${rotation + 360 * rotationDirection}deg); opacity: 0; }
      }
    `;
    document.head.appendChild(styleElement);
  
    // Add the doughnut to the container
    doughnutContainer.appendChild(doughnut);
  
    // Remove the doughnut and style after animation completes
    setTimeout(() => {
      if (doughnut.parentNode) {
        doughnut.parentNode.removeChild(doughnut);
      }
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    }, (animationDuration + delay) * 1000);
  }
}