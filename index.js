/**
 * NexusFlix VIP - Ultimate Native Scraper (v8.0)
 * Direct Integrations: Torrent-CSV + YTS + EZTV + VidSrc (100% Unblockable)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
        id: 'org.stremio.nexusflixvip.v8',
        version: '8.0.0',
        name: 'NexusFlix VIP 🇮🇳',
        description: 'Standalone Direct Scraper (Torrent-CSV + YTS + EZTV). No Proxy Dependencies. 100% Working.',
        logo: 'https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png',
        types: ['movie', 'series', 'anime', 'other'],
        catalogs: [],
        resources: ['stream'],
        idPrefixes: ['tt', 'kitsu'],
        behaviorHints: { configurable: true, configurationRequired: false }
      };

      return new Response(JSON.stringify(manifest), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
              <h1>NexusFlix VIP V8</h1>
              <p>Powered by <span class="highlight">Torrent-CSV API</span>, YTS, and EZTV Direct.</p>
              
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
      const fullId = streamMatch[3]; // e.g., tt1234567 or tt1234567:1:2
      const idParts = fullId.split(':');
      const imdbId = idParts[0]; 
      
      let streams = [];
      const fetchPromises = [];
      const uniqueStreams = new Map();

      // Duplicate filter
      const addStream = (streamData) => {
        const key = streamData.infoHash || streamData.url;
        if (key && !uniqueStreams.has(key)) {
          uniqueStreams.set(key, streamData);
        }
      };

      // Byte Formatter
      const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      // ----------------------------------------------------
      // A. CINEMETA API: Get Title for Torrent-CSV
      // ----------------------------------------------------
      let title = '';
      try {
        const metaRes = await fetch(`https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`);
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          title = metaData?.meta?.name || '';
        }
      } catch (e) {}

      // ----------------------------------------------------
      // B. TORRENT-CSV API (Movies & Series Both)
      // ----------------------------------------------------
      if (title) {
        let query = title;
        if (type === 'series' && idParts.length === 3) {
          const s = idParts[1].padStart(2, '0');
          const e = idParts[2].padStart(2, '0');
          query = `${title} s${s}e${e}`;
        }
        
        const csvUrl = `https://torrents-csv.com/service/search?q=${encodeURIComponent(query)}&size=30`;
        fetchPromises.push(
          fetch(csvUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
            .then(res => res.json())
            .then(data => {
              if (data && Array.isArray(data)) {
                data.forEach(tor => {
                  addStream({
                    name: 'Nexus CSV',
                    title: `⚡ ${tor.name}\n💾 ${formatBytes(tor.size_bytes)} | 👤 Seeds: ${tor.seeders}`,
                    infoHash: tor.infohash.toLowerCase(),
                    behaviorHints: { bingeworthyGroup: "csv" }
                  });
                });
              }
            }).catch(e => console.error("CSV Fetch Error:", e.message))
        );
      }

      // ----------------------------------------------------
      // C. MOVIE SCRAPER: DIRECT YTS API
      // ----------------------------------------------------
      if (type === 'movie' && imdbId.startsWith('tt')) {
        const ytsUrl = `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`;
        fetchPromises.push(
          fetch(ytsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
            .then(res => res.json())
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
            }).catch(e => console.error("YTS Fetch Error:", e.message))
        );
      }

      // ----------------------------------------------------
      // D. SERIES SCRAPER: DIRECT EZTV API
      // ----------------------------------------------------
      if (type === 'series' && idParts.length === 3 && imdbId.startsWith('tt')) {
        const numericImdbId = imdbId.replace('tt', '');
        const season = parseInt(idParts[1], 10);
        const episode = parseInt(idParts[2], 10);
        
        const eztvUrl = `https://eztvx.to/api/get-torrents?imdb_id=${numericImdbId}&limit=100`;
        fetchPromises.push(
          fetch(eztvUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
            .then(res => res.json())
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
            }).catch(e => console.error("EZTV Fetch Error:", e.message))
        );
      }

      // ----------------------------------------------------
      // E. WEB STREAM (Backup Direct Play)
      // ----------------------------------------------------
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

      // Wait for all Scrapers to finish concurrently
      await Promise.allSettled(fetchPromises);

      // Convert Map back to array
      streams = Array.from(uniqueStreams.values());

      return new Response(JSON.stringify({ streams: streams }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};