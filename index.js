/**
 * NexusFlix VIP 🇮🇳 - The REAL Content Scraper (v18.0)
 * NO FAKE DEMOS. Uses The Pirate Bay (TPB) + YTS + EZTV Direct APIs.
 * 100% Unblockable on Cloudflare Workers.
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

    // ==========================================
    // 1. CONFIGURATION UI
    // ==========================================
    if (path === '/' || path === '/configure') {
      const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NexusFlix VIP Configuration</title>
          <style>
              body { background-color: #14151a; color: #a3a7b8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; background: #1a1c23; padding: 30px; border-radius: 12px; border: 1px solid #2a2d3e; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              .header { text-align: center; margin-bottom: 20px; }
              .header img { width: 70px; border-radius: 50%; border: 2px solid #eab308; margin-bottom: 10px; }
              h1 { color: #fff; font-size: 24px; margin: 0; }
              .desc { font-size: 13px; line-height: 1.6; text-align: center; margin-top: 10px; margin-bottom: 30px; color: #8b92a5; }
              .highlight { color: #eab308; font-weight: bold; }
              .install-btn { display: block; width: 100%; background: linear-gradient(135deg, #eab308, #ca8a04); color: white; padding: 15px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 30px; text-align: center; text-decoration: none; transition: 0.3s; }
              .copy-btn { display: block; width: 100%; background: transparent; color: #eab308; padding: 10px; border: none; font-size: 14px; cursor: pointer; margin-top: 10px; text-align: center; font-weight: bold; }
              .input-group { display: flex; gap: 10px; margin-top: 20px; }
              input[type="text"] { flex: 1; padding: 10px; background: #14151a; border: 1px solid #2a2d3e; color: #fff; border-radius: 5px; outline: none; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png" alt="Logo" onerror="this.style.display='none'">
                  <h1>NexusFlix VIP 🇮🇳</h1>
              </div>
              <div class="desc">
                  <span class="highlight">NO FAKE DEMOS.</span> Fetches 100% Real Movies & Series directly from The Pirate Bay, YTS, and EZTV.
              </div>
              <a href="#" id="install-btn" class="install-btn">🚀 INSTALL ADD-ON</a>
              <div class="input-group">
                  <input type="text" id="manifest-url" readonly>
                  <button class="copy-btn" onclick="copyLink()" style="width: auto; margin: 0;">COPY</button>
              </div>
          </div>
          <script>
              const baseUrl = window.location.origin;
              const manifestUrl = baseUrl + '/manifest.json';
              document.getElementById('install-btn').href = manifestUrl.replace(/^https?:\\/\\//, 'stremio://');
              document.getElementById('manifest-url').value = manifestUrl;
              function copyLink() {
                  const copyText = document.getElementById('manifest-url');
                  copyText.select();
                  navigator.clipboard.writeText(copyText.value).then(() => alert("✅ Link Copied! Paste in Stremio search bar."));
              }
          </script>
      </body>
      </html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // ==========================================
    // 2. MANIFEST ROUTER
    // ==========================================
    if (path.endsWith('/manifest.json')) {
      const manifest = {
        id: 'org.stremio.nexusflixvip.v18',
        version: '18.0.0',
        name: 'NexusFlix VIP 🇮🇳',
        description: 'Real Torrents Only (TPB + YTS + EZTV). No Fake Demos.',
        logo: 'https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png',
        types: ['movie', 'series'],
        catalogs: [],
        resources: ['stream'],
        idPrefixes: ['tt'],
        behaviorHints: { configurable: true, configurationRequired: false }
      };
      return new Response(JSON.stringify(manifest), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ==========================================
    // 3. STREAM SCRAPER (REAL TORRENTS ONLY)
    // ==========================================
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
        const key = streamData.infoHash;
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

      // STEP 1: Get Real Movie Name from Stremio's Cinemeta API
      let title = '';
      let year = '';
      try {
        const metaRes = await fetch(`https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`);
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          title = metaData?.meta?.name || '';
          year = metaData?.meta?.year || '';
        }
      } catch (e) {}

      // ---------------------------------------------------------
      // PART A: THE PIRATE BAY (TPB) - Has CAMs and New Releases
      // ---------------------------------------------------------
      if (title) {
        let query = title;
        if (type === 'series' && idParts.length === 3) {
          const s = idParts[1].padStart(2, '0');
          const e = idParts[2].padStart(2, '0');
          query = `${title} s${s}e${e}`;
        } else if (year) {
          query = `${title} ${year}`;
        }
        
        fetchPromises.push(
          fetch(`https://apibay.org/q.php?q=${encodeURIComponent(query)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
            .then(res => res.json())
            .then(data => {
              if (data && Array.isArray(data) && data[0].info_hash !== '0000000000000000000000000000000000000000') {
                data.slice(0, 15).forEach(tor => { // Get top 15 results
                  addStream({
                    name: 'Nexus TPB 🏴‍☠️',
                    title: `${tor.name}\n💾 ${formatBytes(tor.size)} | 👤 Seeds: ${tor.seeders}`,
                    infoHash: tor.info_hash.toLowerCase()
                  });
                });
              }
            }).catch(e => console.error("TPB Error"))
        );
      }

      // ---------------------------------------------------------
      // PART B: YTS API (For HD Movies)
      // ---------------------------------------------------------
      if (type === 'movie' && imdbId.startsWith('tt')) {
        fetchPromises.push(
          fetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
            .then(res => res.json())
            .then(data => {
              if (data?.data?.movie?.torrents) {
                data.data.movie.torrents.forEach(tor => {
                  addStream({
                    name: 'Nexus YTS 🎥',
                    title: `YTS | ${tor.quality} | ${tor.size}\n👤 Seeds: ${tor.seeds}`,
                    infoHash: tor.hash.toLowerCase()
                  });
                });
              }
            }).catch(e => console.error("YTS Error"))
        );
      }

      // ---------------------------------------------------------
      // PART C: EZTV API (For HD Series)
      // ---------------------------------------------------------
      if (type === 'series' && idParts.length === 3 && imdbId.startsWith('tt')) {
        const numericImdbId = imdbId.replace('tt', '');
        const season = parseInt(idParts[1], 10);
        const episode = parseInt(idParts[2], 10);
        
        fetchPromises.push(
          fetch(`https://eztvx.to/api/get-torrents?imdb_id=${numericImdbId}&limit=100`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
            .then(res => res.json())
            .then(data => {
              if (data?.torrents && data.torrents.length > 0) {
                const matchingTorrents = data.torrents.filter(tor => 
                  parseInt(tor.season, 10) === season && parseInt(tor.episode, 10) === episode
                );
                matchingTorrents.forEach(tor => {
                  addStream({
                    name: 'Nexus EZTV 📺',
                    title: `EZTV | ${tor.title}\n💾 ${formatBytes(tor.size_bytes)} | 👤 Seeds: ${tor.seeds}`,
                    infoHash: tor.hash.toLowerCase()
                  });
                });
              }
            }).catch(e => console.error("EZTV Error"))
        );
      }

      // Wait for all APIs to finish
      await Promise.allSettled(fetchPromises);
      streams = Array.from(uniqueStreams.values());

      // If no real torrents are found, tell the user the truth!
      if (streams.length === 0) {
        streams.push({
          name: 'Nexus Info ⚠️',
          title: `No Real Torrents Found!\nThis movie/episode is either too new or not available on the internet yet.`,
          url: '#'
        });
      }

      return new Response(JSON.stringify({ streams: streams }), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
          }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};