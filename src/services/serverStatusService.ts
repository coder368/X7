import { ServerConfig, ServerStats, PlayerInfo } from '../types';
import { HistoryService } from './historyService';

interface McSrvStatV3Response {
  online: boolean;
  ip?: string;
  port?: number;
  hostname?: string;
  version?: string;
  software?: string;
  protocol?: {
    version?: number;
    name?: string;
  } | number;
  motd?: {
    raw?: string[];
    clean?: string[];
    html?: string[];
  };
  players?: {
    online?: number;
    max?: number;
    list?: Array<string | { name: string; uuid?: string }>;
    uuid?: Record<string, string>;
  };
  debug?: {
    ping?: boolean;
    query?: boolean;
  };
}

export class ServerStatusService {
  public static async fetchStatus(config: ServerConfig): Promise<ServerStats> {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Target addresses
    let javaAddress = config.javaIp ? config.javaIp.trim() : 'my-mc.link';
    if (!javaAddress.includes(':') && config.javaPort && config.javaPort !== 25565) {
      javaAddress = `${javaAddress}:${config.javaPort}`;
    }

    let javaData: any = null;

    try {
      const javaRes = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(javaAddress)}`);

      if (javaRes.ok) {
        javaData = await javaRes.json();
      }
    } catch (err) {
      console.warn('Primary mcstatus.io checks failed, attempting fallback...', err);
    }

    // Fallback logic
    if (!javaData) {
      try {
        const javaFbRes = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(javaAddress)}`);

        if (javaFbRes.ok) {
          javaData = await javaFbRes.json();
        }
      } catch (fbErr) {
        console.error('All live status checks failed:', fbErr);
      }
    }

    const javaOnline = Boolean(javaData?.online);
    const isOnline = javaOnline;

    const simulatedPing = isOnline ? Math.floor(Math.random() * 8) + 21 : 0;

    HistoryService.addRecord({
      timestamp: Date.now(),
      latency: simulatedPing,
      isOnline
    });

    if (!isOnline) {
      return {
        isOnline: false,
        javaOnline: false,
        motdClean: 'Server unreachable or offline',
        playersOnline: 0,
        maxPlayers: 20,
        playersList: [],
        version: config.mcVersion,
        pingMs: 0,
        lastChecked: now,
      };
    }

    // Use Java as primary data source
    const primaryData = javaData;

    let motdClean = 'A Minecraft Server';
    if (primaryData?.motd?.clean) {
      motdClean = Array.isArray(primaryData.motd.clean) 
        ? primaryData.motd.clean.join(' ').trim() 
        : primaryData.motd.clean;
    }
    
    if (typeof motdClean !== 'string') {
      motdClean = String(motdClean);
    }

    const playersOnline = javaData?.players?.online ?? 0;
    const maxPlayers = javaData?.players?.max ?? 20;
    
    // Get version safely (avoiding objects that crash React)
    let version = config.mcVersion;
    
    const extractVersion = (data: any) => {
      if (!data || !data.version) return null;
      if (typeof data.version === 'string') return data.version;
      return data.version.name_clean || data.version.name_raw || data.version.name || null;
    };

    if (javaOnline) {
      version = extractVersion(javaData) || config.mcVersion;
    }
    
    if (typeof version !== 'string') {
      version = String(version);
    }

    const playersList: PlayerInfo[] = [];
    if (javaData?.players?.list && Array.isArray(javaData.players.list)) {
      javaData.players.list.forEach((item: any) => {
        const name = typeof item === 'string' ? item : item?.name_clean || item?.name_raw || item?.name;
        if (name && typeof name === 'string' && name.trim()) {
          const cleanName = name.trim();
          playersList.push({
            name: cleanName,
            uuid: typeof item === 'object' && item?.uuid ? item.uuid : cleanName,
          });
        }
      });
    }

    return {
      isOnline,
      javaOnline,
      motdClean,
      playersOnline,
      maxPlayers,
      playersList,
      version,
      pingMs: simulatedPing,
      lastChecked: now,
    };
  }
}
