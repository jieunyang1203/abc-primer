document.addEventListener('DOMContentLoaded', function() {
    // Create a new fixed positioned div for particles
    const particleContainer = document.createElement('div');
    particleContainer.id = 'particle-container';
    particleContainer.style.position = 'fixed';
    particleContainer.style.top = '0'; // Start at the top of the page
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '50%'; // Only cover top half of screen
    particleContainer.style.zIndex = '1'; // Low positive value
    particleContainer.style.pointerEvents = 'none'; // Critical: ensures clicks pass through to elements beneath
    particleContainer.style.pointerEvents = 'none'; // Allow clicks to pass through
    
    // Add the particle container to the body
    document.body.appendChild(particleContainer);
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    canvas.style.pointerEvents = 'none'; // Disable pointer events for the canvas
    
    // Add canvas to particle container
    particleContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size with higher resolution for sharper rendering
    function resizeCanvas() {
        // Get window dimensions for fixed positioning
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Set canvas resolution (2x for high DPI)
        canvas.width = windowWidth * 2;
        canvas.height = (windowHeight * 0.5) * 2; // Top 50% of viewport
        
        ctx.scale(2, 2);
    }
    
    resizeCanvas();
    
    // Mouse position
    let mouse = {
        x: canvas.width / 4,
        y: canvas.height / 4,
        radius: 100
    };
    
    // Track mouse movement
    window.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    // Add touch support for mobile
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouse.x = touch.clientX - rect.left;
        mouse.y = touch.clientY - rect.top;
    }, { passive: false });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        resizeCanvas();
        init();
    });
    
    // Particle class for small circles
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.size = 3.6; // CHANGED: Reduced size to 90% of original (4 * 0.9 = 3.6)
            this.vx = Math.random() * 0.5 - 0.25;
            this.vy = Math.random() * 0.5 - 0.25;
            this.maxDistance = Math.random() * 30 + 10;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.stroke();
        }
        
        update() {
            // Natural floating movement
            this.x += this.vx;
            this.y += this.vy;
            
            // Calculate distance from original position
            const dx = this.x - this.baseX;
            const dy = this.y - this.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Return to original area if too far
            if (distance > this.maxDistance) {
                const angle = Math.atan2(this.baseY - this.y, this.baseX - this.x);
                this.vx += Math.cos(angle) * 0.01;
                this.vy += Math.sin(angle) * 0.01;
                
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 0.8) {
                    this.vx = (this.vx / speed) * 0.8;
                    this.vy = (this.vy / speed) * 0.8;
                }
            }
            
            // Add random movement
            if (Math.random() < 0.05) {
                this.vx += (Math.random() - 0.5) * 0.1;
                this.vy += (Math.random() - 0.5) * 0.1;
            }
            
            // React to mouse
            const mouseDistX = mouse.x - this.x;
            const mouseDistY = mouse.y - this.y;
            const mouseDistance = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY);
            
            if (mouseDistance < 80) {
                const angle = Math.atan2(mouseDistY, mouseDistX);
                const force = (80 - mouseDistance) / 80 * 0.7;
                this.vx -= Math.cos(angle) * force; // Reversed to make particles move away
                this.vy -= Math.sin(angle) * force; // Reversed to make particles move away
            }
            
            // Keep particles within bounds of canvas with buffer for their size
            const canvasWidth = canvas.width / 2;
            const canvasHeight = canvas.height / 2;
            const buffer = this.size + 1; // Add buffer of particle size plus 1px
            
            // Bounce off edges instead of being clamped
            if (this.x < buffer) {
                this.x = buffer;
                this.vx *= -1; // Reverse horizontal velocity
            } else if (this.x > canvasWidth - buffer) {
                this.x = canvasWidth - buffer;
                this.vx *= -1; // Reverse horizontal velocity
            }
            
            if (this.y < buffer) {
                this.y = buffer;
                this.vy *= -1; // Reverse vertical velocity
            } else if (this.y > canvasHeight - buffer) {
                this.y = canvasHeight - buffer;
                this.vy *= -1; // Reverse vertical velocity
            }
        }
    }
    
    // Array to store particles
    let particles = [];
    
    // Draw the scene
    function drawScene() {
        const canvasWidth = canvas.width / 2; // Accounting for scale factor
        const canvasHeight = canvas.height / 2;
        
        // Clear the canvas completely
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
    }
    
    // Initialize scene
    function init() {
        particles = [];
        
        const canvasWidth = canvas.width / 2;
        const canvasHeight = canvas.height / 2;
        
        // Create particles away from edges
        const padding = 10; // Keep particles away from edges initially
        
        // Divide canvas into regions for better coverage
        const gridCols = 6;
        const gridRows = 4;
        const cellWidth = (canvasWidth - padding * 2) / gridCols;
        const cellHeight = (canvasHeight - padding * 2) / gridRows;
        
        // Create 41 particles (34 + 20% = ~41 particles)
        let particlesCreated = 0;
        
        // First, ensure at least one particle in each cell for better distribution
        for (let col = 0; col < gridCols; col++) {
            for (let row = 0; row < gridRows; row++) {
                // Add small random offset within each cell
                const x = padding + col * cellWidth + Math.random() * cellWidth;
                const y = padding + row * cellHeight + Math.random() * cellHeight;
                
                particles.push(new Particle(x, y));
                particlesCreated++;
                
                // Stop after we've created 41 particles
                if (particlesCreated >= 41) {
                    break;
                }
            }
            if (particlesCreated >= 41) {
                break;
            }
        }
        
        // Fill remaining with completely random placement if we haven't reached our target
        for (let i = particlesCreated; i < 41; i++) {
            const x = padding + Math.random() * (canvasWidth - padding * 2);
            const y = padding + Math.random() * (canvasHeight - padding * 2);
            
            particles.push(new Particle(x, y));
        }
    }
    
    // Animation loop
    function animate() {
        drawScene();
        requestAnimationFrame(animate);
    }

    // Initialize and start animation
    init();
    animate();
});