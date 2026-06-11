const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
const particles = [];
const particleCount = 200; 
const connectionDistance = 120;
const mouseDistance = 150;

const mouse = {
    x: null,
    y: null
};

canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
})

canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        
    }

   draw() {
    let alpha = 0.15;

    if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseDistance) {
            const proximity = (mouseDistance - distance) / mouseDistance;
            alpha = 0.15 + proximity * 0.65; 
        }
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
}
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Обновляем и рисуем точки (они сами посчитают свою яркость)
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Рисуем линии
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                // Базовая прозрачность линии от расстояния между точками
                const lineAlpha = (connectionDistance - distance) / connectionDistance;
                
                // ЭФФЕКТ ТУМАНА ДЛЯ ЛИНИЙ:
                // Считаем, насколько близко центр этой линии находится к мышке
                let fogModifier = 0.1; // Базовая видимость линий в тумане (10%)

                if (mouse.x !== null && mouse.y !== null) {
                    // Берем среднюю точку (центр линии)
                    const midX = (particles[i].x + particles[j].x) / 2;
                    const midY = (particles[i].y + particles[j].y) / 2;
                    
                    const dxMouse = mouse.x - midX;
                    const dyMouse = mouse.y - midY;
                    const mouseDist = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                    if (mouseDist < mouseDistance) {
                        // Чем ближе к мыши центр линии, тем сильнее "рассеивается туман"
                        const proximity = (mouseDistance - mouseDist) / mouseDistance;
                        fogModifier = 0.1 + proximity * 0.7; // До 80% яркости в эпицентре
                    }
                }

                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                
                // Перемножаем прозрачность дистанции и эффект тумана от мыши
                ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha * fogModifier})`; 
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Рисуем линии от самой МЫШКИ к ближайшим точкам (оставляем из прошлого шага)
        if (mouse.x !== null && mouse.y !== null) {
            const dxMouse = mouse.x - particles[i].x;
            const dyMouse = mouse.y - particles[i].y;
            const mouseDist = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (mouseDist < mouseDistance) {
                const alpha = (mouseDistance - mouseDist) / mouseDistance;
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(particles[i].x, particles[i].y);
                ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.7})`; // Яркие линии прямо к курсору
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

animate();