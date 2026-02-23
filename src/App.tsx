/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Skull, Play, RotateCcw, Shield, Languages } from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { GameStatus, Battery } from './types';

type Lang = 'zh' | 'en';

const TRANSLATIONS = {
  en: {
    title: "Nova Defense",
    start: "Start Game",
    win: "Mission Accomplished!",
    lose: "Defense Failed",
    score: "Score",
    target: "Target",
    restart: "Play Again",
    home: "Back to Home",
    instructions: "Click anywhere to launch interceptors. Protect your cities and batteries.",
    batteries: "Batteries",
    missiles: "Missiles",
    lang: "中文"
  },
  zh: {
    title: "新星防御",
    start: "开始游戏",
    win: "任务完成！",
    lose: "防御失败",
    score: "得分",
    target: "目标",
    restart: "再玩一次",
    home: "回到主界面",
    instructions: "点击屏幕发射拦截导弹。保护你的城市和炮台。",
    batteries: "导弹炮台",
    missiles: "剩余导弹",
    lang: "English"
  }
};

export default function App() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [score, setScore] = useState(0);
  const [lang, setLang] = useState<Lang>('zh');
  const [batteryStats, setBatteryStats] = useState<number[]>([20, 40, 20]);

  const t = TRANSLATIONS[lang];

  const handleScoreUpdate = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  const handleGameEnd = useCallback((won: boolean) => {
    setStatus(won ? 'WON' : 'LOST');
  }, []);

  const handleMissileUpdate = useCallback((idx: number, count: number) => {
    setBatteryStats(prev => {
      const next = [...prev];
      next[idx] = count;
      return next;
    });
  }, []);

  const startGame = () => {
    setScore(0);
    setBatteryStats([20, 40, 20]);
    setStatus('PLAYING');
  };

  const goHome = () => {
    setScore(0);
    setBatteryStats([20, 40, 20]);
    setStatus('START');
  };

  const toggleLang = () => setLang(prev => prev === 'zh' ? 'en' : 'zh');

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden font-sans select-none">
      {/* Header UI */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tighter text-white/90 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            {t.title}
          </h1>
          <div className="flex gap-4 font-mono text-sm">
            <div className="flex flex-col">
              <span className="text-white/40 uppercase text-[10px] tracking-widest">{t.score}</span>
              <span className="text-xl text-emerald-400">{score.toString().padStart(4, '0')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/40 uppercase text-[10px] tracking-widest">{t.target}</span>
              <span className="text-xl text-white/60">1000</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={toggleLang}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 text-xs"
          >
            <Languages className="w-4 h-4" />
            {t.lang}
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative">
        <GameCanvas 
          status={status}
          onScoreUpdate={handleScoreUpdate}
          onGameEnd={handleGameEnd}
          onMissileUpdate={handleMissileUpdate}
        />

        {/* Overlays */}
        <AnimatePresence>
          {status !== 'PLAYING' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
              >
                {status === 'START' && (
                  <>
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{t.title}</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                      {t.instructions}
                    </p>
                    <button 
                      onClick={startGame}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group"
                    >
                      <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      {t.start}
                    </button>
                  </>
                )}

                {status === 'WON' && (
                  <>
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trophy className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-emerald-400">{t.win}</h2>
                    <p className="text-slate-400 mb-8">
                      {t.score}: <span className="text-white font-mono">{score}</span>
                    </p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={startGame}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        {t.restart}
                      </button>
                      <button 
                        onClick={goHome}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white/80 rounded-2xl font-medium transition-all"
                      >
                        {t.home}
                      </button>
                    </div>
                  </>
                )}

                {status === 'LOST' && (
                  <>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Skull className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-red-400">{t.lose}</h2>
                    <p className="text-slate-400 mb-8">
                      {t.score}: <span className="text-white font-mono">{score}</span>
                    </p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={startGame}
                        className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        {t.restart}
                      </button>
                      <button 
                        onClick={goHome}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white/80 rounded-2xl font-medium transition-all"
                      >
                        {t.home}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-slate-950 border-t border-white/5 flex justify-center gap-8 z-20">
        {batteryStats.map((count, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-widest text-white/30">
              {i === 1 ? 'CENTER' : i === 0 ? 'LEFT' : 'RIGHT'}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: Math.min(count, 10) }).map((_, j) => (
                <div key={j} className="w-1 h-3 bg-blue-500 rounded-full" />
              ))}
              {count > 10 && <span className="text-[10px] text-blue-400 ml-1">+{count - 10}</span>}
              {count === 0 && <span className="text-[10px] text-red-500 uppercase font-bold">EMPTY</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
