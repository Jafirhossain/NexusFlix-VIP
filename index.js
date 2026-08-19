/**
 * NexusFlix VIP - The Ultimate Proxy Bypass (v10.0)
 * Uses Free CORS Proxies to completely hide Cloudflare Worker IP.
 * 100% Unblockable from YTS, Torrentio, and CSV.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Maha-Jugad: Smart Proxy Fetcher
// Yeh function Cloudflare Worker ke IP ko hide karke data fetch karta hai
async function smartFetch(targetUrl) {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    targetUrl // Fallback to direct if proxies fail
  ];

  for (const url of proxies) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) return data;
      }
    } catch (e) {
      console.error("Fetch failed for:", url);
    }
  }
  return null;
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. MANIFEST
    if (path.endsWith('/manifest.json')) {
      const manifest = {
        id: 'org.stremio.nexusflixvip.v10',
        version: '10.0.0',
        name: 'NexusFlix VIP 🇮🇳',
        description: 'Ultimate Proxy Bypass Scraper. 100% Unblockable Streams.',
        logo: 'https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png',
        types: ['movie', 'series', 'anime', 'other'],
        catalogs: [],
        resources: ['stream'],
        idPrefixes: ['tt', 'kitsu'],
        behaviorHints: { configurable: true, configurationRequired: false }
      };
      return new Response(JSON.stringify(manifest), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. CONFIGURATION UI
    if (path === '/' || path.endsWith('/configure')) {
      const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NexusFlix VIP Setup</title>
          <style>
              body { background-color: #0f1015; color: #fff; font-family: Arial, sans-serif; text-align: center; padding: 40px 20px; margin: 0; }
              .box { max-width: 500px; background: #1a1c23; margin: 0 auto; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #2a2d3e; }
              img { width: 80px; border-radius: 50%; margin-bottom: 15px; border: 2px solid #3b42ff; }
              h1 { font-size: 24px; margin: 0 0 10px 0; }
              p { color: #8b92a5; font-size: 14px; line-height: 1.5; margin-bottom: 25px; }
              .highlight { color: #4ade80; font-weight: bold; }
              .install-btn { display: block; background: linear-gradient(135deg, #6131b4, #3b42ff); color: white; text-decoration: none; padding: 15px; border-radius: 8px; font-size: 18px; font-weight: bold; margin-bottom: 15px; transition: 0.3s; }
              .copy-section { background: #0f1015; padding: 15px; border-radius: 8px; border: 1px solid #2a2d3e; text-align: left; }
              .copy-section label { display: block; font-size: 12px; color: #eab308; margin-bottom: 8px; font-weight: bold; }
              .input-group { display: flex; gap: 10px; }
              input[type="text"] { flex: 1; padding: 10px; background: #1a1c23; border: 1px solid #2a2d3e; color: #fff; border-radius: 5px; outline: none; }
              button { background: #2a2d3e; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="box">
              <img src="https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png" alt="Logo" onerror="this.style.display='none'">
              <h1>NexusFlix VIP V10</h1>
              <p>Powered by <span class="highlight">Smart Proxy Bypass System</span>. 100% Unblockable.</p>
              <a href="#" id="install-btn" class="install-btn">🚀 INSTALL IN STREMIO</a>
              <div class="copy-section">
                  <label>COPY & PASTE LINK (100% WORKING)</label>
                  <div class="input-group">
                      <input type="text" id="manifest-url" readonly>
                      <button onclick="copyUrl()">COPY</button>
                  </div>
              </div>
          </div>
          <script>
              const baseUrl = window.location.origin;
              const manifestUrl = baseUrl + '/manifest.json';
              document.getElementById('install-btn').href = manifestUrl.replace(/^https?:\\/\\//, 'stremio://');
              document.getElementById('manifest-url').value = manifestUrl;
              function copyUrl() {
                  const copyText = document.getElementById('manifest-url');
                  copyText.select();
                  navigator.clipboard.writeText(copyText.value).then(() => alert("✅ Link Copied! Open Stremio, paste in search & install."));
              }
          </script>
      </body>
      </html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // 3. DIRECT NATIVE STREAM SCRAPER
    const streamMatch = path.match(/(?:\/([^\/]+))?\/stream\/(movie|series)\/([^\/]+)\.json/);
    
    if (streamMatch) {
      const type = streamMatch[2]; 
      const fullId = streamMatch[3]; 
      const idParts = fullId.split(':');
      const imdbId = idParts[0]; 
      
      let streams = [];
      const fetchPromises = [];
      const uniqueStreams = new Map();

      const addStream = (streamData) => {
        const key = streamData.infoHash || streamData.url;
        if (key && !uniqueStreams.has(key)) {
          uniqueStreams.set(key, streamData);
        }
      };

      const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      // A. TORRENTIO (Via Proxy Bypass)
      fetchPromises.push(
        smartFetch(`https://torrentio.strem.fun/stream/${type}/${fullId}.json`)
          .then(data => {
            if (data?.streams) {
              data.streams.forEach(s => {
                addStream({
                  name: 'Nexus Pro',
                  title: `⚡ [TO] ${s.title || "Stream"}`,
                  infoHash: s.infoHash ? s.infoHash.toLowerCase() : undefined,
                  url: s.url,
                  behaviorHints: s.behaviorHints
                });
              });
            }
          })
      );

      // B. YTS API (Via Proxy Bypass)
      if (type === 'movie' && imdbId.startsWith('tt')) {
        fetchPromises.push(
          smartFetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`)
            .then(data => {
              if (data?.data?.movie?.torrents) {
                data.data.movie.torrents.forEach(tor => {
                  addStream({
                    name: 'Nexus YTS',
                    title: `🎥 ${tor.quality} | ${tor.size}\n👤 Seeds: ${tor.seeds} | Peers: ${tor.peers}`,
                    infoHash: tor.hash.toLowerCase(),
                    behaviorHints: { bingeworthyGroup: "yts" }
                  });
                });
              }
            })
        );
      }

      // C. EZTV API (Via Proxy Bypass)
      if (type === 'series' && idParts.length === 3 && imdbId.startsWith('tt')) {
        const numericImdbId = imdbId.replace('tt', '');
        const season = parseInt(idParts[1], 10);
        const episode = parseInt(idParts[2], 10);
        
        fetchPromises.push(
          smartFetch(`https://eztvx.to/api/get-torrents?imdb_id=${numericImdbId}&limit=100`)
            .then(data => {
              if (data?.torrents && data.torrents.length > 0) {
                const matchingTorrents = data.torrents.filter(tor => 
                  parseInt(tor.season, 10) === season && parseInt(tor.episode, 10) === episode
                );
                matchingTorrents.forEach(tor => {
                  addStream({
                    name: 'Nexus EZTV',
                    title: `📺 ${tor.title}\n💾 ${formatBytes(tor.size_bytes)} | 👤 Seeds: ${tor.seeds}`,
                    infoHash: tor.hash.toLowerCase(),
                    behaviorHints: { bingeworthyGroup: "eztv" }
                  });
                });
              }
            })
        );
      }

      // D. WEB STREAM (Backup)
      if (type === 'movie') {
        addStream({
          name: 'Nexus Web',
          title: '🌐 Web Stream (External Player)',
          url: `https://vidsrc.me/embed/movie?imdb=${imdbId}`,
          behaviorHints: { notWebReady: true }
        });
      } else if (type === 'series' && idParts.length === 3) {
        addStream({
          name: 'Nexus Web',
          title: `🌐 Web Stream (S${idParts[1]} E${idParts[2]})`,
          url: `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${idParts[1]}&episode=${idParts[2]}`,
          behaviorHints: { notWebReady: true }
        });
      }

      // Wait for all Proxied Scrapers to finish
      await Promise.allSettled(fetchPromises);
      streams = Array.from(uniqueStreams.values());

      return new Response(JSON.stringify({ streams: streams }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};