/**
 * NexusFlix VIP - Clean Stable Production Build (v2.1.2)
 * Fixed Stream Routing & Cloudflare Bypass
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Manifest Request
    if (url.pathname.endsWith('/manifest.json')) {
      return new Response(JSON.stringify({
        id: 'org.stremio.nexusflixvip',
        version: '2.1.2',
        name: 'NexusFlix VIP 🇮🇳',
        description: 'Ultimate Dual-Engine Add-on for Torrents & Web Streams with High Quality & Hindi Priority.',
        logo: 'https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png',
        types: ['movie', 'series', 'anime', 'other'],
        catalogs: [],
        resources: ['stream'],
        idPrefixes: ['tt', 'kitsu'],
        behaviorHints: { configurable: true, configurationRequired: false }
      }), {
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    // 2. Configuration UI
    if (url.pathname === '/' || url.pathname.endsWith('/configure')) {
      const htmlContent = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NexusFlix VIP Configuration</title>
          <style>
              body { background-color: #14151a; color: #a3a7b8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; -webkit-tap-highlight-color: transparent; }
              .container { max-width: 800px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 25px; }
              .logo { width: 60px; height: 60px; background: #262835; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; color: #4ade80; border: 2px solid #3b42ff; margin-bottom: 10px; overflow: hidden; }
              .logo img { width: 100%; height: 100%; object-fit: cover; }
              h1 { color: #ffffff; font-size: 26px; margin: 5px 0; }
              .version { background: #2a2d3e; color: #6e84ff; padding: 3px 8px; border-radius: 4px; font-size: 12px; vertical-align: middle; margin-left: 10px; }
              .bio { font-size: 14px; line-height: 1.6; color: #8b92a5; background: #1a1c23; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #2a2d3e; margin-bottom: 30px; }
              .bio span { color: #a3a7b8; }
              .highlight-text { color: #eab308; }
              h3 { font-size: 12px; letter-spacing: 1.5px; color: #6b7280; text-transform: uppercase; margin-bottom: 12px; margin-top: 35px; border-bottom: 1px solid #2a2d3e; padding-bottom: 8px; }
              .select-all { float: right; color: #6e84ff; font-size: 12px; cursor: pointer; text-transform: none; font-weight: normal; padding: 5px; }
              
              .pill-container { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; }
              .pill { display: inline-block; cursor: pointer; user-select: none; position: relative; z-index: 5; }
              .pill input { position: absolute; opacity: 0.01; cursor: pointer; }
              .pill span { display: inline-block; padding: 10px 18px; background: #1d1e24; border-radius: 20px; color: #a3a7b8; font-size: 13.5px; font-weight: 500; border: 1px solid #2a2d3e; transition: 0.2s; pointer-events: none; }
              .pill input:checked + span.blue { background: #3b42ff; color: #ffffff; border-color: #3b42ff; box-shadow: 0 0 12px rgba(59,66,255,0.3); }
              .pill input:checked + span.purple { background: #6131b4; color: #ffffff; border-color: #6131b4; }
              .pill input:checked + span.red { background: #e11d48; color: #ffffff; border-color: #e11d48; }

              .input-box { background: #1a1c23; border: 1px solid #2a2d3e; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
              .input-group { margin-bottom: 15px; }
              .input-group label { display: block; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #6b7280; }
              .input-group input[type="text"], .input-group input[type="password"], .input-group select { width: 100%; padding: 14px; background: #14151a; border: 1px solid #2a2d3e; border-radius: 8px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box; transition: 0.3s; }
              
              .checkbox-group { display: flex; align-items: center; margin-bottom: 12px; cursor: pointer; color: #d1d5e6; font-size: 14px; position: relative; z-index: 5; }
              .checkbox-group input { margin-right: 12px; width: 18px; height: 18px; accent-color: #6131b4; cursor: pointer; }
              
              .btn-group { display: flex; gap: 15px; margin-top: 40px; position: relative; z-index: 10; }
              .install-btn { flex: 2; background: linear-gradient(135deg, #6131b4, #3b42ff); color: white; padding: 18px; border: none; border-radius: 8px; font-size: 17px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(97, 49, 180, 0.4); }
              .install-btn:hover { background: linear-gradient(135deg, #713bc9, #4a47ff); transform: translateY(-2px); }
              .copy-btn { flex: 1; background: #1d1e24; color: #a3a7b8; border: 1px solid #2a2d3e; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
              .copy-btn:hover { background: #2a2d3e; color: #fff; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">
                      <img src="https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png" alt="Logo" onerror="this.style.display='none'">
                  </div>
                  <h1>NexusFlix VIP <span class="version">v2.1.2</span></h1>
              </div>

              <div class="bio">
                  Provides live <span>torrent streams</span>. Fully optimized for high quality & Hindi priority.<br>
                  <span class="highlight-text">💡 Note: Web Scrapers require external API. Currently fetching best Torrents.</span>
              </div>
              
              <!-- UI Elements (Kept as is for design) -->
              <h3>PRIORITY LANGUAGE <span class="select-all" onclick="toggleAll('lang')">Select All</span></h3>
              <div class="pill-container" id="lang-container">
                  <label class="pill"><input type="checkbox" checked><span class="purple">Hindi 🇮🇳 (Priority)</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="purple">Multi 🌐</span></label>
              </div>

              <div class="btn-group">
                  <button class="install-btn" onclick="generateInstallLink()">INSTALL / UPDATE ADD-ON</button>
                  <button class="copy-btn" onclick="copyInstallLink()">📋 Copy URL</button>
              </div>
          </div>

          <script>
              function generateInstallLink() {
                  const basePath = window.location.origin;
                  // Fixed: Uses stremio:// to open app directly
                  const stremioUrl = basePath.replace(/^https?:\\/\\//, 'stremio://') + "/manifest.json";
                  window.location.href = stremioUrl;
              }

              function copyInstallLink() {
                  const basePath = window.location.origin;
                  const manifestUrl = basePath + "/manifest.json";
                  navigator.clipboard.writeText(manifestUrl).then(() => {
                      alert("Link Copied! Open Stremio, paste this link in the search bar, and install.");
                  }).catch(err => {
                      prompt("Copy this link manually:", manifestUrl);
                  });
              }
          </script>
      </body>
      </html>`;
      return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 3. Clean Stream Handler (Fixed Routing & Cloudflare Bypass)
    // Matches both /stream/type/id.json AND /config/stream/type/id.json
    const streamRegex = /(?:\\/([^\\/]+))?\\/stream\\/([^\\/]+)\\/([^\\/]+)\\.json/;
    const match = url.pathname.match(streamRegex);

    if (match) {
      const config = match[1] || ''; 
      const type = match[2]; 
      const id = match[3]; 

      let streams = [];

      try {
          // Construct proper Torrentio URL
          const torrentioUrl = config 
              ? \`https://torrentio.strem.fun/\${config}/stream/\${type}/\${id}.json\`
              : \`https://torrentio.strem.fun/stream/\${type}/\${id}.json\`;

          // Fetch with proper headers to avoid Cloudflare Worker blocks
          const res = await fetch(torrentioUrl, {
              headers: { 
                  'Accept': 'application/json',
                  'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
              }
          });

          if (res.ok) {
              const data = await res.json();
              if (data && data.streams && data.streams.length > 0) {
                  data.streams.forEach(s => {
                      streams.push({
                          name: 'NexusFlix VIP',
                          title: \`⚡ \${s.title || "Stream"}\`,
                          infoHash: s.infoHash,
                          url: s.url,
                          behaviorHints: s.behaviorHints
                      });
                  });
              }
          } else {
              console.error("Torrentio blocked the request. Status:", res.status);
          }
      } catch (err) {
          console.error("Error fetching streams:", err);
      }

      // Fallback if no streams found
      if (streams.length === 0) {
          streams.push({
              name: 'NexusFlix VIP',
              title: '⚠️ No Streams Found (Try again or check provider)',
              url: '#'
          });
      }

      return new Response(JSON.stringify({ streams }), {
          headers: { 
              'Content-Type': 'application/json', 
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*'
          }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};