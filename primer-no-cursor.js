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
    
    // Update display
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
    
    function initAnimation(letter) {
        const animationFunction = animationFunctions[letter];
        if (animationFunction) {
            animationFunction();
        }
    }
    
    // A - Acceleration: Speed increasing motion
    function initAccelerationAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                x: 150,
                duration: 2.5,
                stagger: 0.05,
                ease: "power3.in"
            })
            .to(chars, {
                x: -150,
                duration: 1.5,
                stagger: 0.03,
                ease: "power4.in"
            })
            .to(chars, {
                x: 0,
                duration: 0.8,
                stagger: 0.02,
                ease: "power3.out"
            });
        
        currentAnimation = tl;
    }
    
    // B - Balance: Seesaw motion
    function initBalanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                rotation: -25,
                y: 20,
                duration: 1.5,
                ease: "power2.inOut",
                transformOrigin: "50% 100%"
            })
            .to(chars, {
                rotation: 25,
                y: 20,
                duration: 1.5,
                ease: "power2.inOut",
                transformOrigin: "50% 100%"
            });
        
        currentAnimation = tl;
    }
    
    // C - Conversion: Form transformation
    function initConversionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                scale: 1.2,
                rotation: 180,
                duration: 1,
                stagger: 0.1,
                ease: "power2.inOut"
            })
            .to(chars, {
                scale: 0.8,
                rotation: 360,
                duration: 1,
                stagger: 0.1,
                ease: "power2.inOut"
            })
            .to(chars, {
                scale: 1,
                rotation: 720,
                duration: 1,
                ease: "elastic.out(1, 0.5)"
            });
        
        currentAnimation = tl;
    }
    
    // D - Density: Compression/expansion
    function initDensityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                scale: 0.7,
                duration: 1,
                ease: "power2.in",
                stagger: 0.05
            })
            .to(chars, {
                scale: 1.2,
                duration: 1,
                ease: "power2.out",
                stagger: 0.05
            })
            .to(chars, {
                scale: 1,
                duration: 0.8,
                ease: "elastic.out(1, 0.3)"
            });
        
        currentAnimation = tl;
    }
    
    // E - Equilibrium: Gentle floating
    function initEquilibriumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: "random(-20, 20)",
                x: "random(-10, 10)",
                duration: "random(3, 5)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.2
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // F - Friction: Resistance motion
    function initFrictionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                x: 100,
                duration: 0.5,
                ease: "power2.out"
            })
            .to(chars, {
                x: 80,
                duration: 2,
                ease: "power4.out"
            })
            .to(chars, {
                x: 0,
                duration: 3,
                ease: "power4.out"
            });
        
        currentAnimation = tl;
    }
    
    // G - Gravity: Falling motion
    function initGravityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                y: -100,
                duration: 0.8,
                ease: "power2.out",
                stagger: 0.05
            })
            .to(chars, {
                y: 0,
                duration: 0.6,
                ease: "power2.in",
                stagger: 0.05
            })
            .to(chars, {
                y: -20,
                duration: 0.3,
                ease: "power2.out"
            })
            .to(chars, {
                y: 0,
                duration: 0.2,
                ease: "power2.in"
            });
        
        currentAnimation = tl;
    }
    
    // H - Harmonic: Perfect sine waves
    function initHarmonicAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: 50,
                x: "random(-5, 5)",
                rotation: "random(-5, 5)",
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.1
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // I - Inertia: Slow resistance to change
    function initInertiaAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                x: 50,
                rotation: 10,
                duration: 3,
                ease: "power2.inOut"
            })
            .to(chars, {
                x: -50,
                rotation: -10,
                duration: 3,
                ease: "power2.inOut"
            })
            .to(chars, {
                x: 0,
                rotation: 0,
                duration: 2,
                ease: "power2.inOut"
            });
        
        currentAnimation = tl;
    }
    
    // J - Joule: Energy pulse
    function initJouleAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
        
        tl
            .to(chars, {
                scale: 1.8,
                duration: 0.3,
                ease: "power2.out",
                stagger: 0.05
            })
            .to(chars, {
                scale: 1,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)",
                stagger: 0.05
            });
        
        currentAnimation = tl;
    }
    
    // K - Kinetic: Constant motion
    function initKineticAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                x: "random(-80, 80)",
                y: "random(-60, 60)",
                rotation: "random(-180, 180)",
                duration: "random(0.3, 0.7)",
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: i * 0.05
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // L - Luminosity: Light emission effect
    function initLuminosityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Pulsing glow effect with more white
        tl
            .to(chars, {
                opacity: 0.1,
                scale: 1.3,
                filter: "brightness(2)",
                duration: 1,
                stagger: 0.1,
                ease: "power2.in"
            })
            .to(chars, {
                opacity: 1,
                scale: 1.1,
                textShadow: "0 0 50px rgba(255, 255, 255, 1), 0 0 100px rgba(255, 255, 255, 0.8)",
                filter: "brightness(3)",
                duration: 0.2,
                stagger: 0.05,
                ease: "power4.out"
            })
            .to(chars, {
                scale: 1,
                textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                filter: "brightness(1)",
                duration: 1.5,
                ease: "power2.out"
            });
        
        currentAnimation = tl;
    }
    
    // M - Momentum: Mass in motion with impact
    function initMomentumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Build momentum then transfer energy
        tl
            .to(chars, {
                x: -50,
                scale: 0.8,
                duration: 0.8,
                ease: "power2.in"
            })
            .to(chars, {
                x: 100,
                scale: 1.1,
                duration: 0.4,
                ease: "power4.out"
            })
            .to(chars, {
                x: 80,
                scale: 0.9,
                duration: 0.3,
                ease: "bounce.out"
            })
            .to(chars, {
                x: 0,
                scale: 1,
                duration: 1,
                ease: "elastic.out(1, 0.5)"
            });
        
        currentAnimation = tl;
    }
    
    // N - Neutron: Orbital motion
    function initNeutronAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            const angle = (i / chars.length) * Math.PI * 2;
            gsap.to(char, {
                x: Math.cos(angle) * 20,
                y: Math.sin(angle) * 20,
                duration: 2,
                repeat: -1,
                ease: "none",
                onUpdate: function() {
                    const progress = this.progress();
                    const currentAngle = angle + progress * Math.PI * 2;
                    gsap.set(char, {
                        x: Math.cos(currentAngle) * 20,
                        y: Math.sin(currentAngle) * 20
                    });
                }
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
            duration: 1.5,
            ease: "sine.inOut"
        });
        
        currentAnimation = tl;
    }
    
    // P - Potential: Build up and release
    function initPotentialAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                y: -100,
                scale: 0.8,
                duration: 2,
                ease: "power2.in"
            })
            .to(chars, {
                y: 0,
                scale: 1.5,
                duration: 0.3,
                ease: "power4.out"
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
        
        const positions = [-60, -30, 0, 30, 60];
        const tl = gsap.timeline({ repeat: -1 });
        
        positions.forEach(pos => {
            tl.set(chars, {
                x: pos,
                duration: 0
            })
            .to({}, { duration: 0.5 });
        });
        
        currentAnimation = tl;
    }
    
    // R - Resonance: Amplifying vibration
    function initResonanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        let amplitude = 10;
        const tl = gsap.timeline({ 
            repeat: -1,
            onRepeat: function() {
                amplitude = amplitude < 60 ? amplitude + 10 : 10;
                gsap.to(chars, {
                    x: amplitude,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut"
                });
            }
        });
        
        tl.to(chars, {
            x: amplitude,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut"
        });
        
        currentAnimation = tl;
    }
    
    // S - Symmetry: Mirrored movement
    function initSymmetryAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                rotationY: 180,
                duration: 1.5,
                ease: "power2.inOut"
            })
            .to(chars, {
                rotationY: 360,
                duration: 1.5,
                ease: "power2.inOut"
            });
        
        currentAnimation = tl;
    }
    
    // T - Thermal: Rapid vibration
    function initThermalAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach(char => {
            gsap.to(char, {
                x: "random(-5, 5)",
                y: "random(-5, 5)",
                duration: 0.1,
                repeat: -1,
                ease: "none"
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // U - Uncertainty: Fuzzy positions
    function initUncertaintyAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach(char => {
            gsap.to(char, {
                x: "random(-30, 30)",
                y: "random(-30, 30)",
                opacity: "random(0.2, 1)",
                filter: "blur(random(0, 4)px)",
                duration: "random(0.5, 1)",
                repeat: -1,
                yoyo: true,
                ease: "none"
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // V - Voltage: Electric pulse
    function initVoltageAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
        
        tl
            .to(chars, {
                scale: 1.2,
                opacity: 0.3,
                duration: 0.1,
                stagger: {
                    each: 0.05,
                    from: "start"
                }
            })
            .to(chars, {
                scale: 1,
                opacity: 1,
                duration: 0.1,
                stagger: {
                    each: 0.05,
                    from: "start"
                }
            })
            .to(chars, {
                scale: 1.4,
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            })
            .to(chars, {
                scale: 1,
                opacity: 1,
                duration: 0.1
            });
        
        currentAnimation = tl;
    }
    
    // W - Wave: Sine wave propagation
    function initWaveAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: 50,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.15
            });
        });
        
        currentAnimation = gsap.timeline();
    }
    
    // X - X-ray: Penetrating effect
    function initXrayAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                opacity: 0.1,
                scale: 0.9,
                duration: 0.5,
                stagger: 0.1
            })
            .to(chars, {
                opacity: 1,
                scale: 1.1,
                textShadow: "0 0 20px rgba(255, 255, 255, 0.8)",
                duration: 0.3,
                stagger: 0.1
            })
            .to(chars, {
                scale: 1,
                textShadow: "0 0 0px rgba(255, 255, 255, 0)",
                duration: 0.5
            });
        
        currentAnimation = tl;
    }
    
    // Y - Yield: Explosive release
    function initYieldAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
        
        // Build pressure then explosive yield
        tl
            .to(chars, {
                scale: 0.6,
                rotation: "random(-10, 10)",
                duration: 1.5,
                ease: "power4.in"
            })
            .to(chars, {
                scale: 1.5,
                x: "random(-100, 100)",
                y: "random(-100, 100)",
                rotation: "random(-360, 360)",
                opacity: 0,
                duration: 0.4,
                ease: "expo.out",
                stagger: {
                    each: 0.02,
                    from: "random"
                }
            })
            .set(chars, {
                scale: 1,
                x: 0,
                y: 0,
                rotation: 0,
                opacity: 1
            });
        
        currentAnimation = tl;
    }
    
    // Z - Zero Point: Minimal vibration
    function initZeroPointAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach(char => {
            gsap.to(char, {
                x: "random(-3, 3)",
                y: "random(-3, 3)",
                rotation: "random(-2, 2)",
                scale: "random(0.97, 1.03)",
                duration: 0.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
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
    prevButton.addEventListener('click', goToPrevLetter);
    nextButton.addEventListener('click', goToNextLetter);
    
    letters.forEach((letterEl, index) => {
        letterEl.addEventListener('click', () => updateDisplay(index));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            goToPrevLetter();
        } else if (e.key === 'ArrowRight') {
            goToNextLetter();
        } else if (e.key >= 'a' && e.key <= 'z') {
            const letterIndex = e.key.charCodeAt(0) - 97;
            updateDisplay(letterIndex);
        } else if (e.key >= 'A' && e.key <= 'Z') {
            const letterIndex = e.key.charCodeAt(0) - 65;
            updateDisplay(letterIndex);
        }
    });
    
    // Slider drag functionality
    let isDragging = false;
    
    sliderThumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const trackRect = sliderTrack.getBoundingClientRect();
        const startMargin = 45;
        const endMargin = trackRect.width + 2;
        const usableTrackWidth = endMargin - startMargin;
        
        let relativeX = e.clientX - trackRect.left - startMargin;
        relativeX = Math.max(0, Math.min(relativeX, usableTrackWidth));
        
        const index = Math.round((relativeX / usableTrackWidth) * 25);
        updateDisplay(index);
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Touch support for slider
    sliderThumb.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        const trackRect = sliderTrack.getBoundingClientRect();
        const startMargin = 45;
        const endMargin = trackRect.width + 2;
        const usableTrackWidth = endMargin - startMargin;
        
        let relativeX = touch.clientX - trackRect.left - startMargin;
        relativeX = Math.max(0, Math.min(relativeX, usableTrackWidth));
        
        const index = Math.round((relativeX / usableTrackWidth) * 25);
        updateDisplay(index);
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Initialize with letter A
    updateDisplay(0);
});