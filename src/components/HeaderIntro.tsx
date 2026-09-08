import React from 'react';
import { ServerConfig, ServerStats } from '../types';
import { Copy, Check, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

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
  const fullBedrockIp = `${config.bedrockIp}:${config.bedrockPort}`;

  const isJavaCopied = copiedLabel === 'hero-java-ip';
  const isBedrockCopied = copiedLabel === 'hero-bedrock-ip';

  const handleCopy = (text: string, label: string) => {
    sounds.playPop();
    onCopyIp(text, label);
  };

  return (
    <section id="home" className="relative pt-24 sm:pt-28 pb-4 px-4 text-center scroll-mt-24">
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Live Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-md">
          <span className="relative flex h-2.5 w-2.5">
            {stats.isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                stats.isOnline ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="text-zinc-400">SERVER STATUS:</span>
          <span className={`font-bold ${stats.isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">v{stats.version || config.mcVersion}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-semibold">{stats.playersOnline} Players</span>
        </div>

        {/* Clean Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-sans">
            {config.serverName}
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
            Crossplay Minecraft survival network supporting both Java and Bedrock clients. Click below to copy the connection addresses.
          </p>
        </div>

        {/* 3. DIRECT IP COPY BUTTONS (Prominent, High-Contrast, Side-by-side on desktop, Stack on mobile) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 max-w-2xl mx-auto pt-2 w-full">
          {/* Java Button: "Java: my-mc.link:40891" */}
          <button
            id="hero-copy-java-btn"
            type="button"
            onClick={() => handleCopy(fullJavaIp, 'hero-java-ip')}
            aria-label={`Copy Java IP: ${fullJavaIp}`}
            className="w-full sm:w-auto flex-1 min-w-[280px] py-3.5 px-6 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-zinc-950 font-mono font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-colors shadow-lg cursor-pointer"
          >
            {isJavaCopied ? (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span className="tracking-tight">Copied!</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <span className="tracking-tight">Java: {fullJavaIp}</span>
                <Copy className="w-4 h-4 stroke-[2.5] opacity-75 shrink-0" />
              </div>
            )}
          </button>

          {/* Bedrock Button: "Bedrock: my-mc.link:34481" */}
          <button
            id="hero-copy-bedrock-btn"
            type="button"
            onClick={() => handleCopy(fullBedrockIp, 'hero-bedrock-ip')}
            aria-label={`Copy Bedrock IP: ${fullBedrockIp}`}
            className="w-full sm:w-auto flex-1 min-w-[280px] py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-zinc-100 border border-zinc-800 hover:border-zinc-700 font-mono font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-colors shadow-md cursor-pointer"
          >
            {isBedrockCopied ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span className="tracking-tight">Copied!</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <span className="tracking-tight text-zinc-200">Bedrock: {fullBedrockIp}</span>
                <Copy className="w-4 h-4 text-zinc-400 stroke-[2.5] shrink-0" />
              </div>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
