/**
 * NexusFlix VIP - The Torrentio Replica (v11.0)
 * Exact UI Clone + Smart Proxy Backend + Direct API Fallbacks
 * 1000% Working & Anti-Block
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Smart Proxy Fetcher (To bypass Cloudflare blocks on Torrentio)
async function smartFetch(targetUrl) {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    targetUrl
  ];
  for (const url of proxies) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) return await res.json();
    } catch (e) {}
  }
  return null;
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. MANIFEST (Dynamic based on config)
    if (path.endsWith('/manifest.json')) {
      const manifest = {
        id: 'org.stremio.nexusflix.clone',
        version: '11.0.0',
        name: 'NexusFlix (Torrentio Clone)',
        description: 'Provides torrent streams from scraped torrent providers. 1000% Working Bypass.',
        logo: 'https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png',
        types: ['movie', 'series', 'anime', 'other'],
        catalogs: [],
        resources: ['stream'],
        idPrefixes: ['tt', 'kitsu'],
        behaviorHints: { configurable: true, configurationRequired: false }
      };
      return new Response(JSON.stringify(manifest), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. EXACT TORRENTIO UI CLONE
    if (path === '/' || path.endsWith('/configure')) {
      const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NexusFlix Configuration</title>
          <style>
              body { background-color: #14151a; color: #a3a7b8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; background: #1a1c23; padding: 30px; border-radius: 12px; border: 1px solid #2a2d3e; }
              .header { text-align: center; margin-bottom: 20px; }
              .header img { width: 60px; border-radius: 50%; border: 2px solid #6131b4; }
              h1 { color: #fff; font-size: 24px; margin: 10px 0; }
              .desc { font-size: 13px; line-height: 1.6; text-align: center; margin-bottom: 30px; color: #8b92a5; }
              
              h3 { font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #2a2d3e; padding-bottom: 8px; margin-top: 30px; }
              .select-all { float: right; color: #6e84ff; cursor: pointer; text-transform: none; }
              
              .pill-container { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
              .pill { display: inline-block; cursor: pointer; position: relative; }
              .pill input { position: absolute; opacity: 0; cursor: pointer; }
              .pill span { display: inline-block; padding: 8px 15px; background: #1d1e24; border-radius: 20px; color: #a3a7b8; font-size: 13px; border: 1px solid #2a2d3e; transition: 0.2s; }
              .pill input:checked + span.blue { background: #3b42ff; color: #fff; border-color: #3b42ff; }
              .pill input:checked + span.red { background: #e11d48; color: #fff; border-color: #e11d48; }
              
              .input-group { margin-bottom: 20px; }
              select, input[type="text"] { width: 100%; padding: 12px; background: #14151a; border: 1px solid #2a2d3e; color: #fff; border-radius: 8px; outline: none; }
              
              .install-btn { display: block; width: 100%; background: linear-gradient(135deg, #6131b4, #3b42ff); color: white; padding: 15px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 30px; text-align: center; text-decoration: none; }
              .copy-btn { display: block; width: 100%; background: transparent; color: #6e84ff; padding: 10px; border: none; font-size: 14px; cursor: pointer; margin-top: 10px; text-align: center; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png" alt="Logo">
                  <h1>NexusFlix (Torrentio Clone)</h1>
              </div>
              <div class="desc">
                  Provides torrent streams from scraped torrent providers. Currently supports YTS, EZTV, RARBG, 1337x, ThePirateBay, KickassTorrents, TorrentGalaxy, MagnetDL, and more.<br>
                  <b>1000% Working Proxy Bypass Enabled.</b>
              </div>

              <h3>PROVIDERS <span class="select-all" onclick="toggleAll('prov')">Select All</span></h3>
              <div class="pill-container" id="prov-container">
                  <label class="pill"><input type="checkbox" value="yts" checked><span class="blue">YTS</span></label>
                  <label class="pill"><input type="checkbox" value="eztv" checked><span class="blue">EZTV</span></label>
                  <label class="pill"><input type="checkbox" value="rarbg" checked><span class="blue">RARBG</span></label>
                  <label class="pill"><input type="checkbox" value="1337x" checked><span class="blue">1337x</span></label>
                  <label class="pill"><input type="checkbox" value="thepiratebay" checked><span class="blue">ThePirateBay</span></label>
                  <label class="pill"><input type="checkbox" value="kickasstorrents" checked><span class="blue">KickassTorrents</span></label>
                  <label class="pill"><input type="checkbox" value="torrentgalaxy" checked><span class="blue">TorrentGalaxy</span></label>
                  <label class="pill"><input type="checkbox" value="magnetdl" checked><span class="blue">MagnetDL</span></label>
                  <label class="pill"><input type="checkbox" value="nyaasi" checked><span class="blue">NyaaSi</span></label>
                  <label class="pill"><input type="checkbox" value="tokyotosho" checked><span class="blue">TokyoTosho</span></label>
              </div>

              <div class="input-group">
                  <h3>SORTING</h3>
                  <select id="sort">
                      <option value="qualityseeders">By quality then seeders</option>
                      <option value="qualitysize">By quality then size</option>
                      <option value="seeders">By seeders</option>
                      <option value="size">By size</option>
                  </select>
              </div>

              <h3>EXCLUDE RESOLUTIONS</h3>
              <div class="pill-container" id="res-container">
                  <label class="pill"><input type="checkbox" value="4k"><span class="red">4k</span></label>
                  <label class="pill"><input type="checkbox" value="1080p"><span class="red">1080p</span></label>
                  <label class="pill"><input type="checkbox" value="720p"><span class="red">720p</span></label>
                  <label class="pill"><input type="checkbox" value="480p"><span class="red">480p</span></label>
                  <label class="pill"><input type="checkbox" value="cam"><span class="red">Cam</span></label>
                  <label class="pill"><input type="checkbox" value="screener"><span class="red">Screener</span></label>
                  <label class="pill"><input type="checkbox" value="3d"><span class="red">3D</span></label>
              </div>

              <div class="input-group">
                  <h3>DEBRID PROVIDER</h3>
                  <select id="debrid">
                      <option value="none">None</option>
                      <option value="realdebrid">RealDebrid</option>
                      <option value="alldebrid">AllDebrid</option>
                      <option value="premiumize">Premiumize</option>
                  </select>
              </div>

              <a href="#" id="install-btn" class="install-btn" onclick="generateInstall()">INSTALL</a>
              <button class="copy-btn" onclick="copyLink()">Copy Link</button>
          </div>

          <script>
              let states = { prov: true };
              function toggleAll(type) {
                  states[type] = !states[type];
                  document.querySelectorAll('#' + type + '-container input').forEach(cb => cb.checked = states[type]);
              }

              function getConfigString() {
                  let config = [];
                  
                  // Providers
                  let provs = Array.from(document.querySelectorAll('#prov-container input:checked')).map(cb => cb.value);
                  if(provs.length > 0) config.push('providers=' + provs.join(','));

                  // Sorting
                  let sort = document.getElementById('sort').value;
                  if(sort !== 'qualityseeders') config.push('sort=' + sort);

                  // Resolutions
                  let res = Array.from(document.querySelectorAll('#res-container input:checked')).map(cb => cb.value);
                  if(res.length > 0) config.push('exclude=' + res.join(','));

                  return config.length > 0 ? config.join('|') : '';
              }

              function generateInstall() {
                  const configStr = getConfigString();
                  const baseUrl = window.location.origin;
                  const finalUrl = configStr ? \`\${baseUrl}/\${configStr}/manifest.json\` : \`\${baseUrl}/manifest.json\`;
                  window.location.href = finalUrl.replace(/^https?:\\/\\//, 'stremio://');
              }

              function copyLink() {
                  const configStr = getConfigString();
                  const baseUrl = window.location.origin;
                  const finalUrl = configStr ? \`\${baseUrl}/\${configStr}/manifest.json\` : \`\${baseUrl}/manifest.json\`;
                  navigator.clipboard.writeText(finalUrl).then(() => alert("Link Copied! Paste in Stremio search bar."));
              }
          </script>
      </body>
      </html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // 3. STREAM ROUTER (The Brains)
    // Matches: /stream/movie/tt123.json OR /providers=yts|sort=size/stream/movie/tt123.json
    const streamRegex = /(?:\/([^\/]+))?\/stream\/(movie|series|anime)\/([^\/]+)\.json/;
    const match = path.match(streamRegex);
    
    if (match) {
      const configStr = match[1] || ''; // e.g., providers=yts,eztv|sort=size
      const type = match[2]; 
      const fullId = match[3]; 
      const imdbId = fullId.split(':')[0]; 
      
      let streams = [];
      const uniqueStreams = new Map();

      const addStream = (streamData) => {
        const key = streamData.infoHash || streamData.url;
        if (key && !uniqueStreams.has(key)) uniqueStreams.set(key, streamData);
      };

      // --- LAYER 1: PROXIED TORRENTIO (Using User's Config) ---
      // Hum user ki setting (configStr) ko direct Torrentio ke API me bhejenge proxy ke through
      const torrentioUrl = configStr 
        ? `https://torrentio.strem.fun/${configStr}/stream/${type}/${fullId}.json`
        : `https://torrentio.strem.fun/stream/${type}/${fullId}.json`;

      const torrentioData = await smartFetch(torrentioUrl);
      if (torrentioData && torrentioData.streams) {
        torrentioData.streams.forEach(s => {
          addStream({
            name: 'Nexus [TO]',
            title: s.title,
            infoHash: s.infoHash,
            url: s.url,
            behaviorHints: s.behaviorHints
          });
        });
      }

      // --- LAYER 2: DIRECT YTS API (1000% Backup for Movies) ---
      if (type === 'movie' && imdbId.startsWith('tt')) {
        try {
          const ytsRes = await fetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`);
          const ytsData = await ytsRes.json();
          if (ytsData?.data?.movie?.torrents) {
            ytsData.data.movie.torrents.forEach(tor => {
              addStream({
                name: 'Nexus [YTS]',
                title: `🎥 ${tor.quality} | ${tor.size}\n👤 Seeds: ${tor.seeds}`,
                infoHash: tor.hash.toLowerCase()
              });
            });
          }
        } catch(e) {}
      }

      // --- LAYER 3: DIRECT EZTV API (1000% Backup for Series) ---
      if (type === 'series' && fullId.split(':').length === 3 && imdbId.startsWith('tt')) {
        try {
          const parts = fullId.split(':');
          const season = parseInt(parts[1]);
          const episode = parseInt(parts[2]);
          const numId = imdbId.replace('tt', '');
          
          const eztvRes = await fetch(`https://eztvx.to/api/get-torrents?imdb_id=${numId}&limit=100`);
          const eztvData = await eztvRes.json();
          if (eztvData?.torrents) {
            eztvData.torrents.filter(t => parseInt(t.season) === season && parseInt(t.episode) === episode).forEach(tor => {
              addStream({
                name: 'Nexus [EZTV]',
                title: `📺 ${tor.title}\n👤 Seeds: ${tor.seeds}`,
                infoHash: tor.hash.toLowerCase()
              });
            });
          }
        } catch(e) {}
      }

      // --- LAYER 4: WEB STREAM (Ultimate Fallback) ---
      if (streams.length === 0) {
        if (type === 'movie') {
          addStream({ name: 'Nexus Web', title: '🌐 Web Stream', url: `https://vidsrc.me/embed/movie?imdb=${imdbId}` });
        } else if (type === 'series') {
          const parts = fullId.split(':');
          addStream({ name: 'Nexus Web', title: '🌐 Web Stream', url: `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${parts[1]}&episode=${parts[2]}` });
        }
      }

      streams = Array.from(uniqueStreams.values());

      return new Response(JSON.stringify({ streams: streams }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};