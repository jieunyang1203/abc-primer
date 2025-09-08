document.addEventListener('DOMContentLoaded', function() {
    // Alphabet content data - expanded with all physics concepts
    const alphabetData = [
        { letter: 'A', word: 'Acceleration', description: 'Objects gain velocity over time' },
        { letter: 'B', word: 'Balance', description: 'Equal distribution of energy' },
        { letter: 'C', word: 'Conversion', description: 'Energy changing from one form to another' },
        { letter: 'D', word: 'Density', description: 'Mass per unit of volume' },
        { letter: 'E', word: 'Equilibrium', description: 'State of balanced opposing forces' },
        { letter: 'F', word: 'Friction', description: 'Resistance encountered when moving' },
        { letter: 'G', word: 'Gravity', description: 'Force that attracts objects toward each other' },
        { letter: 'H', word: 'Harmonic', description: 'Repeating patterns of vibration' },
        { letter: 'I', word: 'Inertia', description: 'Resistance to change in motion' },
        { letter: 'J', word: 'Joule', description: 'Unit of energy or work' },
        { letter: 'K', word: 'Kinetic', description: 'Energy of motion' },
        { letter: 'L', word: 'Luminosity', description: 'Emission of visible light' },
        { letter: 'M', word: 'Momentum', description: 'Product of mass and velocity' },
        { letter: 'N', word: 'Neutron', description: 'Particle with no electric charge' },
        { letter: 'O', word: 'Oscillation', description: 'Regular variation in position' },
        { letter: 'P', word: 'Potential', description: 'Stored energy due to position' },
        { letter: 'Q', word: 'Quantum', description: 'Discrete packet of energy' },
        { letter: 'R', word: 'Resonance', description: 'Amplification at specific frequencies' },
        { letter: 'S', word: 'Symmetry', description: 'Balance across an axis or point' },
        { letter: 'T', word: 'Thermal', description: 'Energy related to temperature' },
        { letter: 'U', word: 'Uncertainty', description: 'Limits on measurement precision' },
        { letter: 'V', word: 'Voltage', description: 'Electric potential visualization' },
        { letter: 'W', word: 'Wave', description: 'Disturbance traveling through medium' },
        { letter: 'X', word: 'X-ray', description: 'High-energy electromagnetic radiation' },
        { letter: 'Y', word: 'Yield', description: 'Energy released in a process' },
        { letter: 'Z', word: 'Zero point', description: 'Lowest possible energy state' }
    ];

    // DOM elements
    // DOM elements
    const mainLetter = document.querySelector('.main-letter');
    const letterWord = document.querySelector('.letter-word');
    const concept = document.querySelector('.concept');
    const counter = document.querySelector('.counter');
    const prevButton = document.querySelector('.nav-text-button.prev');  // FIXED CLASS
    const nextButton = document.querySelector('.nav-text-button.next');  // FIXED CLASS
    const letters = document.querySelectorAll('.alphabet-strip .letter');
    const sliderThumb = document.querySelector('.slider-thumb');
    
    // Current letter index and animation state
    let currentIndex = 0;
    let currentAnimation = null;
    
    // Mouse position tracking for cursor interaction
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorInfluence = 0;
    
    // Update mouse position globally to be used by all animations
    // Optimized with throttling for better performance
    let mouseUpdateScheduled = false;
    function updateMousePosition(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Throttle the expensive calculations using RAF
        if (!mouseUpdateScheduled) {
            mouseUpdateScheduled = true;
            requestAnimationFrame(() => {
                // Calculate distance to letter
                const letterBounds = mainLetter.getBoundingClientRect();
                const letterCenterX = letterBounds.left + letterBounds.width / 2;
                const letterCenterY = letterBounds.top + letterBounds.height / 2;
                
                // Calculate horizontal and vertical distance
                const dx = mouseX - letterCenterX;
                const dy = mouseY - letterCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Influence range - stronger when cursor is closer
                const influenceRange = letterBounds.width * 1.5;
                cursorInfluence = 1 - Math.min(1, distance / influenceRange);
                
                mouseUpdateScheduled = false;
            });
        }
    }
    
    // Add global mousemove event listener with passive option for better performance
    document.addEventListener('mousemove', updateMousePosition, { passive: true });
    
    // Function to update the display with current letter data
    function updateDisplay(index) {
        const data = alphabetData[index];
        
        // If switching letters, clear current animation
        if (currentIndex !== index) {
            clearCurrentAnimation();
        }
        
        // Update main content
        mainLetter.textContent = data.letter;
        letterWord.textContent = data.word;
        concept.textContent = data.description;
        counter.textContent = `${index + 1}/26`;
        
        // Update alphabet strip highlight
letters.forEach(letterEl => {
    letterEl.classList.remove('current');
    // Make sure each letter just shows the letter itself
    letterEl.textContent = letterEl.getAttribute('data-letter');
});

// Just add the current class without changing the content or adding parentheses
letters[index].classList.add('current');
        
        // Update slider position with GSAP for smooth animation
// Add 15px margins at each end of the track
const trackWidth = document.querySelector('.slider-track').offsetWidth;
const startMargin = 45; // 45px from the left edge
const endMargin = trackWidth + 2; // -2px from the right edge
const usableTrackWidth = endMargin - startMargin;

const actualPosition = index / (alphabetData.length - 1);
const thumbPosition = startMargin + (actualPosition * usableTrackWidth);

gsap.to(sliderThumb, {
    left: thumbPosition,
    duration: 0.3,
    ease: "power2.out"
});
        
        // Update current index
        currentIndex = index;
        
        // Initialize the appropriate animation based on the letter
        initAnimation(data.letter);
        
        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('letterChanged', { 
            detail: { letter: data.letter, word: data.word } 
        }));
    }
    
    // Clear any current animation
    function clearCurrentAnimation() {
        if (currentAnimation) {
            currentAnimation.kill();
            currentAnimation = null;
        }
        
        // Clean up any event listeners
        document.removeEventListener('mousemove', updateMousePosition);
        
        // Re-add the global mouse position tracker with passive option
        document.addEventListener('mousemove', updateMousePosition, { passive: true });
    }
    
    // Helper function to create split text animation
    function createSplitTextAnimation(letter) {
        let splitText;
        let chars;
        
        if (window.SplitText) {
            splitText = new SplitText(mainLetter, {type: "chars"});
            chars = splitText.chars;
        } else {
            // Fallback if SplitText isn't available
            chars = [mainLetter];
        }
        
        return {
            splitText: splitText,
            chars: chars
        };
    }
    
    // Helper function to get slider value (0-1)
    function getSliderValue() {
        const sliderTrack = document.querySelector('.slider-track');
        const thumbRect = sliderThumb.getBoundingClientRect();
        const trackRect = sliderTrack.getBoundingClientRect();
        return (thumbRect.left + thumbRect.width/2 - trackRect.left) / trackRect.width;
    }
    
    // Animation functions for each letter
    const animationFunctions = {
        A: initAccelerationAnimation,
        B: initBalanceAnimation,
        C: initConversionAnimation,
        D: initDensityAnimation,
        E: initEquilibriumAnimation,
        F: initFrictionAnimation,
        G: initGravityAnimation,
        H: initHarmonicAnimation,
        I: initInertiaAnimation,
        J: initJouleAnimation,
        K: initKineticAnimation,
        L: initLuminosityAnimation,
        M: initMomentumAnimation,
        N: initNeutronAnimation,
        O: initOscillationAnimation,
        P: initPotentialAnimation,
        Q: initQuantumAnimation,
        R: initResonanceAnimation,
        S: initSymmetryAnimation,
        T: initThermalAnimation,
        U: initUncertaintyAnimation,
        V: initVoltageAnimation,
        W: initWaveAnimation,
        X: initXrayAnimation,
        Y: initYieldAnimation,
        Z: initZeroPointAnimation
    };
    
    // Initialize animation based on letter
    function initAnimation(letter) {
        const animationFunction = animationFunctions[letter];
        
        if (animationFunction) {
            animationFunction();
        } else {
            // Default subtle animation
            const tl = gsap.timeline();
            tl.fromTo(mainLetter, {
                scale: 0.95,
                opacity: 0.8
            }, {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                ease: "elastic.out(1, 0.3)"
            });
            currentAnimation = tl;
        }
    }
    
    // A - Acceleration Animation
function initAccelerationAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Get slider position for acceleration value - INCREASED base and multiplier
    let accelerationRate = 0.2 + getSliderValue() * 0.8;
    
    // Define horizontal movement range (in pixels) - INCREASED for wider spread
    const minX = -150;
    const maxX = 150;
    
    // Create master timeline with FASTER repeat
    const masterTl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.3, // Shorter delay between repeats
        onUpdate: function() {
            // Update acceleration rate based on current slider position
            accelerationRate = 0.2 + getSliderValue() * 0.8;
        }
    });
    
    // Set initial position
    gsap.set(chars, { x: 0, y: 0 });
    
    // ENHANCED cursor interaction variables
    const cursorInfluenceRadius = 200; // Pixels within which cursor has effect
    const maxCursorForce = 40; // Maximum pixels of movement from cursor
    
    // Track cursor position globally
    let mouseX = 0;
    let mouseY = 0;
    
    // Update mouse position on move
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Apply immediate reaction to cursor proximity
        if (chars) {
            applyDirectCursorInfluence(0.5); // Pass strength factor
        }
    });
    
    // Function for direct cursor influence
    function applyDirectCursorInfluence(strengthFactor = 1) {
        chars.forEach((char) => {
            if (!char._gsap) return;
            
            // Get character position
            const charRect = char.getBoundingClientRect();
            const charCenterX = charRect.left + charRect.width / 2;
            const charCenterY = charRect.top + charRect.height / 2;
            
            // Calculate distance from cursor to character
            const distX = mouseX - charCenterX;
            const distY = mouseY - charCenterY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            // Only affect characters within influence radius
            if (distance < cursorInfluenceRadius) {
                // Closer = stronger effect (inverse relationship)
                const influence = (1 - distance / cursorInfluenceRadius) * strengthFactor;
                
                // Repel from cursor (or attract based on preference)
                const repelStrength = maxCursorForce * influence;
                const angleRad = Math.atan2(distY, distX);
                
                // Calculate new target position (repelling away from cursor)
                const repelX = -Math.cos(angleRad) * repelStrength;
                const repelY = -Math.sin(angleRad) * repelStrength;
                
                // Constrain horizontal movement to our bounds
                const currentX = gsap.getProperty(char, "x");
                let newTargetX = currentX + repelX;
                newTargetX = Math.max(minX, Math.min(maxX, newTargetX));
                
                // Apply the movement with faster animation
                gsap.to(char, {
                    x: newTargetX,
                    y: repelY, // Allow some vertical movement for more dynamic effect
                    duration: 0.15, // Faster reaction
                    overwrite: "auto",
                    ease: "power2.out"
                });
            }
        });
    }
    
    // Create the symmetrical horizontal movement animation - FASTER
    function createSymmetricalMotion() {
        const tl = gsap.timeline();
        const staggerTime = 0.04; // FASTER stagger
        
        // Right movement with acceleration - FASTER
        tl.to(chars, {
            x: maxX,
            duration: 0.8, // Faster movement
            stagger: staggerTime,
            ease: "power3.in", // Stronger acceleration curve
            onUpdate: function() {
                // Apply constant cursor influence during animation
                applyDirectCursorInfluence(0.7);
            }
        });
        
        // Left movement with acceleration - FASTER
        tl.to(chars, {
            x: minX,
            duration: 0.8, // Faster movement
            stagger: staggerTime,
            ease: "power3.in", // Stronger acceleration curve
            onUpdate: function() {
                // Apply constant cursor influence during animation
                applyDirectCursorInfluence(0.7);
            }
        });
        
        // Return to center - FASTER
        tl.to(chars, {
            x: 0,
            y: 0, // Reset vertical position too
            duration: 0.5, // Faster return
            stagger: staggerTime,
            ease: "back.out(1.2)" // Add a slight bounce for more dynamic feel
        });
        
        return tl;
    }
    
    // Add the symmetrical motion to the master timeline
    masterTl.add(createSymmetricalMotion());
    
    // ENHANCED hover events for more dramatic reaction
    mainLetter.addEventListener('mouseenter', function() {
        // Create a stronger burst of speed/jitter when hovering
        gsap.to(chars, {
            x: i => (Math.random() - 0.5) * 200, // More dramatic random movement
            y: i => (Math.random() - 0.5) * 50,  // Add some vertical jitter
            rotation: i => (Math.random() - 0.5) * 20, // Add rotation for chaos
            duration: 0.4,
            stagger: 0.02, // Quick succession
            ease: "power2.out",
            onComplete: function() {
                // Return to normal pattern after the burst
                gsap.to(chars, {
                    y: 0,
                    rotation: 0,
                    duration: 0.5,
                    stagger: 0.03,
                    ease: "elastic.out(1, 0.3)"
                });
            }
        });
    });
    
    // Add a mouseleave handler to restore order when cursor leaves
    mainLetter.addEventListener('mouseleave', function() {
        gsap.to(chars, {
            y: 0,
            rotation: 0,
            duration: 0.7,
            stagger: 0.02,
            ease: "back.out(1.7)"
        });
    });
    
    // Store current animation for later cleanup
    currentAnimation = masterTl;
    
    // Clean up event listeners when animation is killed
    const mouseListener = document.addEventListener('mousemove', function() {});
    
    masterTl.eventCallback("onKill", function() {
        mainLetter.removeEventListener('mouseenter', function() {});
        mainLetter.removeEventListener('mouseleave', function() {});
        document.removeEventListener('mousemove', mouseListener);
        
        if (splitText) {
            splitText.revert();
        }
    });
}
    // B - Balance Animation
function initBalanceAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Create a "balance beam" effect where the letter constantly sways and responds to cursor
    
    // Set initial rotation and position
    gsap.set(chars, { rotation: 0, y: 0, transformOrigin: "bottom center" });
    
    // Define the max rotation angles (in degrees)
    const baseMaxRotation = 30; // Base maximum rotation (no cursor)
    const cursorMaxRotation = 45; // Maximum rotation with cursor influence
    
    // Create the continuous swaying timeline (independent of cursor)
    const baseTl = gsap.timeline({
        repeat: -1,
        yoyo: true
    });
    
    // Continuous side-to-side swaying (will run regardless of cursor position)
    baseTl.to(chars, {
        rotation: -15,
        duration: 1.5,
        ease: "sine.inOut",
        stagger: 0.08
    });
    
    baseTl.to(chars, {
        rotation: 15,
        duration: 1.5,
        ease: "sine.inOut",
        stagger: 0.08
    });
    
    // Secondary swaying pattern for visual interest
    baseTl.to(chars, {
        rotation: -12,
        duration: 1.2,
        ease: "sine.inOut",
        stagger: 0.1
    });
    
    baseTl.to(chars, {
        rotation: 12,
        duration: 1.2,
        ease: "sine.inOut", 
        stagger: 0.1
    });
    
    // Create a separate timeline for cursor-influenced movements
    const cursorTl = gsap.timeline({
        paused: true, // This timeline only plays when cursor moves
        onUpdate: function() {
            if (cursorInfluence > 0.1) {
                // Calculate tilt based on cursor horizontal position
                const letterRect = mainLetter.getBoundingClientRect();
                const letterCenterX = letterRect.left + letterRect.width / 2;
                
                // Map mouse position to rotation angle
                const distanceFromCenter = mouseX - letterCenterX;
                const maxDistance = letterRect.width * 1.5; // Extended range
                const tiltFactor = Math.min(1, Math.abs(distanceFromCenter) / maxDistance);
                const tiltDirection = distanceFromCenter > 0 ? 1 : -1;
                
                // Calculate additional rotation from cursor
                const cursorRotation = tiltDirection * tiltFactor * cursorMaxRotation * cursorInfluence;
                
                // Get the current base rotation
                const baseRotation = getBaseRotation();
                
                // Apply combined rotation (base + cursor influence)
                gsap.to(chars, {
                    rotation: baseRotation + cursorRotation,
                    duration: 0.4,
                    ease: "power2.out",
                    stagger: 0.05
                });
                
                // Move Y position to simulate gravity
                const yOffset = 15 * tiltFactor * cursorInfluence;
                chars.forEach((char, index) => {
                    const charRect = char.getBoundingClientRect();
                    const charCenterX = charRect.left + charRect.width / 2;
                    const distanceFromCharCenter = mouseX - charCenterX;
                    const charTiltDirection = distanceFromCharCenter > 0 ? 1 : -1;
                    
                    // Small horizontal shift
                    const xOffset = 3 * charTiltDirection * tiltFactor;
                    
                    gsap.to(char, {
                        y: charTiltDirection * yOffset,
                        x: xOffset,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });
            }
        }
    });
    
    // Helper function to get the current base rotation from the base timeline
    function getBaseRotation() {
        // Get the current progress of the base timeline
        const progress = baseTl.progress();
        
        // Approximate the current rotation based on timeline progress
        // This is a simplified estimation that works for our continuous sway pattern
        return Math.sin(progress * Math.PI * 2) * 15;
    }
    
    // Create slider influence
    const sliderValue = getSliderValue();
    // Slider affects the balance stability - higher values make it more stable
    const stabilityFactor = 0.5 + sliderValue * 2; // 0.5 to 2.5
    
    baseTl.timeScale(1 / stabilityFactor); // Slower with more stability
    
    // Track mouse movement
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Ensure the cursor timeline is running
        cursorTl.progress(0).play();
    });
    
    // Add mouseenter event for more dramatic balancing effect
    mainLetter.addEventListener('mouseenter', function() {
        // Pause the base animation briefly
        const currentProgress = baseTl.progress();
        baseTl.pause();
        
        // Create an imbalance when hovering directly over the letter
        const randomDirection = Math.random() > 0.5 ? 1 : -1;
        
        gsap.to(chars, {
            rotation: randomDirection * cursorMaxRotation,
            duration: 0.5,
            ease: "power2.inOut",
            stagger: 0.08,
            onComplete: function() {
                // Try to restore balance
                gsap.to(chars, {
                    rotation: -randomDirection * cursorMaxRotation * 0.7,
                    duration: 0.8,
                    ease: "elastic.out(1, 0.3)",
                    stagger: 0.08,
                    onComplete: function() {
                        // Resume the base animation
                        baseTl.progress(currentProgress).play();
                    }
                });
            }
        });
    });
    
    // Add mouseleave handler
    mainLetter.addEventListener('mouseleave', function() {
        // Return to base animation without cursor influence
        gsap.to(chars, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.4)",
            stagger: 0.05
        });
    });
    
    // Store current animation for later cleanup
    currentAnimation = baseTl;
    
    // Clean up when animation is killed
    const mouseListener = document.addEventListener('mousemove', function() {});
    
    baseTl.eventCallback("onKill", function() {
        cursorTl.kill();
        mainLetter.removeEventListener('mouseenter', function() {});
        mainLetter.removeEventListener('mouseleave', function() {});
        document.removeEventListener('mousemove', mouseListener);
        
        if (splitText) {
            splitText.revert();
        }
    });
}
    
    // C - Conversion Animation
    function initConversionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For "Conversion" - animate changing from one form to another
        // Continuously cycle through different transformations
        
        const transformations = [
            { scale: 1, rotation: 0, opacity: 1 },
            { scale: 1.2, rotation: 45, opacity: 0.8 },
            { scale: 0.8, rotation: -20, opacity: 0.9 },
            { scale: 1.1, rotation: 10, opacity: 1 }
        ];
        
        // Set initial state
        gsap.set(chars, { 
            transformOrigin: "center center",
            scale: 1,
            rotation: 0,
            opacity: 1
        });
        
        // Create conversion cycle animation
        const tl = gsap.timeline({ repeat: -1 });
        
        transformations.forEach((state, index) => {
            tl.to(chars, {
                scale: state.scale,
                rotation: state.rotation,
                opacity: state.opacity,
                duration: 1.5,
                ease: "power1.inOut",
                stagger: 0.1
            });
        });
        
        // Slider affects the speed of conversion
        const conversionRate = 0.5 + getSliderValue() * 2; // 0.5 to 2.5
        tl.timeScale(conversionRate);
        
        // Cursor interaction - attract or repel during conversion
        mainLetter.addEventListener('mousemove', function(e) {
            if (cursorInfluence > 0.2) {
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const charCenterX = charRect.left + charRect.width / 2;
                    const charCenterY = charRect.top + charRect.height / 2;
                    
                    // Distance between cursor and char center
                    const dx = mouseX - charCenterX;
                    const dy = mouseY - charCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Direction vectors
                    const directionX = dx / (distance || 1);
                    const directionY = dy / (distance || 1);
                    
                    // Stronger effect when closer
                    const strength = 30 * cursorInfluence * (1 - Math.min(1, distance / 100));
                    
                    // Push away from cursor - conversion = force field
                    gsap.to(char, {
                        x: `-=${directionX * strength}`,
                        y: `-=${directionY * strength}`,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                    
                    // Spring back to original position
                    gsap.to(char, {
                        x: 0,
                        y: 0,
                        delay: 0.3,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.3)"
                    });
                });
            }
        });
        
        // Store current animation for later cleanup
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            mainLetter.removeEventListener('mousemove', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
   // D - Density Animation (Pure CSS Transform Approach)
function initDensityAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Make sure we have valid characters
    if (!chars || chars.length === 0 || !mainLetter) {
        console.error("Missing elements for density animation");
        return gsap.timeline();
    }
    
    // Create a timeline for animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Store original character color
    const originalColor = window.getComputedStyle(chars[0]).color || "#000000";
    
    // Set initial state
    gsap.set(chars, { 
        color: originalColor,
        transformOrigin: "center bottom"
    });
    
    // Default density pulsing animation
    tl.to(chars, {
        scale: 0.85, // More dense (smaller)
        duration: 1.5,
        ease: "sine.inOut"
    })
    .to(chars, {
        scale: 1.15, // Less dense (larger)
        duration: 1.5,
        ease: "sine.inOut"
    })
    .to(chars, {
        scale: 1, // Normal density
        duration: 1.5,
        ease: "sine.inOut"
    });
    
    // Track mouse interaction
    let isMouseOverLetter = false;
    
    // Mouse move handler for density effect
    function handleMouseMove(e) {
        // Check if mouse is over the letter
        const letterRect = mainLetter.getBoundingClientRect();
        const wasOverLetter = isMouseOverLetter;
        
        isMouseOverLetter = (
            e.clientX >= letterRect.left && 
            e.clientX <= letterRect.right && 
            e.clientY >= letterRect.top && 
            e.clientY <= letterRect.bottom
        );
        
        if (isMouseOverLetter) {
            // Pause the default animation
            tl.pause();
            
            // Calculate vertical position within letter (0 at top, 1 at bottom)
            const relativeY = (e.clientY - letterRect.top) / letterRect.height;
            
            // Map position to density state (top = more dense, bottom = less dense)
            const scaleValue = 0.7 + relativeY * 0.6; // Range from 0.7 (compressed) to 1.3 (expanded)
            
            // Apply density transform
            gsap.to(chars, {
                scale: scaleValue,
                duration: 0.3,
                ease: "power2.out"
            });
        } 
        // If mouse just left the letter
        else if (wasOverLetter && !isMouseOverLetter) {
            // Return to normal density with elastic bounce
            gsap.to(chars, {
                scale: 1,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                onComplete: function() {
                    // Resume default animation
                    tl.resume();
                }
            });
        }
    }
    
    // Click handler for dramatic density change
    function handleClick() {
        // Pause the animation
        tl.pause();
        
        // Create dramatic density shift
        gsap.timeline()
            .to(chars, {
                scale: 0.5, // Maximum density (highly compressed)
                duration: 0.5,
                ease: "power2.in"
            })
            .to(chars, {
                scale: 1.5, // Minimum density (highly expanded)
                duration: 0.5,
                ease: "power2.out"
            })
            .to(chars, {
                scale: 1, // Return to normal density
                duration: 0.8,
                ease: "elastic.out(1, 0.3)",
                onComplete: function() {
                    // Resume default animation
                    tl.resume();
                }
            });
    }
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    mainLetter.addEventListener('click', handleClick);
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
        // Remove event listeners
        document.removeEventListener('mousemove', handleMouseMove);
        mainLetter.removeEventListener('click', handleClick);
        
        // Restore original characters
        gsap.set(chars, {
            clearProps: "all"
        });
        
        // Revert split text
        if (splitText && typeof splitText.revert === 'function') {
            splitText.revert();
        }
    });
    
    // Store animation reference
    currentAnimation = tl;
    
    return tl;
}
    
    // E - Equilibrium Animation
    function initEquilibriumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For equilibrium - show balanced opposing forces
        
        // Set initial state
        gsap.set(chars, { 
            x: 0,
            y: 0,
            rotation: 0,
            transformOrigin: "center center"
        });
        
        // Subtle, constant pulsing to represent balanced state
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        
        // Slow, gentle pulse around equilibrium position
        tl.to(chars, {
            scale: 1.05,
            duration: 1.5,
            ease: "sine.inOut",
            stagger: {
                each: 0.1,
                from: "center", // Pulse from center outward
                grid: "auto"
            }
        });
        
        // Use slider to control the "stableness" of equilibrium
        const stabilityFactor = getSliderValue() * 2; // 0 to 2
        
        // More unstable with lower stability
        if (stabilityFactor < 1) {
            // Add slight random motion
            chars.forEach((char) => {
                const randX = (Math.random() - 0.5) * 3 * (1 - stabilityFactor);
                const randY = (Math.random() - 0.5) * 3 * (1 - stabilityFactor);
                const randRot = (Math.random() - 0.5) * 5 * (1 - stabilityFactor);
                
                gsap.to(char, {
                    x: randX,
                    y: randY,
                    rotation: randRot,
                    duration: 0.5 + Math.random(),
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });
        }
        
        // Cursor interaction creates imbalance then return to equilibrium
        mainLetter.addEventListener('mousemove', function() {
            if (cursorInfluence > 0.2) {
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const charCenterX = charRect.left + charRect.width / 2;
                    const charCenterY = charRect.top + charRect.height / 2;
                    
                    // Vector from character to cursor
                    const dx = mouseX - charCenterX;
                    const dy = mouseY - charCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Direction vectors
                    const dirX = dx / (distance || 1);
                    const dirY = dy / (distance || 1);
                    
                    // Displacement amount based on distance and cursor influence
                    const displacement = 20 * cursorInfluence * (1 - Math.min(1, distance / 150));
                    
                    // Move away from equilibrium position
                    gsap.to(char, {
                        x: dirX * displacement,
                        y: dirY * displacement,
                        duration: 0.3,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                    
                    // Return to equilibrium with elastic effect
                    gsap.to(char, {
                        x: 0,
                        y: 0,
                        delay: 0.3,
                        duration: 1,
                        ease: "elastic.out(1, 0.5)",
                        overwrite: "auto"
                    });
                });
            }
        });
        
        // Add mouseenter effect for more dramatic disruption
        mainLetter.addEventListener('mouseenter', function() {
            // Scatter all characters
            chars.forEach((char) => {
                const randX = (Math.random() - 0.5) * 40;
                const randY = (Math.random() - 0.5) * 40;
                const randRot = (Math.random() - 0.5) * 30;
                
                gsap.to(char, {
                    x: randX,
                    y: randY,
                    rotation: randRot,
                    duration: 0.4,
                    ease: "power2.out"
                });
                
                // Return to equilibrium gradually
                gsap.to(char, {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    delay: 0.5,
                    duration: 1.5,
                    ease: "elastic.out(1, 0.5)"
                });
            });
        });
        
        // Store current animation for later cleanup
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            mainLetter.removeEventListener('mousemove', function() {});
            mainLetter.removeEventListener('mouseenter', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
    // F - Friction Animation - Lively Sliding Version with Smooth Interactions
function initFrictionAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Set initial state - no opacity changes, just position and rotation
    gsap.set(chars, { 
        y: -120,
        rotation: -8,
        color: "#000000",
        transformOrigin: "center bottom"
    });
    
    // Create a continuously lively and dynamic animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Initial dramatic slide down
    tl.to(chars, {
        y: 0,
        rotation: 0,
        duration: 1,
        ease: "back.out(1.7)",
        stagger: 0.07
    });
    
    // Small bounce at bottom
    tl.to(chars, {
        y: 10,
        rotation: 2,
        duration: 0.4,
        ease: "power1.in",
        stagger: 0.04
    });
    
    tl.to(chars, {
        y: 0,
        rotation: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
        stagger: 0.04
    });
    
    // Slide up with rotation
    tl.to(chars, {
        y: -60,
        rotation: -5,
        duration: 0.8,
        ease: "power2.inOut",
        stagger: 0.05
    });
    
    // Slide back down with bounce
    tl.to(chars, {
        y: 15,
        rotation: 3,
        duration: 0.7,
        ease: "power3.in",
        stagger: 0.04
    });
    
    tl.to(chars, {
        y: 0,
        rotation: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)",
        stagger: 0.04
    });
    
    // Side to side motion to add more liveliness
    tl.to(chars, {
        x: function(i) { return (i % 2 === 0) ? 15 : -15; },
        rotation: function(i) { return (i % 2 === 0) ? 5 : -5; },
        duration: 0.6,
        ease: "sine.inOut",
        stagger: 0.03
    });
    
    tl.to(chars, {
        x: 0,
        rotation: 0,
        duration: 0.7,
        ease: "back.out(1.7)",
        stagger: 0.03
    });
    
    // Smooth cursor interaction - variables to track state
    let isHovering = false;
    let hoverTween = null;
    
    // Improved smoother hover interaction
    function handleMouseEnter() {
        isHovering = true;
        
        // Kill any existing hover tweens
        if (hoverTween) hoverTween.kill();
        
        // Create a new hover animation
        hoverTween = gsap.timeline();
        
        // Pause the main timeline
        tl.pause();
        
        // Current properties - smoother transition from current state
        const currentY = chars.map(char => gsap.getProperty(char, "y"));
        const currentRotation = chars.map(char => gsap.getProperty(char, "rotation"));
        
        // Animate to hover state - smoother animation
        chars.forEach((char, i) => {
            hoverTween.to(char, {
                y: -70,
                rotation: -8,
                duration: 0.5,
                ease: "power2.out",
                delay: i * 0.03
            }, 0);
        });
    }
    
    function handleMouseLeave() {
        if (!isHovering) return;
        isHovering = false;
        
        // Kill any existing hover tweens
        if (hoverTween) hoverTween.kill();
        
        // Create a new leave animation
        hoverTween = gsap.timeline({
            onComplete: function() {
                // Resume main timeline
                tl.resume();
            }
        });
        
        // Current properties
        const currentY = chars.map(char => gsap.getProperty(char, "y"));
        const currentRotation = chars.map(char => gsap.getProperty(char, "rotation"));
        
        // Animate back to normal position with bounce
        chars.forEach((char, i) => {
            // First slightly overshoot
            hoverTween.to(char, {
                y: 15,
                rotation: 3,
                duration: 0.4,
                ease: "power2.in",
                delay: i * 0.03
            }, 0);
            
            // Then bounce back to normal
            hoverTween.to(char, {
                y: 0,
                rotation: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)",
                delay: 0.4 + (i * 0.02)
            }, 0);
        });
    }
    
    // Add improved event listeners with named functions for proper cleanup
    mainLetter.addEventListener('mouseenter', handleMouseEnter);
    mainLetter.addEventListener('mouseleave', handleMouseLeave);
    
    // Simple but effective click interaction
    function handleClick() {
        // Quick pulse effect
        gsap.timeline()
            .to(chars, {
                scale: 1.3,
                duration: 0.2,
                ease: "power1.out",
                stagger: 0.02
            })
            .to(chars, {
                scale: 1,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)",
                stagger: 0.02
            });
    }
    
    mainLetter.addEventListener('mousedown', handleClick);
    
    // Store current animation
    currentAnimation = tl;
    
    // Proper cleanup with named functions
    tl.eventCallback("onKill", function() {
        mainLetter.removeEventListener('mouseenter', handleMouseEnter);
        mainLetter.removeEventListener('mouseleave', handleMouseLeave);
        mainLetter.removeEventListener('mousedown', handleClick);
        
        if (hoverTween) hoverTween.kill();
        
        if (splitText) {
            splitText.revert();
        }
    });
}
    
    // G - Gravity Animation
    function initGravityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For gravity - objects attract each other
        
        // Set initial state
        gsap.set(chars, { 
            y: 0,
            x: 0,
            transformOrigin: "center center"
        });
        
        // Use slider to control the gravity strength
        const gravityStrength = 0.2 + getSliderValue() * 1.5; // 0.2 to 1.7
        
        // Continuous subtle floating animation
        const tl = gsap.timeline({ repeat: -1 });
        
        // Float up against gravity
        tl.to(chars, {
            y: -20,
            duration: 2,
            ease: "power1.inOut",
            stagger: 0.1
        });
        
        // Fall down with gravity
        tl.to(chars, {
            y: 50,
            duration: 1 * gravityStrength,
            ease: "power2.in", // Accelerating due to gravity
            stagger: 0.05
        });
        
        // Small bounce
        tl.to(chars, {
            y: 30,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.05
        });
        
        // Settle down
        tl.to(chars, {
            y: 0,
            duration: 1,
            ease: "elastic.out(1, 0.3)",
            stagger: 0.05
        });
        
        // Cursor interaction - gravity well effect
        mainLetter.addEventListener('mousemove', function() {
            if (cursorInfluence > 0.1) {
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const charCenterX = charRect.left + charRect.width / 2;
                    const charCenterY = charRect.top + charRect.height / 2;
                    
                    // Vector from character to cursor (gravity source)
                    const dx = mouseX - charCenterX;
                    const dy = mouseY - charCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Inverse square law for gravity
                    const gravitationalPull = 2000 * gravityStrength * cursorInfluence / Math.max(50, distance * distance);
                    
                    // Direction vectors (normalized)
                    const dirX = dx / (distance || 1);
                    const dirY = dy / (distance || 1);
                    
                    // Apply gravitational pull
                    gsap.to(char, {
                        x: `+=${dirX * gravitationalPull}`,
                        y: `+=${dirY * gravitationalPull}`,
                        duration: 0.3,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                    
                    // Return to orbit position with elastic effect
                    gsap.to(char, {
                        x: 0,
                        y: gsap.getProperty(char, "y"), // Keep current y from timeline
                        delay: 0.3,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.5)",
                        overwrite: "auto"
                    });
                });
            }
        });
        
        // Add click for dramatic gravity effect
        mainLetter.addEventListener('click', function() {
            // Pause the timeline
            tl.pause();
            
            // Create a strong gravity well at click point
            const clickX = mouseX;
            const clickY = mouseY;
            
            chars.forEach((char) => {
                const charRect = char.getBoundingClientRect();
                const charCenterX = charRect.left + charRect.width / 2;
                const charCenterY = charRect.top + charRect.height / 2;
                
                // Vector to click point
                const dx = clickX - charCenterX;
                const dy = clickY - charCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Direction vector
                const dirX = dx / (distance || 1);
                const dirY = dy / (distance || 1);
                
                // Strong gravitational collapse to click point
                gsap.to(char, {
                    x: dirX * distance * 0.8,
                    y: dirY * distance * 0.8,
                    duration: 0.8,
                    ease: "power3.in"
                });
                
                // Return to normal positions with bounce
                gsap.to(char, {
                    x: 0,
                    y: 0,
                    delay: 0.8,
                    duration: 1.5,
                    ease: "elastic.out(1, 0.3)",
                    onComplete: function() {
                        if (char === chars[chars.length - 1]) {
                            // Resume timeline after all chars return
                            tl.play();
                        }
                    }
                });
            });
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            mainLetter.removeEventListener('mousemove', function() {});
            mainLetter.removeEventListener('click', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
    // Harmonic Animation - Enhanced Vibration Effect
function initHarmonicAnimation() {
    console.log("Starting enhanced harmonic vibration animation");
    
    // Get the current letter element
    const mainLetter = document.querySelector('.main-letter');
    if (!mainLetter) {
        console.error("Cannot find .main-letter element");
        return { kill: function() {} };
    }
    
    // Store original content
    const originalContent = mainLetter.innerHTML;
    
    // Split into spans (works with any letter)
    const text = mainLetter.textContent;
    mainLetter.innerHTML = '';
    const spans = [];
    
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        span.style.display = 'inline-block';
        span.style.position = 'relative';
        span.style.transformOrigin = 'center center';
        mainLetter.appendChild(span);
        spans.push(span);
    }
    
    console.log(`Successfully split "${text}" into ${spans.length} spans`);
    
    // Animation variables
    let animationRunning = true;
    let animationId = null;
    let startTime = Date.now();
    
    // Mouse position and influence tracking
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorInfluence = 0;
    
    // Update mouse position and calculate influence
    function updateMouse(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Calculate global cursor influence
        if (mainLetter) {
            const rect = mainLetter.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const dx = mouseX - centerX;
            const dy = mouseY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Higher influence when cursor is closer
            cursorInfluence = Math.max(0, 1 - distance / (rect.width * 1.5));
        }
    }
    
    document.addEventListener('mousemove', updateMouse);
    
    // Animation parameters with multiple frequencies for vibration effect
    const baseFrequency = 5; // Higher frequency for vibration
    const amplitude = 5; // Smaller amplitude for vibration
    
    // Animation function - true vibration with multiple components
    function animate() {
        if (!animationRunning) return;
        
        const elapsedTime = (Date.now() - startTime) / 1000; // seconds
        
        spans.forEach((span, i) => {
            // Multiple frequency components for true vibration feel
            const phaseShift = i * 0.2;
            
            // Main vibration - primary y axis vibration
            const vib1 = Math.sin(elapsedTime * baseFrequency + phaseShift) * amplitude;
            
            // Secondary vibrations - higher frequency, lower amplitude
            const vib2 = Math.sin(elapsedTime * (baseFrequency * 2.7) + phaseShift * 1.5) * (amplitude * 0.4);
            const vib3 = Math.cos(elapsedTime * (baseFrequency * 3.9) + phaseShift * 0.8) * (amplitude * 0.2);
            
            // Small x-axis vibration for more realistic feel
            const vibX = Math.sin(elapsedTime * (baseFrequency * 1.3) + phaseShift * 2) * (amplitude * 0.3);
            
            // Small rotation
            const vibRot = Math.sin(elapsedTime * (baseFrequency * 1.6) + phaseShift) * 1.5;
            
            // Combine all vibrations
            const totalY = vib1 + vib2 + vib3;
            
            // Apply complex transform for realistic vibration
            span.style.transform = `translate(${vibX}px, ${totalY}px) rotate(${vibRot}deg)`;
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    console.log("Harmonic vibration animation started");
    
    // Mouse move handler with improved cursor interaction
    function handleMouseMove(e) {
        if (cursorInfluence > 0.1) {
            spans.forEach((span, i) => {
                // Get span position relative to cursor
                const spanRect = span.getBoundingClientRect();
                const spanCenterX = spanRect.left + spanRect.width / 2;
                const spanCenterY = spanRect.top + spanRect.height / 2;
                
                // Distance from cursor to this specific span
                const dx = mouseX - spanCenterX;
                const dy = mouseY - spanCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate influence on this specific span (stronger when closer)
                const spanInfluence = Math.max(0, 1 - distance / 100) * cursorInfluence;
                
                if (spanInfluence > 0.05) {
                    // Get current transform
                    const transform = span.style.transform || '';
                    
                    // Extract current position values
                    let currentX = 0, currentY = 0, currentRot = 0;
                    
                    const translateMatch = transform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
                    if (translateMatch) {
                        currentX = parseFloat(translateMatch[1]);
                        currentY = parseFloat(translateMatch[2]);
                    }
                    
                    const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
                    if (rotateMatch) {
                        currentRot = parseFloat(rotateMatch[1]);
                    }
                    
                    // Amplify the vibration based on cursor influence
                    // More dramatic effect when cursor is closer
                    const resonanceFactor = 1 + spanInfluence * 5;
                    
                    // Apply amplified vibration
                    span.style.transform = `translate(${currentX * resonanceFactor}px, ${currentY * resonanceFactor}px) rotate(${currentRot * resonanceFactor}deg)`;
                }
            });
        }
    }
    
    // Enhanced click handler for dramatic harmonic resonance
    function handleClick() {
        // Pause the regular animation briefly
        const wasRunning = animationRunning;
        animationRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Create dramatic resonance effect
        const clickTime = Date.now();
        const clickDuration = 1200; // ms
        
        // Special click animation
        function clickAnimate() {
            const elapsed = Date.now() - clickTime;
            
            // If animation is complete, resume normal animation
            if (elapsed >= clickDuration) {
                if (wasRunning) {
                    animationRunning = true;
                    startTime = Date.now(); // Reset time for smooth continuation
                    animate();
                }
                return;
            }
            
            // Progress from 0 to 1
            const progress = elapsed / clickDuration;
            
            // Dramatic bell curve effect (start small, grow, then fade)
            const intensity = Math.sin(progress * Math.PI);
            
            spans.forEach((span, i) => {
                const phaseOffset = i * 0.15;
                const adjustedProgress = progress + phaseOffset;
                
                // Dramatic vibration that transitions from large to small
                const frequency = 15; // Very rapid vibration
                
                // Multiple vibration components
                const vib1 = Math.sin(adjustedProgress * frequency * 2) * amplitude * 6 * intensity;
                const vib2 = Math.sin(adjustedProgress * frequency * 3.7) * amplitude * 3 * intensity;
                const vibX = Math.sin(adjustedProgress * frequency * 2.5) * amplitude * 2 * intensity;
                const vibRot = Math.sin(adjustedProgress * frequency * 3) * 10 * intensity;
                
                // Apply vibration
                span.style.transform = `translate(${vibX}px, ${vib1 + vib2}px) rotate(${vibRot}deg)`;
            });
            
            // Continue click animation
            requestAnimationFrame(clickAnimate);
        }
        
        // Start click animation
        clickAnimate();
    }
    
    // Add event listeners
    mainLetter.addEventListener('mousemove', handleMouseMove);
    mainLetter.addEventListener('click', handleClick);
    
    // Create a controller object
    const controller = {
        kill: function() {
            // Stop animation
            animationRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            // Remove event listeners
            mainLetter.removeEventListener('mousemove', handleMouseMove);
            mainLetter.removeEventListener('click', handleClick);
            document.removeEventListener('mousemove', updateMouse);
            
            // Restore original content
            mainLetter.innerHTML = originalContent;
        }
    };
    
    // Store reference (if the global variable exists)
    if (typeof currentAnimation !== 'undefined') {
        currentAnimation = controller;
    }
    
    return controller;
}
    
    // I - Inertia Animation
    function initInertiaAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For inertia - resistance to change in motion
        
        // Set initial state - at rest
        gsap.set(chars, { 
            x: 0,
            rotation: 0,
            transformOrigin: "center center"
        });
        
        // Use slider to control the inertia (mass)
        const inertiaMass = 0.5 + getSliderValue() * 2; // 0.5 to 2.5
        
        // Subtle breathing animation when at rest
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(chars, {
            scale: 1.05,
            duration: 1.5,
            ease: "sine.inOut",
            stagger: 0.05
        });
        
        // Track motion state
        let isMoving = false;
        let velocityX = 0;
        let dragStartX = 0;
        
        // Cursor interaction - drag with inertia
        mainLetter.addEventListener('mousedown', function(e) {
            // Pause idle animation
            tl.pause();
            
            dragStartX = mouseX;
            let lastX = mouseX;
            let lastTime = Date.now();
            
            // Start drag
            function onDrag(e) {
                const currentTime = Date.now();
                const timeElapsed = (currentTime - lastTime) / 1000; // seconds
                
                // Calculate instantaneous velocity (pixels per second)
                const currentVelocity = (mouseX - lastX) / Math.max(0.016, timeElapsed);
                
                // Apply drag effect with mass
                const dragDistance = (mouseX - dragStartX) / inertiaMass;
                
                // Update chars position
                chars.forEach((char, i) => {
                    // More inertia for later chars (delayed movement)
                    const charInertia = inertiaMass * (1 + i * 0.1);
                    
                    gsap.to(char, {
                        x: dragDistance / charInertia,
                        duration: 0.2,
                        ease: "power1.out",
                        overwrite: "auto"
                    });
                });
                
                // Update tracking variables
                lastX = mouseX;
                lastTime = currentTime;
                velocityX = currentVelocity;
            }
            
            // End drag with inertia
            function endDrag() {
                document.removeEventListener('mousemove', onDrag);
                document.removeEventListener('mouseup', endDrag);
                
                isMoving = true;
                
                // Apply inertial movement based on final velocity
                const cappedVelocity = Math.max(-1000, Math.min(1000, velocityX));
                const distance = cappedVelocity * 0.3; // Travel distance based on velocity
                
                chars.forEach((char, i) => {
                    // Staggered inertia effect
                    const charInertia = inertiaMass * (1 + i * 0.1);
                    const charDistance = distance / charInertia;
                    
                    // Current position
                    const currentX = gsap.getProperty(char, "x");
                    
                    // Move with inertia
                    gsap.to(char, {
                        x: currentX + charDistance,
                        duration: 1,
                        ease: "power2.out",
                        onComplete: function() {
                            if (char === chars[chars.length - 1]) {
                                // Gradually slow down and stop
                                chars.forEach((c, j) => {
                                    const stopDelay = j * 0.05;
                                    
                                    gsap.to(c, {
                                        x: 0,
                                        delay: stopDelay,
                                        duration: 1.5,
                                        ease: "elastic.out(1, 0.5)",
                                        onComplete: function() {
                                            if (c === chars[chars.length - 1]) {
                                                isMoving = false;
                                                tl.play(); // Resume idle animation
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    });
                });
            }
            
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', endDrag);
        });
        
        // Add click interaction when not dragging
        mainLetter.addEventListener('click', function(e) {
            if (!isMoving) {
                // Pause idle animation
                tl.pause();
                
                // Apply impulse force
                const direction = Math.random() > 0.5 ? 1 : -1;
                const impulse = 40 * direction;
                
                chars.forEach((char, i) => {
                    // Staggered impulse based on inertia
                    const charInertia = inertiaMass * (1 + i * 0.1);
                    const charImpulse = impulse / charInertia;
                    
                    // Apply impulse
                    gsap.to(char, {
                        x: charImpulse,
                        duration: 0.5,
                        ease: "power2.out",
                        onComplete: function() {
                            // Return to rest with elastic effect
                            gsap.to(char, {
                                x: 0,
                                duration: 1.5,
                                ease: "elastic.out(1, 0.3)",
                                onComplete: function() {
                                    if (char === chars[chars.length - 1]) {
                                        tl.play(); // Resume idle animation
                                    }
                                }
                            });
                        }
                    });
                });
            }
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            mainLetter.removeEventListener('mousedown', function() {});
            mainLetter.removeEventListener('click', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
    // J - Joule Animation
function initJouleAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Set initial state
    gsap.set(chars, { 
        transformOrigin: "center center",
        scale: 1,
        opacity: 1
    });
    
    // Energy pulsing animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Energy build-up
    tl.to(chars, {
        scale: 1.1,
        opacity: 0.8,
        stagger: {
            each: 0.05,
            from: "center"
        },
        duration: 1,
        ease: "sine.in"
    });
    
    // Energy release
    tl.to(chars, {
        scale: 1.2,
        opacity: 1,
        stagger: {
            each: 0.05,
            from: "center"
        },
        duration: 0.3,
        ease: "power2.out"
    });
    
    // Return to normal
    tl.to(chars, {
        scale: 1,
        stagger: {
            each: 0.05,
            from: "center"
        },
        duration: 0.7,
        ease: "elastic.out(1, 0.5)"
    });
    
    // Cursor interaction - energy transfer
    mainLetter.addEventListener('mousemove', function() {
        if (cursorInfluence > 0.2) {
            chars.forEach((char) => {
                const charRect = char.getBoundingClientRect();
                const charCenterX = charRect.left + charRect.width / 2;
                const charCenterY = charRect.top + charRect.height / 2;
                
                // Distance to cursor
                const dx = mouseX - charCenterX;
                const dy = mouseY - charCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Energy effect based on distance
                const energyEffect = Math.max(0, 1 - distance / 100) * cursorInfluence;
                
                if (energyEffect > 0.3) {
                    // Energy glow effect
                    gsap.to(char, {
                        scale: 1 + 0.2 * energyEffect,
                        color: gsap.utils.interpolate('#000000', '#B0FF8C', energyEffect),
                        duration: 0.2,
                        ease: "power1.out",
                        overwrite: "auto"
                    });
                    
                    // Return to normal
                    gsap.to(char, {
                        scale: 1,
                        color: '#000000',
                        delay: 0.2,
                        duration: 0.5,
                        ease: "elastic.out(1, 0.3)",
                        overwrite: "auto"
                    });
                }
            });
        }
    });
    
    // Store current animation
    currentAnimation = tl;
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
        mainLetter.removeEventListener('mousemove', function() {});
        
        if (splitText) {
            splitText.revert();
        }
    });
}

    // K - Kinetic Animation
    function initKineticAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For Kinetic Energy - Energy of motion
        
        // Set initial state
        gsap.set(chars, { 
            x: 0,
            y: 0,
            rotation: 0,
            transformOrigin: "center center"
        });
        
        // Use slider to control the kinetic energy (speed/intensity)
        const kineticEnergy = 0.5 + getSliderValue() * 2; // 0.5 to 2.5
        
        // Constant motion - never stopping
        const tl = gsap.timeline({ repeat: -1 });
        
        // Function to generate random motion patterns
        function createKineticMotion() {
            const subTl = gsap.timeline();
            
            chars.forEach((char, i) => {
                const randomX = (Math.random() - 0.5) * 40 * kineticEnergy;
                const randomY = (Math.random() - 0.5) * 20 * kineticEnergy;
                const randomRotation = (Math.random() - 0.5) * 30 * kineticEnergy;
                const duration = 0.5 + Math.random() * 0.5;
                
                subTl.to(char, {
                    x: randomX,
                    y: randomY,
                    rotation: randomRotation,
                    duration: duration / kineticEnergy, // Faster with more energy
                    ease: "power1.inOut"
                }, i * 0.05);
            });
            
            return subTl;
        }
        
        // Chain multiple random motions together
        for (let i = 0; i < 5; i++) {
            tl.add(createKineticMotion());
        }
        
        // Cursor interaction - add kinetic energy
        mainLetter.addEventListener('mousemove', function() {
            if (cursorInfluence > 0.2) {
                const letterRect = mainLetter.getBoundingClientRect();
                const letterCenterX = letterRect.left + letterRect.width / 2;
                const letterCenterY = letterRect.top + letterRect.height / 2;
                
                // Calculate cursor velocity (simulated)
                const velocityX = (mouseX - letterCenterX) * 0.1;
                const velocityY = (mouseY - letterCenterY) * 0.1;
                const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                
                // Apply kinetic effect based on cursor velocity
                if (velocity > 1) {
                    chars.forEach((char, i) => {
                        const charRect = char.getBoundingClientRect();
                        const charCenterX = charRect.left + charRect.width / 2;
                        const charCenterY = charRect.top + charRect.height / 2;
                        
                        // Direction vectors from cursor to char
                        const dx = charCenterX - mouseX;
                        const dy = charCenterY - mouseY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const dirX = dx / (distance || 1);
                        const dirY = dy / (distance || 1);
                        
                        // Energy transfer - more when closer
                        const energyTransfer = velocity * Math.max(0, 1 - distance / 150) * cursorInfluence;
                        
                        // Apply kinetic push
                        const pushX = dirX * energyTransfer * 2;
                        const pushY = dirY * energyTransfer * 2;
                        
                        gsap.to(char, {
                            x: `+=${pushX}`,
                            y: `+=${pushY}`,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    });
                }
            }
        });
        
        // Add click for explosive kinetic release
        mainLetter.addEventListener('click', function() {
            // Pause the timeline
            tl.pause();
            
            // Explosion from center
            chars.forEach((char, i) => {
                const charRect = char.getBoundingClientRect();
                const charCenterX = charRect.left + charRect.width / 2;
                const charCenterY = charRect.top + charRect.height / 2;
                
                // Direction from center
                const letterRect = mainLetter.getBoundingClientRect();
                const letterCenterX = letterRect.left + letterRect.width / 2;
                const letterCenterY = letterRect.top + letterRect.height / 2;
                
                const dx = charCenterX - letterCenterX;
                const dy = charCenterY - letterCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const dirX = dx / (distance || 1);
                const dirY = dy / (distance || 1);
                
                // Explosion distance depends on energy
                const explosionDistance = (50 + i * 10) * kineticEnergy;
                
                // Explosive motion
                gsap.to(char, {
                    x: dirX * explosionDistance,
                    y: dirY * explosionDistance,
                    rotation: (Math.random() - 0.5) * 180,
                    duration: 0.5,
                    ease: "power3.out"
                });
                
                // Return with elastic effect
                gsap.to(char, {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    delay: 0.5,
                    duration: 1,
                    ease: "elastic.out(1, 0.5)",
                    onComplete: function() {
                        if (char === chars[chars.length - 1]) {
                            // Resume timeline after all chars return
                            tl.resume();
                        }
                    }
                });
            });
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            mainLetter.removeEventListener('mousemove', function() {});
            mainLetter.removeEventListener('click', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
    // L - Luminosity Animation
function initLuminosityAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Set initial state
    gsap.set(chars, { 
        color: "#000000",
        textShadow: "none",
        transformOrigin: "center center"
    });
    
    // Light pulsing animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Cycle through color/brightness
    function createLuminosityPulse() {
        const glowCycle = [
            { textShadow: "0 0 5px rgba(255,255,255,0.5)" },
            { textShadow: "0 0 10px rgba(255,255,255,0.7)" },
            { textShadow: "0 0 15px rgba(255,255,255,0.9), 0 0 30px rgba(255,255,255,0.5)" },
            { textShadow: "0 0 10px rgba(255,255,255,0.7)" },
            { textShadow: "0 0 5px rgba(255,255,255,0.5)" },
            { textShadow: "none" }
        ];
        
        const subTl = gsap.timeline();
        
        glowCycle.forEach((state, index) => {
            subTl.to(chars, {
                textShadow: state.textShadow,
                duration: 0.7,
                stagger: 0.08,
                ease: "power1.inOut"
            });
        });
        
        return subTl;
    }
    
    tl.add(createLuminosityPulse());
    
    // Cursor interaction - light follows cursor
    mainLetter.addEventListener('mousemove', function() {
        if (cursorInfluence > 0.1) {
            chars.forEach((char) => {
                const charRect = char.getBoundingClientRect();
                const charCenterX = charRect.left + charRect.width / 2;
                const charCenterY = charRect.top + charRect.height / 2;
                
                // Distance to cursor
                const dx = mouseX - charCenterX;
                const dy = mouseY - charCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Light intensity based on proximity
                const intensity = Math.max(0, 1 - distance / 150) * cursorInfluence;
                
                if (intensity > 0.1) {
                    // Light up with proximity to cursor
                    const brightness = Math.min(1, intensity * 1.5);
                    
                    // Calculate color based on intensity
                    const r = Math.round(255);
                    const g = Math.round(170 + (255 - 170) * brightness);
                    const b = Math.round(brightness * 255);
                    const color = `rgb(${r}, ${g}, ${b})`;
                    
                    // Calculate shadow size based on intensity
                    const shadowSize = Math.round(15 * brightness);
                    const textShadow = `0 0 ${shadowSize}px rgba(255, 255, 255, 0.9), 0 0 ${shadowSize * 2}px #FEFF86`;
                    
                    gsap.to(char, {
                        color: color,
                        textShadow: textShadow,
                        duration: 0.2,
                        ease: "power1.out",
                        overwrite: "auto"
                    });
                } else {
                    // Return to current timeline state
                    gsap.to(char, {
                        color: "#000000",
                        textShadow: "none",
                        duration: 0.5,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                }
            });
        }
    });
    
    // Store current animation
    currentAnimation = tl;
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
        mainLetter.removeEventListener('mousemove', function() {});
        
        if (splitText) {
            splitText.revert();
        }
    });
}

    
    // M - Momentum Animation
function initMomentumAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Set initial state
    gsap.set(chars, { 
        x: 0,
        transformOrigin: "center center"
    });
    
    // Momentum demonstration animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Slow build-up of momentum
    tl.to(chars, {
        x: function(i) {
            // First characters have less mass (move more)
            const charMass = 0.5 + i * 0.1;
            return 50 / charMass;
        },
        duration: 2,
        ease: "power1.in", // Accelerating
        stagger: 0.05
    });
    
    // Maintain momentum
    tl.to(chars, {
        x: function(i) {
            const charMass = 0.5 + i * 0.1;
            return 100 / charMass;
        },
        duration: 1,
        ease: "linear", // Constant velocity
        stagger: 0.05
    });
    
    // Switch direction while preserving momentum
    tl.to(chars, {
        x: function(i) {
            const charMass = 0.5 + i * 0.1;
            return -100 / charMass;
        },
        duration: 3,
        ease: "power1.inOut", // Gradual change
        stagger: {
            each: 0.1,
            from: "end" // Heavier (end) characters turn first
        }
    });
    
    // Return to center
    tl.to(chars, {
        x: 0,
        duration: 2,
        ease: "power1.out",
        stagger: {
            each: 0.1,
            from: "end" // Heavier characters stop last
        }
    });
    
    // Track if dragging
    let isDragging = false;
    let velocityX = 0;
    let lastX = 0;
    let lastTime = 0;
    
    // Cursor interaction - momentum transfer
    mainLetter.addEventListener('mousedown', function(e) {
        // Pause timeline
        tl.pause();
        
        isDragging = true;
        lastX = mouseX;
        lastTime = Date.now();
        
        function onDrag(e) {
            const currentTime = Date.now();
            const deltaTime = (currentTime - lastTime) / 1000; // in seconds
            
            // Calculate velocity in pixels per second
            velocityX = (mouseX - lastX) / deltaTime;
            
            // Apply drag based on cursor movement
            const dragAmount = mouseX - lastX;
            
            chars.forEach((char, i) => {
                // Mass affects response to drag
                const charMass = 0.5 + i * 0.1;
                const currentX = gsap.getProperty(char, "x");
                
                gsap.to(char, {
                    x: currentX + dragAmount / charMass,
                    duration: 0.1,
                    ease: "power1.out",
                    overwrite: "auto"
                });
            });
            
            lastX = mouseX;
            lastTime = currentTime;
        }
        
        function endDrag() {
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', endDrag);
            
            isDragging = false;
            
            // Continue motion with momentum
            if (Math.abs(velocityX) > 100) {
                chars.forEach((char, i) => {
                    // Mass affects momentum
                    const charMass = 0.5 + i * 0.1;
                    const currentX = gsap.getProperty(char, "x");
                    
                    // Distance traveled based on velocity and mass
                    const momentumDistance = velocityX * 0.5 / charMass;
                    
                    // Apply momentum motion
                    gsap.to(char, {
                        x: currentX + momentumDistance,
                        duration: 2,
                        ease: "power2.out",
                        onComplete: function() {
                            if (char === chars[chars.length - 1]) {
                                // Return all to center
                                chars.forEach((c, j) => {
                                    gsap.to(c, {
                                        x: 0,
                                        duration: 1.5,
                                        delay: j * 0.05,
                                        ease: "power3.out",
                                        onComplete: function() {
                                            if (c === chars[chars.length - 1]) {
                                                tl.resume();
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    });
                });
            } else {
                // Not enough momentum, just return to center
                chars.forEach((char, i) => {
                    gsap.to(char, {
                        x: 0,
                        duration: 1,
                        delay: i * 0.05,
                        ease: "power3.out",
                        onComplete: function() {
                            if (char === chars[chars.length - 1]) {
                                tl.resume();
                            }
                        }
                    });
                });
            }
        }
        
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
    });
    
    // Store current animation
    currentAnimation = tl;
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
        mainLetter.removeEventListener('mousedown', function() {});
        
        if (splitText) {
            splitText.revert();
        }
    });
}

// N - Neutron Animation
function initNeutronAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Set initial state
    gsap.set(chars, { 
        scale: 1,
        opacity: 1,
        transformOrigin: "center center",
        filter: "blur(0px)"
    });
    
    // Create nuclear-like motion
    const tl = gsap.timeline({ repeat: -1 });
    
    // Randomized orbital-like movements
    chars.forEach((char, i) => {
        // Random orbit radius
        const orbitRadius = 5 + Math.random() * 15;
        const orbitSpeed = 1 + Math.random() * 2;
        const orbitOffset = Math.random() * Math.PI * 2; // Random starting position
        
        // Create orbital motion
        gsap.to(char, {
            x: function(t) {
                return Math.sin(t * orbitSpeed + orbitOffset) * orbitRadius;
            },
            y: function(t) {
                return Math.cos(t * orbitSpeed + orbitOffset) * orbitRadius;
            },
            duration: 3,
            ease: "none",
            repeat: -1
        });
        
        // Pulsing like neutron
        gsap.to(char, {
            scale: 0.9 + 0.2 * Math.random(),
            opacity: 0.7 + 0.3 * Math.random(),
            duration: 1 + Math.random(),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });
    
    // Cursor interaction - nuclear reaction
    mainLetter.addEventListener('mousemove', function() {
        if (cursorInfluence > 0.2) {
            chars.forEach((char) => {
                const charRect = char.getBoundingClientRect();
                const charCenterX = charRect.left + charRect.width / 2;
                const charCenterY = charRect.top + charRect.height / 2;
                
                // Distance to cursor
                const dx = mouseX - charCenterX;
                const dy = mouseY - charCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Effect strength based on proximity
                const effectStrength = Math.max(0, 1 - distance / 150) * cursorInfluence;
                
                if (effectStrength > 0.1) {
                    // Direction vectors
                    const dirX = dx / (distance || 1);
                    const dirY = dy / (distance || 1);
                    
                    // Movement away from cursor (nuclear repulsion)
                    const repulsionStrength = 20 * effectStrength;
                    
                    gsap.to(char, {
                        x: `-=${dirX * repulsionStrength}`,
                        y: `-=${dirY * repulsionStrength}`,
                        duration: 0.3,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                    
                    // Energy pulse effect
                    gsap.to(char, {
                        scale: 1 + 0.3 * effectStrength,
                        opacity: 0.7 + 0.3 * effectStrength,
                        duration: 0.2,
                        ease: "power1.out",
                        overwrite: "auto"
                    });
                    
                    // Return to orbit
                    gsap.to(char, {
                        scale: 1,
                        opacity: 1,
                        delay: 0.2,
                        duration: 0.5,
                        ease: "elastic.out(1, 0.3)",
                        overwrite: "auto"
                    });
                }
            });
        }
    });
    
    // Store current animation
    currentAnimation = tl;
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
        // Clear all individual animations
        chars.forEach((char) => {
            gsap.killTweensOf(char);
        });
        
        mainLetter.removeEventListener('mousemove', function() {});
        
        if (splitText) {
            splitText.revert();
        }
    });
}
    
    // O - Oscillation Animation
    function initOscillationAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For Oscillation - Regular variation in position
        
        // Set initial state
        gsap.set(chars, {
            y: 0,
            transformOrigin: "center center"
        });
        
        // Use slider to control the oscillation frequency and amplitude
        const oscFrequency = 0.5 + getSliderValue() * 2; // 0.5 to 2.5 Hz
        const oscAmplitude = 15 + getSliderValue() * 15; // 15 to 30px
        
        // Create the oscillation animation
        const tl = gsap.timeline({ repeat: -1 });
        
        // Each character oscillates at slightly different frequency
        chars.forEach((char, i) => {
            // Slightly different frequency for each character
            const charFreq = oscFrequency * (0.8 + i * 0.05);
            
            // Continuous oscillation using sine function
            gsap.to(char, {
                y: function(t) {
                    return Math.sin(charFreq * t * Math.PI) * oscAmplitude;
                },
                duration: 2,
                ease: "none",
                repeat: -1
            });
        });
        
        // Cursor interaction - change oscillation phase
        mainLetter.addEventListener('mousemove', function() {
            if (cursorInfluence > 0.2) {
                const letterRect = mainLetter.getBoundingClientRect();
                const letterCenterX = letterRect.left + letterRect.width / 2;
                
                // Horizontal distance from center affects phase
                const dx = mouseX - letterCenterX;
                const phaseShift = (dx / letterRect.width) * Math.PI * cursorInfluence;
                
                chars.forEach((char, i) => {
                    // Current position in oscillation
                    const currentY = gsap.getProperty(char, "y");
                    
                    // Adjust phase
                    const charFreq = oscFrequency * (0.8 + i * 0.05);
                    const newPhase = Math.sin((charFreq * Date.now() / 1000 * Math.PI) + phaseShift) * oscAmplitude;
                    
                    // Smoothly transition to new phase
                    gsap.to(char, {
                        y: newPhase,
                        duration: 0.3,
                        ease: "sine.inOut",
                        overwrite: "auto"
                    });
                });
            }
        });
        
        // Add click for dramatic oscillation
        mainLetter.addEventListener('click', function() {
            chars.forEach((char, i) => {
                // Current oscillation
                const currentY = gsap.getProperty(char, "y");
                
                // Amplify current oscillation
                gsap.to(char, {
                    y: currentY * 2,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                // Return to normal oscillation
                gsap.to(char, {
                    y: currentY,
                    delay: 0.3,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            // Clear all individual animations
            chars.forEach((char) => {
                gsap.killTweensOf(char);
            });
            
            mainLetter.removeEventListener('mousemove', function() {});
            mainLetter.removeEventListener('click', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }

    // P - Potential Animation
    function initPotentialAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For Potential - Stored energy due to position
        
        // Set initial state - at the bottom (high potential energy)
        gsap.set(chars, {
            y: 40, // Start at the bottom
            scale: 1,
            opacity: 1,
            transformOrigin: "center center"
        });
        
        // Use slider to control the potential energy
        const potentialEnergy = 0.5 + getSliderValue() * 2; // 0.5 to 2.5
        
        // Create animation showing potential energy conversion
        const tl = gsap.timeline({ repeat: -1 });
        
        // Raise slowly (storing potential energy)
        tl.to(chars, {
            y: -40,
            duration: 2,
            ease: "power1.inOut",
            stagger: 0.1
        });
        
        // Hold at top (stored potential)
        tl.to(chars, {
            scale: 1.1,
            duration: 1,
            ease: "sine.inOut",
            stagger: 0.05
        });
        
        // Release - fast fall (converting to kinetic)
        tl.to(chars, {
            y: 50,
            scale: 0.9,
            duration: 0.5,
            ease: "power2.in",
            stagger: 0.03
        });
        
        // Bounce and settle (dissipating energy)
        tl.to(chars, {
            y: 40,
            scale: 1,
            duration: 1,
            ease: "elastic.out(1, 0.3)",
            stagger: 0.05
        });
        
        // Track if we're holding
        let isHolding = false;
        let holdY = 0;
        
        // Cursor interaction - drag to store potential energy
        mainLetter.addEventListener('mousedown', function(e) {
            // Pause the timeline
            tl.pause();
            
            isHolding = true;
            holdY = mouseY;
            
            function onDrag(e) {
                // Calculate vertical drag distance
                const dragDistance = mouseY - holdY;
                
                // Convert to potential energy position
                // Negative drag (upward) increases potential
                const potentialY = Math.max(-60, Math.min(40, 40 - dragDistance * 0.5));
                
                // Apply to characters with stagger
                chars.forEach((char, i) => {
                    const delay = i * 0.03;
                    
                    gsap.to(char, {
                        y: potentialY,
                        delay: delay,
                        duration: 0.2,
                        ease: "power1.out",
                        overwrite: "auto"
                    });
                    
                    // Scale based on potential energy (higher = more potential)
                    const potentialScale = 1 + (40 - potentialY) / 100 * 0.2;
                    gsap.to(char, {
                        scale: potentialScale,
                        delay: delay,
                        duration: 0.2,
                        ease: "power1.out",
                        overwrite: "auto"
                    });
                });
            }
            
            function endDrag() {
                document.removeEventListener('mousemove', onDrag);
                document.removeEventListener('mouseup', endDrag);
                
                isHolding = false;
                
                // Get current potential energy position
                const currentY = gsap.getProperty(chars[0], "y");
                
                // Convert to kinetic energy - faster fall from higher position
                const fallDistance = 50 - currentY; // Distance to bottom
                const fallDuration = Math.max(0.3, fallDistance / 200); // Time to fall
                
                chars.forEach((char, i) => {
                    const delay = i * 0.03;
                    
                    // Fall with gravity
                    gsap.to(char, {
                        y: 50, // Slightly overshoot
                        scale: 0.9,
                        delay: delay,
                        duration: fallDuration,
                        ease: "power2.in",
                        overwrite: "auto"
                    });
                    
                    // Bounce and settle
                    gsap.to(char, {
                        y: 40,
                        scale: 1,
                        delay: delay + fallDuration,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.3)",
                        overwrite: "auto",
                        onComplete: function() {
                            if (char === chars[chars.length - 1]) {
                                // Resume regular animation
                                gsap.delayedCall(0.5, function() {
                                    tl.play();
                                });
                            }
                        }
                    });
                });
            }
            
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', endDrag);
        });
        
        // Add click to simulate instant energy release
        mainLetter.addEventListener('click', function() {
            if (!isHolding) {
                // Pause normal animation
                tl.pause();
                
                // Current position
                const currentY = gsap.getProperty(chars[0], "y");
                
                // Quickly raise to high potential
                chars.forEach((char, i) => {
                    const delay = i * 0.05;
                    
                    gsap.to(char, {
                        y: -50,
                        scale: 1.2,
                        delay: delay,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                    
                    // Fast drop - convert to kinetic
                    gsap.to(char, {
                        y: 60,
                        scale: 0.8,
                        delay: delay + 0.6,
                        duration: 0.3,
                        ease: "power3.in"
                    });
                    
                    // Dramatic bounce
                    gsap.to(char, {
                        y: 40,
                        scale: 1,
                        delay: delay + 0.9,
                        duration: 1,
                        ease: "elastic.out(1, 0.2)",
                        onComplete: function() {
                            if (char === chars[chars.length - 1]) {
                                // Resume normal animation
                                gsap.delayedCall(0.5, function() {
                                    tl.play();
                                });
                            }
                        }
                    });
                });
            }
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            mainLetter.removeEventListener('mousedown', function() {});
            mainLetter.removeEventListener('click', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
    // Q - Quantum Animation
function initQuantumAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Set initial state
    gsap.set(chars, { 
    scale: 1,
    opacity: 1,
    transformOrigin: "center center",
    filter: "blur(0px)"
    });
    
    // Create quantum state animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Quantum state superposition
    chars.forEach((char, i) => {
    // Random probabilities for different states
    const stateA = { scale: 1, x: 0, y: 0, opacity: 1, filter: "blur(0px)", color: "#000000" };
    const stateB = { scale: 1.2, x: 10, y: -5, opacity: 0.7, filter: "blur(2px)", color: "#6EB5FF" };
    const stateC = { scale: 0.8, x: -15, y: 5, opacity: 0.8, filter: "blur(1px)", color: "#FF5757" };
    
    // Create quantum oscillation
    const tQuantum = gsap.timeline({ repeat: -1 });
    
    // State fluctuations - representing quantum uncertainty
    tQuantum.to(char, {
        ...stateA,
        duration: 0.5 + Math.random() * 0.5,
        ease: "power1.inOut"
    });
    
    // Randomly show different states based on probability
    if (Math.random() < 0.3) {
        tQuantum.to(char, {
            ...stateB,
            duration: 0.5 + Math.random() * 0.5,
            ease: "power1.inOut"
        });
    }
    
    if (Math.random() < 0.2) {
        tQuantum.to(char, {
            ...stateC,
            duration: 0.5 + Math.random() * 0.5,
            ease: "power1.inOut"
        });
    }
    
    // Return to base state
    tQuantum.to(char, {
        ...stateA,
        duration: 0.5 + Math.random() * 0.5,
        ease: "power1.inOut"
    });
    
    // Add to master timeline
    tl.add(tQuantum, i * 0.1);
    });
    
    // Cursor interaction - quantum state observation/collapse
    mainLetter.addEventListener('mousemove', function() {
    if (cursorInfluence > 0.2) {
        chars.forEach((char) => {
            const charRect = char.getBoundingClientRect();
            const charCenterX = charRect.left + charRect.width / 2;
            const charCenterY = charRect.top + charRect.height / 2;
            
            // Distance to cursor (observation point)
            const dx = mouseX - charCenterX;
            const dy = mouseY - charCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Quantum collapse probability based on observation proximity
            const observationStrength = Math.max(0, 1 - distance / 150) * cursorInfluence;
            
            if (observationStrength > 0.3) {
                // Pause the timeline for this character - "observation freezes the state"
                gsap.killTweensOf(char);
                
                // Collapse to observed state - sharper/more defined
                gsap.to(char, {
                    scale: 1 + 0.2 * observationStrength,
                    opacity: 1,
                    filter: "blur(0px)",
                    color: "#000000",
                    duration: 0.2,
                    ease: "power2.out"
                });
                
                // Random quantum jump when observed
                if (Math.random() < 0.1 * observationStrength) {
                    const jumpX = (Math.random() - 0.5) * 30;
                    const jumpY = (Math.random() - 0.5) * 30;
                    
                    gsap.to(char, {
                        x: jumpX,
                        y: jumpY,
                        duration: 0.1,
                        ease: "none",
                        onComplete: function() {
                            // Return to position
                            gsap.to(char, {
                                x: 0,
                                y: 0,
                                duration: 0.3,
                                ease: "power2.out"
                            });
                        }
                    });
                }
            }
        });
    }
    });
    
    // Store current animation
    currentAnimation = tl;
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
    chars.forEach((char) => {
        gsap.killTweensOf(char);
    });
    
    mainLetter.removeEventListener('mousemove', function() {});
    
    if (splitText) {
        splitText.revert();
    }
    });
    }

    // R - Resonance Animation
function initResonanceAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Set initial state
    gsap.set(chars, { 
    y: 0,
    transformOrigin: "center center"
    });
    
    // Create the base oscillation animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Baseline oscillation (non-resonant)
    chars.forEach((char, i) => {
    // Each character oscillates at base frequency
    gsap.to(char, {
        y: function(t) {
            return Math.sin(t * Math.PI) * 10;
        },
        duration: 2,
        ease: "none",
        repeat: -1
    });
    });
    
    // Add amplification zones
    let isInResonance = false;
    let resonanceTimer = null;
    
    // Switch in and out of resonance periodically
    function toggleResonance() {
    isInResonance = !isInResonance;
    
    chars.forEach((char, i) => {
        // Get current phase
        const currentY = gsap.getProperty(char, "y");
        
        // Adjust amplitude based on resonance state
        const targetAmplitude = isInResonance ? 30 : 10;
        const duration = isInResonance ? 1 : 2;
        
        // Kill current oscillation
        gsap.killTweensOf(char, "y");
        
        // Start new oscillation with updated amplitude
        const freq = isInResonance ? 1.5 : 0.5;
        gsap.to(char, {
            y: function(t) {
                return Math.sin(freq * t * Math.PI) * targetAmplitude;
            },
            duration: 2,
            ease: "none",
            repeat: -1
        });
        
        // Scale effect to visualize energy increase
        gsap.to(char, {
            scale: isInResonance ? 1.2 : 1,
            duration: duration,
            ease: "power1.inOut"
        });
    });
    
    // Schedule next toggle
    resonanceTimer = setTimeout(toggleResonance, (isInResonance ? 3 : 5) * 1000);
    }
    
    // Start the resonance cycle
    resonanceTimer = setTimeout(toggleResonance, 3000);
    
    // Cursor interaction - drive resonance
    mainLetter.addEventListener('mousemove', function() {
    if (cursorInfluence > 0.2) {
        const letterRect = mainLetter.getBoundingClientRect();
        const letterCenterX = letterRect.left + letterRect.width / 2;
        
        // Distance from center - affects frequency
        const dx = (mouseX - letterCenterX) / letterRect.width * 2; // -1 to 1 range
        
        // Map position to frequency (center = resonant frequency)
        const normalizedPosition = Math.abs(dx);
        const isNearResonance = normalizedPosition < 0.2; // Close to resonant frequency
        
        chars.forEach((char, i) => {
            // Current oscillation
            const currentY = gsap.getProperty(char, "y");
            
            // Kill current oscillation
            gsap.killTweensOf(char, "y");
            
            // Frequency based on cursor position
            const freq = isNearResonance ? 
                1.5 + (Math.random() * 0.1 - 0.05) : // Near resonance with slight variation
                0.5 + dx * 2; // Away from resonance
            
            // Amplitude based on resonance
            const amplitude = isNearResonance ? 
                30 + 20 * cursorInfluence * (1 - normalizedPosition * 5) : // Amplified at resonance
                10 + 5 * cursorInfluence; // Normal amplitude
                // Apply new oscillation
                gsap.to(char, {
                    y: function(t) {
                        return Math.sin(freq * t * Math.PI) * amplitude;
                    },
                    duration: 2,
                    ease: "none",
                    repeat: -1
                });
                
                // Visual feedback for resonance
                gsap.to(char, {
                    scale: isNearResonance ? 1.3 : 1,
                    duration: 0.3,
                    ease: "power1.out",
                    overwrite: "auto"
                });
            });
        }
    });
    
    // Store current animation
    currentAnimation = tl;
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
        clearTimeout(resonanceTimer);
        
        chars.forEach((char) => {
            gsap.killTweensOf(char);
        });
        
        mainLetter.removeEventListener('mousemove', function() {});
        
        if (splitText) {
            splitText.revert();
        }
    });
    }
    
     // S - Symmetry Animation
     function initSymmetryAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For Symmetry - Balance across an axis or point
        
        // Set initial state
        gsap.set(chars, { 
            x: 0,
            y: 0,
            rotation: 0,
            transformOrigin: "center center"
        });
        
        // Use slider to control symmetry axis rotation
        const symmetryRotation = getSliderValue() * 180; // 0 to 180 degrees
        
        // Create symmetrical animation
        const tl = gsap.timeline({ repeat: -1 });
        
        // Define symmetrical movement
        function createSymmetryAnimation() {
            const subTl = gsap.timeline();
            
            // Character count for center point
            const centerIndex = Math.floor(chars.length / 2);
            const isEven = chars.length % 2 === 0;
            
            // Convert degrees to radians
            const angleRad = symmetryRotation * Math.PI / 180;
            
            // Calculate symmetry axis vector
            const axisX = Math.cos(angleRad);
            const axisY = Math.sin(angleRad);
            
            // Symmetrical movement around the axis
            chars.forEach((char, i) => {
                let distFromCenter;
                if (isEven) {
                    distFromCenter = i - (centerIndex - 0.5);
                } else {
                    distFromCenter = i - centerIndex;
                }
                
                // Position along axis
                const position = distFromCenter * 20;
                
                // Project position onto axis vector for symmetrical movement
                const projectedX = axisX * position;
                const projectedY = axisY * position;
                
                // Rotation - mirrored across the axis
                const rotation = distFromCenter * 5 * axisY; // Rotate based on axis angle
                
                // Animate to position
                subTl.to(char, {
                    x: projectedX,
                    y: projectedY,
                    rotation: rotation,
                    duration: 1.5,
                    ease: "sine.inOut"
                }, 0);
            });
            
            // Return to center
            subTl.to(chars, {
                x: 0,
                y: 0,
                rotation: 0,
                duration: 1.5,
                ease: "sine.inOut"
            });
            
            // Mirror the movement in the opposite direction
            chars.forEach((char, i) => {
                let distFromCenter;
                if (isEven) {
                    distFromCenter = i - (centerIndex - 0.5);
                } else {
                    distFromCenter = i - centerIndex;
                }
                
                const position = -distFromCenter * 20; // Negative for mirroring
                const projectedX = axisX * position;
                const projectedY = axisY * position;
                const rotation = distFromCenter * -5 * axisY; // Opposite rotation
                
                subTl.to(char, {
                    x: projectedX,
                    y: projectedY,
                    rotation: rotation,
                    duration: 1.5,
                    ease: "sine.inOut"
                }, 3);
            });
            
            // Complete the cycle
            subTl.to(chars, {
                x: 0,
                y: 0,
                rotation: 0,
                duration: 1.5,
                ease: "sine.inOut"
            });
            
            return subTl;
        }
        
        // Add symmetry animation to main timeline
        tl.add(createSymmetryAnimation());
        
        // Cursor interaction - break and restore symmetry
        mainLetter.addEventListener('mousemove', function() {
            if (cursorInfluence > 0.2) {
                const letterRect = mainLetter.getBoundingClientRect();
                const letterCenterX = letterRect.left + letterRect.width / 2;
                const letterCenterY = letterRect.top + letterRect.height / 2;
                
                // Distance to cursor
                const dx = mouseX - letterCenterX;
                const dy = mouseY - letterCenterY;
                
                // Interaction strength
                const interactionStrength = Math.min(1, Math.sqrt(dx*dx + dy*dy) / 150) * cursorInfluence;
                
                // Character count for center point
                const centerIndex = Math.floor(chars.length / 2);
                const isEven = chars.length % 2 === 0;
                
                chars.forEach((char, i) => {
                    const charRect = char.getBoundingClientRect();
                    const charCenterX = charRect.left + charRect.width / 2;
                    const charCenterY = charRect.top + charRect.height / 2;
                    
                    // Distance from cursor to char
                    const charDx = mouseX - charCenterX;
                    const charDy = mouseY - charCenterY;
                    const charDist = Math.sqrt(charDx*charDx + charDy*charDy);
                    
                    // Current position
                    const currentX = gsap.getProperty(char, "x");
                    const currentY = gsap.getProperty(char, "y");
                    
                    // Position index relative to center
                    let distFromCenter;
                    if (isEven) {
                        distFromCenter = i - (centerIndex - 0.5);
                    } else {
                        distFromCenter = i - centerIndex;
                    }
                    
                    // Symmetry breaking - move toward or away from cursor
                    // Closer chars move more
                    const breakFactor = Math.max(0, 1 - charDist / 150) * interactionStrength;
                    
                    if (breakFactor > 0.1) {
                        // Break symmetry based on cursor position
                        gsap.to(char, {
                            x: currentX - charDx * 0.1 * breakFactor,
                            y: currentY - charDy * 0.1 * breakFactor,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    }
                });
            }
        });
        
        // Add mouseout to restore symmetry
        mainLetter.addEventListener('mouseleave', function() {
            // Get current position in timeline
            const progress = tl.progress();
            
            // Kill all tweens
            chars.forEach((char) => {
                gsap.killTweensOf(char);
            });
            
            // Restore timeline
            tl.progress(progress);
            tl.play();
        });
        
        // Add click for perfect symmetry demonstration
        mainLetter.addEventListener('click', function() {
            // Pause timeline
            tl.pause();
            
            // Perfect symmetry demonstration
            const centerIndex = Math.floor(chars.length / 2);
            const isEven = chars.length % 2 === 0;
            
            // Rotate symmetry axis
            const newAxis = (symmetryRotation + 90) % 180;
            const angleRad = newAxis * Math.PI / 180;
            
            // Calculate new symmetry axis vector
            const axisX = Math.cos(angleRad);
            const axisY = Math.sin(angleRad);
            
            // Apply perfect symmetry
            chars.forEach((char, i) => {
                let distFromCenter;
                if (isEven) {
                    distFromCenter = i - (centerIndex - 0.5);
                } else {
                    distFromCenter = i - centerIndex;
                }
                
                // Position along new axis
                const position = distFromCenter * 30;
                const projectedX = axisX * position;
                const projectedY = axisY * position;
                
                // Scale with distance from center
                const centerScale = 1 + 0.3 * Math.abs(distFromCenter) / centerIndex;
                
                gsap.to(char, {
                    x: projectedX,
                    y: projectedY,
                    scale: centerScale,
                    rotation: distFromCenter * 10,
                    duration: 1,
                    ease: "power2.inOut"
                });
                
                // Return to center
                gsap.to(char, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    delay: 1.5,
                    duration: 1,
                    ease: "elastic.out(1, 0.5)",
                    onComplete: function() {
                        if (char === chars[chars.length - 1]) {
                            // Resume timeline
                            tl.resume();
                        }
                    }
                });
            });
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            mainLetter.removeEventListener('mousemove', function() {});
            mainLetter.removeEventListener('mouseleave', function() {});
            mainLetter.removeEventListener('click', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
    // T - Thermal Animation
    function initThermalAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Set initial state
    gsap.set(chars, { 
        scale: 1,
        color: "#000000",
        textShadow: "none",
        transformOrigin: "center center"
    });
    
    // Create thermal animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Temperature cycles
    function createThermalCycle() {
        const subTl = gsap.timeline();
        
        // Cold state (low energy)
        subTl.to(chars, {
            scale: 0.9,
            color: "#6EB5FF",
            textShadow: "0 0 5px #6EB5FF",
            duration: 2,
            ease: "sine.inOut",
            stagger: 0.05
        });
        
        // Medium state
        subTl.to(chars, {
            scale: 1,
            color: "#000000",
            textShadow: "none",
            duration: 2,
            ease: "sine.inOut",
            stagger: 0.05
        });
        
        // Hot state (high energy)
        subTl.to(chars, {
            scale: 1.1,
            color: "#FF5757",
            textShadow: "0 0 8px #FF5757",
            duration: 2,
            ease: "sine.inOut",
            stagger: 0.05
        });
        
        // Return to medium
        subTl.to(chars, {
            scale: 1,
            color: "#000000",
            textShadow: "none",
            duration: 2,
            ease: "sine.inOut",
            stagger: 0.05
        });
        
        return subTl;
    }
    
    tl.add(createThermalCycle());
    
    // Random thermal motion based on temperature
    chars.forEach((char, i) => {
        // Higher frequency with more thermal energy
        const thermalFreq = 0.5 + i * 0.1;
        const thermalAmplitude = 3;
        
        // Thermal jitter - continuous random movement
        gsap.to(char, {
            x: function(t) {
                return (Math.random() - 0.5) * thermalAmplitude;
            },
            y: function(t) {
                return (Math.random() - 0.5) * thermalAmplitude;
            },
            duration: 0.1,
            repeat: -1,
            ease: "none"
        });
    });
    
    // Cursor interaction - heat up or cool down
    mainLetter.addEventListener('mousemove', function() {
        if (cursorInfluence > 0.2) {
            const letterRect = mainLetter.getBoundingClientRect();
            const letterCenterX = letterRect.left + letterRect.width / 2;
            
            // Distance from center - affects temperature
            const dx = mouseX - letterCenterX;
            
            // Cursor position determines temperature
            // Left = cold, right = hot
            const normalizedPosition = (dx / letterRect.width * 2) * cursorInfluence; // -1 to 1
            
            chars.forEach((char, i) => {
                const charRect = char.getBoundingClientRect();
                const charCenterX = charRect.left + charRect.width / 2;
                const charCenterY = charRect.top + charRect.height / 2;
                
                // Distance to cursor
                const charDx = mouseX - charCenterX;
                const charDy = mouseY - charCenterY;
                const charDist = Math.sqrt(charDx*charDx + charDy*charDy);
                
                // Temperature effect based on proximity and position
                const tempEffect = Math.max(0, 1 - charDist / 150) * Math.abs(normalizedPosition);
                
                if (tempEffect > 0.1) {
                    // Cold effect (left side)
                    if (normalizedPosition < -0.1) {
                        // Blue color, contract
                        gsap.to(char, {
                            color: gsap.utils.interpolate("#000000", "#6EB5FF", tempEffect),
                            textShadow: `0 0 ${tempEffect * 5}px #6EB5FF`,
                            scale: 1 - tempEffect * 0.2,
                            duration: 0.3,
                            ease: "power1.out",
                            overwrite: "auto"
                        });
                        
                        // Reduce thermal motion
                        gsap.killTweensOf(char, { x: true, y: true });
                        gsap.to(char, {
                            x: function(t) {
                                return (Math.random() - 0.5) * (1 - tempEffect);
                            },
                            y: function(t) {
                                return (Math.random() - 0.5) * (1 - tempEffect);
                            },
                            duration: 0.1,
                            repeat: -1,
                            ease: "none"
                        });
                    }
                    // Hot effect (right side)
                    else if (normalizedPosition > 0.1) {
                        // Red color, expand
                        gsap.to(char, {
                            color: gsap.utils.interpolate("#000000", "#FF5757", tempEffect),
                            textShadow: `0 0 ${tempEffect * 8}px #FF5757`,
                            scale: 1 + tempEffect * 0.2,
                            duration: 0.3,
                            ease: "power1.out",
                            overwrite: "auto"
                        });
                        
                        // Increase thermal motion
                        gsap.killTweensOf(char, { x: true, y: true });
                        gsap.to(char, {
                            x: function(t) {
                                return (Math.random() - 0.5) * (1 + tempEffect * 2);
                            },
                            y: function(t) {
                                return (Math.random() - 0.5) * (1 + tempEffect * 2);
                            },
                            duration: 0.1,
                            repeat: -1,
                            ease: "none"
                        });
                    }
                }
            });
        }
    });
    
    // Add mouseout to return to normal thermal state
    mainLetter.addEventListener('mouseleave', function() {
        chars.forEach((char, i) => {
            // Kill current tweens
            gsap.killTweensOf(char, { color: true, textShadow: true, scale: true });
            
            // Reset thermal jitter to normal
            gsap.killTweensOf(char, { x: true, y: true });
            gsap.to(char, {
                x: function(t) {
                    return (Math.random() - 0.5) * 3;
                },
                y: function(t) {
                    return (Math.random() - 0.5) * 3;
                },
                duration: 0.1,
                repeat: -1,
                ease: "none"
            });
        });
    });
    
    // Store current animation
    currentAnimation = tl;
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
        chars.forEach((char) => {
            gsap.killTweensOf(char);
        });
        
        mainLetter.removeEventListener('mousemove', function() {});
        mainLetter.removeEventListener('mouseleave', function() {});
        
        if (splitText) {
            splitText.revert();
        }
    });
    }
    
    
    // U - Uncertainty Animation
    function initUncertaintyAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For Uncertainty - Limits on measurement precision
        
        // Set initial state - position is certain, momentum is uncertain
        gsap.set(chars, { 
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            transformOrigin: "center center"
        });
        
        // Use slider to control the uncertainty level
        const uncertaintyLevel = 0.3 + getSliderValue() * 1.5; // 0.3 to 1.8
        
        // Create uncertainty animation
        const tl = gsap.timeline({ repeat: -1 });
        
        // Position certainty = velocity uncertainty
        function createPositionAnimation() {
            const subTl = gsap.timeline();
            
            // Position is certain (fixed position, blurred to show velocity uncertainty)
            subTl.to(chars, {
                x: function(i) {
                    return i * 15; // Fixed, precise positions
                },
                filter: `blur(${5 * uncertaintyLevel}px)`, // Blurry = velocity uncertainty
                opacity: 0.8,
                duration: 2,
                ease: "sine.inOut",
                stagger: 0.1
            });
            
            // Transition phase
            subTl.to(chars, {
                x: 0,
                filter: "blur(0px)",
                opacity: 1,
                duration: 1,
                ease: "power1.inOut",
                stagger: 0.1
            });
            
            // Velocity is certain (random, fast motion with clear edges)
            subTl.to(chars, {
                x: function(i, target) {
                    return (Math.random() - 0.5) * 50; // Random but sharp positions
                },
                filter: "blur(0px)", // Sharp = position uncertainty
                duration: 0.1,
                ease: "none",
                repeat: 20,
                stagger: 0.05
            });
            
            // Transition back
            subTl.to(chars, {
                x: 0,
                filter: "blur(0px)",
                duration: 1,
                ease: "power1.inOut",
                stagger: 0.1
            });
            
            return subTl;
        }
        
        tl.add(createPositionAnimation());
        
        // Cursor interaction - observe the position, increase velocity uncertainty
        mainLetter.addEventListener('mousemove', function() {
            if (cursorInfluence > 0.2) {
                const letterRect = mainLetter.getBoundingClientRect();
                const letterCenterX = letterRect.left + letterRect.width / 2;
                const letterCenterY = letterRect.top + letterRect.height / 2;
                
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const charCenterX = charRect.left + charRect.width / 2;
                    const charCenterY = charRect.top + charRect.height / 2;
                    
                    // Distance to cursor (observation point)
                    const dx = mouseX - charCenterX;
                    const dy = mouseY - charCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Observation strength - closer = more precisely observed position
                    const observationStrength = Math.max(0, 1 - distance / 150) * cursorInfluence;
                    
                    if (observationStrength > 0.1) {
                        // When observed, position becomes more certain, velocity more uncertain
                        gsap.to(char, {
                            filter: `blur(${8 * observationStrength * uncertaintyLevel}px)`, // Increase blur (velocity uncertainty)
                            scale: 1 - 0.1 * observationStrength, // Slight contraction
                            duration: 0.3,
                            ease: "power1.out",
                            overwrite: "auto"
                        });
                        
                        // Reset when not directly observed
                        gsap.to(char, {
                            filter: "blur(0px)",
                            scale: 1,
                            delay: 0.3,
                            duration: 0.5,
                            ease: "power1.inOut",
                            overwrite: "auto"
                        });
                    }
                });
            }
        });
        
        // Add click to demonstrate uncertainty principle
        mainLetter.addEventListener('click', function() {
            // Pause timeline
            tl.pause();
            
            // Extreme uncertainty demonstration
            chars.forEach((char, i) => {
                const delay = i * 0.1;
                
                // Phase 1: Perfect position measurement
                gsap.to(char, {
                    x: function() {
                        return i * 15; // Exact, known positions
                    },
                    filter: `blur(${10 * uncertaintyLevel}px)`, // Extreme velocity uncertainty
                    scale: 0.9,
                    delay: delay,
                    duration: 0.5,
                    ease: "power2.out"
                });
                
                // Phase 2: Perfect velocity measurement
                gsap.to(char, {
                    x: function() {
                        return (Math.random() - 0.5) * 100; // Random positions (position uncertainty)
                    },
                    filter: "blur(0px)", // Clear image (velocity certainty)
                    scale: 1.1,
                    delay: delay + 1,
                    duration: 0.01, // Instant change
                    repeat: 15,
                    repeatDelay: 0.05
                });
                
                // Return to intermediate state
                gsap.to(char, {
                    x: 0,
                    filter: "blur(0px)",
                    scale: 1,
                    delay: delay + 2,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: function() {
                        if (char === chars[chars.length - 1]) {
                            // Resume timeline
                            tl.resume();
                        }
                    }
                });
            });
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            mainLetter.removeEventListener('mousemove', function() {});
            mainLetter.removeEventListener('click', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }

    // V - Voltage Animation (Electric Potential)
function initVoltageAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Make sure we have valid characters
    if (!chars || chars.length === 0 || !mainLetter) {
        console.error("Missing elements for voltage animation");
        return gsap.timeline();
    }
    
    // Create a timeline for our animation
    const tl = gsap.timeline({ repeat: -1 });
    
    // Set initial state
    gsap.set(chars, { 
        color: "#000000",
        transformOrigin: "center center",
        textShadow: "none"
    });
    
    // Default voltage animation showing electric potential
    function createVoltageAnimation() {
        // First state - low voltage (neutral)
        tl.to(chars, {
            color: "#000000",
            textShadow: "none",
            scale: 1,
            duration: 1.5,
            ease: "sine.inOut",
            stagger: 0.1
        });
        
        // Second state - high voltage (fast transition to avoid ugly mix)
        tl.to(chars, {
            color: "#46EAFF", // Using your specified cyan color
            textShadow: "0 0 10px rgba(70, 234, 255, 0.9)",
            scale: 1.1,
            duration: 0.3, // Much faster transition
            ease: "power1.out",
            stagger: 0.1
        });
        
        // Third state - maintain high voltage
        tl.to(chars, {
            color: "#46EAFF",
            textShadow: "0 0 15px rgba(70, 234, 255, 1), 0 0 30px rgba(70, 234, 255, 0.7)",
            scale: 1.15,
            duration: 1.5,
            ease: "sine.inOut",
            stagger: 0.1
        });
        
        // Final state - discharge back to neutral (fast transition)
        tl.to(chars, {
            color: "#000000",
            textShadow: "none",
            scale: 1,
            duration: 0.3, // Fast transition back to black
            ease: "power1.in",
            stagger: 0.1
        });
        
        return tl;
    }
    
    // Create the voltage animation
    createVoltageAnimation();
    
    // Track mouse interaction
    let isMouseOverLetter = false;
    let voltageLevel = 0; // 0 (low) to 1 (high)
    
    // Mouse move handler for voltage effect
    function handleMouseMove(e) {
        // Check if mouse is over the letter
        const letterRect = mainLetter.getBoundingClientRect();
        const wasOverLetter = isMouseOverLetter;
        
        isMouseOverLetter = (
            e.clientX >= letterRect.left && 
            e.clientX <= letterRect.right && 
            e.clientY >= letterRect.top && 
            e.clientY <= letterRect.bottom
        );
        
        if (isMouseOverLetter) {
            // Pause the default animation
            tl.pause();
            
            // Calculate horizontal position within letter (0 at left, 1 at right)
            const relativeX = (e.clientX - letterRect.left) / letterRect.width;
            
            // Map position to voltage level (left = low voltage, right = high voltage)
            voltageLevel = relativeX;
            
            // Apply direct black or blue color based on voltage threshold to avoid mixing
            const voltageColor = voltageLevel > 0.5 ? "#46EAFF" : "#000000";
            
            // Shadow size and intensity based on voltage
            const shadowSize = voltageLevel > 0.5 ? Math.round(voltageLevel * 20) : 0;
            const shadowIntensity = voltageLevel > 0.5 ? Math.min(1, voltageLevel * 1.2) : 0;
            const textShadow = voltageLevel > 0.5 ? 
                `0 0 ${shadowSize}px rgba(70, 234, 255, ${shadowIntensity}), 0 0 ${shadowSize * 2}px rgba(70, 234, 255, ${shadowIntensity * 0.6})` : 
                "none";
            
            // Apply voltage effect with sharp threshold
            gsap.to(chars, {
                color: voltageColor,
                textShadow: textShadow,
                scale: voltageLevel > 0.5 ? 1 + (voltageLevel * 0.2) : 1,
                duration: 0.2, // Very fast transition
                ease: "power1.out",
                stagger: {
                    each: 0.05,
                    from: "start" // Start from left
                }
            });
        } 
        // If mouse just left the letter
        else if (wasOverLetter && !isMouseOverLetter) {
            // Return to neutral voltage quickly
            gsap.to(chars, {
                color: "#000000",
                textShadow: "none",
                scale: 1,
                duration: 0.3, // Fast transition
                ease: "power1.out",
                stagger: 0.05,
                onComplete: function() {
                    // Resume default animation
                    tl.resume();
                }
            });
        }
    }
    
    // Click handler for dramatic electric discharge
    function handleClick() {
        // Pause animation
        tl.pause();
        
        // Create electric discharge effect
        const dischargeTl = gsap.timeline({
            onComplete: function() {
                if (!isMouseOverLetter) {
                    tl.resume();
                }
            }
        });
        
        // Maximum voltage build-up (use pure blue, no intermediate colors)
        dischargeTl.to(chars, {
            color: "#46EAFF",
            textShadow: "0 0 20px #46EAFF, 0 0 40px #46EAFF",
            scale: 1.2,
            duration: 0.2, // Fast transition
            ease: "power1.out",
            stagger: 0.03
        });
        
        // Sudden discharge flash
        dischargeTl.to(chars, {
            color: "#ffffff", // Flash white
            textShadow: "0 0 30px #ffffff, 0 0 60px #46EAFF",
            scale: 1.3,
            duration: 0.1,
            ease: "none"
        });
        
        // Cool down period (fast transition back to black)
        dischargeTl.to(chars, {
            color: "#000000",
            textShadow: "none",
            scale: 1,
            duration: 0.3, // Fast transition
            ease: "power1.in"
        });
    }
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    mainLetter.addEventListener('click', handleClick);
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
        // Remove event listeners
        document.removeEventListener('mousemove', handleMouseMove);
        mainLetter.removeEventListener('click', handleClick);
        
        // Restore original characters
        gsap.set(chars, {
            clearProps: "all"
        });
        
        // Revert split text
        if (splitText && typeof splitText.revert === 'function') {
            splitText.revert();
        }
    });
    
    // Store animation reference
    currentAnimation = tl;
    
    return tl;
}
    
    // W - Wave Animation (Enhanced)
function initWaveAnimation() {
    const { splitText, chars } = createSplitTextAnimation();
    
    // Make sure we have characters to animate
    if (!chars || chars.length === 0) {
        console.error("No characters to animate");
        return gsap.timeline();
    }
    
    // Set initial state
    gsap.set(chars, { 
        y: 0,
        transformOrigin: "center center"
    });
    
    // Create timeline
    const tl = gsap.timeline({ repeat: -1 });
    
    // More dramatic wave parameters
    const waveAmplitude = 30; // Larger amplitude for more obvious wave
    const waveFrequency = 1; // Frequency of wave
    
    // Create a sequence of keyframes for a traveling wave effect
    function createWaveSequence() {
        const duration = 2; // Total duration of wave sequence
        const frames = 20; // Number of keyframes
        
        // Loop through multiple frames to create smooth wave motion
        for (let frame = 0; frame <= frames; frame++) {
            const progress = frame / frames;
            const time = progress * duration;
            
            // Custom positions for each character at this point in time
            const positions = chars.map((_, i) => {
                // Calculate position in wave - shifts over time to create traveling effect
                const wavePosition = (i / (chars.length - 1)) - progress;
                
                // Apply sine wave function
                return Math.sin(wavePosition * Math.PI * 2) * waveAmplitude;
            });
            
            // Create keyframe at this time point
            tl.to(chars, {
                y: (i) => positions[i],
                duration: duration / frames,
                ease: "none"
            }, time);
        }
        
        return tl;
    }
    
    // Create wave animation
    createWaveSequence();
    
    // Simple cursor interaction that creates ripples
    function handleMouseMove(e) {
        if (!mainLetter) return;
        
        // Get letter dimensions
        const letterRect = mainLetter.getBoundingClientRect();
        
        // Only process if mouse is over or near the letter
        if (e.clientX >= letterRect.left - 50 && 
            e.clientX <= letterRect.right + 50 && 
            e.clientY >= letterRect.top - 50 && 
            e.clientY <= letterRect.bottom + 50) {
            
            // Horizontal position within the letter
            const normalizedX = (e.clientX - letterRect.left) / letterRect.width;
            
            // Find which character is closest to cursor
            const closestCharIndex = Math.floor(normalizedX * chars.length);
            
            // Create ripple effect centered on closest character
            for (let i = 0; i < chars.length; i++) {
                // Distance from ripple center (in character indices)
                const distance = Math.abs(i - closestCharIndex);
                
                // Only affect nearby characters
                if (distance < chars.length / 2) {
                    // Delay based on distance from center (ripple propagation)
                    const delay = distance * 0.05;
                    
                    // Ripple amplitude decreases with distance
                    const rippleHeight = 40 * (1 - distance / (chars.length / 2));
                    
                    // Create ripple effect
                    gsap.to(chars[i], {
                        y: rippleHeight,
                        duration: 0.2,
                        delay: delay,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                    
                    // Return to wave
                    gsap.to(chars[i], {
                        y: 0,
                        delay: delay + 0.2,
                        duration: 0.6,
                        ease: "elastic.out(1, 0.3)",
                        overwrite: "auto"
                    });
                }
            }
            
            // Pause the regular wave briefly
            tl.pause();
            
            // Resume after ripple effect completes
            setTimeout(() => {
                tl.resume();
            }, 1000);
        }
    }
    
    // Dramatic tsunami wave for click
    function handleClick() {
        // Pause base animation
        tl.pause();
        
        // Tsunami animation
        const tsunami = gsap.timeline({
            onComplete: () => {
                // Resume base animation after tsunami completes
                tl.resume();
            }
        });
        
        // Create sequential wave with dramatic movements
        for (let i = 0; i < chars.length; i++) {
            const delay = i * 0.07;
            
            // Initial rise (big wave building)
            tsunami.to(chars[i], {
                y: -50,
                duration: 0.4,
                delay: delay,
                ease: "power2.out"
            }, 0);
            
            // Crash down (wave breaking)
            tsunami.to(chars[i], {
                y: 60,
                duration: 0.3,
                ease: "power3.in"
            }, 0.4 + delay);
            
            // Secondary smaller wave
            tsunami.to(chars[i], {
                y: -30,
                duration: 0.3,
                ease: "power2.out"
            }, 0.7 + delay);
            
            // Final smaller wave
            tsunami.to(chars[i], {
                y: 15,
                duration: 0.3,
                ease: "power2.in"
            }, 1.0 + delay);
            
            // Return to normal with bounce
            tsunami.to(chars[i], {
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            }, 1.3 + delay);
        }
    }
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    mainLetter.addEventListener('click', handleClick);
    
    // Clean up when animation is killed
    tl.eventCallback("onKill", function() {
        // Stop all animations
        chars.forEach((char) => {
            gsap.killTweensOf(char);
        });
        
        // Remove event listeners
        document.removeEventListener('mousemove', handleMouseMove);
        mainLetter.removeEventListener('click', handleClick);
        
        // Revert split text
        if (splitText && typeof splitText.revert === 'function') {
            splitText.revert();
        }
    });
    
    // Store current animation
    currentAnimation = tl;
    
    return tl;
}
    
    // X - X-ray Animation
    function initXrayAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // For X-ray - High-energy electromagnetic radiation
        
        // Set initial state
        gsap.set(chars, { 
            opacity: 1,
            scale: 1,
            color: "#000000",
            textShadow: "none",
            filter: "brightness(1) contrast(1)",
            transformOrigin: "center center"
        });
        
        // Use slider to control the X-ray energy level
        const xrayIntensity = 0.5 + getSliderValue() * 2; // 0.5 to 2.5
        
        // Create X-ray animation
        const tl = gsap.timeline({ repeat: -1 });
        
        // X-ray pulsing effect
        function createXrayEffect() {
            const subTl = gsap.timeline();
            
            // Normal state
            subTl.to(chars, {
                opacity: 1,
                scale: 1,
                color: "#000000",
                textShadow: "none",
                filter: "brightness(1) contrast(1)",
                duration: 1.5,
                ease: "sine.inOut",
                stagger: 0.05
            });
            
            // X-ray state - revealing "internal structure"
            subTl.to(chars, {
                opacity: 0.7,
                scale: 0.95,
                color: "#00ccff",
                textShadow: `0 0 ${8 * xrayIntensity}px rgba(0, 204, 255, 0.8)`,
                filter: `brightness(${1.5 * xrayIntensity}) contrast(${1.5 * xrayIntensity})`,
                duration: 0.5,
                ease: "power2.in",
                stagger: 0.05
            });
            
            // Intense X-ray pulse
            subTl.to(chars, {
                opacity: 0.9,
                scale: 1.05,
                color: "#ffffff",
                textShadow: `0 0 ${15 * xrayIntensity}px rgba(100, 240, 255, 0.9)`,
                filter: `brightness(${2 * xrayIntensity}) contrast(${2 * xrayIntensity})`,
                duration: 0.3,
                ease: "power2.out",
                stagger: 0.05
            });
            
            // Fade back to normal
            subTl.to(chars, {
                opacity: 1,
                scale: 1,
                color: "#000000",
                textShadow: "none",
                filter: "brightness(1) contrast(1)",
                duration: 1,
                ease: "power1.inOut",
                stagger: 0.05
            });
            
            return subTl;
        }
        
        tl.add(createXrayEffect());
        
        // Create X-ray scanning effect
        let scanningAnimation = null;
        
        // Cursor interaction - X-ray scanning
        mainLetter.addEventListener('mousemove', function() {
            if (cursorInfluence > 0.2) {
                const letterRect = mainLetter.getBoundingClientRect();
                const letterLeftX = letterRect.left;
                const letterWidth = letterRect.width;
                
                // Horizontal position for scanning effect
                const normalizedX = Math.max(0, Math.min(1, (mouseX - letterLeftX) / letterWidth));
                
                // Kill previous scanning animation if exists
                if (scanningAnimation) {
                    scanningAnimation.kill();
                }
                
                // Create scanning effect
                scanningAnimation = gsap.timeline();
                
                chars.forEach((char, i) => {
                    // Position of this character in sequence
                    const charPosition = i / (chars.length - 1);
                    
                    // Distance from scanning point
                    const distance = Math.abs(normalizedX - charPosition);
                    
                    // X-ray scanning effect - strongest at scan point
                    if (distance < 0.2) {
                        // X-ray intensity based on distance from scan point
                        const intensity = Math.max(0, 1 - distance / 0.2) * cursorInfluence;
                        
                        // Apply X-ray effect
                        gsap.to(char, {
                            opacity: 0.7 + intensity * 0.3,
                            scale: 0.95 + intensity * 0.1,
                            color: gsap.utils.interpolate("#000000", "#00ccff", intensity),
                            textShadow: `0 0 ${intensity * 15 * xrayIntensity}px rgba(0, 204, 255, ${intensity * 0.8})`,
                            filter: `brightness(${1 + intensity * xrayIntensity}) contrast(${1 + intensity * xrayIntensity})`,
                            duration: 0.3,
                            ease: "power1.out",
                            overwrite: "auto"
                        });
                    } else {
                        // Return to normal
                        gsap.to(char, {
                            opacity: 1,
                            scale: 1,
                            color: "#000000",
                            textShadow: "none",
                            filter: "brightness(1) contrast(1)",
                            duration: 0.5,
                            ease: "power1.out",
                            overwrite: "auto"
                        });
                    }
                });
            }
        });
        
        // Add mouseout to return to normal
        mainLetter.addEventListener('mouseleave', function() {
            // Kill scanning animation
            if (scanningAnimation) {
                scanningAnimation.kill();
                scanningAnimation = null;
            }
            
            // Return to normal state
            chars.forEach((char) => {
                gsap.to(char, {
                    opacity: 1,
                    scale: 1,
                    color: "#F8F8F8",
                    textShadow: "none",
                    filter: "brightness(1) contrast(1)",
                    duration: 0.5,
                    ease: "power1.inOut",
                    overwrite: "auto"
                });
            });
        });
        
        // Add click for full X-ray exposure
        mainLetter.addEventListener('click', function() {
            // Pause timeline
            tl.pause();
            
            // Kill scanning animation
            if (scanningAnimation) {
                scanningAnimation.kill();
                scanningAnimation = null;
            }
            
            // Full X-ray exposure effect
            chars.forEach((char, i) => {
                const delay = i * 0.05;
                
                // Initial flash
                gsap.to(char, {
                    opacity: 0.3,
                    scale: 0.9,
                    color: "#ffffff",
                    textShadow: `0 0 ${20 * xrayIntensity}px rgba(255, 255, 255, 1)`,
                    filter: `brightness(${3 * xrayIntensity}) contrast(${3 * xrayIntensity})`,
                    delay: delay,
                    duration: 0.2,
                    ease: "power2.in"
                });
                
                // X-ray view - "see through" effect
                gsap.to(char, {
                    opacity: 0.8,
                    scale: 1,
                    color: "#00ccff",
                    textShadow: `0 0 ${15 * xrayIntensity}px rgba(0, 204, 255, 0.9)`,
                    filter: `brightness(${2 * xrayIntensity}) contrast(${2 * xrayIntensity})`,
                    delay: delay + 0.2,
                    duration: 0.3,
                    ease: "power1.out"
                });
                
                // Return to normal
                gsap.to(char, {
                    opacity: 1,
                    scale: 1,
                    color: "#000000",
                    textShadow: "none",
                    filter: "brightness(1) contrast(1)",
                    delay: delay + 1.5,
                    duration: 0.8,
                    ease: "power1.inOut",
                    onComplete: function() {
                        if (char === chars[chars.length - 1]) {
                            // Resume timeline
                            tl.resume();
                        }
                    }
                });
            });
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            // Kill scanning animation
            if (scanningAnimation) {
                scanningAnimation.kill();
                scanningAnimation = null;
            }
            
            mainLetter.removeEventListener('mousemove', function() {});
            mainLetter.removeEventListener('mouseleave', function() {});
            mainLetter.removeEventListener('click', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
     // Y - Yield Animation
     function initYieldAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Set initial state - condensed, stored energy
        gsap.set(chars, { 
            scale: 0.8,
            opacity: 1,
            color: "#000000",
            textShadow: "none",
            transformOrigin: "center center"
        });
        
        // Create yield animation
        const tl = gsap.timeline({ repeat: -1 });
        
        // Energy storage and release cycle
        function createYieldCycle() {
            const subTl = gsap.timeline();
            
            // Compression - storing energy
            subTl.to(chars, {
                scale: 0.7,
                duration: 2,
                ease: "power2.inOut",
                stagger: 0.05
            });
            
            // Tension at maximum compression
            subTl.to(chars, {
                color: "#FF5757",
                textShadow: "0 0 5px #FF5757",
                duration: 1,
                ease: "sine.inOut",
                stagger: 0.05
            });
            
            // Rapid expansion - energy release
            subTl.to(chars, {
                scale: 1.5,
                color: "#FEFF86",
                textShadow: "0 0 10px #FEFF86",
                duration: 0.5,
                ease: "power3.out",
                stagger: 0.03
            });
            
            // Energy dissipation
            subTl.to(chars, {
                scale: 1,
                color: "#000000",
                textShadow: "none",
                duration: 1.5,
                ease: "power2.inOut",
                stagger: 0.05
            });
            
            // Return to initial state
            subTl.to(chars, {
                scale: 0.8,
                duration: 1,
                ease: "power1.inOut",
                stagger: 0.05
            });
            
            return subTl;
        }
        
        tl.add(createYieldCycle());
        
        // Cursor interaction - trigger localized energy release
        mainLetter.addEventListener('mousemove', function() {
            if (cursorInfluence > 0.2) {
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const charCenterX = charRect.left + charRect.width / 2;
                    const charCenterY = charRect.top + charRect.height / 2;
                    
                    // Distance to cursor
                    const dx = mouseX - charCenterX;
                    const dy = mouseY - charCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Energy yield effect based on proximity
                    const yieldEffect = Math.max(0, 1 - distance / 150) * cursorInfluence;
                    
                    if (yieldEffect > 0.1) {
                        // Current state
                        const currentScale = gsap.getProperty(char, "scale");
                        
                        // Apply yield effect
                        gsap.to(char, {
                            scale: currentScale * (1 + yieldEffect * 0.5),
                            color: gsap.utils.interpolate("#000000", "#FEFF86", yieldEffect),
                            textShadow: `0 0 ${yieldEffect * 10}px #FEFF86`,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                        
                        // Return to timeline state
                        gsap.to(char, {
                            scale: currentScale,
                            color: "#000000",
                            textShadow: "none",
                            delay: 0.3,
                            duration: 0.5,
                            ease: "power1.inOut",
                            overwrite: "auto"
                        });
                    }
                });
            }
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            mainLetter.removeEventListener('mousemove', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
     // Z - Zero Point Animation
     function initZeroPointAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Set initial state
        gsap.set(chars, { 
            scale: 1,
            opacity: 1,
            color: "#000000",
            x: 0,
            y: 0,
            transformOrigin: "center center"
        });
        
        // Create zero point animation
        const tl = gsap.timeline({ repeat: -1 });
        
        // Quantum vacuum fluctuations
        chars.forEach((char, i) => {
            // Continuous subtle quantum fluctuations
            gsap.to(char, {
                x: function() {
                    return (Math.random() - 0.5) * 5;
                },
                y: function() {
                    return (Math.random() - 0.5) * 5;
                },
                scale: function() {
                    return 0.95 + Math.random() * 0.1;
                },
                opacity: function() {
                    return 0.95 + Math.random() * 0.05;
                },
                duration: 0.5 + Math.random() * 0.5,
                repeat: -1,
                repeatRefresh: true, // Get new random values each time
                ease: "sine.inOut"
            });
        });
        
        // Zero-point cycle - occasional energy dips
        function createZeroPointCycle() {
            const subTl = gsap.timeline();
            
            // Near-zero energy state
            subTl.to(chars, {
                scale: 0.9,
                opacity: 0.8,
                color: "#6EB5FF",
                duration: 2,
                ease: "sine.inOut",
                stagger: 0.05
            });
            
            // Minimum fluctuations
            subTl.to(chars, {
                scale: 0.85,
                opacity: 0.7,
                color: "#000000",
                duration: 1,
                ease: "power2.out",
                stagger: 0.05
            });
            
            // Return to normal vacuum state
            subTl.to(chars, {
                scale: 1,
                opacity: 1,
                color: "#000000",
                duration: 2,
                ease: "sine.inOut",
                stagger: 0.05
            });
            
            return subTl;
        }
        
        tl.add(createZeroPointCycle());
        
        // Cursor interaction - energy into vacuum
        mainLetter.addEventListener('mousemove', function() {
            if (cursorInfluence > 0.2) {
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const charCenterX = charRect.left + charRect.width / 2;
                    const charCenterY = charRect.top + charRect.height / 2;
                    
                    // Distance to cursor
                    const dx = mouseX - charCenterX;
                    const dy = mouseY - charCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Energy effect based on proximity
                    const energyEffect = Math.max(0, 1 - distance / 150) * cursorInfluence;
                    
                    if (energyEffect > 0.1) {
                        // Adding energy increases fluctuations
                        gsap.to(char, {
                            x: (Math.random() - 0.5) * 15 * energyEffect,
                            y: (Math.random() - 0.5) * 15 * energyEffect,
                            scale: 1 + 0.2 * energyEffect,
                            opacity: 1,
                            color: gsap.utils.interpolate("#000000", "#B0FF8C", energyEffect),
                            duration: 0.3,
                            ease: "power1.out",
                            overwrite: "auto"
                        });
                        
                        // Return to vacuum fluctuations
                        gsap.to(char, {
                            scale: 0.95 + Math.random() * 0.1,
                            opacity: 0.95 + Math.random() * 0.05,
                            color: "#000000",
                            delay: 0.3,
                            duration: 0.5,
                            ease: "power1.inOut",
                            overwrite: "auto"
                        });
                    }
                });
            }
        });
        
        // Store current animation
        currentAnimation = tl;
        
        // Clean up when animation is killed
        tl.eventCallback("onKill", function() {
            chars.forEach((char) => {
                gsap.killTweensOf(char);
            });
            
            mainLetter.removeEventListener('mousemove', function() {});
            
            if (splitText) {
                splitText.revert();
            }
        });
    }
    
    // Replace your goToPrevLetter and goToNextLetter functions with these:

function goToPrevLetter() {
    if (currentIndex > 0) {
        // Normal case - go to previous letter
        updateDisplay(currentIndex - 1);
    } else {
        // If at first letter (A), go to last letter (Z)
        updateDisplay(25); // Z is at index 25 (0-based, so 26th letter)
    }
}

function goToNextLetter() {
    if (currentIndex < alphabetData.length - 1) {
        // Normal case - go to next letter
        updateDisplay(currentIndex + 1);
    } else {
        // If at last letter (Z), go to first letter (A)
        updateDisplay(0); // A is at index 0
    }
}
    function goToLetter(letter) {
        const index = alphabetData.findIndex(item => item.letter === letter);
        if (index !== -1) {
            updateDisplay(index);
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
    // Get the navigation buttons
    const prevButton = document.querySelector('.nav-text-button.prev');
    const nextButton = document.querySelector('.nav-text-button.next');
    
    // Add click event listeners
    if (prevButton) {
        prevButton.addEventListener('click', function(e) {
            e.stopPropagation();
            goToPrevLetter();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function(e) {
            e.stopPropagation();
            goToNextLetter();
        });
    }
});
    
    // Letter strip navigation
    letters.forEach(letterEl => {
        letterEl.addEventListener('click', function() {
            const letter = this.getAttribute('data-letter');
            goToLetter(letter);
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            goToPrevLetter();
        } else if (event.key === 'ArrowRight') {
            goToNextLetter();
        }
    });
    
    // Slider functionality
    const sliderTrack = document.querySelector('.slider-track');
    
    sliderTrack.addEventListener('click', function(event) {
        // Calculate position as percentage
        const rect = sliderTrack.getBoundingClientRect();
        let clickPosition = (event.clientX - rect.left) / rect.width;
        
        // Convert to index considering the margins
        const marginPercent = 0.01; // 1% margin from edges - very slight
        let normalizedPosition = (clickPosition - marginPercent) / (1 - 2 * marginPercent);
        normalizedPosition = Math.max(0, Math.min(1, normalizedPosition));
        
        // Find the closest letter index
        const index = Math.round(normalizedPosition * (alphabetData.length - 1));
        updateDisplay(index);
    });
    
    // Drag functionality for slider
    let isDragging = false;
    
    sliderThumb.addEventListener('mousedown', function(event) {
        isDragging = true;
        document.addEventListener('mousemove', moveThumb);
        document.addEventListener('mouseup', stopDragging);
        
        // Prevent text selection during drag
        event.preventDefault();
    });
    
    function moveThumb(event) {
        if (isDragging) {
            const track = sliderTrack.getBoundingClientRect();
            
            // Calculate raw position as percentage
            let rawPosition = (event.clientX - track.left) / track.width;
            rawPosition = Math.max(0, Math.min(1, rawPosition));
            
            // Convert to position within the usable range (accounting for 1% margins)
            const marginPercent = 0.01; // 1% margin from edges - very slight
            const adjustedPosition = marginPercent + rawPosition * (1 - 2 * marginPercent);
            
            // Set position immediately for responsive feel
            sliderThumb.style.left = `${adjustedPosition * 100}%`;
            
            // Calculate index - convert back to 0-1 range for index calculation
            const normalizedPosition = (adjustedPosition - marginPercent) / (1 - 2 * marginPercent);
            const index = Math.round(normalizedPosition * (alphabetData.length - 1));
            
            // Only update display if the index changed
            if (index !== currentIndex) {
                updateDisplay(index);
            }
            
            // Dispatch event for animation to update
            document.dispatchEvent(new CustomEvent('sliderMoved'));
        }
    }
    
    function stopDragging() {
        isDragging = false;
        document.removeEventListener('mousemove', moveThumb);
        document.removeEventListener('mouseup', stopDragging);
    }
    
    // Window resize handling for responsive animations
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(function() {
            // Reinitialize current animation after resize
            initAnimation(alphabetData[currentIndex].letter);
        }, 250); // Debounce resize events
    });
    
    // Initialize display
    updateDisplay(currentIndex);
});

document.addEventListener('DOMContentLoaded', function() {
    // Create the gradient animation using GSAP
    if (typeof gsap !== 'undefined') {
        gsap.to(".top-divider", {
            backgroundPosition: "-100% 0%", 
            duration: 20,
            ease: "none",
            repeat: -1,
            yoyo: false,
            immediateRender: true
        });
    } else {
        console.warn("GSAP not loaded. Add GSAP library for gradient animation.");
    }
});