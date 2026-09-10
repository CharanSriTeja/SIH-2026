import React, { useEffect, useRef, useState } from 'react';

interface LandscapeCanvasProps {
  scrollProgress?: number; // 0 to 1
}

const TOTAL_FRAMES = 240;

const getFramePath = (index: number) => {
  const frameNum = String(index + 1).padStart(3, '0');
  return `/frames/ezgif-frame-${frameNum}.jpg`;
};

export const LandscapeCanvas: React.FC<LandscapeCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hudPhase, setHudPhase] = useState('01 // PEACEFUL TERRAIN');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    const isLoaded: boolean[] = new Array(TOTAL_FRAMES).fill(false);

    let currentFrameFloat = 0;
    let targetFrameFloat = 0;
    let drawnImageIndex = -1;
    let animationFrameId: number;

    const stages = [
      { p: 0.00, name: '01 // PEACEFUL TERRAIN' },
      { p: 0.20, name: '02 // RAINFALL & MOISTURE FUSION' },
      { p: 0.40, name: '03 // AI INSTABILITY DETECTION' },
      { p: 0.60, name: '04 // GEOSPATIAL RISK POLYGON' },
      { p: 0.80, name: '05 // EVACUATION & COMMAND RESPONSE' },
    ];

    function resizeCanvas() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const target = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentFrameFloat)));
      drawFrame(target, true);
    }

    function getBestLoadedImage(desiredIndex: number) {
      if (isLoaded[desiredIndex] && images[desiredIndex] && images[desiredIndex].complete) {
        return { img: images[desiredIndex], index: desiredIndex };
      }
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const down = desiredIndex - offset;
        if (down >= 0 && isLoaded[down] && images[down] && images[down].complete) {
          return { img: images[down], index: down };
        }
        const up = desiredIndex + offset;
        if (up < TOTAL_FRAMES && isLoaded[up] && images[up] && images[up].complete) {
          return { img: images[up], index: up };
        }
      }
      return null;
    }

    function drawFrame(targetIndex: number, force = false) {
      if (!ctx || !canvas) return;
      const best = getBestLoadedImage(targetIndex);
      if (!best || !best.img) return;

      if (!force && drawnImageIndex === best.index) {
        return;
      }

      const img = best.img;
      if (!img.complete || img.naturalWidth === 0) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const scale = Math.max(cw / iw, ch / ih);
      const nw = iw * scale;
      const nh = ih * scale;
      const dx = (cw - nw) * 0.5;
      const dy = (ch - nh) * 0.5;

      ctx.drawImage(img, 0, 0, iw, ih, dx, dy, nw, nh);
      drawnImageIndex = best.index;
    }

    function updateScrollTarget() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      );
      const clientHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);
      const fraction = Math.max(0, Math.min(1, scrollTop / maxScroll));

      targetFrameFloat = fraction * (TOTAL_FRAMES - 1);

      // Update telemetry stage name based on fraction
      let currentStage = stages[0].name;
      for (let i = stages.length - 1; i >= 0; i--) {
        if (fraction >= stages[i].p - 0.05) {
          currentStage = stages[i].name;
          break;
        }
      }
      setHudPhase(currentStage);
    }

    function loop() {
      const diff = targetFrameFloat - currentFrameFloat;
      if (Math.abs(diff) > 0.001) {
        currentFrameFloat += diff * 0.15;
      } else {
        currentFrameFloat = targetFrameFloat;
      }

      const targetIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(currentFrameFloat))
      );

      drawFrame(targetIndex);

      animationFrameId = requestAnimationFrame(loop);
    }

    function preloadImages() {
      // 1. Frame 0 priority for instant first paint
      const firstImg = new Image();
      firstImg.onload = () => {
        isLoaded[0] = true;
        resizeCanvas();
        drawFrame(0, true);
      };
      firstImg.src = getFramePath(0);
      images[0] = firstImg;
      if (firstImg.complete) {
        isLoaded[0] = true;
        resizeCanvas();
        drawFrame(0, true);
      }

      // 2. Preload remaining frames
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        const index = i;
        img.onload = () => {
          isLoaded[index] = true;
          const currentTarget = Math.round(currentFrameFloat);
          if (currentTarget === index && drawnImageIndex !== index) {
            drawFrame(index, true);
          }
        };
        img.src = getFramePath(index);
        images[index] = img;
        if (img.complete) {
          isLoaded[index] = true;
        }
      }
    }

    // Event Listeners
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('wheel', () => {
      requestAnimationFrame(updateScrollTarget);
    }, { passive: true });

    // Initial setup
    resizeCanvas();
    preloadImages();
    updateScrollTarget();
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Scroll-responsive terrain elevation canvas */}
      <canvas ref={canvasRef} className="w-full h-full block bg-[#F6F3EC]" />

      {/* Warm paper contrast veil: keeps terrain subtle and body text 100% legible */}
      <div className="absolute inset-0 bg-[#F6F3EC]/80 pointer-events-none backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#F6F3EC]/90 via-transparent to-[#F6F3EC]/95 pointer-events-none" />

      {/* Floating Spatial Telemetry HUD Indicator */}
      <div className="absolute top-24 left-6 hidden lg:flex items-center gap-3 text-[11px] font-mono text-[#55594C] pointer-events-auto bg-[#FFFDF8]/95 border border-[#DDD6C4] px-3.5 py-1.5 rounded-lg shadow-sm">
        <div className="w-2 h-2 rounded-full bg-[#4F8F5B] animate-pulse" />
        <span className="font-semibold text-[#2E4A3D]">TERRAIN &amp; PRECIPITATION OBSERVATION</span>
        <span className="text-[#DDD6C4]">|</span>
        <span className="text-[#B5551F] font-semibold">{hudPhase}</span>
      </div>
    </div>
  );
};
