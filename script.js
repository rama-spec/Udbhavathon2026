document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Canvas Starfield Animation
    // ==========================================
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];

    // Configuration
    const STAR_COUNT = 160;
    const MOUSE_RADIUS = 250;
    const STAR_COLORS = ['rgba(0, 229, 255, ', 'rgba(124, 124, 255, ']; // Cyan & Violet base

    // Resize Handler
    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse Tracking State
    const mouse = { x: -1000, y: -1000 }; // Start off-screen

    class Star {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;

            // Depth and Size
            this.z = Math.random() * 2 + 0.5; // Depth factor
            this.baseSize = Math.random() * 1.5 + 0.5;

            // Drift Velocity
            this.vx = (Math.random() - 0.5) * 0.15 * this.z;
            this.vy = (Math.random() - 0.5) * 0.15 * this.z;

            // Appearance
            this.baseOpacity = Math.random() * 0.6 + 0.2;
            this.colorPrefix = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        }

        update() {
            // 1. Natural Drift
            this.x += this.vx;
            this.y += this.vy;

            // 2. Mouse Repel Logic
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const angle = Math.atan2(dy, dx);

                // Push star away based on proximity
                const push = force * 2.5;
                this.x += Math.cos(angle) * push;
                this.y += Math.sin(angle) * push;
            }

            // 3. Screen Wrap
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            let size = this.baseSize;
            let opacity = this.baseOpacity;

            // Interaction: Increase Size & Brightness
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                size += force * 2; // Grow up to +2px
                opacity += force * 0.5; // Brighten up
                if (opacity > 1) opacity = 1;
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.colorPrefix + opacity + ')';
            ctx.fill();
        }
    }

    // Initialize Stars
    // Clear and rebuild to be safe
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
    }

    // Animation Loop
    const animate = () => {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(star => {
            star.update();
            star.draw();
        });

        requestAnimationFrame(animate);
    };

    animate();

    // ==========================================
    // 2. DOM Parallax & Tilt Effects
    // ==========================================
    const planet = document.querySelector('.planet-container');
    const heroContent = document.querySelector('.hero-content');
    const canvasEl = document.getElementById('starfield');
    const card = document.getElementById('glassCard');

    // Unified Mouse Handler
    document.addEventListener('mousemove', (e) => {
        // Update Canvas Mouse
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        // Calculate Center-based Position for Parallax
        const xPct = (window.innerWidth - e.pageX * 2) / 100;
        const yPct = (window.innerHeight - e.pageY * 2) / 100;

        // Apply Layer Transforms
        if (planet) planet.style.transform = `translateY(-50%) translate(${xPct * 2}px, ${yPct * 2}px)`;
        // if (heroContent) heroContent.style.transform = `translate(${xPct * 0.5}px, ${yPct * 0.5}px)`; // Disabled text parallax
        if (canvasEl) canvasEl.style.transform = `translate(${xPct * 0.2}px, ${yPct * 0.2}px)`;

        // Dynamic Planet Lighting
        const planetShadow = document.querySelector('.planet-shadow');
        if (planetShadow) {
            // Calculate light position loosely opposite to mouse
            const lightX = 30 + (xPct * 2); // Base 30% + shift
            const lightY = 30 + (yPct * 2);
            planetShadow.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, transparent 40%, rgba(2, 6, 23, 0.95) 85%)`;
        }
    });

    // Specific Card Tilt Listener (Restoring specific behavior)
    if (card) {
        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const x = e.clientX - cardRect.left;
            const y = e.clientY - cardRect.top;
            const centerX = cardRect.width / 2;
            const centerY = cardRect.height / 2;

            // Limit tilt angles
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    }
    // ==========================================
    // 3. Scroll Reveal Animation
    // ==========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Optional: keep observing or run once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
    // ==========================================
    // 4. Generic Tilt Effect for Feature Cards
    // ==========================================
    document.querySelectorAll('.tilt-card').forEach(tiltCard => {
        tiltCard.addEventListener('mousemove', (e) => {
            const rect = tiltCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Professional tilt - max 4 degrees
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            tiltCard.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        tiltCard.addEventListener('mouseleave', () => {
            tiltCard.style.transform = '';
        });
    });

    // ==========================================
    // 5. Orbit Path Timeline - Step-Driven Progression
    // ==========================================
    const timelineSection = document.querySelector('.timeline-section');
    const orbitPath = document.getElementById('orbitPath');
    const energyDot = document.getElementById('energyDot');
    const orbitNodes = document.querySelectorAll('.orbit-node');
    const timelineCards = document.querySelectorAll('.timeline-card');
    const orbitContainer = document.querySelector('.orbit-container');
    const cardsWrapper = document.querySelector('.cards-wrapper');

    if (timelineSection && orbitPath && energyDot && orbitContainer) {
        const totalNodes = orbitNodes.length;

        // Cinematic timing values
        const staggerDelay = 800;      // ms between each card
        const pathAnimDuration = 650;  // ms per path segment
        const dotAnimDuration = 650;   // ms for energy dot movement

        // Animation state
        let revealStarted = false;
        let currentNodeIndex = -1;
        let currentDotPosition = { x: 0, y: 0 };
        let targetDotPosition = { x: 0, y: 0 };

        // Two-lane positioning system
        // Fixed horizontal positions for 8 nodes (evenly distributed)
        const nodeXPositions = [8, 20, 32, 44, 56, 68, 80, 92]; // Percentage values

        // Fixed vertical lanes (percentage of viewBox height)
        const topLaneY = 25;     // Top lane at 25%
        const bottomLaneY = 75;  // Bottom lane at 75%
        const curveY = 50;       // Orbit curve center at 50%

        // Get SVG viewBox dimensions
        const svg = orbitPath.ownerSVGElement;
        const viewBox = svg.viewBox.baseVal;
        const vbWidth = viewBox.width || 1400;
        const vbHeight = viewBox.height || 500;

        // Calculate actual node coordinates in viewBox units
        const getNodeCoords = (index) => {
            const xPercent = nodeXPositions[index] || (8 + index * 12);
            const isTopLane = (index % 2 === 0);

            // Node sits between curve and card
            // Cards at 25% or 75%, curve at 50%
            // Node at ~35% (between top card and curve) or ~65% (between curve and bottom card)
            const nodeYPercent = isTopLane ? 38 : 62;

            return {
                x: (xPercent / 100) * vbWidth,
                y: (nodeYPercent / 100) * vbHeight,
                isTopLane: isTopLane
            };
        };

        // Generate all node coordinates
        const nodeCoords = [];
        for (let i = 0; i < totalNodes; i++) {
            nodeCoords.push(getNodeCoords(i));
        }

        // Generate cubic bezier path through all nodes
        const generateOrbitPath = () => {
            if (nodeCoords.length < 2) return '';

            let d = `M ${nodeCoords[0].x} ${nodeCoords[0].y}`;

            for (let i = 0; i < nodeCoords.length - 1; i++) {
                const current = nodeCoords[i];
                const next = nodeCoords[i + 1];

                // Distance between nodes
                const dx = next.x - current.x;
                const dy = next.y - current.y;

                // Control point tension (how far control points extend)
                const tension = Math.abs(dx) * 0.4;

                // Bend direction based on destination lane
                // If next node is on top lane → bend upward (negative Y)
                // If next node is on bottom lane → bend downward (positive Y)
                const bendAmount = vbHeight * 0.15;

                // Control point 1: extends from current node toward next
                const cp1x = current.x + tension;
                const cp1y = current.isTopLane
                    ? current.y + bendAmount  // Coming from top, curve down
                    : current.y - bendAmount; // Coming from bottom, curve up

                // Control point 2: approaches next node
                const cp2x = next.x - tension;
                const cp2y = next.isTopLane
                    ? next.y + bendAmount     // Going to top, approach from below
                    : next.y - bendAmount;    // Going to bottom, approach from above

                d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
            }

            return d;
        };

        // Generate and apply the new path
        const newPathD = generateOrbitPath();
        orbitPath.setAttribute('d', newPathD);

        // Update SVG node positions to match
        orbitNodes.forEach((node, index) => {
            if (index < nodeCoords.length) {
                node.setAttribute('cx', nodeCoords[index].x);
                node.setAttribute('cy', nodeCoords[index].y);
            }
        });

        // Recalculate path length after updating
        const pathLength = orbitPath.getTotalLength();

        // Calculate node positions along the new path
        const nodePathPositions = [];
        for (let i = 0; i < totalNodes; i++) {
            const t = i / (totalNodes - 1);
            const lengthAtNode = t * pathLength;
            const point = orbitPath.getPointAtLength(lengthAtNode);
            nodePathPositions.push({
                index: i,
                length: lengthAtNode,
                x: point.x,
                y: point.y
            });
        }

        // Position cards in two-lane grid layout
        const positionCards = () => {
            timelineCards.forEach((card, index) => {
                if (index >= totalNodes) return;

                const xPercent = nodeXPositions[index] || (8 + index * 12);
                const yPercent = (index % 2 === 0) ? topLaneY : bottomLaneY;

                card.style.left = `${xPercent}%`;
                card.style.top = `${yPercent}%`;
            });
        };

        // Initialize path (hidden)
        orbitPath.style.strokeDasharray = pathLength;
        orbitPath.style.strokeDashoffset = pathLength;
        orbitPath.style.transition = `stroke-dashoffset ${pathAnimDuration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`;

        // Initialize dot at first node
        if (nodePathPositions.length > 0) {
            const firstPos = nodePathPositions[0];
            currentDotPosition = { x: firstPos.x, y: firstPos.y };
            targetDotPosition = { x: firstPos.x, y: firstPos.y };
            energyDot.setAttribute('cx', firstPos.x);
            energyDot.setAttribute('cy', firstPos.y);
        }

        // Lerp for smooth dot movement
        const lerp = (start, end, factor) => start + (end - start) * factor;

        // Animate path to specific node
        const animatePathToNode = (nodeIndex) => {
            if (nodeIndex < 0 || nodeIndex >= totalNodes) return;
            const targetLength = nodePathPositions[nodeIndex].length;
            const newOffset = pathLength - targetLength;
            orbitPath.style.strokeDashoffset = newOffset;
        };

        // Move energy dot to specific node
        const moveDotToNode = (nodeIndex) => {
            if (nodeIndex < 0 || nodeIndex >= totalNodes) return;
            const pos = nodePathPositions[nodeIndex];
            targetDotPosition = { x: pos.x, y: pos.y };
        };

        // Smooth dot animation loop - slower lerp for 650ms movement
        const updateDotPosition = () => {
            currentDotPosition.x = lerp(currentDotPosition.x, targetDotPosition.x, 0.08);
            currentDotPosition.y = lerp(currentDotPosition.y, targetDotPosition.y, 0.08);

            energyDot.setAttribute('cx', currentDotPosition.x);
            energyDot.setAttribute('cy', currentDotPosition.y);

            requestAnimationFrame(updateDotPosition);
        };

        // Start dot animation loop
        requestAnimationFrame(updateDotPosition);

        // Step-driven reveal sequence - cinematic timing
        const startRevealSequence = () => {
            if (revealStarted) return;
            revealStarted = true;

            // Position cards using perpendicular offsets
            positionCards();

            // Show energy dot
            energyDot.classList.add('visible');

            // Reveal each node, card, and path segment sequentially
            // Order: reveal card → extend path to node → move energy dot → wait → next
            timelineCards.forEach((card, index) => {
                const revealTime = index * staggerDelay;

                // Step 1: Reveal card first
                setTimeout(() => {
                    card.classList.add('reveal');
                }, revealTime);

                // Step 2: Extend path to this node (after card starts appearing)
                setTimeout(() => {
                    animatePathToNode(index);
                }, revealTime + 150);

                // Step 3: Activate node glow + move energy dot
                setTimeout(() => {
                    if (orbitNodes[index]) {
                        orbitNodes[index].classList.add('active');
                    }
                    moveDotToNode(index);
                    currentNodeIndex = index;
                }, revealTime + 300);
            });
        };

        // Observe timeline section - trigger at 40% visibility
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !revealStarted) {
                    startRevealSequence();
                }
            });
        }, {
            threshold: 0.4,
            rootMargin: '0px'
        });

        timelineObserver.observe(timelineSection);

        // Reposition cards on resize
        window.addEventListener('resize', () => {
            if (revealStarted) {
                positionCards();
            }
        });

        // Subtle parallax on revealed timeline cards
        document.addEventListener('mousemove', (e) => {
            if (!revealStarted) return;

            const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
            const yPct = (e.clientY / window.innerHeight - 0.5) * 2;

            timelineCards.forEach((card, index) => {
                const factor = (index % 2 === 0) ? 1 : -1;
                const offsetX = xPct * 4 * factor;
                const offsetY = yPct * 2;

                if (card.classList.contains('reveal') && !card.matches(':hover')) {
                    card.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(1)`;
                }
            });
        });

        // Reset transform on mouse leave
        timelineSection.addEventListener('mouseleave', () => {
            timelineCards.forEach(card => {
                if (card.classList.contains('reveal') && !card.matches(':hover')) {
                    card.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            });
        });
    }

    // ==========================================
    // 6. Countdown Timer
    // ==========================================
    const countdownDays = document.getElementById('countdown-days');
    const countdownHours = document.getElementById('countdown-hours');
    const countdownMin = document.getElementById('countdown-min');
    const countdownSec = document.getElementById('countdown-sec');

    if (countdownDays && countdownHours && countdownMin && countdownSec) {
        // Target date: Feb 25, 2026 — 07:00 AM local time
        const targetDate = new Date('2026-02-25T07:00:00').getTime();

        // Pad numbers with leading zeros
        const padZero = (num) => num.toString().padStart(2, '0');

        // Animate number change
        const animateValue = (element, newValue) => {
            const currentValue = element.textContent;
            if (currentValue !== newValue) {
                element.classList.add('updating');
                setTimeout(() => {
                    element.textContent = newValue;
                    element.classList.remove('updating');
                }, 150);
            }
        };

        // Update countdown
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                // Event has started
                animateValue(countdownDays, '00');
                animateValue(countdownHours, '00');
                animateValue(countdownMin, '00');
                animateValue(countdownSec, '00');
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            animateValue(countdownDays, padZero(days));
            animateValue(countdownHours, padZero(hours));
            animateValue(countdownMin, padZero(minutes));
            animateValue(countdownSec, padZero(seconds));
        };

        // Initial update
        updateCountdown();

        // Update every second
        setInterval(updateCountdown, 1000);
    }

    // ==========================================
    // 7. Prize Calculator
    // ==========================================
    const teamSlider = document.getElementById('teamSlider');
    const sliderValue = document.getElementById('sliderValue');
    const totalFeeEl = document.getElementById('totalFee');
    const roiValueEl = document.getElementById('roiValue');

    if (teamSlider && sliderValue && totalFeeEl && roiValueEl) {
        const FEE_PER_HEAD = 200;
        const PRIZE_POOL = 50000;

        // Animate counting up effect
        let currentDisplayFee = 600;
        let currentDisplayROI = 83;
        let targetFee = 600;
        let targetROI = 83;

        const animateNumbers = () => {
            // Smooth interpolation
            const feeDiff = targetFee - currentDisplayFee;
            const roiDiff = targetROI - currentDisplayROI;

            if (Math.abs(feeDiff) > 1) {
                currentDisplayFee += feeDiff * 0.15;
            } else {
                currentDisplayFee = targetFee;
            }

            if (Math.abs(roiDiff) > 0.5) {
                currentDisplayROI += roiDiff * 0.15;
            } else {
                currentDisplayROI = targetROI;
            }

            totalFeeEl.textContent = `₹${Math.round(currentDisplayFee)}`;
            roiValueEl.textContent = `${Math.round(currentDisplayROI)}×`;

            if (currentDisplayFee !== targetFee || currentDisplayROI !== targetROI) {
                requestAnimationFrame(animateNumbers);
            }
        };

        // Update calculations
        const updateCalculations = () => {
            const teamSize = parseInt(teamSlider.value);
            sliderValue.textContent = teamSize;

            targetFee = teamSize * FEE_PER_HEAD;
            targetROI = Math.floor(PRIZE_POOL / targetFee);

            requestAnimationFrame(animateNumbers);
        };

        // Initial calculation
        updateCalculations();

        // Listen for slider changes
        teamSlider.addEventListener('input', updateCalculations);
    }
});
