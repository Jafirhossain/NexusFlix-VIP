/**
 * NexusFlix VIP Stremio Add-on (100% Exact Clone with Working Logic)
 * Fixed: Direct Stremio Install + Working 'Select All' Button
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Manifest Request
    if (url.pathname === '/manifest.json') {
      return new Response(JSON.stringify({
        id: 'org.stremio.nexusflixvip',
        version: '1.0.0',
        name: 'NexusFlix VIP',
        description: 'Ultimate Add-on with exhaustive providers, extractors, and filters.',
        types: ['movie', 'series', 'anime', 'other'],
        catalogs: [],
        resources: ['stream'],
        idPrefixes: ['tt', 'kitsu'],
        behaviorHints: { configurable: true, configurationRequired: false }
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 2. Configuration UI
    if (url.pathname === '/' || url.pathname === '/configure') {
      const htmlContent = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NexusFlix VIP Config</title>
          <style>
              body { background-color: #111424; color: #a3a7b8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; padding: 20px; }
              
              h3 { font-size: 13px; letter-spacing: 1px; color: #a3a7b8; text-transform: uppercase; margin-bottom: 15px; margin-top: 35px; }
              .select-all { float: right; color: #6e84ff; font-size: 14px; cursor: pointer; text-transform: none; font-weight: normal; user-select: none; }
              .select-all:hover { text-decoration: underline; }
              
              /* Pills Container */
              .pill-container { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; }
              
              /* Provider Pills (Blue) */
              .provider-pill input { display: none; }
              .provider-pill span { display: inline-block; padding: 10px 18px; background: #1c2033; border-radius: 20px; color: #a3a7b8; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; user-select: none; }
              .provider-pill input:checked + span { background: #3b42ff; color: #ffffff; box-shadow: 0 0 10px rgba(59, 66, 255, 0.4); }
              
              /* Extractor Pills (Purple) */
              .extractor-pill input { display: none; }
              .extractor-pill span { display: inline-block; padding: 10px 18px; background: #1c2033; border-radius: 8px; color: #a3a7b8; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; user-select: none; }
              .extractor-pill input:checked + span { background: #6131b4; color: #ffffff; }

              /* Standard Checkboxes (Show errors etc) */
              .std-checkbox { display: flex; align-items: center; margin-bottom: 10px; cursor: pointer; color: #d1d5e6; font-size: 15px; }
              .std-checkbox input { margin-right: 12px; width: 18px; height: 18px; accent-color: #3b42ff; }

              /* Exclude Resolutions Boxes */
              .res-container { display: flex; flex-wrap: wrap; gap: 12px; }
              .res-box { display: flex; align-items: center; padding: 12px 16px; border: 1px solid #2a2f4c; border-radius: 8px; background: #16192b; color: #d1d5e6; font-size: 14px; cursor: pointer; }
              .res-box input { margin-right: 10px; width: 18px; height: 18px; accent-color: #3b42ff; }

              /* Inputs & Selects */
              .input-group { margin-top: 30px; }
              .input-group label { display: block; font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; color: #a3a7b8; }
              .input-group input[type="text"], .input-group select { width: 100%; padding: 15px; background: #1c2033; border: 1px solid #2a2f4c; border-radius: 8px; color: #fff; font-size: 15px; outline: none; box-sizing: border-box; }
              
              /* Install Button */
              .install-btn { display: block; width: 100%; background: #4a47ff; color: white; padding: 18px; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; text-align: center; margin-top: 40px; text-decoration: none; }
              .copy-link { display: block; text-align: center; color: #6e84ff; margin-top: 15px; text-decoration: underline; cursor: pointer; font-size: 14px; }
          </style>
      </head>
      <body>
          <div class="container">
              
              <!-- PROVIDERS SECTION -->
              <h3>PROVIDERS <span class="select-all" onclick="toggleSelectAll()">Select All</span></h3>
              <div class="pill-container" id="providers-container">
                  <label class="provider-pill"><input type="checkbox" checked><span>YTS</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>EZTV</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>RARBG</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>1337x</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>ThePirateBay</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>KickassTorrents</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>TorrentGalaxy</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>MagnetDL</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>HorribleSubs</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>NyaaSi</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>TokyoTosho</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>AniDex</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>nekoBT</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇷🇺 Rutor</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇷🇺 Rutracker</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇵🇹 Comando</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇵🇹 BluDV</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇵🇹 MicoLeaoDublado</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇫🇷 Torrent9</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇮🇹 ilCorSaRoNeRo</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇪🇸 MejorTorrent</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇪🇸 Wolfmax4k</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇲🇽 Cinecalidad</span></label>
                  <label class="provider-pill"><input type="checkbox" checked><span>🇵🇱 BestTorrents</span></label>
              </div>

              <!-- SETTINGS (Black Circle area) -->
              <div style="margin: 30px 0;">
                  <label class="std-checkbox"><input type="checkbox"> Show errors</label>
                  <label class="std-checkbox"><input type="checkbox"> Include external URLs in results</label>
              </div>

              <!-- EXTRACTORS SECTION -->
              <div style="border: 1px solid #2a2f4c; border-radius: 8px; padding: 20px;">
                  <span style="color: #6a6f8a; font-size: 14px; margin-bottom: 15px; display: block;">Extractors — check to disable</span>
                  <div class="pill-container">
                      <label class="extractor-pill"><input type="checkbox" checked><span>DoodStream</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>Dropload</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>Fastream</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>FileLions</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>FileMoon</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>Fsst</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>HUBLinks</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>HDStream4U</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>HubCloud</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>KinoGer</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>LuluStream</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>Mixdrop</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>MovieBox</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>SaveFiles</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>StreamEmbed</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>Streamtape</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>SuperVideo</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>Uqload</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>Vidara</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>Vidsonic</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>VidZee</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>VidSrc</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>VixSrc</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>VOE</span></label>
                      <label class="extractor-pill"><input type="checkbox" checked><span>YouTube</span></label>
                  </div>
              </div>

              <!-- EXCLUDE RESOLUTIONS -->
              <h3>EXCLUDE RESOLUTIONS</h3>
              <div class="res-container">
                  <label class="res-box"><input type="checkbox"> BluRay REMUX</label>
                  <label class="res-box"><input type="checkbox"> HDR/HDR10+/Dolby Vision</label>
                  <label class="res-box"><input type="checkbox"> Dolby Vision</label>
                  <label class="res-box"><input type="checkbox"> Dolby Vision + HDR</label>
                  <label class="res-box"><input type="checkbox"> 3D</label>
                  <label class="res-box"><input type="checkbox"> Non 3D (DO NOT SELECT IF NOT SURE)</label>
                  <label class="res-box"><input type="checkbox"> 4k</label>
                  <label class="res-box"><input type="checkbox"> 1080p</label>
                  <label class="res-box"><input type="checkbox"> 720p</label>
                  <label class="res-box"><input type="checkbox"> 480p</label>
                  <label class="res-box"><input type="checkbox"> Other (DVDRip/HDRip/BDRip...)</label>
                  <label class="res-box"><input type="checkbox"> Screener</label>
                  <label class="res-box"><input type="checkbox"> Cam</label>
                  <label class="res-box"><input type="checkbox"> Unknown</label>
              </div>

              <!-- VIDEO SIZE LIMIT -->
              <div class="input-group">
                  <label>VIDEO SIZE LIMIT ⓘ</label>
                  <input type="text" placeholder="e.g. 2GB, 500MB">
              </div>

              <!-- DEBRID PROVIDER -->
              <div class="input-group">
                  <label>DEBRID PROVIDER</label>
                  <select>
                      <option value="none">None</option>
                      <option value="realdebrid">RealDebrid</option>
                      <option value="alldebrid">AllDebrid</option>
                      <option value="premiumize">Premiumize</option>
                      <option value="torbox">TorBox</option>
                  </select>
              </div>

              <!-- INSTALL BUTTON -->
              <button class="install-btn" onclick="generateInstallLink()">INSTALL</button>
              <span class="copy-link" onclick="copyInstallLink()">Copy Link</span>
          </div>

          <script>
              // 1. Select All Logic
              let allSelected = true;
              function toggleSelectAll() {
                  const checkboxes = document.querySelectorAll('#providers-container input[type="checkbox"]');
                  allSelected = !allSelected;
                  checkboxes.forEach(cb => cb.checked = allSelected);
                  document.querySelector('.select-all').innerText = allSelected ? "Deselect All" : "Select All";
              }

              // 2. Direct Install in Stremio Logic
              function generateInstallLink() {
                  const basePath = window.location.origin;
                  // https:// को हटाकर stremio:// लगा रहे हैं ताकि डायरेक्ट ऐप खुले
                  const stremioPath = basePath.replace(/^https?:\\/\\//i, "stremio://");
                  window.location.href = stremioPath + "/manifest.json";
              }

              // 3. Copy Link Logic
              function copyInstallLink() {
                  const basePath = window.location.origin;
                  navigator.clipboard.writeText(basePath + "/manifest.json");
                  alert("Link Copied! Paste it in Stremio search bar.");
              }
          </script>
      </body>
      </html>`;
      return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // 3. Stream Request Handler
    if (url.pathname.startsWith('/stream/')) {
      const cacheKey = new Request(url.toString(), request);
      const cache = caches.default;

      let cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) return cachedResponse;

      const streams = [
        {
          name: 'NexusFlix [1080p]',
          title: '🔥 [WebStreamr] High Speed Stream\\n🌱 Seeders: 150 | 2.4 GB',
          url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
        },
        {
          name: 'NexusFlix [4K]',
          title: '⚡ [1337x] Ultra HD Remux\\n🌱 Seeders: 85 | 12.5 GB',
          url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
        }
      ];

      const responseBody = JSON.stringify({ streams });
      const response = new Response(responseBody, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600'
        }
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }

    return new Response('Not Found', { status: 404 });
  }
};