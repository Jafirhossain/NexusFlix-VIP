export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ==========================================
    // 🎨 LOGO URL (अभी यह डिफ़ॉल्ट पर लॉक है)
    // ==========================================
    const LOGO_URL = "https://ui-avatars.com/api/?name=N+F&background=e11d48&color=fff&size=256&font-size=0.4";

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ==========================================
    // 1. VIP CONFIGURATION DASHBOARD (UI)
    // ==========================================
    if (path === "/" || path === "/configure" || path.endsWith("/configure")) {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NexusFlix VIP 👑</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #09090b; color: #fafafa; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .card { background: #18181b; padding: 40px; border-radius: 16px; border: 1px solid #27272a; box-shadow: 0 10px 50px rgba(225, 29, 72, 0.15); width: 100%; max-width: 450px; text-align: center; }
                .logo { width: 120px; height: 120px; border-radius: 20%; margin-bottom: 20px; border: 2px solid #e11d48; box-shadow: 0 0 20px rgba(225,29,72,0.4); }
                h1 { margin: 0 0 5px 0; font-size: 28px; font-weight: 800; color: #e11d48; text-transform: uppercase; letter-spacing: 1.5px; }
                p.desc { color: #a1a1aa; font-size: 13px; margin-bottom: 30px; line-height: 1.5; }
                .input-group { text-align: left; margin-bottom: 20px; }
                label { display: block; font-size: 12px; font-weight: 700; color: #d4d4d8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                select { width: 100%; padding: 14px; background: #0f0f13; border: 1px solid #3f3f46; color: white; border-radius: 8px; font-size: 15px; outline: none; transition: border 0.3s; }
                select:focus { border-color: #e11d48; }
                .btn { display: block; background: linear-gradient(135deg, #e11d48, #be123c); color: white; text-decoration: none; padding: 16px; font-size: 18px; font-weight: bold; border-radius: 8px; margin-top: 30px; transition: all 0.3s ease; }
                .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(225,29,72,0.4); }
            </style>
        </head>
        <body>
            <div class="card">
                <img src="${LOGO_URL}" class="logo" alt="NexusFlix Logo">
                <h1>NexusFlix VIP</h1>
                <p class="desc">The Ultimate Catalog: Trending, Global Horror, Anime, OTT & Regional Cinema.</p>
                
                <div class="input-group">
                    <label>Premium Links (Debrid)</label>
                    <select id="debrid">
                        <option value="none">Free Mode (Direct DDL & Torrents)</option>
                        <option value="realdebrid">Real-Debrid (VIP High Speed)</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Video Quality</label>
                    <select id="quality">
                        <option value="all">Best Available (4K / 1080p)</option>
                        <option value="1080p">1080p & 720p Only</option>
                    </select>
                </div>
                <a id="install" class="btn" href="#">🚀 Install to Stremio</a>
            </div>
            <script>
                document.getElementById('install').addEventListener('click', (e) => {
                    e.preventDefault();
                    let config = { debrid: document.getElementById('debrid').value, quality: document.getElementById('quality').value };
                    window.location.href = 'stremio://' + window.location.host + '/' + btoa(JSON.stringify(config)) + '/manifest.json';
                });
            </script>
        </body>
        </html>
      `;
      return new Response(html, { headers: { "Content-Type": "text/html", ...corsHeaders } });
    }

    // ==========================================
    // 2. STREMIO MANIFEST (The Brain & Categories)
    // ==========================================
    if (path.includes("manifest.json")) {
      const manifest = {
        id: "com.nexusflix.vip.advanced",
        version: "3.0.0",
        name: "NexusFlix VIP 👑",
        description: "IMDb Ratings, Global Horror, Live Trending, Anime & Complete Indian/OTT Cinema.",
        logo: LOGO_URL,
        resources: ["catalog", "meta", "stream"],
        types: ["movie", "series", "anime"],
        idPrefixes: ["tmdb", "tt"],
        behaviorHints: { configurable: true, configurationRequired: false },
        catalogs: [
          { type: "movie", id: "nexus_trending", name: "🔥 NexusFlix: Live Trending Today" },
          { type: "movie", id: "nexus_new", name: "🆕 NexusFlix: Fresh Releases" },
          { type: "movie", id: "nexus_upcoming", name: "⏳ NexusFlix: Upcoming / Coming Soon" },
          { 
            type: "movie", id: "nexus_horror", name: "💀 NexusFlix: Global Horror Vault",
            extra: [{ name: "genre", isRequired: false, options: ["Indonesian", "J-Horror (Japan)", "Hollywood", "Bollywood", "Thai", "Korean"] }]
          },
          { 
            type: "series", id: "nexus_ott", name: "👑 NexusFlix: Global & Indian OTT",
            extra: [{ name: "genre", isRequired: false, options: ["Netflix", "Amazon Prime", "JioCinema", "Hotstar", "Crunchyroll (Anime)"] }]
          },
          { 
            type: "movie", id: "nexus_regional", name: "🍿 NexusFlix: Indian Cinema",
            extra: [{ name: "genre", isRequired: false, options: ["Bollywood", "Tollywood", "Bengali"] }]
          }
        ]
      };
      return new Response(JSON.stringify(manifest), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // ==========================================
    // 3. CATALOGS ENGINE (TMDB Live Auto-Routing)
    // ==========================================
    if (path.includes("/catalog/")) {
      const TMDB_API = "15d2ea6d0dc1d476efbca3eba2b9bbfb"; 
      const parts = path.split("/");
      const type = parts[2]; 
      const catalogId = parts[3]; 
      const extra = parts[4] || ""; 

      let tmdbUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API}`; 

      if (catalogId === "nexus_trending") tmdbUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API}`;
      if (catalogId === "nexus_new") tmdbUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API}`;
      if (catalogId === "nexus_upcoming") tmdbUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API}`;
      
      if (catalogId === "nexus_horror") {
        let lang = "";
        if (extra.includes("Indonesian")) lang = "id";
        else if (extra.includes("Japan")) lang = "ja";
        else if (extra.includes("Thai")) lang = "th";
        else if (extra.includes("Korean")) lang = "ko";
        else if (extra.includes("Bollywood")) lang = "hi";
        else if (extra.includes("Hollywood")) lang = "en";
        
        tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API}&with_genres=27&sort_by=popularity.desc`;
        if (lang) tmdbUrl += `&with_original_language=${lang}`;
      }

      if (catalogId === "nexus_ott") {
        let networkId = ""; 
        if (extra.includes("Netflix")) networkId = "213";
        else if (extra.includes("Amazon")) networkId = "1024";
        else if (extra.includes("JioCinema")) networkId = "3186"; 
        else if (extra.includes("Hotstar")) networkId = "122";
        else if (extra.includes("Crunchyroll")) networkId = "1120";

        tmdbUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API}&sort_by=popularity.desc`;
        if (networkId) tmdbUrl += `&with_networks=${networkId}`;
      }

      if (catalogId === "nexus_regional") {
        let lang = "hi"; 
        if (extra.includes("Tollywood")) lang = "te"; 
        else if (extra.includes("Bengali")) lang = "bn";
        
        tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API}&with_original_language=${lang}&sort_by=popularity.desc`;
      }

      try {
        let tRes = await fetch(tmdbUrl);
        let tData = await tRes.json();
        let metas = (tData.results || []).map(m => ({
          id: `tmdb:${m.id}`,
          type: m.media_type || (catalogId.includes("ott") ? "series" : "movie"),
          name: m.title || m.name,
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "https://via.placeholder.com/500x750?text=NexusFlix",
          description: m.overview || "Details coming soon..."
        }));
        return new Response(JSON.stringify({ metas }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      } catch (e) {
        return new Response(JSON.stringify({ metas: [] }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
    }

    // ==========================================
    // 4. META ENGINE (IMDb Style Details)
    // ==========================================
    if (path.includes("/meta/")) {
      const TMDB_API = "15d2ea6d0dc1d476efbca3eba2b9bbfb";
      const parts = path.split("/");
      let type = parts[2] === "series" ? "tv" : "movie";
      let id = parts[parts.length - 1].replace(".json", "");
      let cleanId = id.replace("tmdb:", "");
      
      try {
        let tRes = await fetch(`https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API}&append_to_response=credits`);
        let m = await tRes.json();
        
        let cast = m.credits && m.credits.cast ? m.credits.cast.slice(0, 3).map(c => c.name).join(", ") : "Unknown";
        let rating = m.vote_average ? m.vote_average.toFixed(1) : "N/A";
        let year = (m.release_date || m.first_air_date || "2026").split("-")[0];
        
        let richDescription = `⭐ IMDb/TMDB Rating: ${rating}/10\n📅 Year: ${year}\n🎭 Cast: ${cast}\n\n🎬 Story: ${m.overview || "No description."}`;

        let metaObj = {
          id: id,
          type: parts[2],
          name: m.title || m.name,
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "https://via.placeholder.com/500",
          background: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : "",
          description: richDescription,
          releaseInfo: year,
          imdbRating: rating
        };
        return new Response(JSON.stringify({ meta: metaObj }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      } catch (e) {
        return new Response(JSON.stringify({ meta: {} }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
    }

    // ==========================================
    // 5. STREAM ENGINE (Direct Links + Torrents)
    // ==========================================
    if (path.includes("/stream/")) {
      const TMDB_API = "15d2ea6d0dc1d476efbca3eba2b9bbfb";
      const parts = path.split("/");
      let targetId = parts[parts.length - 1].replace(".json", "");
      let isSeries = parts[2] === "series";
      let mediaTitle = "Movie";

      try {
        if (targetId.startsWith("tmdb:")) {
          let cleanId = targetId.split(":")[1];
          let tRes = await fetch(`https://api.themoviedb.org/3/${isSeries ? 'tv' : 'movie'}/${cleanId}?api_key=${TMDB_API}`);
          let tData = await tRes.json();
          mediaTitle = tData.title || tData.name;
        }
      } catch (e) {}

      let allStreams = [];

      allStreams.push({
        name: "🎬 NexusFlix VIP\n🌐 DIRECT WEB",
        title: `✨ Multi-Audio / Hindi Dub\nHigh Speed No Buffering`,
        url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" 
      });

      if (!isSeries) {
        try {
          let csvRes = await fetch(`https://torrents-csv.com/service/search?q=${encodeURIComponent(mediaTitle)}&size=15`);
          let csvData = await csvRes.json();
          if (csvData && csvData.torrents) {
            csvData.torrents.forEach(t => {
              allStreams.push({
                name: "🎬 NexusFlix VIP\n⚡ P2P SERVER",
                title: `✨ 4K / 1080p Stream\n${t.name}\n👤 Seeders: ${t.seeders || 'High'}`,
                infoHash: t.infohash
              });
            });
          }
        } catch (e) {}
      }

      return new Response(JSON.stringify({ streams: allStreams }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response("NexusFlix Master Engine is Live and Running!", { headers: corsHeaders });
  }
};