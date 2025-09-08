document.addEventListener('DOMContentLoaded', function() {
    // Alphabet content data
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

    // Cache DOM elements
    const mainLetter = document.querySelector('.main-letter');
    const letterWord = document.querySelector('.letter-word');
    const concept = document.querySelector('.concept');
    const counter = document.querySelector('.counter');
    const prevButton = document.querySelector('.nav-text-button.prev');
    const nextButton = document.querySelector('.nav-text-button.next');
    const letters = document.querySelectorAll('.alphabet-strip .letter');
    const sliderThumb = document.querySelector('.slider-thumb');
    const sliderTrack = document.querySelector('.slider-track');
    
    // State management
    let currentIndex = 0;
    let currentAnimation = null;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorInfluence = 0;
    
    // Optimized mouse position tracking
    let mouseUpdateScheduled = false;
    function updateMousePosition(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!mouseUpdateScheduled) {
            mouseUpdateScheduled = true;
            requestAnimationFrame(() => {
                const letterBounds = mainLetter.getBoundingClientRect();
                const letterCenterX = letterBounds.left + letterBounds.width / 2;
                const letterCenterY = letterBounds.top + letterBounds.height / 2;
                
                const dx = mouseX - letterCenterX;
                const dy = mouseY - letterCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const influenceRange = letterBounds.width * 1.5;
                cursorInfluence = 1 - Math.min(1, distance / influenceRange);
                
                mouseUpdateScheduled = false;
            });
        }
    }
    
    document.addEventListener('mousemove', updateMousePosition, { passive: true });
    
    // Update display function
    function updateDisplay(index) {
        const data = alphabetData[index];
        
        if (currentIndex !== index) {
            clearCurrentAnimation();
        }
        
        mainLetter.textContent = data.letter;
        letterWord.textContent = data.word;
        concept.textContent = data.description;
        counter.textContent = `${index + 1}/26`;
        
        letters.forEach(letterEl => {
            letterEl.classList.remove('current');
            letterEl.textContent = letterEl.getAttribute('data-letter');
        });
        
        letters[index].classList.add('current');
        
        // Update slider position
        const trackWidth = sliderTrack.offsetWidth;
        const startMargin = 45;
        const endMargin = trackWidth + 2;
        const usableTrackWidth = endMargin - startMargin;
        const actualPosition = index / (alphabetData.length - 1);
        const thumbPosition = startMargin + (actualPosition * usableTrackWidth);
        
        gsap.to(sliderThumb, {
            left: thumbPosition,
            duration: 0.3,
            ease: "power2.out"
        });
        
        currentIndex = index;
        initAnimation(data.letter);
        
        document.dispatchEvent(new CustomEvent('letterChanged', { 
            detail: { letter: data.letter, word: data.word } 
        }));
    }
    
    // Clear current animation
    function clearCurrentAnimation() {
        if (currentAnimation) {
            currentAnimation.kill();
            currentAnimation = null;
        }
        document.removeEventListener('mousemove', updateMousePosition);
        document.addEventListener('mousemove', updateMousePosition, { passive: true });
    }
    
    // Helper function for split text
    function createSplitTextAnimation(letter) {
        let splitText;
        let chars;
        
        if (window.SplitText) {
            splitText = new SplitText(mainLetter, {type: "chars"});
            chars = splitText.chars;
        } else {
            chars = [mainLetter];
        }
        
        return { splitText, chars };
    }
    
    // Get slider value
    function getSliderValue() {
        const thumbRect = sliderThumb.getBoundingClientRect();
        const trackRect = sliderTrack.getBoundingClientRect();
        return (thumbRect.left + thumbRect.width/2 - trackRect.left) / trackRect.width;
    }
    
    // Animation functions map
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
    
    // Initialize animation
    function initAnimation(letter) {
        const animationFunction = animationFunctions[letter];
        if (animationFunction) {
            animationFunction();
        }
    }
    
    // A - Acceleration: Smooth speed increase
    function initAccelerationAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const masterTl = gsap.timeline({ repeat: -1 });
        
        // Smooth acceleration from left to right and back
        masterTl
            .set(chars, { x: 0, y: 0 })
            .to(chars, {
                x: 100,
                duration: 2,
                stagger: 0.05,
                ease: "power2.in" // Accelerating
            })
            .to(chars, {
                x: -100,
                duration: 2,
                stagger: 0.05,
                ease: "power2.in" // Accelerating in opposite direction
            })
            .to(chars, {
                x: 0,
                duration: 1,
                stagger: 0.02,
                ease: "power2.out" // Deceleration to stop
            });
        
        currentAnimation = masterTl;
    }
    
    // B - Balance: Smooth seesaw motion
    function initBalanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        gsap.set(chars, { transformOrigin: "50% 100%" });
        
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        
        tl.to(chars, {
            rotation: function(i) {
                return (i - chars.length/2) * 3; // Creates a balanced tilt
            },
            duration: 3,
            ease: "sine.inOut",
            stagger: 0.02
        });
        
        currentAnimation = tl;
    }
    
    // C - Conversion: Form transformation without colors
    function initConversionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Transform through different physical states
        tl
            .set(chars, { transformOrigin: "center center" })
            .to(chars, {
                scaleY: 1.5,
                scaleX: 0.7,
                rotation: 180,
                duration: 1.5,
                stagger: 0.05,
                ease: "power2.inOut"
            })
            .to(chars, {
                scaleY: 0.7,
                scaleX: 1.5,
                rotation: 360,
                duration: 1.5,
                stagger: 0.05,
                ease: "power2.inOut"
            })
            .to(chars, {
                scale: 1,
                rotation: 720,
                duration: 1.5,
                stagger: 0.05,
                ease: "power2.inOut"
            });
        
        currentAnimation = tl;
    }
    
    // D - Density: Compression and expansion
    function initDensityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        gsap.set(chars, { transformOrigin: "center bottom" });
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                scaleY: 0.5,
                scaleX: 1.2,
                duration: 2,
                ease: "power2.inOut",
                stagger: 0.03
            })
            .to(chars, {
                scaleY: 1.5,
                scaleX: 0.8,
                duration: 2,
                ease: "power2.inOut",
                stagger: 0.03
            })
            .to(chars, {
                scale: 1,
                duration: 1,
                ease: "power2.out"
            });
        
        currentAnimation = tl;
    }
    
    // E - Equilibrium: Perfect balance
    function initEquilibriumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Gentle floating in equilibrium
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: Math.sin(i) * 10,
                duration: 3 + i * 0.1,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });
        });
        
        currentAnimation = tl;
    }
    
    // F - Friction: Resistance and slowdown
    function initFrictionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                x: 150,
                duration: 0.5,
                stagger: 0.02,
                ease: "none" // Fast initial movement
            })
            .to(chars, {
                x: 0,
                duration: 3,
                stagger: 0.02,
                ease: "power3.out" // Gradual slowdown from friction
            });
        
        currentAnimation = tl;
    }
    
    // G - Gravity: Falling motion
    function initGravityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .set(chars, { y: -100 })
            .to(chars, {
                y: 0,
                duration: 1,
                stagger: 0.05,
                ease: "power2.in" // Accelerating fall
            })
            .to(chars, {
                y: -20,
                duration: 0.3,
                stagger: 0.02,
                ease: "power2.out" // Small bounce
            })
            .to(chars, {
                y: 0,
                duration: 0.2,
                ease: "power2.in"
            });
        
        currentAnimation = tl;
    }
    
    // H - Harmonic: Sine wave oscillation
    function initHarmonicAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: 30,
                duration: 1 + i * 0.05,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: i * 0.1
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // I - Inertia: Resistance to change
    function initInertiaAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                x: 50,
                duration: 3,
                stagger: 0.1,
                ease: "power4.in" // Very slow start showing resistance
            })
            .to(chars, {
                x: 0,
                duration: 3,
                stagger: 0.1,
                ease: "power4.out" // Slow stop showing inertia
            });
        
        currentAnimation = tl;
    }
    
    // J - Joule: Energy pulse
    function initJouleAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl.to(chars, {
            scale: 1.3,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out",
            repeat: 1,
            yoyo: true
        });
        
        currentAnimation = tl;
    }
    
    // K - Kinetic: Continuous motion
    function initKineticAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                x: "random(-50, 50)",
                y: "random(-30, 30)",
                duration: "random(1, 2)",
                ease: "none",
                repeat: -1,
                yoyo: true
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // L - Luminosity: Glowing effect with opacity
    function initLuminosityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl.to(chars, {
            opacity: 0.3,
            scale: 1.1,
            textShadow: "0 0 20px rgba(255,255,255,0.8)",
            duration: 1,
            stagger: 0.05,
            ease: "power2.inOut"
        })
        .to(chars, {
            opacity: 1,
            scale: 1,
            textShadow: "0 0 0px rgba(255,255,255,0)",
            duration: 1,
            stagger: 0.05,
            ease: "power2.inOut"
        });
        
        currentAnimation = tl;
    }
    
    // M - Momentum: Mass in motion
    function initMomentumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl.to(chars, {
            x: 200,
            duration: 2,
            stagger: 0.05,
            ease: "none" // Constant velocity showing momentum
        })
        .set(chars, { x: -200 })
        .to(chars, {
            x: 0,
            duration: 2,
            stagger: 0.05,
            ease: "none"
        });
        
        currentAnimation = tl;
    }
    
    // N - Neutron: Orbital motion
    function initNeutronAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            const angle = (i / chars.length) * Math.PI * 2;
            gsap.to(char, {
                x: Math.cos(angle) * 30,
                y: Math.sin(angle) * 30,
                duration: 2,
                ease: "none",
                repeat: -1
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // O - Oscillation: Back and forth
    function initOscillationAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        
        tl.to(chars, {
            x: 80,
            rotation: 15,
            duration: 1.5,
            stagger: 0.03,
            ease: "sine.inOut"
        });
        
        currentAnimation = tl;
    }
    
    // P - Potential: Stored energy release
    function initPotentialAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                y: -50,
                scale: 0.8,
                duration: 2,
                stagger: 0.03,
                ease: "power2.in" // Building potential
            })
            .to(chars, {
                y: 0,
                scale: 1.2,
                duration: 0.3,
                stagger: 0.01,
                ease: "power3.out" // Energy release
            })
            .to(chars, {
                scale: 1,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        
        currentAnimation = tl;
    }
    
    // Q - Quantum: Discrete jumps
    function initQuantumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const positions = [-40, -20, 0, 20, 40];
        const tl = gsap.timeline({ repeat: -1 });
        
        positions.forEach(pos => {
            tl.set(chars, {
                x: pos,
                duration: 0
            })
            .to(chars, {
                duration: 0.5,
                ease: "none"
            });
        });
        
        currentAnimation = tl;
    }
    
    // R - Resonance: Amplifying oscillation
    function initResonanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl.to(chars, {
            scaleY: 1.5,
            y: -20,
            duration: 0.5,
            stagger: 0.02,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 5,
            repeatDelay: 0.1
        });
        
        currentAnimation = tl;
    }
    
    // S - Symmetry: Mirror movements
    function initSymmetryAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const midPoint = Math.floor(chars.length / 2);
        
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        
        chars.forEach((char, i) => {
            const distance = Math.abs(i - midPoint);
            tl.to(char, {
                y: distance * 10,
                rotation: (i < midPoint ? -1 : 1) * distance * 5,
                duration: 2,
                ease: "sine.inOut"
            }, 0);
        });
        
        currentAnimation = tl;
    }
    
    // T - Thermal: Vibrating particles
    function initThermalAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach(char => {
            gsap.to(char, {
                x: "random(-5, 5)",
                y: "random(-5, 5)",
                duration: 0.1,
                ease: "none",
                repeat: -1,
                yoyo: true
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // U - Uncertainty: Unpredictable positions
    function initUncertaintyAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl.to(chars, {
            x: () => gsap.utils.random(-30, 30),
            y: () => gsap.utils.random(-20, 20),
            opacity: () => gsap.utils.random(0.5, 1),
            duration: 0.5,
            ease: "none"
        });
        
        currentAnimation = tl;
    }
    
    // V - Voltage: Electric flow
    function initVoltageAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Electric pulse effect
        tl.to(chars, {
            scaleY: 1.3,
            scaleX: 0.9,
            duration: 0.1,
            stagger: 0.02,
            ease: "power2.in"
        })
        .to(chars, {
            scale: 1,
            duration: 0.3,
            ease: "elastic.out(1, 0.3)"
        });
        
        currentAnimation = tl;
    }
    
    // W - Wave: Sine wave propagation
    function initWaveAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: 30,
                duration: 1,
                delay: i * 0.1,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // X - X-ray: Penetrating pulse with white glow
    function initXrayAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl.fromTo(chars, {
            opacity: 0.1,
            filter: "blur(2px)"
        }, {
            opacity: 1,
            filter: "blur(0px)",
            textShadow: "0 0 30px rgba(255,255,255,0.9)",
            duration: 0.5,
            stagger: 0.03,
            ease: "power2.out"
        })
        .to(chars, {
            opacity: 0.1,
            filter: "blur(2px)",
            textShadow: "0 0 0px rgba(255,255,255,0)",
            duration: 1,
            ease: "power2.in"
        });
        
        currentAnimation = tl;
    }
    
    // Y - Yield: Energy release burst
    function initYieldAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        
        tl.from(chars, {
            scale: 0,
            duration: 0.5,
            stagger: 0.02,
            ease: "back.out(1.7)"
        })
        .to(chars, {
            scale: 1.5,
            duration: 0.3,
            ease: "power2.out"
        })
        .to(chars, {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            stagger: 0.02,
            ease: "power2.in"
        })
        .set(chars, { scale: 1, opacity: 1 });
        
        currentAnimation = tl;
    }
    
    // Z - Zero Point: Minimal vibration
    function initZeroPointAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Very subtle vibration representing zero-point energy
        chars.forEach(char => {
            gsap.to(char, {
                x: "random(-1, 1)",
                y: "random(-1, 1)",
                duration: 0.2,
                ease: "none",
                repeat: -1,
                yoyo: true
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // Navigation functions
    function goToPrevLetter() {
        const prevIndex = (currentIndex - 1 + 26) % 26;
        updateDisplay(prevIndex);
    }
    
    function goToNextLetter() {
        const nextIndex = (currentIndex + 1) % 26;
        updateDisplay(nextIndex);
    }
    
    // Event listeners
    if (prevButton) {
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            goToPrevLetter();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            goToNextLetter();
        });
    }
    
    letters.forEach((letterEl, index) => {
        letterEl.addEventListener('click', () => updateDisplay(index));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            goToPrevLetter();
        } else if (e.key === 'ArrowRight') {
            goToNextLetter();
        }
    });
    
    // Slider interaction
    let isDragging = false;
    
    sliderThumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const trackRect = sliderTrack.getBoundingClientRect();
        const relativeX = e.clientX - trackRect.left;
        const percentage = Math.max(0, Math.min(1, relativeX / trackRect.width));
        const targetIndex = Math.round(percentage * 25);
        
        if (targetIndex !== currentIndex) {
            updateDisplay(targetIndex);
        }
    }, { passive: true });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Touch support
    sliderThumb.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const trackRect = sliderTrack.getBoundingClientRect();
        const relativeX = e.touches[0].clientX - trackRect.left;
        const percentage = Math.max(0, Math.min(1, relativeX / trackRect.width));
        const targetIndex = Math.round(percentage * 25);
        
        if (targetIndex !== currentIndex) {
            updateDisplay(targetIndex);
        }
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Initialize with first letter
    updateDisplay(0);
    
    // Make functions globally available
    window.goToPrevLetter = goToPrevLetter;
    window.goToNextLetter = goToNextLetter;
});