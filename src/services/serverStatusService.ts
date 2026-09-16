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

    let bedrockAddress = config.bedrockIp ? config.bedrockIp.trim() : javaAddress.split(':')[0];
    if (!bedrockAddress.includes(':') && config.bedrockPort && config.bedrockPort !== 19132) {
      bedrockAddress = `${bedrockAddress}:${config.bedrockPort}`;
    }

    let javaData: any = null;
    let bedrockData: any = null;

    try {
      const [javaRes, bedrockRes] = await Promise.allSettled([
        fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(javaAddress)}`),
        fetch(`https://api.mcstatus.io/v2/status/bedrock/${encodeURIComponent(bedrockAddress)}`)
      ]);

      if (javaRes.status === 'fulfilled' && javaRes.value.ok) {
        javaData = await javaRes.value.json();
      }
      if (bedrockRes.status === 'fulfilled' && bedrockRes.value.ok) {
        bedrockData = await bedrockRes.value.json();
      }
    } catch (err) {
      console.warn('Primary mcstatus.io checks failed, attempting fallback...', err);
    }

    // Fallback logic
    if (!javaData && !bedrockData) {
      try {
        const [javaFbRes, bedrockFbRes] = await Promise.allSettled([
          fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(javaAddress)}`),
          fetch(`https://api.mcsrvstat.us/3/bedrock/${encodeURIComponent(bedrockAddress)}`)
        ]);

        if (javaFbRes.status === 'fulfilled' && javaFbRes.value.ok) {
          javaData = await javaFbRes.value.json();
        }
        if (bedrockFbRes.status === 'fulfilled' && bedrockFbRes.value.ok) {
          bedrockData = await bedrockFbRes.value.json();
        }
      } catch (fbErr) {
        console.error('All live status checks failed:', fbErr);
      }
    }

    const javaOnline = Boolean(javaData?.online);
    const bedrockOnline = Boolean(bedrockData?.online);
    const isOnline = javaOnline || bedrockOnline;

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
        bedrockOnline: false,
        motdClean: 'Server unreachable or offline',
        playersOnline: 0,
        maxPlayers: 20,
        playersList: [],
        version: config.mcVersion,
        pingMs: 0,
        lastChecked: now,
      };
    }

    // Use Java as primary data source if available, otherwise Bedrock
    const primaryData = javaOnline ? javaData : bedrockData;

    let motdClean = 'A Minecraft Server';
    if (primaryData?.motd?.clean) {
      motdClean = Array.isArray(primaryData.motd.clean) 
        ? primaryData.motd.clean.join(' ').trim() 
        : primaryData.motd.clean;
    }
    
    if (typeof motdClean !== 'string') {
      motdClean = String(motdClean);
    }

    // Geyser/Java servers report the same total population on both ports. 
    // Summing them causes double-counting. We take the max to get the true total count.
    const playersOnline = Math.max(
      javaData?.players?.online ?? 0,
      bedrockData?.players?.online ?? 0
    );
    const maxPlayers = javaData?.players?.max ?? bedrockData?.players?.max ?? 20;
    
    // Get version from whoever is online safely (avoiding objects that crash React)
    let version = config.mcVersion;
    
    const extractVersion = (data: any) => {
      if (!data || !data.version) return null;
      if (typeof data.version === 'string') return data.version;
      return data.version.name_clean || data.version.name_raw || data.version.name || null;
    };

    if (javaOnline) {
      version = extractVersion(javaData) || config.mcVersion;
    } else if (bedrockOnline) {
      version = extractVersion(bedrockData) || config.mcVersion;
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
      bedrockOnline,
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
