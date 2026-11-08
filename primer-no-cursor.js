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
    // `mainLetter` is a `let` because each animation rebuild swaps in a fresh
    // node (see run() below) to shed the previous build's event listeners.
    let mainLetter = document.querySelector('.main-letter');
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
        
        // Update slider - align thumb with actual letter element center
        const sliderContainer = sliderThumb.parentElement;
        const containerRect = sliderContainer.getBoundingClientRect();
        const letterEl = letters[index];
        const letterRect = letterEl.getBoundingClientRect();
        const letterCenterX = letterRect.left + letterRect.width / 2;
        const thumbPosition = letterCenterX - containerRect.left;

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

    // Expose the real animation functions so the code panel (code-display.js)
    // can print their actual source instead of a separate hand-written copy.
    // This keeps the displayed code and the running code permanently in sync.
    window.animationFunctions = animationFunctions;

    function initAnimation(letter) {
        const fn = animationFunctions[letter];
        if (fn) run(letter, fn.toString());
    }

    // Persistent per-letter interactions that must survive a node swap.
    // (Re-attached on every rebuild because run() replaces the .main-letter node.)
    function attachLetterHandlers() {
        // Touch support for the main letter burst.
        // On touch devices `mouseenter` only fires once (the element stays in a
        // synthetic hover state), so taps after the first did nothing. Re-fire the
        // burst on every tap, while leaving vertical scrolling untouched.
        let letterTouchX = 0, letterTouchY = 0, letterTouchT = 0;
        mainLetter.addEventListener('touchstart', (e) => {
            const t = e.changedTouches[0];
            letterTouchX = t.clientX;
            letterTouchY = t.clientY;
            letterTouchT = Date.now();
        }, { passive: true });
        mainLetter.addEventListener('touchend', (e) => {
            const t = e.changedTouches[0];
            const moved = Math.hypot(t.clientX - letterTouchX, t.clientY - letterTouchY);
            const elapsed = Date.now() - letterTouchT;
            if (moved < 12 && elapsed < 500) {          // a tap, not a scroll
                e.preventDefault();                     // suppress the synthetic mouseenter (avoids a double burst)
                mainLetter.dispatchEvent(new MouseEvent('mouseenter'));
            }
        });
    }

    // Build and run an animation from a source string. Normally this is just the
    // stringified init function above, but the code panel (code-display.js) can
    // pass an *edited* version — with tweaked numeric literals — so that dragging
    // a number in the visible code retunes the live animation. What you see in the
    // panel is literally what executes here.
    function run(letter, source) {
        // Preserve loop position so retuning mid-drag doesn't snap back to frame 0.
        let prevProgress = 0;
        try { if (currentAnimation) prevProgress = currentAnimation.progress(); } catch (e) {}

        // Kill the previous timeline and every per-character tween it spawned.
        if (currentAnimation) { currentAnimation.kill(); currentAnimation = null; }
        gsap.killTweensOf(mainLetter);
        mainLetter.querySelectorAll('*').forEach(function (el) { gsap.killTweensOf(el); });

        // Swap in a fresh node so stale listeners (hover bursts, old splits) are
        // dropped in one shot. This also fixes listeners stacking up on navigation.
        const fresh = mainLetter.cloneNode(false);
        fresh.textContent = letter;
        // Optical correction: W and M read as bulkier, so scale them down slightly.
        fresh.classList.toggle('wide-letter', letter === 'W' || letter === 'M');
        mainLetter.parentNode.replaceChild(fresh, mainLetter);
        mainLetter = fresh;
        gsap.set(mainLetter, { clearProps: 'all' });
        attachLetterHandlers();

        // Compile the (possibly edited) source with the closure dependencies it
        // expects injected via `with`, so `currentAnimation = tl` writes back to us.
        const ctx = {
            gsap: gsap,
            Math: Math,
            createSplitTextAnimation: createSplitTextAnimation,
            mainLetter: mainLetter,
            currentAnimation: null
        };
        try {
            const runner = new Function('__ctx', 'with (__ctx) { return (' + source + ')(); }');
            runner(ctx);
            currentAnimation = ctx.currentAnimation || null;
            // Resume roughly where the previous loop was, for a smooth retune.
            if (currentAnimation && prevProgress > 0 && prevProgress < 1) {
                try { currentAnimation.progress(prevProgress); } catch (e) {}
            }
        } catch (err) {
            console.error('[primer] animation build failed for', letter, err);
            // Fall back to the pristine built-in so a bad edit never leaves it blank.
            const fn = animationFunctions[letter];
            if (fn && source !== fn.toString()) run(letter, fn.toString());
        }
    }

    // Exposed so the code panel can retune the live animation from edited source.
    window.primer = { run: run };
    
    function initAccelerationAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Acceleration: Speed increasing motion
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                x: i => (Math.random() - 0.5) * 380,
                y: i => (Math.random() - 0.5) * 100,
                rotation: i => (Math.random() - 0.5) * 55,
                duration: 0.18, stagger: 0.015, ease: "power3.out"
            }).to(chars, {
                x: 0, y: 0, rotation: 0,
                duration: 0.7, stagger: 0.03, ease: "elastic.out(1, 0.3)",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initBalanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Balance: Seesaw motion
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            const dir = Math.random() > 0.5 ? 1 : -1;
            gsap.timeline().to(chars, {
                rotation: dir * 85, y: 30,
                duration: 0.28, ease: "power3.out", stagger: 0.05,
                transformOrigin: "50% 100%"
            }).to(chars, {
                rotation: -dir * 85 * 0.6, y: 15,
                duration: 0.5, ease: "elastic.out(1, 0.3)", stagger: 0.05,
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initConversionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Conversion: Form transformation
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                scale: 1.5, rotation: 200, duration: 0.25, stagger: 0.08, ease: "power3.out"
            }).to(chars, {
                scale: 1, rotation: 720, duration: 0.6, ease: "elastic.out(1, 0.4)",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initDensityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Density: Compression/expansion
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                scale: 0.35, duration: 0.3, ease: "power3.in", stagger: 0.04
            }).to(chars, {
                scale: 1.7, duration: 0.25, ease: "power3.out", stagger: 0.04
            }).to(chars, {
                scale: 1, duration: 0.6, ease: "elastic.out(1, 0.3)",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initEquilibriumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Equilibrium: Gentle floating
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            chars.forEach(c => gsap.killTweensOf(c));
            chars.forEach((char, i) => {
                gsap.timeline().to(char, {
                    x: (Math.random() - 0.5) * 130, y: (Math.random() - 0.5) * 130,
                    rotation: (Math.random() - 0.5) * 80,
                    duration: 0.2, ease: "power3.out", delay: i * 0.025
                }).to(char, {
                    x: "random(-20, 20)", y: "random(-20, 20)",
                    duration: "random(3, 5)", repeat: -1, yoyo: true,
                    ease: "sine.inOut", delay: i * 0.2
                });
            });
        });
        currentAnimation = gsap.timeline();
    }

    function initFrictionAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Friction: Resistance motion
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                x: 200, duration: 0.15, ease: "power4.out"
            }).to(chars, {
                x: 0, duration: 2.5, ease: "power4.out",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initGravityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Gravity: Falling motion
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                y: 180, duration: 0.22, stagger: 0.04, ease: "power3.in"
            }).to(chars, {
                y: 0, duration: 0.8, stagger: 0.04, ease: "elastic.out(1, 0.3)",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initHarmonicAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Harmonic: Perfect sine waves
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            chars.forEach(c => gsap.killTweensOf(c));
            chars.forEach((char, i) => {
                gsap.timeline().to(char, {
                    y: 120, x: "random(-5, 5)", rotation: "random(-8, 8)",
                    duration: 0.15, ease: "power3.out", delay: i * 0.08
                }).to(char, {
                    y: 50, x: "random(-5, 5)", rotation: "random(-5, 5)",
                    duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut"
                });
            });
        });
        currentAnimation = gsap.timeline();
    }

    function initInertiaAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Inertia: Slow resistance to change
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                x: 120, rotation: 15, duration: 0.2, ease: "power4.out", stagger: 0.04
            }).to(chars, {
                x: 0, rotation: 0, duration: 1.5, ease: "power4.out", stagger: 0.04,
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initJouleAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Joule: Energy pulse
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                scale: 2.5, opacity: 0.15, filter: "blur(3px)",
                duration: 0.12, stagger: { each: 0.03, from: 'center' }, ease: "power3.out"
            }).to(chars, {
                scale: 1, opacity: 1, filter: "blur(0px)",
                duration: 0.8, stagger: { each: 0.04, from: 'center' }, ease: "elastic.out(1, 0.3)",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initKineticAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Kinetic: Constant motion
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            chars.forEach(c => gsap.killTweensOf(c));
            chars.forEach((char, i) => {
                gsap.timeline().to(char, {
                    x: (Math.random() - 0.5) * 180,
                    y: (Math.random() - 0.5) * 100,
                    rotation: (Math.random() - 0.5) * 60,
                    duration: 0.18, ease: "power3.out", delay: i * 0.02
                }).to(char, {
                    x: "random(-80, 80)", y: "random(-60, 60)",
                    rotation: "random(-180, 180)",
                    duration: "random(0.3, 0.7)", repeat: -1, yoyo: true,
                    ease: "power2.inOut"
                });
            });
        });
        currentAnimation = gsap.timeline();
    }

    function initLuminosityAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Luminosity: Light emission effect

        gsap.set(chars, { filter: "brightness(1)" });

        const tl = gsap.timeline({ repeat: -1 });
        
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
                filter: "brightness(3)",
                duration: 0.2,
                stagger: 0.05,
                ease: "power4.out"
            })
            .to(chars, {
                scale: 1,
                filter: "brightness(1)",
                duration: 1.5,
                ease: "power2.out"
            });
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                opacity: 0.1, scale: 1.15, filter: "blur(3px)",
                duration: 0.18, stagger: 0.05, ease: "power2.out"
            }).to(chars, {
                opacity: 1, scale: 1, filter: "blur(0px)",
                duration: 1.3, stagger: 0.06, ease: "power2.inOut",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initMomentumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Momentum: Mass in motion with impact
        
        const tl = gsap.timeline({ repeat: -1 });
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                x: -130, scale: 0.7, duration: 0.2, ease: "power3.in"
            }).to(chars, {
                x: 180, scale: 1.15, duration: 0.35, ease: "power4.out"
            }).to(chars, {
                x: 120, scale: 0.95, duration: 0.3, ease: "bounce.out"
            }).to(chars, {
                x: 0, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initNeutronAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Neutron: Orbital motion
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            chars.forEach(c => gsap.killTweensOf(c));
            chars.forEach((char, i) => {
                gsap.timeline().to(char, {
                    x: Math.cos((i / chars.length) * Math.PI * 2) * 110,
                    y: Math.sin((i / chars.length) * Math.PI * 2) * 90,
                    scale: 1.4, opacity: 0.5,
                    duration: 0.22, ease: "power3.out", delay: i * 0.02
                }).to(char, {
                    x: 0, y: 0, scale: 1, opacity: 1,
                    duration: 0.9, ease: "elastic.out(1, 0.4)", delay: i * 0.03
                });
            });
        });
        currentAnimation = gsap.timeline();
    }

    function initOscillationAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Oscillation: Back and forth
        
        gsap.set(chars, { x: -80 });
        const tl = gsap.timeline({ repeat: -1, yoyo: true });

        tl.to(chars, {
            x: 80,
            duration: 2,
            ease: "sine.inOut"
        });

        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline({ onComplete: () => tl.resume() }).to(chars, {
                x: 200, duration: 0.2, stagger: 0.05, ease: "sine.inOut"
            }).to(chars, {
                x: -200, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 3
            }).to(chars, {
                x: 0, duration: 0.5, stagger: 0.03, ease: "power2.out"
            });
        });
        currentAnimation = tl;
    }

    function initPotentialAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Potential: Build up and release
        
        const tl = gsap.timeline({ repeat: -1 });
        
        tl
            .to(chars, {
                y: -100,            // rise: store potential (up)
                scale: 0.85,
                duration: 1.6,
                ease: "power2.inOut"
            })
            .to(chars, {
                y: 90,              // release: fall through centre and overshoot down
                scale: 1.4,
                duration: 0.35,
                ease: "power4.out"
            })
            .to(chars, {
                y: 0,               // settle back at the centre
                scale: 1,
                duration: 0.7,
                ease: "elastic.out(1, 0.3)"
            });

        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline({ onComplete: () => tl.resume() }).to(chars, {
                y: -190, scale: 0.7, duration: 0.25, ease: "power3.in", stagger: 0.05
            }).to(chars, {
                y: 150, scale: 1.5, duration: 0.28, ease: "power4.out", stagger: 0.04
            }).to(chars, {
                y: 0, scale: 1, duration: 0.65, ease: "elastic.out(1, 0.3)"
            });
        });
        currentAnimation = tl;
    }

    function initQuantumAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Quantum: Discrete jumps
        
        const positions = [-60, -30, 0, 30, 60];
        const tl = gsap.timeline({ repeat: -1 });
        
        positions.forEach(pos => {
            tl.set(chars, {
                x: pos,
                duration: 0
            })
            .to({}, { duration: 0.5 });
        });
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            chars.forEach((char, i) => {
                gsap.timeline().to(char, {
                    x: (Math.random() - 0.5) * 80,
                    y: (Math.random() - 0.5) * 80,
                    scale: 0.5 + Math.random() * 1.0,
                    opacity: 0.2 + Math.random() * 0.5,
                    filter: `blur(${Math.random() * 6}px)`,
                    duration: 0.1 + Math.random() * 0.1,
                    ease: "none", delay: i * 0.02
                }).to(char, {
                    x: 0, y: 0, scale: 1, opacity: 1,
                    filter: 'blur(0px)',
                    duration: 0.7, delay: 0.15, ease: "elastic.out(1, 0.3)",
                    onComplete: function() {
                        if (char === chars[chars.length - 1]) tl.resume();
                    }
                });
            });
        });
        currentAnimation = tl;
    }

    function initResonanceAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Resonance: Amplifying vibration
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                x: i => (Math.random() - 0.5) * 120,
                duration: 0.18, stagger: 0.05, ease: "sine.inOut",
                yoyo: true, repeat: 7
            }).to(chars, {
                x: 0, duration: 0.4, ease: "power3.out",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initSymmetryAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Symmetry: Mirrored movement
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                rotationY: 220, duration: 0.5, ease: "power2.inOut"
            }).to(chars, {
                rotationY: 360, duration: 0.5, ease: "power2.inOut",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initThermalAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Thermal: Rapid vibration
        
        chars.forEach(char => {
            gsap.to(char, {
                x: "random(-5, 5)",
                y: "random(-5, 5)",
                duration: 0.1,
                repeat: -1,
                ease: "none"
            });
        });
        
        mainLetter.addEventListener('mouseenter', function() {
            chars.forEach(c => gsap.killTweensOf(c));
            chars.forEach((char, i) => {
                gsap.timeline().to(char, {
                    scale: 1.5, opacity: 0.15, filter: "blur(4px)",
                    duration: 0.2, ease: "power3.out", delay: i * 0.03
                }).to(char, {
                    scale: 1, opacity: 1, filter: "blur(0px)",
                    duration: 0.9, ease: "power2.inOut",
                    onComplete: function() {
                        gsap.to(char, {
                            x: "random(-5, 5)", y: "random(-5, 5)",
                            duration: 0.1, repeat: -1, ease: "none"
                        });
                    }
                });
            });
        });
        currentAnimation = gsap.timeline();
    }

    function initUncertaintyAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Uncertainty: Fuzzy positions
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            chars.forEach(c => gsap.killTweensOf(c));
            chars.forEach((char, i) => {
                gsap.timeline().to(char, {
                    x: (Math.random() - 0.5) * 110,
                    y: (Math.random() - 0.5) * 110,
                    opacity: 0.3,
                    filter: `blur(${3 + Math.random() * 5}px)`,
                    duration: 0.18, ease: "power2.out", delay: i * 0.03
                }).to(char, {
                    x: "random(-30, 30)", y: "random(-30, 30)",
                    opacity: "random(0.2, 1)", filter: "blur(random(0, 4)px)",
                    duration: "random(0.5, 1)", repeat: -1, yoyo: true, ease: "none"
                });
            });
        });
        currentAnimation = gsap.timeline();
    }

    function initVoltageAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Voltage: Electric pulse
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                scale: 1.3, opacity: 0.1, filter: "blur(4px)",
                duration: 0.15, stagger: 0.05, ease: "power3.out"
            }).to(chars, {
                scale: 1.1, opacity: 1, filter: "blur(2px)",
                duration: 0.2, stagger: 0.05, ease: "power4.out"
            }).to(chars, {
                scale: 1, filter: "blur(0px)",
                duration: 1.2, ease: "power2.out",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initWaveAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Wave: Sine wave propagation
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            chars.forEach(c => gsap.killTweensOf(c));
            // Guard against a single-character letter (chars.length === 1),
            // where (i / (chars.length - 1)) would be 0/0 = NaN
            const denom = chars.length > 1 ? chars.length - 1 : 1;
            chars.forEach((char, i) => {
                const waveY = chars.length > 1
                    ? -80 * Math.sin((i / denom) * Math.PI)
                    : -100; // single char: strong upward burst on hover
                gsap.timeline().to(char, {
                    y: waveY, duration: 0.3, ease: "power2.out", delay: i * 0.04
                }).to(char, {
                    y: 70, duration: 0.8, repeat: -1, yoyo: true,
                    ease: "sine.inOut", delay: i * 0.15
                });
            });
        });
        currentAnimation = gsap.timeline();
    }

    function initXrayAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // X-ray: Penetrating effect
        
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
                duration: 0.3,
                stagger: 0.1
            })
            .to(chars, {
                scale: 1,
                duration: 0.5
            });
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                opacity: 0.05, scale: 0.85,
                filter: "blur(5px)",
                duration: 0.2, stagger: 0.08, ease: "power2.in"
            }).to(chars, {
                opacity: 1, scale: 1, filter: "blur(0px)",
                duration: 0.8, ease: "power1.inOut",
                onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initYieldAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Yield: Explosive release
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
        
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
        
        mainLetter.addEventListener('mouseenter', function() {
            tl.pause();
            gsap.timeline().to(chars, {
                scale: 0.5, opacity: 0, x: "random(-100, 100)",
                y: "random(-100, 100)", rotation: "random(-360, 360)",
                duration: 0.3, ease: "expo.out",
                stagger: { each: 0.02, from: "random" }
            }).set(chars, { scale: 1, x: 0, y: 0, rotation: 0, opacity: 1 }).to(chars, {
                duration: 0.1, onComplete: () => tl.resume()
            });
        });
        currentAnimation = tl;
    }

    function initZeroPointAnimation() {
        const { splitText, chars } = createSplitTextAnimation();

        // Zero Point: Minimal vibration
        
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

        mainLetter.addEventListener('mouseenter', function() {
            chars.forEach(c => gsap.killTweensOf(c));
            chars.forEach((char, i) => {
                gsap.timeline().to(char, {
                    x: "random(-30, 30)", y: "random(-30, 30)",
                    rotation: "random(-15, 15)", scale: "random(0.9, 1.1)",
                    opacity: 0.3, filter: "blur(3px)",
                    duration: 0.25, ease: "power2.out", delay: i * 0.02
                }).to(char, {
                    x: 0, y: 0, rotation: 0, scale: 1,
                    opacity: 1, filter: "blur(0px)",
                    duration: 0.6, ease: "power3.inOut",
                    onComplete: function() {
                        gsap.to(char, {
                            x: "random(-3, 3)", y: "random(-3, 3)",
                            rotation: "random(-2, 2)", scale: "random(0.97, 1.03)",
                            duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut"
                        });
                    }
                });
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

    // (Touch-tap burst support is attached per build via attachLetterHandlers,
    //  since run() swaps the .main-letter node on every animation rebuild.)

    letters.forEach((letterEl, index) => {
        letterEl.addEventListener('click', () => updateDisplay(index));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
        if (e.key === 'ArrowLeft') {
            goToPrevLetter();
        } else if (e.key === 'ArrowRight') {
            goToNextLetter();
        } else if (e.key >= 'a' && e.key <= 'z') {
            const letterIndex = e.key.charCodeAt(0) - 97;
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

        let closest = 0;
        let minDist = Infinity;
        letters.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const dist = Math.abs(e.clientX - cx);
            if (dist < minDist) { minDist = dist; closest = i; }
        });
        updateDisplay(closest);
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

        const touchX = e.touches[0].clientX;
        let closest = 0;
        let minDist = Infinity;
        letters.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const dist = Math.abs(touchX - cx);
            if (dist < minDist) { minDist = dist; closest = i; }
        });
        updateDisplay(closest);
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Initialize with letter A
    updateDisplay(0);
});