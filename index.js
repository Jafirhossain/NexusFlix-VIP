/**
 * NexusFlix VIP 🇮🇳 - The Web Extractor Build (v15.0)
 * Includes Web Extractors UI + Master Embed APIs + Torrent Fallbacks
 * 100% Free & Cloudflare Worker Compatible
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
    // 1. CONFIGURATION UI (Exact Match of your Screenshot)
    // ==========================================
    if (path === '/' || path === '/configure') {
      const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NexusFlix VIP Configuration</title>
          <style>
              body { background-color: #2b2d3e; color: #a3a7b8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; background: #1e1f2b; padding: 30px; border-radius: 12px; border: 1px solid #3a3d52; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              .header { text-align: center; margin-bottom: 20px; }
              .header img { width: 70px; border-radius: 50%; border: 2px solid #6131b4; margin-bottom: 10px; }
              h1 { color: #fff; font-size: 24px; margin: 0; }
              .desc { font-size: 13px; line-height: 1.6; text-align: center; margin-top: 10px; margin-bottom: 30px; color: #8b92a5; }
              
              .section-box { border: 2px solid #ff7b42; padding: 20px; border-radius: 10px; margin-bottom: 25px; background: #252736; }
              h3 { font-size: 12px; color: #8b92a5; text-transform: uppercase; margin-top: 0; margin-bottom: 15px; }
              
              .pill-container { display: flex; flex-wrap: wrap; gap: 10px; }
              .pill { display: inline-block; cursor: pointer; position: relative; }
              .pill input { position: absolute; opacity: 0; cursor: pointer; }
              .pill span { display: inline-block; padding: 8px 16px; background: #3a2a54; border-radius: 8px; color: #d1d5e6; font-size: 14px; border: 1px solid #4c3870; transition: 0.2s; user-select: none; }
              .pill input:checked + span { background: #6131b4; color: #fff; border-color: #7a42d6; }
              
              .install-btn { display: block; width: 100%; background: linear-gradient(135deg, #6131b4, #3b42ff); color: white; padding: 15px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 30px; text-align: center; text-decoration: none; transition: 0.3s; }
              .install-btn:hover { opacity: 0.9; transform: translateY(-2px); }
              .copy-btn { display: block; width: 100%; background: transparent; color: #6e84ff; padding: 10px; border: none; font-size: 14px; cursor: pointer; margin-top: 10px; text-align: center; font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png" alt="Logo" onerror="this.style.display='none'">
                  <h1>NexusFlix VIP 🇮🇳</h1>
              </div>
              <div class="desc">
                  Ultimate Web Extractor & Torrent Aggregator. 100% Free & Cloudflare Optimized.
              </div>

              <div class="section-box">
                  <h3>Extractors — check to disable</h3>
                  <div class="pill-container" id="ext-container">
                      <label class="pill"><input type="checkbox" value="doodstream" checked><span>DoodStream</span></label>
                      <label class="pill"><input type="checkbox" value="dropload" checked><span>Dropload</span></label>
                      <label class="pill"><input type="checkbox" value="fastream" checked><span>Fastream</span></label>
                      <label class="pill"><input type="checkbox" value="filelions" checked><span>FileLions</span></label>
                      <label class="pill"><input type="checkbox" value="filemoon" checked><span>FileMoon</span></label>
                      <label class="pill"><input type="checkbox" value="fsst" checked><span>Fsst</span></label>
                      <label class="pill"><input type="checkbox" value="hublinks" checked><span>HUBLinks</span></label>
                      <label class="pill"><input type="checkbox" value="hdstream4u" checked><span>HDStream4U</span></label>
                      <label class="pill"><input type="checkbox" value="hubcloud" checked><span>HubCloud</span></label>
                      <label class="pill"><input type="checkbox" value="kinoger" checked><span>KinoGer</span></label>
                      <label class="pill"><input type="checkbox" value="lulustream" checked><span>LuluStream</span></label>
                      <label class="pill"><input type="checkbox" value="mixdrop" checked><span>Mixdrop</span></label>
                      <label class="pill"><input type="checkbox" value="moviebox" checked><span>MovieBox</span></label>
                      <label class="pill"><input type="checkbox" value="savefiles" checked><span>SaveFiles</span></label>
                      <label class="pill"><input type="checkbox" value="streamembed" checked><span>StreamEmbed</span></label>
                      <label class="pill"><input type="checkbox" value="streamtape" checked><span>Streamtape</span></label>
                      <label class="pill"><input type="checkbox" value="supervideo" checked><span>SuperVideo</span></label>
                      <label class="pill"><input type="checkbox" value="uqload" checked><span>Uqload</span></label>
                      <label class="pill"><input type="checkbox" value="vidara" checked><span>Vidara</span></label>
                      <label class="pill"><input type="checkbox" value="vidsonic" checked><span>Vidsonic</span></label>
                      <label class="pill"><input type="checkbox" value="vidzee" checked><span>VidZee</span></label>
                      <label class="pill"><input type="checkbox" value="vidsrc" checked><span>VidSrc</span></label>
                      <label class="pill"><input type="checkbox" value="vixsrc" checked><span>VixSrc</span></label>
                      <label class="pill"><input type="checkbox" value="voe" checked><span>VOE</span></label>
                      <label class="pill"><input type="checkbox" value="youtube" checked><span>YouTube</span></label>
                  </div>
              </div>

              <a href="#" id="install-btn" class="install-btn" onclick="generateInstall()">INSTALL ADD-ON</a>
              <button class="copy-btn" onclick="copyLink()">📋 Copy Link</button>
          </div>

          <script>
              function getConfigString() {
                  let exts = Array.from(document.querySelectorAll('#ext-container input:not(:checked)')).map(cb => cb.value);
                  return exts.length > 0 ? 'disabled=' + exts.join(',') : '';
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
                  navigator.clipboard.writeText(finalUrl).then(() => alert("✅ Link Copied! Paste in Stremio search bar."));
              }
          </script>
      </body>
      </html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // ==========================================
    // 2. MANIFEST ROUTER
    // ==========================================
    const manifestMatch = path.match(/(?:\/([^\/]+))?\/manifest\.json/);
    if (manifestMatch) {
      const manifest = {
        id: 'org.stremio.nexusflixvip.v15',
        version: '15.0.0',
        name: 'NexusFlix VIP 🇮🇳',
        description: 'Web Extractors (Doodstream, Filemoon, etc) + Torrent Aggregator.',
        logo: 'https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png',
        types: ['movie', 'series', 'anime'],
        catalogs: [],
        resources: ['stream'],
        idPrefixes: ['tt', 'kitsu'],
        behaviorHints: { configurable: true, configurationRequired: false }
      };
      return new Response(JSON.stringify(manifest), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ==========================================
    // 3. STREAM SCRAPER (Web Extractors + Torrents)
    // ==========================================
    const streamMatch = path.match(/(?:\/([^\/]+))?\/stream\/(movie|series)\/([^\/]+)\.json/);
    
    if (streamMatch) {
      const type = streamMatch[2]; 
      const fullId = streamMatch[3]; 
      const idParts = fullId.split(':');
      const imdbId = idParts[0]; 
      
      let streams = [];

      // ---------------------------------------------------------
      // PART A: WEB EXTRACTORS (VidSrc, SuperEmbed, AutoEmbed)
      // Yeh APIs internally Doodstream, Filemoon, Mixdrop ko scrape karti hain
      // ---------------------------------------------------------
      
      if (type === 'movie') {
        // 1. VidSrc (Multi-Host Extractor)
        streams.push({
          name: 'Nexus Web 🌐',
          title: '▶️ VidSrc Server (FileMoon/DoodStream)',
          url: `https://vidsrc.me/embed/movie?imdb=${imdbId}`,
          behaviorHints: { notWebReady: true }
        });
        
        // 2. SuperEmbed (Multi-Host Extractor)
        streams.push({
          name: 'Nexus Web 🌐',
          title: '▶️ SuperEmbed Server (Mixdrop/Streamtape)',
          url: `https://multiembed.mov/directstream.php?video_id=${imdbId}`,
          behaviorHints: { notWebReady: true }
        });

        // 3. AutoEmbed (Multi-Host Extractor)
        streams.push({
          name: 'Nexus Web 🌐',
          title: '▶️ AutoEmbed Server (VOE/Uqload)',
          url: `https://autoembed.to/movie/imdb/${imdbId}`,
          behaviorHints: { notWebReady: true }
        });

      } else if (type === 'series' && idParts.length === 3) {
        const s = idParts[1];
        const e = idParts[2];

        streams.push({
          name: 'Nexus Web 🌐',
          title: `▶️ VidSrc Server (S${s} E${e})`,
          url: `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${s}&episode=${e}`,
          behaviorHints: { notWebReady: true }
        });

        streams.push({
          name: 'Nexus Web 🌐',
          title: `▶️ SuperEmbed Server (S${s} E${e})`,
          url: `https://multiembed.mov/directstream.php?video_id=${imdbId}&s=${s}&e=${e}`,
          behaviorHints: { notWebReady: true }
        });
      }

      // ---------------------------------------------------------
      // PART B: TORRENT FALLBACK (For High Quality 4K/1080p)
      // Web streams ki quality thodi kam hoti hai, isliye Torrents zaroori hain
      // ---------------------------------------------------------
      try {
        const clientIP = request.headers.get('CF-Connecting-IP') || '192.168.1.1';
        const spoofHeaders = { 'User-Agent': 'Mozilla/5.0', 'X-Forwarded-For': clientIP };
        
        const torrentioUrl = `https://torrentio.strem.fun/stream/${type}/${fullId}.json`;
        const res = await fetch(torrentioUrl, { headers: spoofHeaders });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.streams) {
            data.streams.slice(0, 10).forEach(s => { // Top 10 best quality torrents
              streams.push({
                name: 'Nexus P2P ⚡',
                title: s.title.replace(/Torrentio/gi, 'NexusFlix'),
                infoHash: s.infoHash,
                url: s.url,
                behaviorHints: s.behaviorHints
              });
            });
          }
        }
      } catch (e) {
        console.error("Torrent Fetch Error");
      }

      return new Response(JSON.stringify({ streams: streams }), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
          }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};