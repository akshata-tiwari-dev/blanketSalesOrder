/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

import { ClientScriptContext } from 'N/types';

function injectNimbusPopup(): void {
    const div = document.createElement('div');
    div.id = 'nimbus-success-popup';
    div.innerHTML = `
    <div class="nimbus-toast">
      <div class="nimbus-icon-wrapper">
        <svg class="checkmark" viewBox="0 0 52 52">
          <path class="check" d="M14 27 l10 10 l20 -20" />
        </svg>
      </div>
      <div class="nimbus-text">Blanket Sales Order <br>Saved Successfully</div>
      <canvas id="nimbus-sparkle-canvas"></canvas>
    </div>
  `;
    document.body.appendChild(div);
}

function injectNimbusCSS(): void {
    const style = document.createElement('style');
    style.innerHTML = `
    #nimbus-success-popup {
      position: fixed;
      bottom: -200px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      transition: all 0.6s ease-in-out;
    }

    .nimbus-toast {
      background: #111827;
      color: #a7f3d0;
      padding: 20px 40px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      font-weight: 600;
      position: relative;
      animation: scaleSlideIn 0.6s ease-out;
    }

    .nimbus-icon-wrapper {
      background: #10b981;
      border-radius: 50%;
      padding: 10px;
    }

    .checkmark {
      width: 28px;
      height: 28px;
    }

    .check {
      fill: none;
      stroke: white;
      stroke-width: 5;
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
      animation: drawCheck 1s forwards;
    }

    .nimbus-text {
      font-size: 16px;
    }

    #nimbus-sparkle-canvas {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
    }

    @keyframes drawCheck {
      to { stroke-dashoffset: 0; }
    }

    @keyframes scaleSlideIn {
      0% { transform: scale(0.8); opacity: 0; bottom: -100px; }
      100% { transform: scale(1); opacity: 1; bottom: 30px; }
    }
  `;
    document.head.appendChild(style);
}

function triggerNimbusSuccess(): void {
    const popup = document.getElementById('nimbus-success-popup')!;
    const canvas = document.getElementById('nimbus-sparkle-canvas') as HTMLCanvasElement;

    popup.style.bottom = '30px';
    runSparkleEffect(canvas);

    setTimeout(() => {
        popup.style.bottom = '-200px';
    }, 9500);
}

function runSparkleEffect(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const sparks = Array.from({ length: 30 }, () => ({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 6,
        speedY: (Math.random() - 0.5) * 6,
        opacity: 1,
        color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`
    }));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sparks.forEach((spark) => {
            ctx.fillStyle = `rgba(${hexToRgb(spark.color)},${spark.opacity})`;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
            ctx.fill();
            spark.x += spark.speedX;
            spark.y += spark.speedY;
            spark.opacity -= 0.03;
        });
        if (sparks.some(s => s.opacity > 0)) requestAnimationFrame(animate);
    }

    animate();
}

function hexToRgb(hsl: string): string {
    const m = /^hsl\((\d+),\s*100%,\s*(\d+)%\)$/.exec(hsl);
    if (m) {
        const h = parseInt(m[1], 10);
        const l = parseInt(m[2], 10);
        const a = l / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = 255 * (a - Math.min(Math.max(Math.min(k - 3, 9 - k, 1), 0), 1));
            return Math.round(color);
        };
        return `${f(0)},${f(8)},${f(4)}`;
    }
    return '255,255,255';
}

// Entry hooks
export function pageInit(_ctx: ClientScriptContext): void {
    injectNimbusPopup();
    injectNimbusCSS();
}

export function saveRecord(_ctx: ClientScriptContext): boolean {
    triggerNimbusSuccess();
    return true;
}