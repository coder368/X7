import React from 'react';
import { ServerConfig, ServerStats } from '../types';
import { RefreshCw, Users, Shield, Coffee, Smartphone, Copy, Check, Activity, Bell, BellOff } from 'lucide-react';
import { sounds } from '../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';

interface ServerStatusDashboardProps {
  config: ServerConfig;
  stats: ServerStats;
  onRefresh: () => void;
  isLoading: boolean;
  onCopyIp: (ip: string, label: string) => void;
  copiedLabel: string | null;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
}

export const ServerStatusDashboard: React.FC<ServerStatusDashboardProps> = ({
  config,
  stats,
  onRefresh,
  isLoading,
  onCopyIp,
  copiedLabel,
  notificationsEnabled,
  onToggleNotifications,
}) => {
  const fullJavaIp = config.javaPort === 25565 ? config.javaIp : `${config.javaIp}:${config.javaPort}`;
  
  const isJavaCopied = copiedLabel === 'dash-java-ip';

  const playerPercentage = stats.maxPlayers > 0 
    ? Math.min(100, Math.round((stats.playersOnline / stats.maxPlayers) * 100))
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 100, damping: 20 } 
    }
  };

  const StatusIndicatorCompact = ({ isOnline }: { isOnline: boolean | undefined }) => (
    <div className="flex items-center gap-2.5 bg-zinc-900/50 px-3.5 py-1.5 rounded-full border border-zinc-800/50 shadow-inner">
      <span className="relative flex h-2 w-2">
        {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
      </span>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-400' : 'text-zinc-500'}`}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );

  return (
    <section id="dashboard" className="relative max-w-5xl mx-auto px-4 scroll-mt-24">
      <motion.div 
        id="central-dashboard-container"
        className="rounded-[32px] bg-zinc-900/60 backdrop-blur-md sm:backdrop-blur-lg border border-zinc-800/50 p-6 sm:p-8 shadow-2xl space-y-6 sm:space-y-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Top Status Header - Reimagined */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-zinc-800/50">
          <motion.div variants={itemVariants} className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden">
                {stats.isOnline && (
                  <span className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
                )}
                <Activity className={`w-5 h-5 relative z-10 ${stats.isOnline ? 'text-emerald-400' : 'text-zinc-500'}`} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Network Uplink
                  <StatusIndicatorCompact isOnline={stats.isOnline} />
                </h2>
                <p className="text-sm text-zinc-400 font-medium">
                  {stats.motdClean || 'A Minecraft Server'}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Refresh & Actions */}
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="text-right hidden sm:block text-xs text-zinc-500 font-medium mr-1">
              Last updated<br/><span className="text-zinc-300">{stats.lastChecked}</span>
            </div>
            
            {onToggleNotifications && (
              <button
                onClick={onToggleNotifications}
                className={`group inline-flex items-center justify-center w-12 h-12 rounded-2xl border transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow-md ${
                  notificationsEnabled 
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                    : 'bg-zinc-800/50 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-300 border-zinc-700/50'
                }`}
                title={notificationsEnabled ? "Disable Status Notifications" : "Enable Status Notifications"}
              >
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 fill-emerald-500/20" />
                ) : (
                  <BellOff className="w-5 h-5" />
                )}
              </button>
            )}

            <button
              onClick={() => {
                sounds.playClick();
                onRefresh();
              }}
              disabled={isLoading}
              className="group inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800/50 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/50 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md"
              title="Refresh Server Status"
            >
              <RefreshCw className={`w-5 h-5 group-hover:text-white transition-colors ${isLoading ? 'animate-spin text-white' : ''}`} />
            </button>
          </motion.div>
        </div>

        {/* Real Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Player Count Metric */}
          <motion.div variants={itemVariants} className="bg-zinc-950/40 border border-zinc-800/50 rounded-[24px] p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-emerald-400 font-bold text-sm bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                {stats.playersOnline} <span className="text-emerald-400/50">/</span> {stats.maxPlayers}
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-3 tracking-tight">Active Players</div>
              <div className="w-full bg-zinc-800/60 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-out relative" 
                  style={{ width: `${playerPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full" />
                </div>
              </div>
              <div className="mt-3 text-xs text-zinc-500 font-medium tracking-wide uppercase">
                {playerPercentage}% occupied capacity
              </div>
            </div>
          </motion.div>

          {/* Version Metric */}
          <motion.div variants={itemVariants} className="bg-zinc-950/40 border border-zinc-800/50 rounded-[24px] p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Minecraft Version</div>
              <div className="text-3xl font-bold text-white tracking-tight">
                {stats.version || config.mcVersion}
              </div>
              <div className="mt-2 text-sm text-zinc-400 font-medium">
                Vanilla & Paper Compatible
              </div>
            </div>
          </motion.div>
        </div>

        {/* Real Connection Details Bar */}
        <motion.div variants={itemVariants} className="pt-2">
          {/* Java Bar */}
          <button
            onClick={() => {
              sounds.playPop();
              onCopyIp(fullJavaIp, 'dash-java-ip');
            }}
            className="w-full group bg-zinc-950/40 hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700/50 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all cursor-pointer text-left active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-[14px] bg-white/5 border border-white/5 flex items-center justify-center text-white shrink-0 group-hover:bg-white/10 transition-colors shadow-inner">
                <Coffee className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Server Address</div>
                <div className="text-sm font-bold text-white truncate">
                  {fullJavaIp}
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-zinc-800/50 flex items-center justify-center shrink-0 border border-zinc-700/50">
              <AnimatePresence mode="wait">
                {isJavaCopied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
