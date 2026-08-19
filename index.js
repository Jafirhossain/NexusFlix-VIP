/**
 * NexusFlix VIP - Ultimate Dual Scraper Build (v4.0)
 * Integrated YTS P2P + Torrentio Proxy + Web Extractors
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. MANIFEST (Stremio format)
    if (path.endsWith('/manifest.json')) {
      const manifest = {
        id: 'org.stremio.nexusflixvip.v4',
        version: '4.0.0',
        name: 'NexusFlix VIP 🇮🇳',
        description: 'Advanced P2P Scraper & Web Extractor. 100% Working.',
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

    // 2. CONFIGURATION UI (100% Install Fix with Copy Button)
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
              
              .install-btn { display: block; background: linear-gradient(135deg, #6131b4, #3b42ff); color: white; text-decoration: none; padding: 15px; border-radius: 8px; font-size: 18px; font-weight: bold; margin-bottom: 15px; transition: 0.3s; }
              .install-btn:hover { opacity: 0.9; }
              
              .copy-section { background: #0f1015; padding: 15px; border-radius: 8px; border: 1px solid #2a2d3e; text-align: left; }
              .copy-section label { display: block; font-size: 12px; color: #4ade80; margin-bottom: 8px; font-weight: bold; }
              .input-group { display: flex; gap: 10px; }
              input[type="text"] { flex: 1; padding: 10px; background: #1a1c23; border: 1px solid #2a2d3e; color: #fff; border-radius: 5px; font-size: 14px; outline: none; }
              button { background: #2a2d3e; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }
              button:hover { background: #3b42ff; }
          </style>
      </head>
      <body>
          <div class="box">
              <img src="https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png" alt="Logo" onerror="this.style.display='none'">
              <h1>NexusFlix VIP V4</h1>
              <p>Dual Scraper Active (P2P + Web). Click the button below to install, or use Copy Link.</p>
              
              <a href="#" id="install-btn" class="install-btn">🚀 INSTALL IN STREMIO</a>
              
              <div class="copy-section">
                  <label>METHOD 2: COPY & PASTE (100% WORKING)</label>
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
                  copyText.setSelectionRange(0, 99999);
                  navigator.clipboard.writeText(copyText.value).then(() => {
                      alert("✅ Link Copied! Open Stremio, paste in search bar and hit enter.");
                  });
              }
          </script>
      </body>
      </html>`;

      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // 3. STREMIO STREAM SCRAPER ROUTE
    const streamMatch = path.match(/(?:\/([^\/]+))?\/stream\/(movie|series|anime)\/([^\/]+)\.json/);
    
    if (streamMatch) {
      const type = streamMatch[2]; 
      const id = streamMatch[3]; // Example: tt1234567
      const imdbId = id.split(':')[0]; // Handles series format tt1234567:1:2
      
      let streams = [];

      // --- A: YTS P2P SCRAPER (From your new code) ---
      if (type === 'movie' && imdbId.startsWith('tt')) {
        try {
          const ytsUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${imdbId}`;
          const ytsRes = await fetch(ytsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (ytsRes.ok) {
            const data = await ytsRes.json();
            if (data.data && data.data.movies) {
              for (const movie of data.data.movies) {
                if (movie.torrents) {
                  for (const tor of movie.torrents) {
                    streams.push({
                      name: 'Nexus P2P (YTS)',
                      title: `🎥 ${tor.quality} | ${tor.size}\n👤 S: ${tor.seeds} P: ${tor.peers}`,
                      infoHash: tor.hash,
                      behaviorHints: { bingeworthyGroup: "yts" }
                    });
                  }
                }
              }
            }
          }
        } catch (err) { console.error("YTS Scrape Error", err); }
      }

      // --- B: WEB SCRAPER EXTRACTOR (Direct links example using VidSrc) ---
      if (type === 'movie') {
        try {
          const vidsrcUrl = `https://vidsrc.me/embed/movie?imdb=${imdbId}`;
          streams.push({
            name: 'Nexus Web',
            title: `🌐 Web Stream (External Player)`,
            url: vidsrcUrl, // We provide external URL. If user clicks, it opens web player
            behaviorHints: { notWebReady: true }
          });
        } catch(e) {}
      }

      // --- C: TORRENTIO PROXY FALLBACK (For Series and extra Movie links) ---
      try {
        const torrentioUrl = `https://torrentio.strem.fun/stream/${type}/${id}.json`;
        const res = await fetch(torrentioUrl, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.streams) {
                data.streams.forEach(s => {
                    streams.push({
                        name: 'Nexus Pro',
                        title: `⚡ ${s.title || "Stream"}`,
                        infoHash: s.infoHash,
                        url: s.url,
                        behaviorHints: s.behaviorHints
                    });
                });
            }
        }
      } catch (err) { console.error("Torrentio Error", err); }

      // Return combined streams to Stremio
      return new Response(JSON.stringify({ streams: streams }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};