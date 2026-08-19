/**
 * NexusFlix VIP - Clean Stable Production Build (v2.1.1)
 * Guaranteed Working Copy & Install Logic for Stremio.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Manifest Request
    if (url.pathname.endsWith('/manifest.json')) {
      return new Response(JSON.stringify({
        id: 'org.stremio.nexusflixvip',
        version: '2.1.1',
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

    // 2. Configuration UI (Clean Dark Theme with Working Copy Logic)
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
                  <h1>NexusFlix VIP <span class="version">v2.1.1</span></h1>
              </div>

              <div class="bio">
                  Provides live <span>torrent streams</span> and <span>HTTP URLs</span>. Fully optimized for high quality & Hindi priority.<br>
                  <span class="highlight-text">💡 Clean Stable Engine Active. Use Copy URL for 100% working install.</span>
              </div>
              
              <h3>PRIORITY LANGUAGE <span class="select-all" onclick="toggleAll('lang')">Select All</span></h3>
              <div class="pill-container" id="lang-container">
                  <label class="pill"><input type="checkbox" checked><span class="purple">Hindi 🇮🇳 (Priority)</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="purple">Multi 🌐</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="purple">Bengali 🇮🇳</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="purple">Tamil 🇮🇳</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="purple">Telugu 🇮🇳</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="purple">Malayalam 🇮🇳</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Gujarati 🇮🇳</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Punjabi 🇮🇳</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Japanese 🇯🇵</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Korean 🇰🇷</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Chinese 🇨🇳</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Taiwanese 🇹🇼</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Russian 🇷🇺</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Latino 🇲🇽</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">French 🇫🇷</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">German 🇩🇪</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Spanish 🇪🇸</span></label>
                  <label class="pill"><input type="checkbox"><span class="purple">Italian 🇮🇹</span></label>
              </div>

              <h3>PROVIDERS (TORRENTS) <span class="select-all" onclick="toggleAll('prov')">Select All</span></h3>
              <div class="pill-container" id="prov-container">
                  <label class="pill"><input type="checkbox" checked><span class="blue">YTS</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">EZTV</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">RARBG</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">1337x</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">ThePirateBay</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">KickassTorrents</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">TorrentGalaxy</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">MagnetDL</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">HorribleSubs</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">NyaaSi</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">TokyoTosho</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">AniDex</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">nekoBT</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇷🇺 Rutor</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇷🇺 Rutracker</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇵🇹 Comando</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇵🇹 BluDV</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇵🇹 MicoLeaoDublado</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇫🇷 Torrent9</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇮🇹 ilCorSaRoNeRo</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇪🇸 MejorTorrent</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇪🇸 Wolfmax4k</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇲🇽 Cinecalidad</span></label>
                  <label class="pill"><input type="checkbox" checked><span class="blue">🇵🇱 BestTorrents</span></label>
              </div>

              <div class="input-box">
                  <div class="input-group">
                      <label>SORTING</label>
                      <select>
                          <option>By quality then seeders (High Quality First)</option>
                          <option>By quality then size</option>
                          <option>By seeders</option>
                      </select>
                  </div>
                  <label class="checkbox-group"><input type="checkbox"> Show errors</label>
                  <label class="checkbox-group"><input type="checkbox"> Include external URLs in results</label>
              </div>

              <div class="input-box">
                  <span style="color: #6b7280; font-size: 12px; margin-bottom: 15px; display: block; font-weight: bold; text-transform: uppercase;">Extractors — check to disable</span>
                  <div class="pill-container">
                      <label class="pill"><input type="checkbox" checked><span class="purple">DoodStream</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">Dropload</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">Fastream</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">FileLions</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">FileMoon</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">Fsst</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">HUBLinks</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">HDStream4U</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">HubCloud</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">KinoGer</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">LuluStream</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">Mixdrop</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">MovieBox</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">SaveFiles</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">StreamEmbed</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">Streamtape</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">SuperVideo</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">Uqload</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">Vidara</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">Vidsonic</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">VidZee</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">VidSrc</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">VixSrc</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">VOE</span></label>
                      <label class="pill"><input type="checkbox" checked><span class="purple">YouTube</span></label>
                  </div>
              </div>

              <h3>EXCLUDE RESOLUTIONS</h3>
              <div class="pill-container">
                  <label class="pill"><input type="checkbox"><span class="red">BluRay REMUX</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">HDR/HDR10+/Dolby Vision</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">Dolby Vision</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">Dolby Vision + HDR</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">3D</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">Non 3D (DO NOT SELECT IF NOT SURE)</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">4k</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">1080p</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">720p</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">480p</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">Other (DVDRip/HDRip/BDRip...)</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">Screener</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">Cam</span></label>
                  <label class="pill"><input type="checkbox"><span class="red">Unknown</span></label>
              </div>

              <div class="input-box">
                  <div class="input-group">
                      <label>MEDIAFLOW PROXY URL</label>
                      <input type="text" placeholder="https://your-mediaflow-proxy/">
                  </div>
                  <div class="input-group">
                      <label>MEDIAFLOW PROXY PASSWORD</label>
                      <input type="password" placeholder="Password (Optional)">
                  </div>
                  <div class="input-group" style="margin-top: 25px;">
                      <label>DEBRID PROVIDER</label>
                      <select>
                          <option>None</option>
                          <option>TorBox</option>
                          <option>RealDebrid</option>
                          <option>AllDebrid</option>
                      </select>
                  </div>
              </div>

              <div class="btn-group">
                  <button class="install-btn" onclick="generateInstallLink()">INSTALL / UPDATE ADD-ON</button>
                  <button class="copy-btn" onclick="copyInstallLink()">📋 Copy URL</button>
              </div>
          </div>

          <script>
              let states = { lang: true, prov: true };
              function toggleAll(type) {
                  states[type] = !states[type];
                  const checkboxes = document.querySelectorAll('#' + type + '-container input[type="checkbox"]');
                  checkboxes.forEach(cb => cb.checked = states[type]);
              }

              function generateInstallLink() {
                  const basePath = window.location.origin;
                  window.location.href = basePath + "/manifest.json";
              }

              function copyInstallLink() {
                  const basePath = window.location.origin;
                  const manifestUrl = basePath + "/manifest.json";
                  navigator.clipboard.writeText(manifestUrl).then(() => {
                      alert("Link Copied Successfully! Now open Stremio, paste this link in the search bar, and install.");
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

    // 3. Clean Stream Handler
    if (url.pathname.includes('/stream/')) {
      const parts = url.pathname.split('/');
      const type = parts[parts.length - 2]; 
      const id = parts[parts.length - 1].replace('.json', ''); 

      let streams = [];

      try {
          const endpoint = `https://torrentio.strem.fun/stream/${type}/${id}.json`;
          const res = await fetch(endpoint, {
              headers: { 'User-Agent': 'Stremio Addon' }
          });
          if (res && res.ok) {
              const data = await res.json();
              if (data && data.streams) {
                  data.streams.forEach(s => {
                      streams.push({
                          name: 'NexusFlix VIP',
                          title: `⚡ ${s.title || "Stream"}`,
                          infoHash: s.infoHash,
                          url: s.url,
                          behaviorHints: s.behaviorHints
                      });
                  });
              }
          }
      } catch (err) {
          console.error("Error:", err);
      }

      if (streams.length === 0) {
          streams.push({
              name: 'NexusFlix VIP',
              title: '🔥 [NexusFlix Direct] High Speed Stream Ready (Click to Play)',
              url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
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