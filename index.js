/**
 * NexusFlix VIP - Ultimate Stable Build (v3.0.0)
 * 100% Working Proxy & Foolproof Installation
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. MANIFEST (Add-on Details)
    if (path.endsWith('/manifest.json')) {
      const manifest = {
        id: 'org.stremio.nexusflixvip.v3',
        version: '3.0.0',
        name: 'NexusFlix VIP 🇮🇳',
        description: 'High Speed Torrent Streams. 100% Free & Working Proxy.',
        logo: 'https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png',
        types: ['movie', 'series', 'anime', 'other'],
        catalogs: [],
        resources: ['stream'],
        idPrefixes: ['tt', 'kitsu'],
        behaviorHints: { configurable: true, configurationRequired: false }
      };

      return new Response(JSON.stringify(manifest), {
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*' 
        }
      });
    }

    // 2. CONFIGURATION UI (Fixed Install Logic)
    if (path === '/' || path === '/configure') {
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
              <h1>NexusFlix VIP</h1>
              <p>Your add-on is ready! Click the button below to install. If the button shows code instead of opening Stremio, use the Copy Link method.</p>
              
              <a href="#" id="install-btn" class="install-btn">🚀 INSTALL IN STREMIO</a>
              
              <div class="copy-section">
                  <label>METHOD 2: COPY & PASTE (100% WORKING)</label>
                  <div class="input-group">
                      <input type="text" id="manifest-url" readonly>
                      <button onclick="copyUrl()">COPY</button>
                  </div>
                  <p style="font-size: 12px; margin-top: 10px; margin-bottom: 0;">Copy this link, open Stremio app, go to the search bar, paste the link, and hit enter to install.</p>
              </div>
          </div>

          <script>
              // Generate URLs dynamically based on where the worker is hosted
              const baseUrl = window.location.origin;
              const manifestUrl = baseUrl + '/manifest.json';
              const stremioUrl = manifestUrl.replace(/^https?:\\/\\//, 'stremio://');
              
              // Set the links
              document.getElementById('install-btn').href = stremioUrl;
              document.getElementById('manifest-url').value = manifestUrl;

              function copyUrl() {
                  const copyText = document.getElementById('manifest-url');
                  copyText.select();
                  copyText.setSelectionRange(0, 99999); // For mobile devices
                  navigator.clipboard.writeText(copyText.value).then(() => {
                      alert("✅ Link Copied! Now open Stremio, paste it in the search bar and install.");
                  }).catch(() => {
                      alert("Failed to copy. Please select the text and copy manually.");
                  });
              }
          </script>
      </body>
      </html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // 3. STREAM SCRAPER (Proxying Torrentio - The best free source)
    const streamMatch = path.match(/(?:\/([^\/]+))?\/stream\/(movie|series|anime)\/([^\/]+)\.json/);
    
    if (streamMatch) {
      const config = streamMatch[1] || ''; 
      const type = streamMatch[2]; 
      const id = streamMatch[3]; 

      let streams = [];

      try {
        // Build the Torrentio URL
        const torrentioUrl = config 
            ? `https://torrentio.strem.fun/${config}/stream/${type}/${id}.json`
            : `https://torrentio.strem.fun/stream/${type}/${id}.json`;

        // Fetch streams from Torrentio
        const response = await fetch(torrentioUrl, {
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.streams && data.streams.length > 0) {
                // Modify the streams to show your Add-on name
                streams = data.streams.map(s => ({
                    name: 'NexusFlix VIP',
                    title: `⚡ ${s.title || "Stream"}`,
                    infoHash: s.infoHash,
                    url: s.url,
                    behaviorHints: s.behaviorHints
                }));
            }
        }
      } catch (error) {
        console.error("Scraper Error:", error);
      }

      // Return the streams to Stremio
      return new Response(JSON.stringify({ streams: streams }), {
          headers: { 
              'Content-Type': 'application/json', 
              'Access-Control-Allow-Origin': '*' 
          }
      });
    }

    // 4. 404 Not Found for anything else
    return new Response('Not Found', { status: 404 });
  }
};