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

    // DOM elements
    const mainLetter = document.querySelector('.main-letter');
    const letterWord = document.querySelector('.letter-word');
    const concept = document.querySelector('.concept');
    const counter = document.querySelector('.counter');
    const prevButton = document.querySelector('.nav-text-button.prev');
    const nextButton = document.querySelector('.nav-text-button.next');
    const letters = document.querySelectorAll('.alphabet-strip .letter');
    const sliderThumb = document.querySelector('.slider-thumb');
    const sliderTrack = document.querySelector('.slider-track');
    
    // State
    let currentIndex = 0;
    let currentAnimation = null;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorInfluence = 0;
    let environmentElements = [];
    
    // Mouse tracking
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
                
                const influenceRange = letterBounds.width * 2;
                cursorInfluence = 1 - Math.min(1, distance / influenceRange);
                
                mouseUpdateScheduled = false;
            });
        }
    }
    
    document.addEventListener('mousemove', updateMousePosition, { passive: true });
    
    // Create environmental elements
    function createEnvironmentElement(type, options = {}) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.pointerEvents = 'none';
        element.style.zIndex = '1';
        
        switch(type) {
            case 'particle':
                element.style.width = options.size || '4px';
                element.style.height = options.size || '4px';
                element.style.background = options.color || '#000';
                element.style.borderRadius = '50%';
                break;
            case 'trail':
                element.style.width = options.width || '2px';
                element.style.height = options.height || '20px';
                element.style.background = options.color || 'rgba(0,0,0,0.3)';
                element.style.borderRadius = '1px';
                break;
            case 'wave':
                element.style.width = options.size || '100px';
                element.style.height = options.size || '100px';
                element.style.border = `1px solid ${options.color || 'rgba(0,0,0,0.2)'}`;
                element.style.borderRadius = '50%';
                element.style.background = 'transparent';
                break;
            case 'field':
                element.style.width = options.width || '200px';
                element.style.height = options.height || '200px';
                element.style.background = `radial-gradient(circle, ${options.color || 'rgba(0,0,0,0.1)'} 0%, transparent 70%)`;
                element.style.borderRadius = '50%';
                break;
        }
        
        mainLetter.parentNode.appendChild(element);
        environmentElements.push(element);
        return element;
    }
    
    // Clear environment
    function clearEnvironment() {
        environmentElements.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        environmentElements = [];
    }
    
    // Update display function
    function updateDisplay(index) {
        const data = alphabetData[index];
        
        if (currentIndex !== index) {
            clearCurrentAnimation();
            clearEnvironment();
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
        
        // Update slider
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
    
    // Clear animation
    function clearCurrentAnimation() {
        if (currentAnimation) {
            currentAnimation.kill();
            currentAnimation = null;
        }
        gsap.set(mainLetter, { clearProps: "all" });
    }
    
    // Create split text
    function createSplitTextAnimation() {
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
    
    // Animation functions
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
    
    function initAnimation(letter) {
        const animationFunction = animationFunctions[letter];
        if (animationFunction) {
            animationFunction();
        }
    }
    
    // A - Acceleration: Motion trails showing speed increase
    function initAccelerationAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create trailing effect
        const trails = [];
        chars.forEach((char, i) => {
            for (let j = 0; j < 5; j++) {
                const trail = createEnvironmentElement('trail', {
                    width: '3px',
                    height: '30px',
                    color: `rgba(0,0,0,${0.8 - j * 0.15})`
                });
                trails.push(trail);
            }
        });
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Accelerating movement
        tl.to(chars, {
            x: 200,
            duration: 3,
            ease: "power3.in",
            stagger: 0.02
        })
        .to(chars, {
            x: -200,
            duration: 3,
            ease: "power3.in",
            stagger: 0.02
        })
        .to(chars, {
            x: 0,
            duration: 1,
            ease: "power2.out"
        });
        
        // Animate trails
        trails.forEach((trail, i) => {
            const charIndex = Math.floor(i / 5);
            const trailIndex = i % 5;
            
            gsap.to(trail, {
                x: () => gsap.getProperty(chars[charIndex], "x") - (trailIndex + 1) * 20,
                y: () => gsap.getProperty(chars[charIndex], "y"),
                duration: 0.1,
                repeat: -1,
                ease: "none"
            });
        });
        
        currentAnimation = tl;
    }
    
    // B - Balance: Seesaw with fulcrum point
    function initBalanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create fulcrum
        const fulcrum = createEnvironmentElement('particle', {
            size: '8px',
            color: '#000'
        });
        
        const letterBounds = mainLetter.getBoundingClientRect();
        gsap.set(fulcrum, {
            x: letterBounds.left + letterBounds.width / 2 - 4,
            y: letterBounds.bottom + 10
        });
        
        gsap.set(chars, { transformOrigin: "50% 120%" });
        
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        
        // Balanced tilting
        tl.to(chars, {
            rotation: (i) => (i - chars.length/2) * 8,
            duration: 3,
            ease: "sine.inOut",
            stagger: 0.03
        });
        
        // Cursor interaction
        function updateBalance() {
            if (cursorInfluence > 0.2) {
                const tilt = (mouseX - letterBounds.left - letterBounds.width/2) / 10;
                gsap.to(chars, {
                    rotation: (i) => (i - chars.length/2) * 8 + tilt,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        }
        
        gsap.ticker.add(updateBalance);
        
        currentAnimation = tl;
    }
    
    // C - Conversion: Shape morphing between states
    function initConversionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Different transformation states
        const states = [
            { scale: 1, rotation: 0, opacity: 1 },
            { scale: 1.3, rotation: 90, opacity: 0.7 },
            { scale: 0.7, rotation: 180, opacity: 0.9 },
            { scale: 1.1, rotation: 270, opacity: 0.8 },
            { scale: 1, rotation: 360, opacity: 1 }
        ];
        
        states.forEach(state => {
            tl.to(chars, {
                scale: state.scale,
                rotation: state.rotation,
                opacity: state.opacity,
                duration: 1.2,
                stagger: 0.05,
                ease: "power2.inOut"
            });
        });
        
        currentAnimation = tl;
    }
    
    // D - Density: Visual compression with particle density
    function initDensityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create density particles
        const particles = [];
        for (let i = 0; i < 20; i++) {
            const particle = createEnvironmentElement('particle', {
                size: '3px',
                color: 'rgba(0,0,0,0.4)'
            });
            particles.push(particle);
        }
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Main letter compression
        tl.to(chars, {
            scale: 0.6,
            duration: 2,
            ease: "power2.inOut"
        })
        .to(chars, {
            scale: 1.4,
            duration: 2,
            ease: "power2.inOut"
        })
        .to(chars, {
            scale: 1,
            duration: 1,
            ease: "power2.out"
        });
        
        // Particles compress and expand
        const letterBounds = mainLetter.getBoundingClientRect();
        particles.forEach((particle, i) => {
            const angle = (i / particles.length) * Math.PI * 2;
            
            gsap.set(particle, {
                x: letterBounds.left + letterBounds.width/2 + Math.cos(angle) * 100,
                y: letterBounds.top + letterBounds.height/2 + Math.sin(angle) * 100
            });
            
            gsap.to(particle, {
                x: letterBounds.left + letterBounds.width/2 + Math.cos(angle) * 30,
                y: letterBounds.top + letterBounds.height/2 + Math.sin(angle) * 30,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut"
            });
        });
        
        currentAnimation = tl;
    }
    
    // E - Equilibrium: Stable floating with gentle sway
    function initEquilibriumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create equilibrium field
        const field = createEnvironmentElement('field', {
            width: '300px',
            height: '300px',
            color: 'rgba(0,0,0,0.05)'
        });
        
        const letterBounds = mainLetter.getBoundingClientRect();
        gsap.set(field, {
            x: letterBounds.left + letterBounds.width/2 - 150,
            y: letterBounds.top + letterBounds.height/2 - 150
        });
        
        // Gentle floating
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: Math.sin(i * 0.5) * 8,
                x: Math.cos(i * 0.3) * 5,
                duration: 3 + i * 0.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        
        // Field pulsing
        gsap.to(field, {
            scale: 1.1,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // F - Friction: Dragging motion with heat particles
    function initFrictionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create friction sparks
        const sparks = [];
        for (let i = 0; i < 10; i++) {
            const spark = createEnvironmentElement('particle', {
                size: '2px',
                color: 'rgba(0,0,0,0.6)'
            });
            sparks.push(spark);
        }
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Resistant motion
        tl.to(chars, {
            x: 100,
            duration: 0.3,
            ease: "power1.out",
            stagger: 0.02
        })
        .to(chars, {
            x: 0,
            duration: 2.5,
            ease: "power3.out", // Friction slowdown
            stagger: 0.02
        });
        
        // Sparks animation
        const letterBounds = mainLetter.getBoundingClientRect();
        sparks.forEach((spark, i) => {
            gsap.set(spark, {
                x: letterBounds.left + letterBounds.width,
                y: letterBounds.bottom
            });
            
            gsap.to(spark, {
                x: letterBounds.left + letterBounds.width + Math.random() * 50,
                y: letterBounds.bottom + Math.random() * 20,
                opacity: 0,
                duration: 1,
                repeat: -1,
                delay: Math.random() * 2,
                ease: "power2.out"
            });
        });
        
        currentAnimation = tl;
    }
    
    // G - Gravity: Falling particles towards the letter
    function initGravityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create falling particles
        const particles = [];
        for (let i = 0; i < 15; i++) {
            const particle = createEnvironmentElement('particle', {
                size: '4px',
                color: 'rgba(0,0,0,0.7)'
            });
            particles.push(particle);
        }
        
        // Letter gentle fall
        const tl = gsap.timeline({ repeat: -1 });
        tl.from(chars, {
            y: -20,
            duration: 1.5,
            ease: "power2.in",
            stagger: 0.03
        })
        .to(chars, {
            y: 0,
            duration: 0.3,
            ease: "bounce.out"
        });
        
        // Falling particles
        const letterBounds = mainLetter.getBoundingClientRect();
        particles.forEach((particle, i) => {
            const startX = letterBounds.left + Math.random() * letterBounds.width * 2;
            
            gsap.set(particle, {
                x: startX,
                y: letterBounds.top - 200
            });
            
            gsap.to(particle, {
                y: letterBounds.bottom + 50,
                duration: 2 + Math.random(),
                repeat: -1,
                delay: Math.random() * 3,
                ease: "power2.in"
            });
        });
        
        currentAnimation = tl;
    }
    
    // H - Harmonic: Perfect sine wave motion
    function initHarmonicAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create wave trail
        const wavePoints = [];
        for (let i = 0; i < 20; i++) {
            const point = createEnvironmentElement('particle', {
                size: '2px',
                color: `rgba(0,0,0,${0.8 - i * 0.03})`
            });
            wavePoints.push(point);
        }
        
        // Harmonic motion
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: 40,
                duration: 1,
                delay: i * 0.08,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        
        // Wave visualization
        const letterBounds = mainLetter.getBoundingClientRect();
        wavePoints.forEach((point, i) => {
            gsap.set(point, {
                x: letterBounds.left - 100 + i * 10,
                y: letterBounds.top + letterBounds.height/2
            });
            
            gsap.to(point, {
                y: letterBounds.top + letterBounds.height/2 + Math.sin(i * 0.5) * 30,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // I - Inertia: Resistance to change
    function initInertiaAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Very slow start, resistance to movement
        tl.to(chars, {
            x: 80,
            duration: 4, // Very slow
            ease: "power4.out", // Heavy resistance
            stagger: 0.2
        })
        .to(chars, {
            x: 0,
            duration: 4, // Slow to stop
            ease: "power4.out",
            stagger: 0.2
        });
        
        // Cursor interaction - show resistance
        function showInertia() {
            if (cursorInfluence > 0.3) {
                const force = cursorInfluence * 20;
                gsap.to(chars, {
                    x: force,
                    duration: 1.5, // Slow response
                    ease: "power3.out",
                    stagger: 0.1
                });
            }
        }
        
        gsap.ticker.add(showInertia);
        
        currentAnimation = tl;
    }
    
    // J - Joule: Energy pulse radiation
    function initJouleAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create energy rings
        const rings = [];
        for (let i = 0; i < 3; i++) {
            const ring = createEnvironmentElement('wave', {
                size: '100px',
                color: 'rgba(0,0,0,0.3)'
            });
            rings.push(ring);
        }
        
        const letterBounds = mainLetter.getBoundingClientRect();
        rings.forEach(ring => {
            gsap.set(ring, {
                x: letterBounds.left + letterBounds.width/2 - 50,
                y: letterBounds.top + letterBounds.height/2 - 50
            });
        });
        
        // Pulse animation
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        
        tl.to(chars, {
            scale: 1.2,
            duration: 0.3,
            ease: "power2.out"
        })
        .to(chars, {
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
        
        // Energy rings
        rings.forEach((ring, i) => {
            gsap.to(ring, {
                scale: 3,
                opacity: 0,
                duration: 2,
                repeat: -1,
                delay: i * 0.3,
                ease: "power2.out"
            });
        });
        
        currentAnimation = tl;
    }
    
    // K - Kinetic: Constant motion blur
    function initKineticAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create motion blur trail
        const blurTrail = createEnvironmentElement('trail', {
            width: mainLetter.offsetWidth + 'px',
            height: mainLetter.offsetHeight + 'px',
            color: 'rgba(0,0,0,0.15)'
        });
        
        const letterBounds = mainLetter.getBoundingClientRect();
        gsap.set(blurTrail, {
            x: letterBounds.left,
            y: letterBounds.top
        });
        
        // Continuous random motion
        chars.forEach(char => {
            function randomMove() {
                gsap.to(char, {
                    x: gsap.utils.random(-40, 40),
                    y: gsap.utils.random(-30, 30),
                    duration: gsap.utils.random(0.5, 1.5),
                    ease: "power2.inOut",
                    onComplete: randomMove
                });
            }
            randomMove();
        });
        
        // Blur trail following
        gsap.to(blurTrail, {
            x: () => letterBounds.left + gsap.getProperty(chars[0], "x") - 20,
            y: () => letterBounds.top + gsap.getProperty(chars[0], "y") - 10,
            duration: 0.1,
            repeat: -1,
            ease: "none"
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // L - Luminosity: White light emission
    function initLuminosityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Glowing effect
        tl.to(chars, {
            textShadow: "0 0 20px rgba(255,255,255,0.9), 0 0 40px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.3)",
            duration: 1.5,
            ease: "sine.inOut"
        })
        .to(chars, {
            textShadow: "0 0 5px rgba(255,255,255,0.3)",
            duration: 1.5,
            ease: "sine.inOut"
        });
        
        // Cursor interaction - brighter when closer
        function updateLuminosity() {
            if (cursorInfluence > 0.1) {
                const intensity = cursorInfluence;
                const glow = `0 0 ${20 * intensity}px rgba(255,255,255,${0.9 * intensity}), 0 0 ${40 * intensity}px rgba(255,255,255,${0.6 * intensity})`;
                
                gsap.to(chars, {
                    textShadow: glow,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        }
        
        gsap.ticker.add(updateLuminosity);
        
        currentAnimation = tl;
    }
    
    // M - Momentum: Consistent directional movement
    function initMomentumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Create momentum trail
        const trails = [];
        chars.forEach(() => {
            const trail = createEnvironmentElement('trail', {
                width: '20px',
                height: '3px',
                color: 'rgba(0,0,0,0.4)'
            });
            trails.push(trail);
        });
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Constant velocity movement
        tl.to(chars, {
            x: 300,
            duration: 3,
            ease: "none", // Constant speed
            stagger: 0.05
        })
        .set(chars, { x: -300 })
        .to(chars, {
            x: 0,
            duration: 3,
            ease: "none",
            stagger: 0.05
        });
        
        // Momentum trails
        trails.forEach((trail, i) => {
            gsap.to(trail, {
                x: () => gsap.getProperty(chars[i], "x") - 30,
                y: () => gsap.getProperty(chars[i], "y"),
                duration: 0.1,
                repeat: -1,
                ease: "none"
            });
        });
        
        currentAnimation = tl;
    }
    
    // Continue with remaining functions...
    // (N through Z would follow similar patterns)
    
    // For brevity, I'll implement a few more key ones:
    
    // N - Neutron: Orbital motion
    function initNeutronAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const letterBounds = mainLetter.getBoundingClientRect();
        const centerX = letterBounds.left + letterBounds.width / 2;
        const centerY = letterBounds.top + letterBounds.height / 2;
        
        chars.forEach((char, i) => {
            const radius = 30 + i * 5;
            const speed = 2 + i * 0.2;
            
            gsap.to(char, {
                motionPath: {
                    path: `M${centerX},${centerY} m${radius},0 a${radius},${radius} 0 1,1 -${radius * 2},0 a${radius},${radius} 0 1,1 ${radius * 2},0`,
                    autoRotate: false
                },
                duration: speed,
                repeat: -1,
                ease: "none"
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // Add simplified versions for remaining letters...
    function initOscillationAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(chars, {
            x: 60,
            duration: 1,
            ease: "sine.inOut",
            stagger: 0.05
        });
        currentAnimation = tl;
    }
    
    function initPotentialAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        const tl = gsap.timeline({ repeat: -1 });
        tl.to(chars, { y: -30, scale: 0.8, duration: 2, ease: "power2.in" })
          .to(chars, { y: 0, scale: 1.3, duration: 0.3, ease: "power3.out" })
          .to(chars, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        currentAnimation = tl;
    }
    
    function initQuantumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        const positions = [-40, -20, 0, 20, 40];
        const tl = gsap.timeline({ repeat: -1 });
        positions.forEach(pos => {
            tl.set(chars, { x: pos }).to({}, { duration: 0.5 });
        });
        currentAnimation = tl;
    }
    
    function initResonanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        chars.forEach((char, i) => {
            gsap.to(char, {
                scaleY: 1.5,
                duration: 0.5,
                repeat: -1,
                yoyo: true,
                delay: i * 0.1,
                ease: "sine.inOut"
            });
        });
        currentAnimation = gsap.timeline();
    }
    
    function initSymmetryAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        const midPoint = Math.floor(chars.length / 2);
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        chars.forEach((char, i) => {
            const distance = Math.abs(i - midPoint);
            tl.to(char, {
                y: distance * 8,
                rotation: (i < midPoint ? -1 : 1) * distance * 3,
                duration: 2,
                ease: "sine.inOut"
            }, 0);
        });
        currentAnimation = tl;
    }
    
    function initThermalAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        chars.forEach(char => {
            gsap.to(char, {
                x: "random(-3, 3)",
                y: "random(-3, 3)",
                duration: 0.1,
                repeat: -1,
                yoyo: true,
                ease: "none"
            });
        });
        currentAnimation = gsap.timeline();
    }
    
    function initUncertaintyAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        const tl = gsap.timeline({ repeat: -1 });
        tl.to(chars, {
            x: () => gsap.utils.random(-50, 50),
            y: () => gsap.utils.random(-30, 30),
            opacity: () => gsap.utils.random(0.3, 1),
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.inOut"
        });
        currentAnimation = tl;
    }
    
    function initVoltageAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
        tl.to(chars, {
            scaleY: 1.5,
            duration: 0.1,
            ease: "power2.in",
            stagger: 0.02
        })
        .to(chars, {
            scaleY: 1,
            duration: 0.3,
            ease: "elastic.out(1, 0.3)"
        });
        currentAnimation = tl;
    }
    
    function initWaveAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: 25,
                duration: 0.8,
                delay: i * 0.1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        currentAnimation = gsap.timeline();
    }
    
    function initXrayAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        const tl = gsap.timeline({ repeat: -1 });
        tl.fromTo(chars, {
            opacity: 0.1,
            filter: "blur(3px)"
        }, {
            opacity: 1,
            filter: "blur(0px)",
            textShadow: "0 0 20px rgba(255,255,255,0.8)",
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out"
        })
        .to(chars, {
            opacity: 0.1,
            filter: "blur(3px)",
            textShadow: "none",
            duration: 1,
            ease: "power2.in"
        });
        currentAnimation = tl;
    }
    
    function initYieldAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
        tl.from(chars, {
            scale: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: "back.out(1.7)"
        })
        .to(chars, {
            scale: 2,
            opacity: 0,
            duration: 0.8,
            stagger: 0.03,
            ease: "power3.out"
        })
        .set(chars, { scale: 1, opacity: 1 });
        currentAnimation = tl;
    }
    
    function initZeroPointAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        chars.forEach(char => {
            gsap.to(char, {
                x: "random(-0.5, 0.5)",
                y: "random(-0.5, 0.5)",
                duration: 0.3,
                repeat: -1,
                yoyo: true,
                ease: "none"
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
    
    // Initialize
    updateDisplay(0);
    
    // Global functions
    window.goToPrevLetter = goToPrevLetter;
    window.goToNextLetter = goToNextLetter;
});