export function addConfetti() {
  // Add CSS for confetti
  const style = document.createElement('style');
  style.id = 'confetti-style';
  style.textContent = `
    @keyframes confetti-fall {
      0% { transform: translateY(0) rotate(0deg); }
      100% { transform: translateY(100vh) rotate(360deg); }
    }
    
    .confetti {
      position: fixed;
      width: 10px;
      height: 10px;
      background-color: #f00;
      top: -10px;
      z-index: 999;
      animation: confetti-fall linear forwards;
    }
  `;
  document.head.appendChild(style);
  
  // Create confetti pieces
  const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
  const container = document.createElement('div');
  container.id = 'confetti-container';
  document.body.appendChild(container);
  
  // Create 100 confetti pieces
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      container.appendChild(confetti);
      
      // Remove confetti after animation
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }, i * 100);
  }
}

export function addSnowflakes() {
  // Add snowflake CSS
  const style = document.createElement('style');
  style.id = 'snowflake-style';
  style.textContent = `
    .snowflake {
      position: fixed;
      top: -10px;
      z-index: 999;
      color: #fff;
      text-shadow: 0 0 5px rgba(255,255,255,0.7);
      animation: snowfall linear forwards;
    }
    
    @keyframes snowfall {
      0% { transform: translateY(0) rotate(0deg); }
      100% { transform: translateY(100vh) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  // Create snowflake container
  const container = document.createElement('div');
  container.id = 'snowflake-container';
  document.body.appendChild(container);
  
  // Create snowflakes
  const snowflakeChars = ['❄', '❅', '❆', '✻', '✼', '❊'];
  
  // Start creating snowflakes
  const snowflakeInterval = setInterval(() => {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.style.left = `${Math.random() * 100}%`;
    snowflake.style.fontSize = `${Math.random() * 20 + 10}px`;
    snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
    snowflake.innerHTML = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
    container.appendChild(snowflake);
    
    // Remove snowflake after animation
    setTimeout(() => {
      snowflake.remove();
    }, 10000);
  }, 300);
  
  // Store interval ID in a data attribute to clear it later
  container.dataset.intervalId = snowflakeInterval;
}

export function addFireworks() {
  // Add fireworks CSS
  const style = document.createElement('style');
  style.id = 'fireworks-style';
  style.textContent = `
    @keyframes firework-explosion {
      0% { transform: translate(0, 0); opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
    }
    
    .firework-particle {
      position: absolute;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      animation: firework-explosion 0.8s forwards;
    }
  `;
  document.head.appendChild(style);
  
  // Create container
  const container = document.createElement('div');
  container.id = 'fireworks-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 999;
  `;
  document.body.appendChild(container);
  
  // Launch fireworks every few seconds
  const fireworksInterval = setInterval(launchFirework, 2000);
  container.dataset.intervalId = fireworksInterval;
  
  function launchFirework() {
    // Random position for the firework
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight;
    
    // Create the firework "shell"
    const shell = document.createElement('div');
    shell.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 5px;
      height: 5px;
      background-color: white;
      border-radius: 50%;
    `;
    container.appendChild(shell);
    
    // Animate the shell going up
    const targetY = Math.random() * (window.innerHeight * 0.5) + 100;
    shell.animate(
      [
        { transform: 'translateY(0)' },
        { transform: `translateY(-${targetY}px)` }
      ],
      {
        duration: 1000,
        easing: 'ease-out'
      }
    ).onfinish = () => {
      // Remove the shell
      shell.remove();
      
      // Create the explosion
      createExplosion(x, y - targetY);
    };
  }
  
  function createExplosion(x, y) {
    // Random color for this explosion
    const colors = [
      '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
      '#ff00ff', '#00ffff', '#ff8800', '#ff0088'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Create particles
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.backgroundColor = color;
      
      // Random direction for each particle
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      
      container.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 800);
    }
  }
}