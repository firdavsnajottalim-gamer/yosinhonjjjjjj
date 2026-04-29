import React, { useRef, useEffect, useState } from 'react';
import { ShoppingCart, X, Check, Lock, Car, Trophy, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DriftGameProps {
  onExit: () => void;
}

interface Skin {
  id: number;
  name: string;
  color: string;
  price: number;
}

const SKINS: Skin[] = [
  { id: 0, name: "Standart", color: "#dc2626", price: 0 },
  { id: 1, name: "Neon Yashil", color: "#00ff00", price: 5 },
  { id: 2, name: "Moviy", color: "#3b82f6", price: 10 },
  { id: 3, name: "Sariq", color: "#eab308", price: 15 },
  { id: 4, name: "Pushti", color: "#ec4899", price: 20 },
  { id: 5, name: "Oq", color: "#ffffff", price: 25 },
  { id: 6, name: "Binafsha", color: "#8b5cf6", price: 30 },
  { id: 7, name: "To'q yashil", color: "#15803d", price: 35 },
  { id: 8, name: "Oltin", color: "#fbbf24", price: 40 },
];

export const DriftGame: React.FC<DriftGameProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Persistent State
  const [driftPoints, setDriftPoints] = useState(() => {
    const saved = localStorage.getItem('driftPoints');
    return saved ? parseInt(saved) : 0;
  });
  
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('driftHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const [unlockedSkins, setUnlockedSkins] = useState<number[]>(() => {
    const saved = localStorage.getItem('unlockedSkins');
    return saved ? JSON.parse(saved) : [0];
  });

  const [selectedSkinId, setSelectedSkinId] = useState(() => {
    const saved = localStorage.getItem('selectedSkinId');
    return saved ? parseInt(saved) : 0;
  });

  // Transient State
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [health, setHealth] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  // Manual & Automatic Saving
  const saveProgress = () => {
    localStorage.setItem('driftPoints', driftPoints.toString());
    localStorage.setItem('driftHighScore', highScore.toString());
    localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
    localStorage.setItem('selectedSkinId', selectedSkinId.toString());
    
    // Show visual feedback
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  };

  // Sync high score whenever points increase
  useEffect(() => {
    if (driftPoints > highScore) {
      setHighScore(driftPoints);
    }
  }, [driftPoints, highScore]);

  // Immediate save on critical changes
  useEffect(() => {
    localStorage.setItem('driftPoints', driftPoints.toString());
    localStorage.setItem('driftHighScore', highScore.toString());
    localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
    localStorage.setItem('selectedSkinId', selectedSkinId.toString());
  }, [driftPoints, highScore, unlockedSkins, selectedSkinId]);

  // Periodic Auto-Save (Every 30 seconds as requested)
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(interval);
  }, [driftPoints, highScore, unlockedSkins, selectedSkinId]);

  const resetGame = () => {
    setHealth(100);
    setIsGameOver(false);
  };

  const selectedSkin = SKINS.find(s => s.id === selectedSkinId) || SKINS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isShopOpen || isGameOver) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game state
    let car = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      angle: 0,
      velocity: 0,
      acceleration: 0.28, 
      friction: 0.985, 
      turnSpeed: 0.085, 
      driftAngle: 0, 
    };

    const keys: { [key: string]: boolean } = {};
    const handleKeyDown = (e: KeyboardEvent) => keys[e.key.toLowerCase()] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys[e.key.toLowerCase()] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;
    let skidMarks: { x: number; y: number; angle: number; opacity: number }[] = [];
    let coins: { x: number; y: number; id: number }[] = [];
    let coinIdCounter = 0;

    const spawnCoin = () => {
      if (coins.length < 12) {
        coins.push({
          x: Math.random() * (canvas.width - 150) + 75,
          y: Math.random() * (canvas.height - 150) + 75,
          id: coinIdCounter++
        });
      }
    };

    for (let i = 0; i < 8; i++) spawnCoin();

    const update = () => {
      const forward = keys['w'] || keys['arrowup'];
      const backward = keys['s'] || keys['arrowdown'];
      const left = keys['a'] || keys['arrowleft'];
      const right = keys['d'] || keys['arrowright'];

      if (forward) car.velocity += car.acceleration;
      if (backward) car.velocity -= car.acceleration * 0.6;

      const turnMultiplier = Math.abs(car.velocity) > 1.2 ? 1 : Math.abs(car.velocity) / 1.2;
      if (left) car.angle -= car.turnSpeed * turnMultiplier;
      if (right) car.angle += car.turnSpeed * turnMultiplier;

      car.velocity *= car.friction;
      
      const currentDriftTarget = (left || right) && Math.abs(car.velocity) > 2.5 ? (left ? -0.45 : 0.45) : 0;
      car.driftAngle += (currentDriftTarget - car.driftAngle) * 0.12;

      const moveX = Math.cos(car.angle + car.driftAngle * 0.5) * car.velocity;
      const moveY = Math.sin(car.angle + car.driftAngle * 0.5) * car.velocity;

      const isDrifting = Math.abs(car.driftAngle) > 0.1 && Math.abs(car.velocity) > 2.2;
      if (isDrifting) {
        skidMarks.push({ x: car.x, y: car.y, angle: car.angle + car.driftAngle, opacity: 0.6 });
        if (skidMarks.length > 300) skidMarks.shift();
        setDriftPoints(prev => prev + 1);
      }

      // Boundary Collision
      let collided = false;
      const margin = 25;
      if (car.x + moveX < margin || car.x + moveX > canvas.width - margin ||
          car.y + moveY < margin || car.y + moveY > canvas.height - margin) {
        car.velocity *= -0.55; 
        collided = true;
      } else {
        car.x += moveX;
        car.y += moveY;
      }

      if (collided) {
        setHealth(prev => {
          const nextHealth = prev - 10;
          if (nextHealth <= 0) {
            setIsGameOver(true);
            return 0;
          }
          return nextHealth;
        });
      }

      coins = coins.filter(coin => {
        const dx = car.x - coin.x;
        const dy = car.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 38) {
          setDriftPoints(prev => prev + 75); // Increased coin reward
          spawnCoin(); 
          return false;
        }
        return true;
      });
      if (Math.random() < 0.008) spawnCoin();

      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i += 80) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
      for (let i = 0; i < canvas.height; i += 80) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
      ctx.stroke();

      // Arena Border
      ctx.strokeStyle = collided ? '#ff0000' : 'rgba(220, 38, 38, 0.15)';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      // Skids
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 4;
      skidMarks.forEach((m) => {
        m.opacity -= 0.0012;
        if (m.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = m.opacity;
        ctx.translate(m.x, m.y);
        ctx.rotate(m.angle);
        ctx.strokeRect(-14, -10, 4, 4);
        ctx.strokeRect(-14, 10, 4, 4);
        ctx.restore();
      });

      // Coins
      const time = Date.now() * 0.006;
      coins.forEach(coin => {
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.scale(Math.cos(time), 1);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fbbf24';
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#92400e'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 0);
        ctx.restore();
      });

      // Car
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle + car.driftAngle);
      ctx.fillStyle = selectedSkin.color;
      ctx.shadowBlur = collided ? 40 : 20;
      ctx.shadowColor = selectedSkin.color;
      ctx.fillRect(-20, -14, 40, 28);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-8, -10, 22, 20);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(16, -11, 6, 5); ctx.fillRect(16, 6, 6, 5);
      ctx.fillStyle = '#ff0000'; ctx.fillRect(-20, -11, 4, 5); ctx.fillRect(-20, 6, 4, 5);
      ctx.restore();

      animationFrameId = requestAnimationFrame(update);
    };

    update();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 64;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isShopOpen, isGameOver, selectedSkinId]);

  const buySkin = (skin: Skin) => {
    if (driftPoints >= skin.price && !unlockedSkins.includes(skin.id)) {
      const nextPoints = driftPoints - skin.price;
      setDriftPoints(nextPoints);
      setUnlockedSkins(prev => [...prev, skin.id]);
      setSelectedSkinId(skin.id);
    } else if (unlockedSkins.includes(skin.id)) {
      setSelectedSkinId(skin.id);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-sleek-black">
      {/* HUD Background */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-6 py-3 px-8 bg-sleek-dark/95 backdrop-blur-xl rounded-2xl border border-sleek-border shadow-2xl">
         {/* Rekord Section */}
         <div className="flex flex-col border-r border-slate-700 pr-6 group cursor-default">
           <div className="flex items-center gap-2 mb-1">
             <Trophy className="w-3 h-3 text-yellow-500" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rekord</span>
           </div>
           <span className="text-xl font-black text-yellow-500 italic leading-none">{highScore.toLocaleString()}</span>
         </div>

         {/* Current Balance */}
         <div className="flex flex-col border-r border-slate-700 pr-6">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-1">Balans</span>
           <span className="text-xl font-black text-sleek-red italic leading-none">{driftPoints.toLocaleString()}</span>
         </div>
         
         {/* Health Bar */}
         <div className="flex flex-col min-w-[140px]">
           <div className="flex justify-between items-center mb-1.5">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jon</span>
             <span className="text-[10px] font-black text-white">{health}%</span>
           </div>
           <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-[1px]">
             <motion.div 
               animate={{ 
                 width: `${health}%`, 
                 backgroundColor: health < 30 ? '#ef4444' : (health < 60 ? '#f59e0b' : '#dc2626') 
               }}
               className="h-full rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"
             />
           </div>
         </div>

         {/* Shop Button */}
         <button 
           onClick={() => setIsShopOpen(true)}
           className="flex items-center gap-2 bg-sleek-red text-white py-2 px-6 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-sleek-red/20 ml-2"
         >
           <ShoppingCart className="w-4 h-4" />
           Do'kon
         </button>
      </div>

      {/* Auto-Save Indicator */}
      <AnimatePresence>
        {showSaveIndicator && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full"
          >
            <Save className="w-3 h-3 text-green-500" />
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Auto-Saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className={`w-full h-full ${isShopOpen || isGameOver ? 'blur-md' : 'cursor-none'}`} />

      {/* Game Over Screen */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center bg-sleek-dark p-12 rounded-[2rem] border border-sleek-red/30 shadow-[0_0_50px_rgba(220,38,38,0.2)] max-w-sm w-full"
            >
              <Car className="w-24 h-24 text-sleek-red mx-auto mb-8 opacity-20" />
              <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">TAMOM!</h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] mb-12 text-xs">Poyga yakunlandi</p>
              
              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                   <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Yig'ildi</span>
                   <span className="text-xl font-black text-white">{driftPoints.toLocaleString()}</span>
                </div>
                <div className="bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
                   <span className="block text-[10px] font-bold text-yellow-500/50 uppercase mb-1">Rekord</span>
                   <span className="text-xl font-black text-yellow-500">{highScore.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={resetGame}
                className="btn-sleek w-full py-5 text-xl tracking-[0.2em] italic"
              >
                YANA BOSHLASH
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Overlay */}
      <AnimatePresence>
        {isShopOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="bg-sleek-dark border border-sleek-border w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <div className="p-8 border-b border-sleek-border flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="bg-sleek-red/10 p-3 rounded-2xl border border-sleek-red/20 shadow-inner">
                    <ShoppingCart className="w-8 h-8 text-sleek-red" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Skinlar do'koni</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Hozirgi Balansing: <span className="text-sleek-red">{driftPoints} BALL</span></p>
                  </div>
                </div>
                <button onClick={() => setIsShopOpen(false)} className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="p-10 grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {SKINS.map((skin) => {
                  const isUnlocked = unlockedSkins.includes(skin.id);
                  const isSelected = selectedSkinId === skin.id;
                  const canAfford = driftPoints >= skin.price;
                  return (
                    <button
                      key={skin.id} onClick={() => buySkin(skin)}
                      disabled={!isUnlocked && !canAfford}
                      className={`relative p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-5 group overflow-hidden ${isSelected ? 'bg-sleek-red/10 border-sleek-red' : 'bg-slate-900/40 border-sleek-border hover:border-slate-500'} ${!isUnlocked && !canAfford ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {/* Background Detail */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[40px] opacity-20" style={{ backgroundColor: skin.color }} />
                      
                      <div className="relative">
                        <div className="w-24 h-14 rounded-xl shadow-2xl group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: skin.color, boxShadow: `0 10px 40px ${skin.color}40` }} />
                        {!isUnlocked && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-[1px]">
                             <Lock className="w-6 h-6 text-white" />
                           </div>
                        )}
                        {isSelected && (
                           <div className="absolute -top-3 -right-3 bg-sleek-red text-white p-1 rounded-full border-2 border-sleek-dark shadow-xl">
                             <Check className="w-4 h-4" />
                           </div>
                        )}
                      </div>
                      
                      <div className="text-center w-full">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white mb-2">{skin.name}</h4>
                        <div className={`py-1.5 px-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isUnlocked ? 'bg-white/5 border-white/5 text-slate-400' : (canAfford ? 'bg-sleek-red border-sleek-red text-white shadow-lg shadow-sleek-red/20' : 'bg-slate-800 border-slate-700 text-slate-600')}`}>
                          {isUnlocked ? "Olingan" : `${skin.price.toLocaleString()} BALL`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="p-8 bg-white/[0.01] text-center border-t border-sleek-border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sleek-red animate-pulse" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">Har bir drift sizni yangi skinlarga yaqinlashtiradi</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
