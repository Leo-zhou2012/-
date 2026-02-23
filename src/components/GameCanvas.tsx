/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Point, 
  EnemyRocket, 
  InterceptorMissile, 
  Explosion, 
  City, 
  Battery, 
  GameStatus, 
  GAME_CONFIG 
} from '../types';

interface GameCanvasProps {
  status: GameStatus;
  onScoreUpdate: (points: number) => void;
  onGameEnd: (won: boolean) => void;
  onMissileUpdate: (batteryIndex: number, count: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  status, 
  onScoreUpdate, 
  onGameEnd, 
  onMissileUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State Refs (to avoid React re-render overhead in loop)
  const rocketsRef = useRef<EnemyRocket[]>([]);
  const missilesRef = useRef<InterceptorMissile[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const citiesRef = useRef<City[]>([]);
  const batteriesRef = useRef<Battery[]>([]);
  const scoreRef = useRef(0);
  const spawnedCountRef = useRef(0);
  const frameRef = useRef<number>(0);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize Cities and Batteries
  useEffect(() => {
    if (status === 'START' || status === 'PLAYING') {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
        
        // Setup cities
        const newCities: City[] = [
          { id: 'c1', pos: { x: clientWidth * 0.2, y: clientHeight - 30 }, active: true },
          { id: 'c2', pos: { x: clientWidth * 0.3, y: clientHeight - 30 }, active: true },
          { id: 'c3', pos: { x: clientWidth * 0.4, y: clientHeight - 30 }, active: true },
          { id: 'c4', pos: { x: clientWidth * 0.6, y: clientHeight - 30 }, active: true },
          { id: 'c5', pos: { x: clientWidth * 0.7, y: clientHeight - 30 }, active: true },
          { id: 'c6', pos: { x: clientWidth * 0.8, y: clientHeight - 30 }, active: true },
        ];
        citiesRef.current = newCities;

        // Setup batteries
        const newBatteries: Battery[] = [
          { id: 'b1', pos: { x: clientWidth * 0.1, y: clientHeight - 40 }, active: true, missiles: 20, maxMissiles: 20 },
          { id: 'b2', pos: { x: clientWidth * 0.5, y: clientHeight - 40 }, active: true, missiles: 40, maxMissiles: 40 },
          { id: 'b3', pos: { x: clientWidth * 0.9, y: clientHeight - 40 }, active: true, missiles: 20, maxMissiles: 20 },
        ];
        batteriesRef.current = newBatteries;
        
        // Reset other refs
        rocketsRef.current = [];
        missilesRef.current = [];
        explosionsRef.current = [];
        scoreRef.current = 0;
        spawnedCountRef.current = 0;
      }
    }
  }, [status]);

  // Handle resize separately
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Game Loop
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Spawn Rockets
      if (spawnedCountRef.current < GAME_CONFIG.MAX_ROCKETS && Math.random() < GAME_CONFIG.SPAWN_RATE) {
        const startX = Math.random() * canvas.width;
        const targetTargets = [...citiesRef.current.filter(c => c.active), ...batteriesRef.current.filter(b => b.active)];
        if (targetTargets.length > 0) {
          spawnedCountRef.current++;
          const target = targetTargets[Math.floor(Math.random() * targetTargets.length)];
          rocketsRef.current.push({
            id: Math.random().toString(),
            start: { x: startX, y: 0 },
            pos: { x: startX, y: 0 },
            target: { x: target.pos.x, y: target.pos.y },
            speed: GAME_CONFIG.ROCKET_SPEED_MIN + Math.random() * (GAME_CONFIG.ROCKET_SPEED_MAX - GAME_CONFIG.ROCKET_SPEED_MIN),
            progress: 0
          });
        }
      }

      // 2. Update Rockets
      rocketsRef.current = rocketsRef.current.filter(rocket => {
        rocket.progress += rocket.speed;
        rocket.pos.x = rocket.start.x + (rocket.target.x - rocket.start.x) * rocket.progress;
        rocket.pos.y = rocket.start.y + (rocket.target.y - rocket.start.y) * rocket.progress;

        if (rocket.progress >= 1) {
          // Hit target
          explosionsRef.current.push({
            id: Math.random().toString(),
            pos: { ...rocket.target },
            radius: 0,
            maxRadius: GAME_CONFIG.EXPLOSION_MAX_RADIUS,
            growing: true,
            alpha: 1
          });

          // Check what was hit
          citiesRef.current.forEach(city => {
            if (city.active && Math.abs(city.pos.x - rocket.target.x) < 5) city.active = false;
          });
          batteriesRef.current.forEach(battery => {
            if (battery.active && Math.abs(battery.pos.x - rocket.target.x) < 5) battery.active = false;
          });

          return false;
        }
        return true;
      });

      // 3. Update Missiles
      missilesRef.current = missilesRef.current.filter(missile => {
        missile.progress += missile.speed;
        missile.pos.x = missile.start.x + (missile.target.x - missile.start.x) * missile.progress;
        missile.pos.y = missile.start.y + (missile.target.y - missile.start.y) * missile.progress;

        if (missile.progress >= 1) {
          explosionsRef.current.push({
            id: Math.random().toString(),
            pos: { ...missile.target },
            radius: 0,
            maxRadius: GAME_CONFIG.EXPLOSION_MAX_RADIUS,
            growing: true,
            alpha: 1
          });
          return false;
        }
        return true;
      });

      // 4. Update Explosions & Collision
      explosionsRef.current = explosionsRef.current.filter(exp => {
        if (exp.growing) {
          exp.radius += GAME_CONFIG.EXPLOSION_SPEED;
          if (exp.radius >= exp.maxRadius) exp.growing = false;
        } else {
          exp.radius -= GAME_CONFIG.EXPLOSION_SPEED * 0.5;
          exp.alpha -= 0.02;
        }

        // Collision with rockets
        rocketsRef.current = rocketsRef.current.filter(rocket => {
          const dx = rocket.pos.x - exp.pos.x;
          const dy = rocket.pos.y - exp.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < exp.radius) {
            scoreRef.current += GAME_CONFIG.ROCKET_SCORE;
            onScoreUpdate(GAME_CONFIG.ROCKET_SCORE);
            explosionsRef.current.push({
              id: Math.random().toString(),
              pos: { ...rocket.pos },
              radius: 0,
              maxRadius: GAME_CONFIG.EXPLOSION_MAX_RADIUS * 0.5,
              growing: true,
              alpha: 1
            });
            return false;
          }
          return true;
        });

        return exp.radius > 0 && exp.alpha > 0;
      });

      // 5. Draw Everything
      // Draw Cities
      citiesRef.current.forEach(city => {
        if (!city.active) return;
        ctx.fillStyle = '#10b981'; // Emerald 500
        ctx.fillRect(city.pos.x - 15, city.pos.y, 30, 20);
        ctx.fillRect(city.pos.x - 10, city.pos.y - 10, 20, 10);
      });

      // Draw Batteries
      batteriesRef.current.forEach(battery => {
        if (!battery.active) return;
        ctx.fillStyle = '#3b82f6'; // Blue 500
        ctx.beginPath();
        ctx.moveTo(battery.pos.x - 20, battery.pos.y + 20);
        ctx.lineTo(battery.pos.x + 20, battery.pos.y + 20);
        ctx.lineTo(battery.pos.x, battery.pos.y - 10);
        ctx.closePath();
        ctx.fill();
        
        // Draw missile count
        ctx.fillStyle = 'white';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(battery.missiles.toString(), battery.pos.x, battery.pos.y + 35);
      });

      // Draw Rockets
      rocketsRef.current.forEach(rocket => {
        // Trail
        ctx.strokeStyle = '#ef4444'; // Red 500
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]); // Dotted trail for rockets
        ctx.beginPath();
        ctx.moveTo(rocket.start.x, rocket.start.y);
        ctx.lineTo(rocket.pos.x, rocket.pos.y);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Warhead (the head of the rocket)
        const angle = Math.atan2(rocket.target.y - rocket.start.y, rocket.target.x - rocket.start.x);
        
        ctx.save();
        ctx.translate(rocket.pos.x, rocket.pos.y);
        ctx.rotate(angle);
        
        // Rocket body/head shape
        ctx.fillStyle = '#f87171'; // Red 400
        ctx.beginPath();
        ctx.moveTo(5, 0); // Tip
        ctx.lineTo(-3, -3);
        ctx.lineTo(-3, 3);
        ctx.closePath();
        ctx.fill();
        
        // Glow effect for the warhead
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0; // Reset shadow
      });

      // Draw Missiles
      missilesRef.current.forEach(missile => {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(missile.start.x, missile.start.y);
        ctx.lineTo(missile.pos.x, missile.pos.y);
        ctx.stroke();

        // Target X
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(missile.target.x - 3, missile.target.y - 3);
        ctx.lineTo(missile.target.x + 3, missile.target.y + 3);
        ctx.moveTo(missile.target.x + 3, missile.target.y - 3);
        ctx.lineTo(missile.target.x - 3, missile.target.y + 3);
        ctx.stroke();
      });

      // Draw Explosions
      explosionsRef.current.forEach(exp => {
        ctx.beginPath();
        ctx.arc(exp.pos.x, exp.pos.y, exp.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(exp.pos.x, exp.pos.y, 0, exp.pos.x, exp.pos.y, exp.radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${exp.alpha})`);
        gradient.addColorStop(0.5, `rgba(251, 191, 36, ${exp.alpha})`); // Amber 400
        gradient.addColorStop(1, `rgba(239, 68, 68, 0)`); // Red 500
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // 6. Check Win/Loss
      if (scoreRef.current >= GAME_CONFIG.WIN_SCORE) {
        onGameEnd(true);
        return;
      }

      if (batteriesRef.current.every(b => !b.active)) {
        onGameEnd(false);
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [status, onScoreUpdate, onGameEnd]);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (status !== 'PLAYING') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Find closest active battery with missiles
    let bestBattery: Battery | null = null;
    let minDist = Infinity;
    let bestIdx = -1;

    batteriesRef.current.forEach((b, idx) => {
      if (b.active && b.missiles > 0) {
        const dist = Math.abs(b.pos.x - x);
        if (dist < minDist) {
          minDist = dist;
          bestBattery = b;
          bestIdx = idx;
        }
      }
    });

    if (bestBattery && bestIdx !== -1) {
      const b = bestBattery as Battery;
      b.missiles -= 1;
      onMissileUpdate(bestIdx, b.missiles);
      
      missilesRef.current.push({
        id: Math.random().toString(),
        start: { ...b.pos },
        pos: { ...b.pos },
        target: { x, y },
        speed: GAME_CONFIG.MISSILE_SPEED,
        progress: 0
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-950">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        className="block w-full h-full cursor-crosshair"
      />
      
      {/* Ground Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800" />
    </div>
  );
};
