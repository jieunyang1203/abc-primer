// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Find the JS link
    const jsLink = document.querySelector('.js-link');
    if (!jsLink) return;
    
    // Create a global reference to track if code is displayed
    window.codeIsDisplayed = false;
    window.codeDisplay = null;
    
    // Add click handler
    jsLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Toggle code visibility
        if (window.codeIsDisplayed) {
            hideCodeDisplay();
        } else {
            displayCodeUnderLink(jsLink);
        }
    });
    
    // Listen for letter changes and update code display if visible
    document.addEventListener('letterChanged', function(event) {
        if (window.codeIsDisplayed && jsLink) {
            displayCodeUnderLink(jsLink);
        }
    });
    
    // Also listen for any navigation button clicks as a fallback
    const navButtons = document.querySelectorAll('.navigation-button, .letter');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Small delay to let the letter update first
            setTimeout(function() {
                if (window.codeIsDisplayed && jsLink) {
                    displayCodeUnderLink(jsLink);
                }
            }, 100);
        });
    });
});

// Get the current letter being displayed
function getCurrentLetter() {
    // Try to find from the active letter in the alphabet strip
    const currentLetterEl = document.querySelector('.letter.current');
    if (currentLetterEl) {
        return currentLetterEl.getAttribute('data-letter');
    }
    
    // Try to get from main letter display
    const mainLetter = document.querySelector('.main-letter');
    if (mainLetter) {
        return mainLetter.textContent.trim().charAt(0).toUpperCase();
    }
    
    return 'A'; // Default to A if we can't determine
}

// Hide the code display
function hideCodeDisplay() {
    const existingDisplay = document.getElementById('code-display');
    if (existingDisplay) {
        existingDisplay.remove();
        window.codeDisplay = null;
        window.codeIsDisplayed = false;
    }
}

// Display code under the js link button
function displayCodeUnderLink(jsLink) {
    // Get current letter
    const letter = getCurrentLetter();
    
    // Get the corresponding code
    const code = getCodeForLetter(letter);
    
    // Remove any existing code display
    hideCodeDisplay();
    
    // Get position of the js link
    const linkRect = jsLink.getBoundingClientRect();
    
    // Calculate visible screen boundaries to avoid text being cut off
    const viewportWidth = window.innerWidth;
    
    // Determine if we need to adjust position to keep text on screen
    let leftPosition = linkRect.left;
    const codeWidth = 500; // Our fixed width
    
    // If the code would extend beyond the right edge, adjust left position
    if (leftPosition + codeWidth > viewportWidth - 20) {
        leftPosition = Math.max(20, viewportWidth - codeWidth - 20);
    }
    
    // Create code container
    const codeContainer = document.createElement('div');
    codeContainer.id = 'code-display';
    codeContainer.style.position = 'absolute';
    codeContainer.style.top = (linkRect.bottom + window.scrollY + 15) + 'px'; // Added 15px top padding
    // Position directly under the js link button with adjustment to stay on screen
    codeContainer.style.left = leftPosition + 'px';
    codeContainer.style.zIndex = '999';
    codeContainer.style.backgroundColor = 'transparent';
    codeContainer.style.padding = '15px 0'; // Increased padding
    codeContainer.style.width = codeWidth + 'px'; // Fixed width
    codeContainer.style.maxHeight = 'calc(100vh - ' + (linkRect.bottom + 40) + 'px)'; // Ensure it stays on screen
    codeContainer.style.overflow = 'auto';
    codeContainer.style.textAlign = 'left';
    
    // Add title
    const title = document.createElement('div');
    title.textContent = '// ' + letter + ' - ' + getLongLetterName(letter) + ' Animation';
    title.style.fontFamily = 'test-family-light, monospace';
    title.style.fontSize = '22px';
    title.style.fontWeight = 'normal';
    title.style.marginBottom = '10px';
    title.style.color = '#000';
    title.style.textShadow = 
  '-1px -1px 1px white, ' +
  '1px -1px 1px white, ' +
  '-1px 1px 1px white, ' +
  '1px 1px 1px white, ' +
  '-2px 0 1px white, ' +
  '2px 0 1px white, ' +
  '0 -2px 1px white, ' +
  '0 2px 1px white, ' +
  '2px 2px 4px rgba(0,0,0,0.3)';
    codeContainer.appendChild(title);
    
    // Add code with styling
    const codeEl = document.createElement('pre');
    codeEl.textContent = code;
    codeEl.style.fontFamily = 'test-family-light, monospace';
    codeEl.style.fontSize = '22px';
    codeEl.style.margin = '0';
    codeEl.style.padding = '0';
    codeEl.style.backgroundColor = 'transparent';
    codeEl.style.color = '#000';
    codeEl.style.textShadow = 
  '-1px -1px 1px white, ' +
  '1px -1px 1px white, ' +
  '-1px 1px 1px white, ' +
  '1px 1px 1px white, ' +
  '-2px 0 1px white, ' +
  '2px 0 1px white, ' +
  '0 -2px 1px white, ' +
  '0 2px 1px white, ' +
  '2px 2px 4px rgba(0,0,0,0.3)';
    codeEl.style.lineHeight = '1.4';
    codeEl.style.whiteSpace = 'pre-wrap';
    codeContainer.appendChild(codeEl);
    
    // Add to document body
    document.body.appendChild(codeContainer);
    
    // Store the code display reference
    window.codeDisplay = codeContainer;
    window.codeIsDisplayed = true;
    
    // Close on escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            hideCodeDisplay();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Get the full name for a letter
function getLongLetterName(letter) {
    const names = {
        'A': 'Acceleration',
        'B': 'Balance',
        'C': 'Conversion',
        'D': 'Density',
        'E': 'Equilibrium',
        'F': 'Friction',
        'G': 'Gravity',
        'H': 'Harmonic',
        'I': 'Inertia',
        'J': 'Joule',
        'K': 'Kinetic',
        'L': 'Luminosity',
        'M': 'Momentum',
        'N': 'Neutron',
        'O': 'Oscillation',
        'P': 'Potential',
        'Q': 'Quantum',
        'R': 'Resonance',
        'S': 'Symmetry',
        'T': 'Thermal',
        'U': 'Uncertainty',
        'V': 'Voltage',
        'W': 'Wave',
        'X': 'X-ray',
        'Y': 'Yield',
        'Z': 'Zero Point'
    };
    
    return names[letter] || letter;
}

// Get animation code for a specific letter
function getCodeForLetter(letter) {
    // Simple code examples for all 26 letters
    const codes = {
        'A': 'function initAccelerationAnimation() {\n' +
             '  const { splitText, chars } = createSplitTextAnimation();\n' +
             '  \n' +
             '  // Get slider position for acceleration value\n' +
             '  let accelerationRate = 0.05 + getSliderValue() * 0.5;\n' +
             '  \n' +
             '  // Define horizontal movement range (in pixels)\n' +
             '  const minX = -80;\n' +
             '  const maxX = 80;\n' +
             '  \n' +
             '  // Create master timeline\n' +
             '  const masterTl = gsap.timeline({\n' +
             '    repeat: -1,\n' +
             '    onUpdate: function() {\n' +
             '      // Update acceleration rate based on current slider position\n' +
             '      accelerationRate = 0.05 + getSliderValue() * 0.5;\n' +
             '    }\n' +
             '  });\n' +
             '  \n' +
             '  // Set initial position\n' +
             '  gsap.set(chars, { x: 0, y: 0 });\n' +
             '  \n' +
             '  // Create the symmetrical horizontal movement animation\n' +
             '  function createSymmetricalMotion() {\n' +
             '    const tl = gsap.timeline();\n' +
             '    const staggerTime = 0.04;\n' +
             '    \n' +
             '    // Right movement with acceleration\n' +
             '    tl.to(chars, {\n' +
             '      x: maxX,\n' +
             '      duration: 0.8,\n' +
             '      stagger: staggerTime,\n' +
             '      ease: "power3.in" // Acceleration curve\n' +
             '    });\n' +
             '    \n' +
             '    // Left movement with acceleration\n' +
             '    tl.to(chars, {\n' +
             '      x: minX,\n' +
             '      duration: 0.8,\n' +
             '      stagger: staggerTime,\n' +
             '      ease: "power3.in" // Acceleration curve\n' +
             '    });\n' +
             '    \n' +
             '    // Return to center\n' +
             '    tl.to(chars, {\n' +
             '      x: 0,\n' +
             '      duration: 0.5,\n' +
             '      stagger: staggerTime,\n' +
             '      ease: "back.out(1.2)" // Add a slight bounce\n' +
             '    });\n' +
             '    \n' +
             '    return tl;\n' +
             '  }\n' +
             '  \n' +
             '  // Add the symmetrical motion to the master timeline\n' +
             '  masterTl.add(createSymmetricalMotion());\n' +
             '  \n' +
             '  return masterTl;\n' +
             '}',

        'B': 'function initBalanceAnimation() {\n' +
             '  const { splitText, chars } = createSplitTextAnimation();\n' +
             '  \n' +
             '  // Set initial rotation and position\n' +
             '  gsap.set(chars, { rotation: 0, y: 0, transformOrigin: "bottom center" });\n' +
             '  \n' +
             '  // Define the max rotation angles (in degrees)\n' +
             '  const baseMaxRotation = 30; // Base maximum rotation (no cursor)\n' +
             '  const cursorMaxRotation = 45; // Maximum rotation with cursor influence\n' +
             '  \n' +
             '  // Create the continuous swaying timeline\n' +
             '  const baseTl = gsap.timeline({\n' +
             '    repeat: -1,\n' +
             '    yoyo: true\n' +
             '  });\n' +
             '  \n' +
             '  // Continuous side-to-side swaying\n' +
             '  baseTl.to(chars, {\n' +
             '    rotation: -15,\n' +
             '    duration: 1.5,\n' +
             '    ease: "sine.inOut",\n' +
             '    stagger: 0.08\n' +
             '  });\n' +
             '  \n' +
             '  baseTl.to(chars, {\n' +
             '    rotation: 15,\n' +
             '    duration: 1.5,\n' +
             '    ease: "sine.inOut",\n' +
             '    stagger: 0.08\n' +
             '  });\n' +
             '  \n' +
             '  // Use slider to control the balance stability\n' +
             '  const sliderValue = getSliderValue();\n' +
             '  const stabilityFactor = 0.5 + sliderValue * 2; // 0.5 to 2.5\n' +
             '  \n' +
             '  baseTl.timeScale(1 / stabilityFactor); // Slower with more stability\n' +
             '  \n' +
             '  return baseTl;\n' +
             '}',

        'C': 'function initConversionAnimation() {\n' +
             '  const { splitText, chars } = createSplitTextAnimation();\n' +
             '  \n' +
             '  // For "Conversion" - animate changing from one form to another\n' +
             '  // Set initial state\n' +
             '  gsap.set(chars, { \n' +
             '    transformOrigin: "center center",\n' +
             '    scale: 1,\n' +
             '    rotation: 0,\n' +
             '    opacity: 1,\n' +
             '    color: "#000000"\n' +
             '  });\n' +
             '  \n' +
             '  // Create conversion cycle animation\n' +
             '  const tl = gsap.timeline({ repeat: -1 });\n' +
             '  \n' +
             '  // Cycle through color/brightness\n' +
             '  // Blue state\n' +
             '  tl.to(chars, {\n' +
             '    scale: 1.2,\n' +
             '    rotation: 45,\n' +
             '    opacity: 0.8,\n' +
             '    color: "#46EAFF",\n' +
             '    duration: 1.5,\n' +
             '    ease: "power1.inOut",\n' +
             '    stagger: 0.1\n' +
             '  });\n' +
             '  \n' +
             '  // Red state\n' +
             '  tl.to(chars, {\n' +
             '    scale: 0.8,\n' +
             '    rotation: -20,\n' +
             '    opacity: 0.9,\n' +
             '    color: "#FF565B",\n' +
             '    duration: 1.5,\n' +
             '    ease: "power1.inOut",\n' +
             '    stagger: 0.1\n' +
             '  });\n' +
             '  \n' +
             '  // Green state\n' +
             '  tl.to(chars, {\n' +
             '    scale: 1.1,\n' +
             '    rotation: 10,\n' +
             '    opacity: 1,\n' +
             '    color: "#B6FF67",\n' +
             '    duration: 1.5,\n' +
             '    ease: "power1.inOut",\n' +
             '    stagger: 0.1\n' +
             '  });\n' +
             '  \n' +
             '  // Back to original\n' +
             '  tl.to(chars, {\n' +
             '    scale: 1,\n' +
             '    rotation: 0,\n' +
             '    opacity: 1,\n' +
             '    color: "#000000",\n' +
             '    duration: 1.5,\n' +
             '    ease: "power1.inOut",\n' +
             '    stagger: 0.1\n' +
             '  });\n' +
             '  \n' +
             '  return tl;\n' +
             '}'
    };
    
    // Add the rest of the letters with simplified default code
    for (let i = 68; i <= 90; i++) { // D(68) to Z(90)
        const letterChar = String.fromCharCode(i);
        if (!codes[letterChar]) {
            const name = getLongLetterName(letterChar);
            codes[letterChar] = 'function init' + name + 'Animation() {\n' +
                 '  // Animation code for ' + name + '\n' +
                 '  const { splitText, chars } = createSplitTextAnimation();\n' +
                 '  \n' +
                 '  // Set initial state\n' +
                 '  gsap.set(chars, { \n' +
                 '    transformOrigin: "center center",\n' +
                 '    scale: 1,\n' +
                 '    x: 0,\n' +
                 '    y: 0\n' +
                 '  });\n' +
                 '  \n' +
                 '  // Create animation timeline\n' +
                 '  const tl = gsap.timeline({ repeat: -1 });\n' +
                 '  \n' +
                 '  // Basic animation example\n' +
                 '  tl.to(chars, {\n' +
                 '    y: -20,\n' +
                 '    duration: 1,\n' +
                 '    stagger: 0.1,\n' +
                 '    ease: "power1.inOut"\n' +
                 '  });\n' +
                 '  \n' +
                 '  tl.to(chars, {\n' +
                 '    y: 20,\n' +
                 '    duration: 1,\n' +
                 '    stagger: 0.1,\n' +
                 '    ease: "power1.inOut"\n' +
                 '  });\n' +
                 '  \n' +
                 '  tl.to(chars, {\n' +
                 '    y: 0,\n' +
                 '    duration: 1,\n' +
                 '    stagger: 0.1,\n' +
                 '    ease: "power1.inOut"\n' +
                 '  });\n' +
                 '  \n' +
                 '  return tl;\n' +
                 '}';
        }
    }
    
    return codes[letter] || '// No animation code available for letter ' + letter;
}