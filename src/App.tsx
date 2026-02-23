/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Skull, Play, Pause, RotateCcw, Shield, Languages, LogOut } from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { GameStatus, Battery } from './types';

type Lang = 'zh' | 'en';

const TRANSLATIONS = {
  en: {
    title: "Missile Defense",
    start: "Start Game",
    win: "Mission Accomplished!",
    lose: "Defense Failed",
    score: "Score",
    target: "Target",
    restart: "Play Again",
    nextLevel: "Next Level",
    home: "Back to Home",
    level: "Level",
    selectLevel: "Select Level",
    instructions: "Click anywhere to launch interceptors. Protect your cities and batteries.",
    batteries: "Batteries",
    remainingRockets: "Rockets Left",
    pause: "Pause",
    resume: "Resume",
    exit: "Exit to Menu",
    lang: "中文"
  },
  zh: {
    title: "导弹防御",
    start: "开始游戏",
    win: "任务完成！",
    lose: "防御失败",
    score: "得分",
    target: "目标",
    restart: "再玩一次",
    nextLevel: "下一关",
    home: "回到主界面",
    level: "关卡",
    selectLevel: "选择关卡",
    instructions: "点击屏幕发射拦截导弹。保护你的城市和炮台。",
    batteries: "导弹炮台",
    remainingRockets: "剩余火箭",
    pause: "暂停",
    resume: "继续",
    exit: "退出游戏",
    lang: "English"
  }
};

export default function App() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [score, setScore] = useState(0);
  const [lang, setLang] = useState<Lang>('zh');
  const [level, setLevel] = useState(1);
  const [batteryStats, setBatteryStats] = useState<number[]>([20, 40, 20]);
  const [remainingRockets, setRemainingRockets] = useState(50);

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

  const handleRocketsUpdate = useCallback((count: number) => {
    setRemainingRockets(count);
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

  const togglePause = () => {
    if (status === 'PLAYING') setStatus('PAUSED');
    else if (status === 'PAUSED') setStatus('PLAYING');
  };

  const nextLevel = () => {
    if (level < 5) {
      const nextLvl = level + 1;
      setLevel(nextLvl);
      setScore(0);
      setBatteryStats([20, 40, 20]);
      setStatus('PLAYING');
    }
  };

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
            <div className="flex flex-col">
              <span className="text-white/40 uppercase text-[10px] tracking-widest">{t.level}</span>
              <span className="text-xl text-blue-400">{level}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/40 uppercase text-[10px] tracking-widest">{t.remainingRockets}</span>
              <span className="text-xl text-red-400">{remainingRockets}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          {(status === 'PLAYING' || status === 'PAUSED') && (
            <button 
              onClick={togglePause}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 text-xs"
            >
              {status === 'PAUSED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {status === 'PAUSED' ? t.resume : t.pause}
            </button>
          )}
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
          level={level}
          onScoreUpdate={handleScoreUpdate}
          onGameEnd={handleGameEnd}
          onMissileUpdate={handleMissileUpdate}
          onRocketsUpdate={handleRocketsUpdate}
        />

        {/* Overlays */}
        <AnimatePresence>
          {status === 'PAUSED' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="text-center">
                <h2 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase italic">
                  {t.pause}
                </h2>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={togglePause}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 mx-auto w-64"
                  >
                    <Play className="w-6 h-6" />
                    {t.resume}
                  </button>
                  <button 
                    onClick={goHome}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 mx-auto w-64 border border-white/10"
                  >
                    <LogOut className="w-6 h-6" />
                    {t.exit}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {status !== 'PLAYING' && status !== 'PAUSED' && (
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

                    <div className="mb-8">
                      <p className="text-xs uppercase tracking-widest text-white/40 mb-3">{t.selectLevel}</p>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(l => (
                          <button
                            key={l}
                            onClick={() => setLevel(l)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all ${
                              level === l 
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

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
                      {level < 5 && (
                        <button 
                          onClick={nextLevel}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          {t.nextLevel}
                        </button>
                      )}
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
