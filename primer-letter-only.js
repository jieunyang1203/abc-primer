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
                
                const influenceRange = letterBounds.width * 1.5;
                cursorInfluence = 1 - Math.min(1, distance / influenceRange);
                
                mouseUpdateScheduled = false;
            });
        }
    }
    
    document.addEventListener('mousemove', updateMousePosition, { passive: true });
    
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
        
        const masterTl = gsap.timeline({ repeat: -1 });
        
        // Accelerating motion
        masterTl
            .to(chars, {
                x: 120,
                duration: 2,
                stagger: 0.03,
                ease: "power3.in" // Gets faster
            })
            .to(chars, {
                x: -120,
                duration: 2,
                stagger: 0.03,
                ease: "power3.in"
            })
            .to(chars, {
                x: 0,
                duration: 0.8,
                stagger: 0.02,
                ease: "power2.out" // Deceleration
            });
        
        // Cursor interaction - speed boost
        let cursorBoost = false;
        function applyCursorBoost() {
            if (cursorInfluence > 0.3 && !cursorBoost) {
                cursorBoost = true;
                masterTl.timeScale(2 + cursorInfluence);
                
                gsap.to(chars, {
                    x: (mouseX > window.innerWidth/2 ? 1 : -1) * 80 * cursorInfluence,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: false
                });
            } else if (cursorInfluence <= 0.1 && cursorBoost) {
                cursorBoost = false;
                masterTl.timeScale(1);
            }
        }
        
        gsap.ticker.add(applyCursorBoost);
        
        currentAnimation = masterTl;
    }
    
    // B - Balance: Seesaw motion
    function initBalanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        gsap.set(chars, { transformOrigin: "50% 100%" });
        
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        
        tl.to(chars, {
            rotation: (i) => (i - chars.length/2) * 5,
            y: (i) => Math.abs(i - chars.length/2) * 3,
            duration: 2.5,
            ease: "sine.inOut",
            stagger: 0.05
        });
        
        // Cursor balance control
        function updateBalance() {
            if (cursorInfluence > 0.2) {
                const letterBounds = mainLetter.getBoundingClientRect();
                const tilt = (mouseX - letterBounds.left - letterBounds.width/2) / 20;
                
                gsap.to(chars, {
                    rotation: (i) => (i - chars.length/2) * 5 + tilt * cursorInfluence,
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            }
        }
        
        gsap.ticker.add(updateBalance);
        
        currentAnimation = tl;
    }
    
    // C - Conversion: Form transformation
    function initConversionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Cycle through different transformations - no ratio distortion
        tl
            .to(chars, {
                scale: 1.3,
                rotation: 90,
                opacity: 0.7,
                duration: 1,
                stagger: 0.05,
                ease: "power2.inOut"
            })
            .to(chars, {
                scale: 0.8,
                rotation: 180,
                opacity: 0.9,
                duration: 1,
                stagger: 0.05,
                ease: "power2.inOut"
            })
            .to(chars, {
                scale: 1.1,
                rotation: 270,
                opacity: 0.8,
                duration: 1,
                stagger: 0.05,
                ease: "power2.inOut"
            })
            .to(chars, {
                scale: 1,
                rotation: 360,
                opacity: 1,
                duration: 1,
                stagger: 0.05,
                ease: "power2.inOut"
            });
        
        // Cursor affects conversion speed
        function updateConversion() {
            if (cursorInfluence > 0.3) {
                tl.timeScale(0.3 + cursorInfluence * 2);
                
                // Add extra distortion near cursor
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const dx = mouseX - (charRect.left + charRect.width/2);
                    const dy = mouseY - (charRect.top + charRect.height/2);
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 100) {
                        const distortion = (100 - distance) / 100 * cursorInfluence;
                        gsap.to(char, {
                            skewX: dx * distortion * 0.1,
                            skewY: dy * distortion * 0.1,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: false
                        });
                    }
                });
            } else {
                tl.timeScale(1);
                gsap.to(chars, {
                    skewX: 0,
                    skewY: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
        }
        
        gsap.ticker.add(updateConversion);
        
        currentAnimation = tl;
    }
    
    // D - Density: Compression/expansion
    function initDensityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                scale: 0.85,
                duration: 0.6,
                ease: "power2.in",
                stagger: 0.02
            })
            .to(chars, {
                scale: 1.2,
                duration: 0.8,
                ease: "power2.out",
                stagger: 0.02
            })
            .to(chars, {
                scale: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        
        // Remove mouse pressure effect - just keep the main animation running
        // Mouse interaction will only affect timeline speed
        function modifySpeed() {
            if (cursorInfluence > 0.3) {
                // Slow down when cursor is near to emphasize density
                tl.timeScale(0.5);
            } else {
                // Normal speed when cursor is away
                tl.timeScale(1);
            }
        }
        
        gsap.ticker.add(modifySpeed);
        
        currentAnimation = tl;
    }
    
    // E - Equilibrium: Gentle floating
    function initEquilibriumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Each character floats at different rates
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: Math.sin(i * 0.5) * 12,
                x: Math.cos(i * 0.3) * 8,
                rotation: Math.sin(i * 0.7) * 3,
                duration: 3 + i * 0.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        
        // Cursor creates gentle disturbance
        function createDisturbance() {
            if (cursorInfluence > 0.1) {
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const dx = mouseX - (charRect.left + charRect.width/2);
                    const dy = mouseY - (charRect.top + charRect.height/2);
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 150) {
                        const force = (150 - distance) / 150 * cursorInfluence * 0.3;
                        const angle = Math.atan2(dy, dx);
                        
                        gsap.to(char, {
                            x: "+=" + Math.cos(angle) * force * 10,
                            y: "+=" + Math.sin(angle) * force * 10,
                            duration: 0.6,
                            ease: "power2.out",
                            overwrite: false
                        });
                    }
                });
            }
        }
        
        gsap.ticker.add(createDisturbance);
        
        currentAnimation = gsap.timeline();
    }
    
    // F - Friction: Resistance motion
    function initFrictionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Fast start, slow friction stop
        tl
            .to(chars, {
                x: 100,
                duration: 0.4,
                ease: "power1.out",
                stagger: 0.02
            })
            .to(chars, {
                x: 0,
                duration: 2.5,
                ease: "power3.out", // Friction drag
                stagger: 0.02
            });
        
        // Cursor drag effect
        let dragStartX = 0;
        function applyDrag() {
            if (cursorInfluence > 0.3) {
                const currentX = gsap.getProperty(chars[0], "x");
                const dragForce = (mouseX - dragStartX) * cursorInfluence * 0.1;
                
                gsap.to(chars, {
                    x: currentX + dragForce,
                    duration: 0.8,
                    ease: "power2.out",
                    overwrite: false
                });
            }
            dragStartX = mouseX;
        }
        
        gsap.ticker.add(applyDrag);
        
        currentAnimation = tl;
    }
    
    // G - Gravity: Falling motion
    function initGravityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .set(chars, { y: -50 })
            .to(chars, {
                y: 0,
                duration: 1,
                stagger: 0.04,
                ease: "power2.in" // Gravity acceleration
            })
            .to(chars, {
                y: -15,
                duration: 0.3,
                stagger: 0.02,
                ease: "power2.out" // Bounce
            })
            .to(chars, {
                y: 0,
                duration: 0.2,
                ease: "bounce.out"
            });
        
        // Cursor gravitational field
        function applyGravity() {
            if (cursorInfluence > 0.2) {
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const dx = mouseX - (charRect.left + charRect.width/2);
                    const dy = mouseY - (charRect.top + charRect.height/2);
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 200) {
                        const pull = (200 - distance) / 200 * cursorInfluence * 0.5;
                        const angle = Math.atan2(dy, dx);
                        
                        gsap.to(char, {
                            x: "+=" + Math.cos(angle) * pull * 8,
                            y: "+=" + Math.sin(angle) * pull * 8,
                            duration: 0.5,
                            ease: "power2.out",
                            overwrite: false
                        });
                    }
                });
            }
        }
        
        gsap.ticker.add(applyGravity);
        
        currentAnimation = tl;
    }
    
    // H - Harmonic: Perfect sine waves
    function initHarmonicAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: 35,
                duration: 1.2,
                delay: i * 0.08,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        
        // Cursor frequency control
        function updateFrequency() {
            if (cursorInfluence > 0.2) {
                const frequency = 0.5 + cursorInfluence * 2;
                chars.forEach((char) => {
                    gsap.to(char, {
                        duration: 1.2 / frequency,
                        overwrite: "duration"
                    });
                });
            }
        }
        
        gsap.ticker.add(updateFrequency);
        
        currentAnimation = gsap.timeline();
    }
    
    // I - Inertia: Slow resistance to change
    function initInertiaAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Heavy, reluctant movement showing resistance
        tl
            .to(chars, {
                x: 80,
                duration: 2.5, // Shorter for visibility
                ease: "power4.out", // Heavy resistance start
                stagger: 0.1
            })
            .to({}, { duration: 0.5 }) // Pause showing resistance
            .to(chars, {
                x: -80,
                duration: 2.5,
                ease: "power4.out",
                stagger: 0.1
            })
            .to({}, { duration: 0.5 }) // Pause
            .to(chars, {
                x: 0,
                duration: 2,
                ease: "power4.out",
                stagger: 0.1
            });
        
        // Cursor force application with visible feedback
        let lastMouseX = mouseX;
        let isBeingForced = false;
        
        function applyForce() {
            const velocity = mouseX - lastMouseX;
            
            if (cursorInfluence > 0.3 && Math.abs(velocity) > 1) {
                const force = velocity * cursorInfluence * 0.5;
                
                if (!isBeingForced) {
                    isBeingForced = true;
                    // Visual feedback - slight scale change showing resistance
                    gsap.to(chars, {
                        scale: 0.95,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
                
                gsap.to(chars, {
                    x: "+=" + force,
                    duration: 1.5, // Slower response showing inertia
                    ease: "power3.out",
                    overwrite: false
                });
                
            } else if (cursorInfluence <= 0.1 && isBeingForced) {
                isBeingForced = false;
                // Return to normal scale
                gsap.to(chars, {
                    scale: 1,
                    duration: 0.8,
                    ease: "elastic.out(1, 0.3)"
                });
            }
            
            lastMouseX = mouseX;
        }
        
        gsap.ticker.add(applyForce);
        
        currentAnimation = tl;
    }
    
    // J - Joule: Energy pulse
    function initJouleAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        
        tl
            .to(chars, {
                scale: 1.3,
                duration: 0.4,
                stagger: 0.03,
                ease: "power2.out"
            })
            .to(chars, {
                scale: 1,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            });
        
        // Click for energy burst
        mainLetter.addEventListener('click', function() {
            gsap.to(chars, {
                scale: 1.8,
                rotation: "+=360",
                duration: 0.8,
                ease: "back.out(1.7)",
                stagger: 0.02,
                onComplete: function() {
                    gsap.to(chars, {
                        scale: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                }
            });
        });
        
        currentAnimation = tl;
    }
    
    // K - Kinetic: Constant motion
    function initKineticAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        // Continuous random movement
        chars.forEach((char) => {
            function randomMove() {
                gsap.to(char, {
                    x: gsap.utils.random(-50, 50),
                    y: gsap.utils.random(-35, 35),
                    rotation: gsap.utils.random(-15, 15),
                    duration: gsap.utils.random(0.8, 2),
                    ease: "power2.inOut",
                    onComplete: randomMove
                });
            }
            randomMove();
        });
        
        // Cursor increases kinetic energy
        function increaseKinetic() {
            if (cursorInfluence > 0.3) {
                chars.forEach((char) => {
                    gsap.to(char, {
                        x: "+=" + gsap.utils.random(-30, 30) * cursorInfluence,
                        y: "+=" + gsap.utils.random(-25, 25) * cursorInfluence,
                        duration: 0.5,
                        ease: "power2.out",
                        overwrite: false
                    });
                });
            }
        }
        
        gsap.ticker.add(increaseKinetic);
        
        currentAnimation = gsap.timeline();
    }
    
    // L - Luminosity: Light emission effect
    function initLuminosityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Pulsing light emission
        tl
            .to(chars, {
                opacity: 0.3,
                scale: 1.1,
                textShadow: "0 0 30px rgba(255,255,255,1), 0 0 60px rgba(255,255,255,0.8)",
                duration: 1.5,
                ease: "power2.inOut",
                stagger: 0.05
            })
            .to(chars, {
                opacity: 1,
                scale: 1,
                textShadow: "0 0 5px rgba(255,255,255,0.4)",
                duration: 1.5,
                ease: "power2.inOut",
                stagger: 0.05
            });
        
        // Create blinking effect for individual chars
        chars.forEach((char, i) => {
            gsap.to(char, {
                opacity: 0.5,
                duration: 0.2,
                repeat: -1,
                repeatDelay: 2 + i * 0.3,
                yoyo: true,
                ease: "power2.inOut"
            });
        });
        
        // Cursor brightness control
        function updateBrightness() {
            if (cursorInfluence > 0.1) {
                const intensity = cursorInfluence;
                
                chars.forEach((char) => {
                    const charRect = char.getBoundingClientRect();
                    const dx = mouseX - (charRect.left + charRect.width/2);
                    const dy = mouseY - (charRect.top + charRect.height/2);
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 150) {
                        const localIntensity = (150 - distance) / 150 * intensity;
                        const glow = `0 0 ${40 * localIntensity}px rgba(255,255,255,1), 0 0 ${80 * localIntensity}px rgba(255,255,255,0.6)`;
                        
                        gsap.to(char, {
                            opacity: 0.3 + localIntensity * 0.7,
                            scale: 1 + localIntensity * 0.2,
                            textShadow: glow,
                            duration: 0.2,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    }
                });
            }
        }
        
        gsap.ticker.add(updateBrightness);
        
        currentAnimation = tl;
    }
    
    // M - Momentum: Consistent movement
    function initMomentumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                x: 200,
                duration: 2.5,
                ease: "none", // Constant velocity
                stagger: 0.04
            })
            .set(chars, { x: -200 })
            .to(chars, {
                x: 0,
                duration: 2.5,
                ease: "none",
                stagger: 0.04
            });
        
        // Cursor momentum transfer
        let mouseDelta = 0;
        let lastX = mouseX;
        
        function transferMomentum() {
            mouseDelta = mouseX - lastX;
            lastX = mouseX;
            
            if (cursorInfluence > 0.3 && Math.abs(mouseDelta) > 2) {
                const momentumBoost = mouseDelta * cursorInfluence * 0.5;
                
                gsap.to(chars, {
                    x: "+=" + momentumBoost,
                    duration: 1,
                    ease: "power1.out",
                    overwrite: false
                });
            }
        }
        
        gsap.ticker.add(transferMomentum);
        
        currentAnimation = tl;
    }
    
    // N - Neutron: Orbital motion
    function initNeutronAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Compact orbital motion
        tl.to(chars, {
            x: (i) => Math.cos(i * 0.5) * 15,
            y: (i) => Math.sin(i * 0.5) * 15,
            rotation: 360,
            duration: 3,
            ease: "none"
        });
        
        currentAnimation = tl;
    }
    
    // O - Oscillation: Back and forth
    function initOscillationAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        
        tl.to(chars, {
            x: 70,
            rotation: 10,
            duration: 1.2,
            stagger: 0.04,
            ease: "sine.inOut"
        });
        
        // Cursor amplitude control
        function updateAmplitude() {
            if (cursorInfluence > 0.2) {
                const amplitude = 70 + (cursorInfluence * 50);
                gsap.to(chars, {
                    x: amplitude * (tl.progress() > 0.5 ? 1 : -1),
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            }
        }
        
        gsap.ticker.add(updateAmplitude);
        
        currentAnimation = tl;
    }
    
    // P - Potential: Build up and release
    function initPotentialAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                y: -40,
                scale: 0.8,
                rotation: -10,
                duration: 2.5,
                ease: "power2.in", // Building potential
                stagger: 0.03
            })
            .to(chars, {
                y: 10,
                scale: 1.4,
                rotation: 5,
                duration: 0.4,
                ease: "power3.out", // Release
                stagger: 0.02
            })
            .to(chars, {
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.4)"
            });
        
        // Click to trigger release
        mainLetter.addEventListener('click', function() {
            tl.progress(0.7); // Jump to release
        });
        
        currentAnimation = tl;
    }
    
    // Q - Quantum: Discrete jumps
    function initQuantumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const positions = [-60, -30, 0, 30, 60];
        const tl = gsap.timeline({ repeat: -1 });
        
        positions.forEach((pos, index) => {
            tl.set(chars, {
                x: pos,
                opacity: index === 2 ? 1 : 0.6,
                scale: index === 2 ? 1.1 : 1
            })
            .to({}, { duration: 0.8 }); // Hold position
        });
        
        currentAnimation = tl;
    }
    
    // R - Resonance: Amplifying vibration
    function initResonanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        let amplitude = 20;
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: amplitude,
                duration: 0.6,
                delay: i * 0.05,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                onUpdate: function() {
                    if (this.progress() > 0.8) {
                        amplitude = Math.min(50, amplitude * 1.02); // Amplification
                    }
                }
            });
        });
        
        // Cursor resonance trigger
        function triggerResonance() {
            if (cursorInfluence > 0.4) {
                amplitude = 60;
                gsap.to(chars, {
                    y: amplitude * (Math.random() > 0.5 ? 1 : -1),
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: false
                });
            }
        }
        
        gsap.ticker.add(triggerResonance);
        
        currentAnimation = gsap.timeline();
    }
    
    // S - Symmetry: Mirrored movement
    function initSymmetryAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        // Create flip animation using rotationY for 3D flip
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
        
        // Cursor symmetry enhancement
        function enhanceSymmetry() {
            if (cursorInfluence > 0.2) {
                gsap.to(chars, {
                    rotationX: 20 * cursorInfluence,
                    scale: 1 + cursorInfluence * 0.3,
                    duration: 0.6,
                    ease: "power2.out",
                    overwrite: false
                });
            }
        }
        
        gsap.ticker.add(enhanceSymmetry);
        currentAnimation = tl;
    }
    
    // T - Thermal: Rapid vibration
    function initThermalAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char) => {
            gsap.to(char, {
                x: "random(-4, 4)",
                y: "random(-4, 4)",
                rotation: "random(-2, 2)",
                duration: 0.08,
                repeat: -1,
                yoyo: true,
                ease: "none"
            });
        });
        
        // Cursor temperature increase
        function increaseTemperature() {
            if (cursorInfluence > 0.3) {
                const intensity = 4 + (cursorInfluence * 8);
                chars.forEach((char) => {
                    gsap.to(char, {
                        x: `random(-${intensity}, ${intensity})`,
                        y: `random(-${intensity}, ${intensity})`,
                        duration: 0.05,
                        ease: "none",
                        overwrite: false
                    });
                });
            }
        }
        
        gsap.ticker.add(increaseTemperature);
        
        currentAnimation = gsap.timeline();
    }
    
    // U - Uncertainty: Fuzzy positions
    function initUncertaintyAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl.to(chars, {
            x: () => gsap.utils.random(-40, 40),
            y: () => gsap.utils.random(-30, 30),
            opacity: () => gsap.utils.random(0.4, 1),
            filter: () => `blur(${gsap.utils.random(0, 2)}px)`,
            duration: 1,
            ease: "power2.inOut",
            stagger: 0.05
        });
        
        // Cursor increases uncertainty
        function increaseUncertainty() {
            if (cursorInfluence > 0.3) {
                chars.forEach((char) => {
                    gsap.to(char, {
                        x: "+=" + gsap.utils.random(-20, 20) * cursorInfluence,
                        y: "+=" + gsap.utils.random(-15, 15) * cursorInfluence,
                        filter: `blur(${cursorInfluence * 3}px)`,
                        duration: 0.5,
                        ease: "power2.out",
                        overwrite: false
                    });
                });
            }
        }
        
        gsap.ticker.add(increaseUncertainty);
        
        currentAnimation = tl;
    }
    
    // V - Voltage: Electric pulse
    function initVoltageAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
        
        tl
            .to(chars, {
                scaleY: 2,
                scaleX: 0.5,
                duration: 0.1,
                stagger: 0.02,
                ease: "power3.in"
            })
            .to(chars, {
                scale: 1,
                duration: 0.4,
                ease: "elastic.out(1.2, 0.3)"
            });
        
        // Click for electric shock
        mainLetter.addEventListener('click', function() {
            gsap.to(chars, {
                x: () => gsap.utils.random(-15, 15),
                y: () => gsap.utils.random(-10, 10),
                rotation: () => gsap.utils.random(-10, 10),
                scaleY: 1.5,
                duration: 0.1,
                ease: "power2.out",
                stagger: 0.01,
                onComplete: function() {
                    gsap.to(chars, {
                        x: 0,
                        y: 0,
                        rotation: 0,
                        scale: 1,
                        duration: 0.6,
                        ease: "elastic.out(1, 0.3)"
                    });
                }
            });
        });
        
        currentAnimation = tl;
    }
    
    // W - Wave: Sine wave propagation
    function initWaveAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char, i) => {
            gsap.to(char, {
                y: 40,
                duration: 1.5,
                delay: i * 0.12,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        
        // Cursor wave interference
        function createInterference() {
            if (cursorInfluence > 0.2) {
                const waveLength = 4;
                chars.forEach((char, i) => {
                    const phase = (i / waveLength) * Math.PI * 2;
                    const amplitude = 40 * cursorInfluence;
                    
                    gsap.to(char, {
                        y: Math.sin(phase + Date.now() * 0.01) * amplitude,
                        duration: 0.1,
                        ease: "none",
                        overwrite: false
                    });
                });
            }
        }
        
        gsap.ticker.add(createInterference);
        
        currentAnimation = gsap.timeline();
    }
    
    // X - X-ray: Penetrating effect
    function initXrayAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .fromTo(chars, {
                opacity: 0.1,
                filter: "blur(4px)"
            }, {
                opacity: 1,
                filter: "blur(0px)",
                textShadow: "0 0 25px rgba(255,255,255,0.8)",
                duration: 1,
                stagger: 0.05,
                ease: "power2.out"
            })
            .to(chars, {
                opacity: 0.1,
                filter: "blur(4px)",
                textShadow: "none",
                duration: 1.5,
                ease: "power2.in"
            });
        
        currentAnimation = tl;
    }
    
    // Y - Yield: Explosive release
    function initYieldAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
        
        tl
            .from(chars, {
                scale: 0,
                rotation: -360,
                duration: 0.6,
                stagger: 0.03,
                ease: "back.out(1.7)"
            })
            .to(chars, {
                scale: 2.5,
                opacity: 0,
                rotation: 360,
                x: () => gsap.utils.random(-100, 100),
                y: () => gsap.utils.random(-80, 80),
                duration: 1.2,
                stagger: 0.02,
                ease: "power3.out"
            })
            .set(chars, { scale: 1, opacity: 1, x: 0, y: 0, rotation: 0 });
        
        currentAnimation = tl;
    }
    
    // Z - Zero Point: Minimal vibration
    function initZeroPointAnimation() {
        const { splitText, chars } = createSplitTextAnimation();
        
        chars.forEach((char) => {
            gsap.to(char, {
                x: "random(-2, 2)",
                y: "random(-2, 2)",
                rotation: "random(-1, 1)",
                scale: "random(0.98, 1.02)",
                duration: 0.6,
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