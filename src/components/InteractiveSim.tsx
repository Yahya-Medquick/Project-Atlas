import React, { useRef, useEffect, useState } from "react";
import { InteractiveSimulation } from "../types";
import { Play, Pause, RotateCcw, Sliders, Info, Sparkles } from "lucide-react";

interface InteractiveSimProps {
  simulation: InteractiveSimulation;
  topic: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  mass: number;
  trail: Array<{ x: number; y: number }>;
}

export const InteractiveSim: React.FC<InteractiveSimProps> = ({
  simulation,
  topic,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  // Simulation controls state
  const [intensity, setIntensity] = useState(
    simulation.presetValues.intensity || 50
  );
  const [particleCount, setParticleCount] = useState(
    simulation.presetValues.particleCount || 60
  );
  const [damping, setDamping] = useState(
    simulation.presetValues.damping || 15
  );
  const [speed, setSpeed] = useState(simulation.presetValues.speed || 2);

  const particlesRef = useRef<Particle[]>([]);
  const [activeEntityCount, setActiveEntityCount] = useState(
    simulation.presetValues.particleCount || 60
  );

  // Initialize particles
  const initParticles = (width: number, height: number, count: number) => {
    const colors = ["#6366f1", "#a855f7", "#3b82f6", "#06b6d4", "#ec4899"];
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (Math.min(width, height) * 0.35) + 40;
      const x = width / 2 + Math.cos(angle) * dist;
      const y = height / 2 + Math.sin(angle) * dist;

      // Orbital initial velocity
      const speedVal = (Math.random() * 2 + 1) * 1.5;
      const vx = -Math.sin(angle) * speedVal;
      const vy = Math.cos(angle) * speedVal;

      particles.push({
        x,
        y,
        vx,
        vy,
        radius: Math.random() * 3 + 2,
        color: colors[i % colors.length],
        mass: Math.random() * 5 + 1,
        trail: [],
      });
    }
    particlesRef.current = particles;
    setActiveEntityCount(particles.length);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.height = 480;

    initParticles(width, height, particleCount);

    let animationFrameId: number;

    const render = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.25)"; // Dark trail effect
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Center Attractor (Core Source)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#6366f1";
      ctx.shadowColor = "#818cf8";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isRunning) {
        const G = (intensity / 50) * 0.5;
        const dragFactor = 1 - (damping / 100) * 0.05;

        particlesRef.current.forEach((p) => {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const distSq = dx * dx + dy * dy + 100;
          const dist = Math.sqrt(distSq);

          // Force law F = G * M / r^2
          const force = (G * 1000) / distSq;
          const ax = (dx / dist) * force;
          const ay = (dy / dist) * force;

          p.vx = (p.vx + ax * speed) * dragFactor;
          p.vy = (p.vy + ay * speed) * dragFactor;

          p.x += p.vx * speed;
          p.y += p.vy * speed;

          // Trail points
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 12) p.trail.shift();
        });
      }

      // Draw particle trails and bodies
      particlesRef.current.forEach((p) => {
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = p.color + "40";
          ctx.lineWidth = p.radius * 0.8;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, intensity, damping, speed]);

  // Click canvas to spawn particle
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colors = ["#6366f1", "#a855f7", "#3b82f6", "#06b6d4", "#ec4899"];
    particlesRef.current.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      mass: 3,
      trail: [],
    });
    setActiveEntityCount(particlesRef.current.length);
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      initParticles(canvas.width, canvas.height, particleCount);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              HTML5 Canvas Sandbox
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Interactive Simulation
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            {simulation.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click anywhere on the simulation canvas to spawn dynamic field entities.
          </p>
        </div>

        {/* Play / Pause / Reset Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Canvas Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-[480px] cursor-crosshair block"
        />

        <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-medium flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active Entities: {activeEntityCount}</span>
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>Simulation Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Slider 1: Intensity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Field Intensity</span>
              <span className="text-indigo-500">{intensity}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Slider 2: Particle Count */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Particle Density</span>
              <span className="text-indigo-500">{particleCount}</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              value={particleCount}
              onChange={(e) => {
                const count = Number(e.target.value);
                setParticleCount(count);
                if (canvasRef.current) {
                  initParticles(canvasRef.current.width, canvasRef.current.height, count);
                }
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Slider 3: Damping */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Drag / Damping</span>
              <span className="text-indigo-500">{damping}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Slider 4: Time Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Time Scale</span>
              <span className="text-indigo-500">{speed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
