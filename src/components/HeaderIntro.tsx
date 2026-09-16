import React from 'react';
import { ServerConfig, ServerStats } from '../types';
import { Copy, Check } from 'lucide-react';
import { sounds } from '../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderIntroProps {
  config: ServerConfig;
  stats: ServerStats;
  onCopyIp: (ip: string, label: string) => void;
  copiedLabel: string | null;
}

export const HeaderIntro: React.FC<HeaderIntroProps> = ({
  config,
  stats,
  onCopyIp,
  copiedLabel,
}) => {
  const fullJavaIp = config.javaPort === 25565 ? config.javaIp : `${config.javaIp}:${config.javaPort}`;
  
  const isJavaCopied = copiedLabel === 'hero-java-ip';

  const handleCopy = (text: string, label: string) => {
    sounds.playPop();
    onCopyIp(text, label);
  };

  const getStatusText = () => {
    if (stats.javaOnline) return 'Network Online';
    return 'Network Offline';
  };

  const isOnline = stats.isOnline;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 80, damping: 20, mass: 1 } 
    }
  };

  return (
    <section id="home" className="relative pt-32 pb-16 px-4 text-center scroll-mt-24 min-h-[50vh] flex flex-col items-center justify-center">
      <motion.div 
        className="relative z-10 w-full max-w-5xl mx-auto space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Apple-style minimalist pill */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-emerald-400' : 'bg-red-500'}`} />
            </span>
            
            <span className={`text-[13px] font-semibold tracking-wide ${isOnline ? 'text-emerald-400' : 'text-red-500'}`}>
              {getStatusText()}
            </span>
            
            {isOnline && (
              <>
                <div className="w-px h-3.5 bg-white/20 mx-1" />
                <span className="text-zinc-300 text-[13px] font-medium tracking-wide">
                  <span className="text-white font-bold">{stats.playersOnline}</span> <span className="opacity-70">of</span> {stats.maxPlayers}
                </span>
                <div className="w-px h-3.5 bg-white/20 mx-1" />
                <span className="text-zinc-400 text-[13px] font-mono tracking-tight">v{stats.version || config.mcVersion}</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Hero Headline - Apple Style (Massive, bold, gradient/clean) */}
        <motion.div variants={itemVariants} className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-[-0.04em] text-white leading-[1.05]">
            {config.serverName}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 font-medium tracking-tight max-w-2xl mx-auto leading-relaxed">
            {config.serverTagline || "Vanilla Minecraft survival network. Experience true pure gameplay."}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6">
          <button
            onClick={() => handleCopy(fullJavaIp, 'hero-java-ip')}
            className="group relative w-full sm:w-[320px] h-16 rounded-3xl bg-white text-zinc-950 font-semibold text-lg flex items-center justify-between px-6 transition-transform duration-300 active:scale-95 shadow-[0_8px_30px_rgb(255,255,255,0.12)] hover:shadow-[0_8px_40px_rgb(255,255,255,0.2)]"
          >
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Server Address</span>
              <span className="tracking-tight text-zinc-900">{fullJavaIp}</span>
            </div>
            <AnimatePresence mode="wait">
              {isJavaCopied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Copy className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
