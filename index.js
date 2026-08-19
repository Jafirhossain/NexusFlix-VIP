/**
 * NexusFlix VIP - Anti-Block Bypass Build (v9.0)
 * Features: Cloudflare Bypass Headers, Multi-Mirror Fallbacks, Smart Status.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Anti-Cloudflare User Agents (Tagada Jugad)
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
];

// Custom Fetch to Bypass Blocks
async function fetchBypass(url) {
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': ua,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
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
        id: 'org.stremio.nexusflixvip.v9',
        version: '9.0.0',
        name: 'NexusFlix VIP 🇮🇳',
        description: 'Anti-Block Bypass Scraper. 100% Working APIs with Mirror Fallbacks.',
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
              <h1>NexusFlix VIP V9</h1>
              <p>Powered by <span class="highlight">Anti-Block Bypass System</span>. 100% Unblockable.</p>
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

      // A. CINEMETA API (For Title & Year)
      let title = '';
      let year = '';
      try {
        const metaData = await fetchBypass(`https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`);
        if (metaData?.meta) {
          title = metaData.meta.name || '';
          year = metaData.meta.year || '';
        }
      } catch (e) {}

      // B. TORRENT-CSV API
      if (title) {
        let query = title;
        if (type === 'series' && idParts.length === 3) {
          const s = idParts[1].padStart(2, '0');
          const e = idParts[2].padStart(2, '0');
          query = `${title} s${s}e${e}`;
        }
        fetchPromises.push(
          fetchBypass(`https://torrents-csv.com/service/search?q=${encodeURIComponent(query)}&size=30`)
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
            })
        );
      }

      // C. YTS API (With Mirror Fallback Jugad)
      if (type === 'movie' && imdbId.startsWith('tt')) {
        const ytsMirrors = [
          `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`,
          `https://yts.rs/api/v2/movie_details.json?imdb_id=${imdbId}`,
          `https://yts.do/api/v2/movie_details.json?imdb_id=${imdbId}`
        ];
        
        fetchPromises.push(
          (async () => {
            for (const url of ytsMirrors) {
              const data = await fetchBypass(url);
              if (data?.data?.movie?.torrents) {
                data.data.movie.torrents.forEach(tor => {
                  addStream({
                    name: 'Nexus YTS',
                    title: `🎥 ${tor.quality} | ${tor.size}\n👤 Seeds: ${tor.seeds} | Peers: ${tor.peers}`,
                    infoHash: tor.hash.toLowerCase(),
                    behaviorHints: { bingeworthyGroup: "yts" }
                  });
                });
                break; // Stop if successful
              }
            }
          })()
        );
      }

      // D. EZTV API (With Mirror Fallback Jugad)
      if (type === 'series' && idParts.length === 3 && imdbId.startsWith('tt')) {
        const numericImdbId = imdbId.replace('tt', '');
        const season = parseInt(idParts[1], 10);
        const episode = parseInt(idParts[2], 10);
        
        const eztvMirrors = [
          `https://eztvx.to/api/get-torrents?imdb_id=${numericImdbId}&limit=100`,
          `https://eztv.re/api/get-torrents?imdb_id=${numericImdbId}&limit=100`
        ];

        fetchPromises.push(
          (async () => {
            for (const url of eztvMirrors) {
              const data = await fetchBypass(url);
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
                break; // Stop if successful
              }
            }
          })()
        );
      }

      // E. WEB STREAM (Backup)
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

      await Promise.allSettled(fetchPromises);
      streams = Array.from(uniqueStreams.values());

      // F. SMART STATUS CHECKER (Nayi movies ke liye message)
      if (streams.length <= 1) {
        const currentYear = new Date().getFullYear();
        const movieYear = parseInt(year) || currentYear;
        
        if (movieYear >= currentYear) {
          streams.unshift({
            name: 'Nexus Info',
            title: `⚠️ No Torrents Found!\nThis movie is from ${movieYear}. It might be too new or not released in HD yet.`,
            url: '#'
          });
        } else {
          streams.unshift({
            name: 'Nexus Info',
            title: `⚠️ No Torrents Found!\nNo seeders available for this title on public trackers.`,
            url: '#'
          });
        }
      }

      return new Response(JSON.stringify({ streams: streams }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};