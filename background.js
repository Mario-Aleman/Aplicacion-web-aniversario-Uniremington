/**
 * ANIMACIÓN DE FONDO INTERACTIVA Y DE ALTO IMPACTO
 * Universidad Remington - Semana de Aniversario
 * 
 * Efectos:
 * - Constelación de partículas de alta energía en colores institucionales (Azul, Cian, Rojo, Dorado y Blanco)
 * - Conexiones dinámicas de luz entre partículas cercanas
 * - Interactividad total con el cursor del mouse (fuerza de repulsión y conexión luminosa)
 * - Soporte para pantallas táctiles y Retina Displays
 * - 60 FPS optimizado con requestAnimationFrame
 */

(function () {
    'use strict';

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Paleta de colores Uniremington festivos
    const PALETTE = [
        { r: 0, g: 210, b: 255 },   // Cian eléctrico / luz
        { r: 1, g: 66, b: 124 },    // Azul Uniremington oficial
        { r: 41, g: 128, b: 185 },  // Azul zafiro luminoso
        { r: 255, g: 255, b: 255 }, // Blanco estelar
        { r: 255, g: 183, b: 3 },   // Dorado festivo aniversario
        { r: 229, g: 27, b: 36 }    // Rojo institucional Uniremington
    ];

    let particles = [];
    const mouse = {
        x: null,
        y: null,
        radius: 160,
        active: false
    };

    function calculateParticleCount() {
        const area = window.innerWidth * window.innerHeight;
        // Aproximadamente 1 partícula cada 14000px² (60-80 en pantallas normales, 30-40 en móviles)
        let count = Math.floor(area / 14000);
        return Math.min(Math.max(count, 35), 85);
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        initParticles();
    }

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 10;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = -(Math.random() * 0.6 + 0.25); // Movimiento ascendente sutil tipo celebración
            this.baseSize = Math.random() * 2.2 + 1.2;
            this.size = this.baseSize;
            
            // Asignación de color con ponderación (mayoría azules y cian, toques rojos y dorados)
            const rand = Math.random();
            if (rand < 0.35) {
                this.color = PALETTE[0]; // Cian
            } else if (rand < 0.60) {
                this.color = PALETTE[1]; // Azul institucional
            } else if (rand < 0.78) {
                this.color = PALETTE[2]; // Zafiro
            } else if (rand < 0.88) {
                this.color = PALETTE[3]; // Blanco
            } else if (rand < 0.95) {
                this.color = PALETTE[4]; // Dorado
            } else {
                this.color = PALETTE[5]; // Rojo
            }

            this.baseAlpha = Math.random() * 0.5 + 0.35;
            this.alpha = this.baseAlpha;
            this.pulseSpeed = Math.random() * 0.03 + 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update() {
            this.pulsePhase += this.pulseSpeed;
            // Efecto de parpadeo suave
            this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.2;
            this.alpha = Math.max(0.15, Math.min(0.9, this.alpha));

            this.x += this.vx;
            this.y += this.vy;

            // Reacción física al mouse (repulsión magnética suave)
            if (mouse.active && mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);

                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    const push = force * 2.5;
                    this.x += Math.cos(angle) * push;
                    this.y += Math.sin(angle) * push;
                }
            }

            // Envoltura de bordes en pantalla
            if (this.x < -15) this.x = width + 15;
            if (this.x > width + 15) this.x = -15;
            if (this.y < -20) {
                this.reset(false);
            }
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
            ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
            ctx.shadowBlur = this.size * 3.5;
            ctx.fill();
            ctx.restore();
        }
    }

    function initParticles() {
        const count = calculateParticleCount();
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // Dibujar líneas de conexión entre partículas cercanas y con el cursor
    function drawConnections() {
        const maxDist = 125;
        const maxDistSq = maxDist * maxDist;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];

            // Conexiones entre partículas
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxDistSq) {
                    const dist = Math.sqrt(distSq);
                    const lineAlpha = (1 - dist / maxDist) * 0.28;

                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 210, 255, ${lineAlpha})`;
                    ctx.lineWidth = 0.85;
                    ctx.stroke();
                    ctx.restore();
                }
            }

            // Conexión especial brillante con el puntero del mouse
            if (mouse.active && mouse.x !== null && mouse.y !== null) {
                const dx = p1.x - mouse.x;
                const dy = p1.y - mouse.y;
                const dist = Math.hypot(dx, dy);

                if (dist < mouse.radius) {
                    const mouseAlpha = (1 - dist / mouse.radius) * 0.65;
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouse.x, mouse.y);

                    const grad = ctx.createLinearGradient(p1.x, p1.y, mouse.x, mouse.y);
                    grad.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${mouseAlpha})`);
                    grad.addColorStop(1, `rgba(0, 210, 255, ${mouseAlpha * 1.2})`);

                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1.3;
                    ctx.shadowColor = 'rgba(0, 210, 255, 0.6)';
                    ctx.shadowBlur = 6;
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }

    let animationFrameId;
    let isPageVisible = true;

    function animate() {
        if (!isPageVisible) return;

        ctx.clearRect(0, 0, width, height);

        drawConnections();

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Escuchadores de eventos interactivos
    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', function () {
        mouse.active = false;
        mouse.x = null;
        mouse.y = null;
    });

    // Soporte táctil en dispositivos móviles
    window.addEventListener('touchmove', function (e) {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
            mouse.active = true;
        }
    }, { passive: true });

    window.addEventListener('touchend', function () {
        mouse.active = false;
    });

    // Optimización de redibujado en resize
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    // Pausar animación si la pestaña está en segundo plano para ahorrar recursos
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            isPageVisible = false;
            cancelAnimationFrame(animationFrameId);
        } else {
            isPageVisible = true;
            animate();
        }
    });

    // Iniciar
    window.addEventListener('DOMContentLoaded', function () {
        resize();
        animate();
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resize();
        animate();
    }
})();
