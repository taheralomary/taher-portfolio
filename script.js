
const panels = [...document.querySelectorAll(".panel")];
const navItems = [...document.querySelectorAll(".nav-item")];

const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const sectionNumber = document.getElementById("sectionNumber");

const portfolio = document.querySelector(".portfolio");
const yearElement = document.getElementById("year");

let currentSection = 0;

yearElement.textContent = new Date().getFullYear();

function showSection(index) {
    if (index < 0 || index >= panels.length) {
        return;
    }

    currentSection = index;

    panels.forEach((panel, i) => {
        const isActive = i === currentSection;

        panel.hidden = !isActive;
        panel.classList.toggle("active", isActive);
    });

    navItems.forEach((item, i) => {
        const isActive = i === currentSection;

        item.classList.toggle("active", isActive);

        if (isActive) {
            item.setAttribute("aria-current", "step");
        } else {
            item.removeAttribute("aria-current");
        }
    });

    sectionNumber.textContent = String(currentSection + 1)
        .padStart(2, "0");

    prevButton.disabled = currentSection === 0;
    nextButton.disabled = currentSection === panels.length - 1;
}

prevButton.addEventListener("click", () => {
    showSection(currentSection - 1);
});

nextButton.addEventListener("click", () => {
    showSection(currentSection + 1);
});

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        const index = Number(item.dataset.section);

        showSection(index);

        requestAnimationFrame(() => {
            const targetPanel = panels[index];

            if (targetPanel) {
                targetPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
});


document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
        const sectionIndex = Number(button.dataset.go);

        showSection(sectionIndex);

        // Scroll to the actual section after it becomes visible.
        requestAnimationFrame(() => {
            const targetPanel = panels[sectionIndex];

            if (targetPanel) {
                targetPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
});


// Arrow-key navigation, similar to the reference portfolio.
document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }

    const target = event.target;

    if (
        target instanceof HTMLElement &&
        (
            target.isContentEditable ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
        )
    ) {
        return;
    }

    if (event.key === "ArrowRight") {
        if (currentSection < panels.length - 1) {
            showSection(currentSection + 1);
        }
    }

    if (event.key === "ArrowLeft") {
        if (currentSection > 0) {
            showSection(currentSection - 1);
        }
    }
});

// Set the initial state.
showSection(0);


const shieldCard = document.getElementById("shieldCard");
const shieldHint = document.getElementById("shieldHint");

if (shieldCard && shieldHint) {
    shieldCard.addEventListener("click", () => {
        const flipped = shieldCard.classList.toggle("is-flipped");

        shieldCard.setAttribute("aria-pressed", String(flipped));

        shieldHint.textContent = flipped
            ? "CLICK TO RETURN"
            : "HOVER OR CLICK TO REVEAL";
    });
}




/* =========================================
   INTERACTIVE CYBER STARFIELD
   Optimized animation and rendering
========================================= */

const canvas = document.getElementById("starfield");
const ctx = canvas?.getContext("2d", {
    alpha: true
});

if (canvas && ctx) {
    const motionPreference = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let reducedMotion = motionPreference.matches;

    let width = 0;
    let height = 0;
    let stars = [];
    let shootingStars = [];

    let animationFrameId = null;
    let lastShot = 0;
    let lastShotInterval = 4500 + Math.random() * 4000;

    // Keep the rendering resolution reasonable on high-DPI displays.
    const MAX_DPR = 1.5;

    const colors = [
        "rgb(196, 137, 255)",
        "rgb(255, 255, 255)",
        "rgb(177, 145, 255)"
    ];

    const mouse = {
        x: -1000,
        y: -1000,
        active: false
    };

    const connectionDistance = 170;
    const interactionRadius = 220;

    /* =========================================
       CANVAS SETUP
    ========================================= */

    function resizeCanvas() {
        const dpr = Math.min(
            window.devicePixelRatio || 1,
            MAX_DPR
        );

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Scale the number of stars to the viewport size.
        const count = Math.min(
            140,
            Math.max(
                45,
                Math.floor((width * height) / 11000)
            )
        );

        stars = Array.from({ length: count }, () => {
            const x = Math.random() * width;
            const y = Math.random() * height;

            return {
                x,
                y,
                originX: x,
                originY: y,
                radius: Math.random() * 1.4 + 0.3,
                speed: Math.random() * 0.22 + 0.04,
                phase: Math.random() * Math.PI * 2,
                twinkle: Math.random() * 0.025 + 0.005,
                color: colors[
                    Math.floor(Math.random() * colors.length)
                ]
            };
        });

        // Avoid leaving shooting stars outside the new viewport.
        shootingStars = [];

        renderStaticFrame();
    }

    /* =========================================
       UPDATE STAR POSITIONS
    ========================================= */

    function updateStars() {
        for (const star of stars) {
            star.originY += star.speed;

            if (star.originY > height) {
                star.originY = 0;
                star.originX = Math.random() * width;
            }

            let targetX = star.originX;
            let targetY = star.originY;

            if (mouse.active) {
                const dx = star.originX - mouse.x;
                const dy = star.originY - mouse.y;

                const distance = Math.hypot(dx, dy);

                if (
                    distance < interactionRadius &&
                    distance > 0
                ) {
                    const force =
                        (interactionRadius - distance) /
                        interactionRadius;

                    targetX += (dx / distance) * force * 25;
                    targetY += (dy / distance) * force * 25;
                }
            }

            star.x += (targetX - star.x) * 0.08;
            star.y += (targetY - star.y) * 0.08;
        }
    }

    /* =========================================
       DRAW STAR CONNECTIONS
    ========================================= */

    function drawConnections() {
        ctx.lineWidth = 0.6;

        for (let i = 0; i < stars.length; i++) {
            const a = stars[i];

            for (let j = i + 1; j < stars.length; j++) {
                const b = stars[j];

                const dx = a.x - b.x;
                const dy = a.y - b.y;

                // Avoid calculating square roots for distant stars.
                const distanceSquared = dx * dx + dy * dy;

                if (
                    distanceSquared <
                    connectionDistance * connectionDistance
                ) {
                    const distance = Math.sqrt(distanceSquared);

                    const alpha =
                        (1 - distance / connectionDistance) * 0.13;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);

                    ctx.strokeStyle =
                        `rgba(169, 112, 255, ${alpha})`;

                    ctx.stroke();
                }
            }
        }
    }

    /* =========================================
       MOUSE INTERACTION
    ========================================= */

    function drawMouseConnections() {
        if (!mouse.active) {
            return;
        }

        for (const star of stars) {
            const dx = mouse.x - star.x;
            const dy = mouse.y - star.y;

            const distanceSquared = dx * dx + dy * dy;

            if (
                distanceSquared <
                interactionRadius * interactionRadius
            ) {
                const distance = Math.sqrt(distanceSquared);

                const opacity =
                    1 - distance / interactionRadius;

                // Connection between the mouse and nearby stars.
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(star.x, star.y);

                ctx.strokeStyle =
                    `rgba(185, 130, 255, ${opacity * 0.75})`;

                ctx.lineWidth = 0.7 + opacity * 1.2;
                ctx.stroke();

                // Glow around nearby stars.
                ctx.beginPath();

                ctx.arc(
                    star.x,
                    star.y,
                    star.radius + opacity * 3,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle =
                    `rgba(205, 165, 255, ${opacity * 0.9})`;

                ctx.shadowBlur = 14 * opacity;
                ctx.shadowColor = "#a970ff";

                ctx.fill();

                ctx.shadowBlur = 0;
            }
        }

        // Soft glow around the cursor.
        const glow = ctx.createRadialGradient(
            mouse.x,
            mouse.y,
            0,
            mouse.x,
            mouse.y,
            75
        );

        glow.addColorStop(
            0,
            "rgba(145, 85, 255, 0.20)"
        );

        glow.addColorStop(
            1,
            "rgba(145, 85, 255, 0)"
        );

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 75, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
    }

    /* =========================================
       DRAW STARS
    ========================================= */

    function drawStars(time) {
        for (const star of stars) {
            const twinkle =
                0.65 +
                Math.sin(time * star.twinkle + star.phase) * 0.35;

            ctx.globalAlpha = twinkle;

            ctx.beginPath();

            ctx.arc(
                star.x,
                star.y,
                star.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = star.color;
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    /* =========================================
       SHOOTING STARS
    ========================================= */

    function createShootingStar() {
        shootingStars.push({
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.4,
            vx: 5 + Math.random() * 4,
            vy: 2 + Math.random() * 2,
            life: 1,
            length: 50 + Math.random() * 80
        });
    }

    function drawShootingStars() {
        shootingStars = shootingStars.filter((star) => {
            star.x += star.vx;
            star.y += star.vy;
            star.life -= 0.012;

            const tailX =
                star.x - star.vx * star.length / 7;

            const tailY =
                star.y - star.vy * star.length / 7;

            const gradient = ctx.createLinearGradient(
                tailX,
                tailY,
                star.x,
                star.y
            );

            gradient.addColorStop(
                0,
                "rgba(196, 137, 255, 0)"
            );

            gradient.addColorStop(
                1,
                `rgba(230, 210, 255, ${Math.max(0, star.life)})`
            );

            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;

            ctx.moveTo(tailX, tailY);
            ctx.lineTo(star.x, star.y);

            ctx.stroke();

            return (
                star.life > 0 &&
                star.x < width + 100 &&
                star.y < height + 100
            );
        });
    }

    /* =========================================
       RENDER A STATIC FRAME
    ========================================= */

    function renderStaticFrame() {
        ctx.clearRect(0, 0, width, height);

        drawConnections();
        drawStars(0);
    }

    /* =========================================
       ANIMATION LOOP
    ========================================= */

    function animate(time) {
        animationFrameId = null;

        if (document.hidden || reducedMotion) {
            return;
        }

        ctx.clearRect(0, 0, width, height);

        updateStars();
        drawConnections();
        drawMouseConnections();
        drawStars(time);

        if (time - lastShot >= lastShotInterval) {
            createShootingStar();

            lastShot = time;
            lastShotInterval =
                4500 + Math.random() * 4000;
        }

        drawShootingStars();

        // Schedule exactly one next frame.
        animationFrameId = requestAnimationFrame(animate);
    }

    /* =========================================
       START AND STOP ANIMATION
    ========================================= */

    function startAnimation() {
        if (
            !document.hidden &&
            !reducedMotion &&
            animationFrameId === null
        ) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    function stopAnimation() {
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    // Respect changes to the operating system's motion preference.
    function handleMotionPreferenceChange(event) {
        reducedMotion = event.matches;

        stopAnimation();

        if (reducedMotion) {
            shootingStars = [];
            renderStaticFrame();
        } else {
            startAnimation();
        }
    }

    if (motionPreference.addEventListener) {
        motionPreference.addEventListener(
            "change",
            handleMotionPreferenceChange
        );
    } else {
        // Compatibility with older browsers.
        motionPreference.addListener(
            handleMotionPreferenceChange
        );
    }

    /* =========================================
       POINTER EVENTS
    ========================================= */

    window.addEventListener(
        "pointermove",
        (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
            mouse.active = true;
        },
        { passive: true }
    );

    document.documentElement.addEventListener(
        "pointerleave",
        () => {
            mouse.active = false;
        }
    );

    window.addEventListener("blur", () => {
        mouse.active = false;
    });

    window.addEventListener("resize", resizeCanvas);

    /* =========================================
       INITIALIZE
    ========================================= */

    resizeCanvas();

    if (!reducedMotion) {
        startAnimation();
    } else {
        renderStaticFrame();
    }
}






/* ==========================================
   PROJECT CARDS — CURSOR TRACKING
   ========================================== */

const projectCards = document.querySelectorAll(".project-card");

const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
);

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

if (canHover.matches && !prefersReducedMotion.matches) {
    projectCards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 2.5;
            const rotateX = ((centerY - y) / centerY) * 2.5;

            card.style.setProperty("--pointer-x", `${x}px`);
            card.style.setProperty("--pointer-y", `${y}px`);

            card.style.transform = `
                perspective(900px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-3px)
            `;
        });

        card.addEventListener("pointerleave", () => {
            card.style.transform =
                "perspective(900px) rotateX(0deg) rotateY(0deg)";
            card.style.setProperty("--pointer-x", "50%");
            card.style.setProperty("--pointer-y", "50%");
        });
    });
}



