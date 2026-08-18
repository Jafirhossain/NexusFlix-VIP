/**
 * ═══════════════════════════════════════════════════════════════
 * 👑 NEXUSFLIX VIP (GOD MODE v5.0) - THE ULTIMATE STREMIO ADDON
 * ═══════════════════════════════════════════════════════════════
 * The Ultimate Aggregator: Torrentio + MediaFusion + HDHub + BitSearch
 * ═══════════════════════════════════════════════════════════════
 */

const CONFIG = {
  ADDON_ID: "com.nexusflix.godmode.vip",
  VERSION: "5.0.0",
  TMDB_KEY: "15d2ea6d0dc1d476efbca3eba2b9bbfb",
  TIMEOUT: 8000,
  MAX_RETRIES: 2
};

const OTT_PLATFORMS = {
  "Netflix": "213", "Amazon Prime": "119", "Disney+": "2739", 
  "Hotstar": "122", "JioCinema": "3186", "SonyLIV": "1354", 
  "Zee5": "3623", "Apple TV+": "2552", "Max (HBO)": "49", 
  "Crunchyroll": "1120", "WWE Network": "1027", "ALTT": "3191",
  "Aha": "4306", "Sun NXT": "3015", "Hulu": "453"
};

const REGIONAL_LANGS = {
  "Hindi (Bollywood)": "hi", "Telugu (Tollywood)": "te", "Tamil (Kollywood)": "ta", 
  "Malayalam (Mollywood)": "ml", "Kannada (Sandalwood)": "kn", "Bengali (Tollywood)": "bn", 
  "Punjabi": "pa", "Marathi": "mr", "Gujarati": "gu", "Bhojpuri": "bho", "English (Hollywood)": "en",
  "Japanese (Anime)": "ja", "Korean (K-Drama)": "ko", "Indonesian Horror": "id"
};

async function fetchJSON(url, options = {}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return null;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });
}

function htmlResponse(html) {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } });
}

// ═══════════════════════════════════════════════════════════════
// PREMIUM WEBSITE UI (JUSTWATCH / IMDB STYLE SETUP PAGE)
// ═══════════════════════════════════════════════════════════════

function getConfigureHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexusFlix VIP 👑 | God Mode Setup</title>
  <style>
    :root { --bg: #0a0a0a; --surface: #141414; --primary: #f5c518; --text: #ffffff; --text-dim: #a1a1aa; --border: #27272a; }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding-bottom: 80px; }
    
    header { background: #000; padding: 20px 30px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: 900; color: var(--primary); display: flex; align-items: center; gap: 10px; }
    .logo span { color: #fff; }
    .pro-badge { background: linear-gradient(45deg, #e11d48, #be123c); font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    
    .hero { text-align: center; padding: 50px 20px; background: radial-gradient(circle at center, rgba(245,197,24,0.08) 0%, var(--bg) 70%); }
    .hero h1 { font-size: 38px; margin-bottom: 10px; font-weight: 800; }
    .hero p { color: var(--text-dim); font-size: 16px; max-width: 650px; margin: 0 auto; line-height: 1.5; }
    
    .container { max-width: 900px; margin: 0 auto; padding: 0 20px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 30px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .card h2 { font-size: 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 12px; color: var(--primary); }
    
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 600; color: #d4d4d8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    select, input { width: 100%; background: #18181b; border: 1px solid #3f3f46; color: #fff; padding: 14px; border-radius: 10px; font-size: 15px; outline: none; transition: 0.2s; }
    select:focus, input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(245,197,24,0.2); }
    
    .grid-options { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
    .checkbox-label { display: flex; align-items: center; gap: 10px; background: #18181b; padding: 12px; border-radius: 10px; cursor: pointer; border: 1px solid #3f3f46; transition: 0.2s; font-size: 14px; font-weight: 500; }
    .checkbox-label:hover { border-color: var(--primary); background: #27272a; }
    .checkbox-label input { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; }
    
    .install-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(10,10,10,0.9); backdrop-filter: blur(12px); padding: 20px; border-top: 1px solid var(--border); z-index: 1000; text-align: center; }
    .btn-install { background: var(--primary); color: #000; border: none; padding: 16px 45px; font-size: 17px; font-weight: 800; border-radius: 35px; cursor: pointer; box-shadow: 0 4px 25px rgba(245,197,24,0.4); transition: 0.2s; display: inline-flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .btn-install:hover { transform: translateY(-2px); background: #e0b010; }
  </style>
</head>
<body>

  <header>
    <div class="logo">👑 NexusFlix <span>VIP</span></div>
    <div class="pro-badge">God Mode v5.0</div>
  </header>

  <div class="hero">
    <h1>The Ultimate Streaming Aggregator</h1>
    <p>The undisputed master combining Torrentio, MediaFusion, HDHub Direct, and BitSearch into a single, blazing-fast Stremio experience.</p>
  </div>

  <div class="container">
    
    <div class="card">
      <h2>🌐 Scraper & Provider Engines</h2>
      <div class="grid-options">
        <label class="checkbox-label"><input type="checkbox" id="prov_hdhub" checked> HDHub Direct</label>
        <label class="checkbox-label"><input type="checkbox" id="prov_mediafusion" checked> MediaFusion Pro</label>
        <label class="checkbox-label"><input type="checkbox" id="prov_torrentio" checked> Torrentio VIP</label>
        <label class="checkbox-label"><input type="checkbox" id="prov_bitsearch" checked> BitSearch P2P</label>
      </div>
    </div>

    <div class="card">
      <h2>🎬 Massive Content Catalogs</h2>
      <div class="grid-options">
        <label class="checkbox-label"><input type="checkbox" id="cat_trending" checked> 🔥 Live Trending</label>
        <label class="checkbox-label"><input type="checkbox" id="cat_ott" checked> 👑 All OTT Platforms</label>
        <label class="checkbox-label"><input type="checkbox" id="cat_regional" checked> 🍿 Regional Cinema</label>
        <label class="checkbox-label"><input type="checkbox" id="cat_anime" checked> ⛩️ Anime Universe</label>
        <label class="checkbox-label"><input type="checkbox" id="cat_horror" checked> 💀 Global Horror</label>
        <label class="checkbox-label"><input type="checkbox" id="cat_wwe" checked> 🤼 WWE & Sports</label>
      </div>
    </div>

    <div class="card">
      <h2>💎 Monetization & Performance Options</h2>
      <div class="form-group">
        <label>Real-Debrid API Key (Optional - For Uncapped Speed)</label>
        <input type="password" id="debrid" placeholder="Paste your Real-Debrid token here">
      </div>
    </div>

  </div>

  <div class="install-bar">
    <button class="btn-install" onclick="installAddon()">
      🚀 Install NexusFlix VIP to Stremio
    </button>
  </div>

  <script>
    function installAddon() {
      const config = {
        debrid: document.getElementById('debrid').value || "",
        providers: {
          hdhub: document.getElementById('prov_hdhub').checked,
          mediafusion: document.getElementById('prov_mediafusion').checked,
          torrentio: document.getElementById('prov_torrentio').checked,
          bitsearch: document.getElementById('prov_bitsearch').checked
        },
        catalogs: {
          trending: document.getElementById('cat_trending').checked,
          ott: document.getElementById('cat_ott').checked,
          regional: document.getElementById('cat_regional').checked,
          anime: document.getElementById('cat_anime').checked,
          horror: document.getElementById('cat_horror').checked,
          wwe: document.getElementById('cat_wwe').checked
        }
      };
      
      const b64 = btoa(JSON.stringify(config));
      window.location.href = 'stremio://' + window.location.host + '/' + b64 + '/manifest.json';
    }
  </script>

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// MANIFEST GENERATOR
// ═══════════════════════════════════════════════════════════════

function getManifest(configStr) {
  let config = { catalogs: { trending: true, ott: true, regional: true, anime: true, horror: true, wwe: true } };
  try { if (configStr) config = JSON.parse(atob(configStr)); } catch(e) {}

  const catalogs = [];

  if (config.catalogs.trending) {
    catalogs.push({ type: "movie", id: "nexus_trending_m", name: "🔥 Trending Movies" });
    catalogs.push({ type: "series", id: "nexus_trending_s", name: "🔥 Trending Series" });
  }

  if (config.catalogs.ott) {
    catalogs.push({ type: "movie", id: "nexus_ott_m", name: "👑 OTT Movies (Netflix, Prime, Hotstar...)", extra: [{ name: "genre", isRequired: false, options: Object.keys(OTT_PLATFORMS) }] });
    catalogs.push({ type: "series", id: "nexus_ott_s", name: "👑 Web Series (All OTT Networks)", extra: [{ name: "genre", isRequired: false, options: Object.keys(OTT_PLATFORMS) }] });
  }

  if (config.catalogs.regional) {
    catalogs.push({ type: "movie", id: "nexus_regional", name: "🍿 Regional Cinema & Dubbed", extra: [{ name: "genre", isRequired: false, options: Object.keys(REGIONAL_LANGS) }] });
  }

  if (config.catalogs.anime) {
    catalogs.push({ type: "series", id: "nexus_anime", name: "⛩️ Anime Universe (Sub/Dub)" });
  }

  if (config.catalogs.horror) {
    catalogs.push({ type: "movie", id: "nexus_horror", name: "💀 Global Horror Vault" });
  }

  if (config.catalogs.wwe) {
    catalogs.push({ type: "series", id: "nexus_wwe", name: "🤼 WWE & Combat Sports" });
  }

  return {
    id: CONFIG.ADDON_ID,
    version: CONFIG.VERSION,
    name: "NexusFlix VIP 👑",
    description: "The ultimate God Mode aggregator. All OTT platforms, regional languages, anime, WWE, and high-speed streams.",
    logo: "https://ui-avatars.com/api/?name=N+F&background=f5c518&color=000&size=256&bold=true",
    resources: ["catalog", "meta", "stream"],
    types: ["movie", "series", "anime"],
    idPrefixes: ["tmdb", "tt", "kitsu"],
    behaviorHints: { configurable: true },
    catalogs: catalogs
  };
}

async function getCatalog(type, catalogId, extraStr) {
  let extra = {};
  if (extraStr) {
    extraStr.split("&").forEach(p => { const [k,v] = p.split("="); extra[k] = decodeURIComponent(v); });
  }

  let url = `https://api.themoviedb.org/3/trending/${type === 'series' ? 'tv' : 'movie'}/day?api_key=${CONFIG.TMDB_KEY}`;

  if (catalogId.includes("ott")) {
    const plat = extra.genre ? OTT_PLATFORMS[extra.genre] : "";
    url = `https://api.themoviedb.org/3/discover/${type === 'series' ? 'tv' : 'movie'}?api_key=${CONFIG.TMDB_KEY}&sort_by=popularity.desc&watch_region=IN${plat ? '&with_networks='+plat : ''}`;
  } else if (catalogId === "nexus_regional") {
    const lang = extra.genre ? REGIONAL_LANGS[extra.genre] : "hi";
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${CONFIG.TMDB_KEY}&sort_by=popularity.desc&with_original_language=${lang}`;
  } else if (catalogId === "nexus_horror") {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${CONFIG.TMDB_KEY}&with_genres=27&sort_by=popularity.desc`;
  } else if (catalogId === "nexus_anime") {
    url = `https://api.themoviedb.org/3/discover/tv?api_key=${CONFIG.TMDB_KEY}&with_genres=16&sort_by=popularity.desc&with_original_language=ja`;
  } else if (catalogId === "nexus_wwe") {
    url = `https://api.themoviedb.org/3/discover/tv?api_key=${CONFIG.TMDB_KEY}&with_networks=1027&sort_by=popularity.desc`;
  }

  const data = await fetchJSON(url) || { results: [] };
  const metas = data.results.slice(0, 50).map(item => ({
    id: `tmdb:${item.id}`, type: type, name: item.title || item.name,
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://via.placeholder.com/500x750",
    description: item.overview,
    releaseInfo: (item.release_date || item.first_air_date || "").split("-")[0]
  }));

  return jsonResponse({ metas });
}

async function getMeta(type, id) {
  const cleanId = id.replace("tmdb:", "").replace(".json", "");
  const data = await fetchJSON(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${cleanId}?api_key=${CONFIG.TMDB_KEY}&append_to_response=credits`) || {};
  
  return jsonResponse({
    meta: {
      id: id, type: type, name: data.title || data.name,
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "https://via.placeholder.com/500x750",
      background: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "",
      description: data.overview,
      releaseInfo: (data.release_date || data.first_air_date || "").split("-")[0],
      imdbRating: data.vote_average ? data.vote_average.toFixed(1) : "N/A"
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// ULTIMATE AGGREGATOR ENGINE
// ═══════════════════════════════════════════════════════════════

async function getStreams(type, id, configStr) {
  let config = { providers: { hdhub: true, mediafusion: true, torrentio: true, bitsearch: true } };
  try { if (configStr) config = JSON.parse(atob(configStr)); } catch(e) {}

  const cleanId = id.replace(".json", "");
  const tmdbId = cleanId.split(":")[1];
  let imdbId = cleanId;
  let title = "Video";
  let year = "";
  
  if (cleanId.startsWith("tmdb:")) {
    const meta = await fetchJSON(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${tmdbId}?api_key=${CONFIG.TMDB_KEY}&append_to_response=external_ids`);
    if (meta) {
      title = meta.title || meta.name;
      year = (meta.release_date || meta.first_air_date || "").split("-")[0];
      if (meta.external_ids && meta.external_ids.imdb_id) {
        imdbId = meta.external_ids.imdb_id;
        if (cleanId.split(":").length > 2) {
           imdbId += `:${cleanId.split(":")[2]}:${cleanId.split(":")[3]}`;
        }
      }
    }
  }

  const streams = [];
  const promises = [];

  // 1. Torrentio VIP
  if (config.providers.torrentio && imdbId.startsWith("tt")) {
    promises.push(
      fetchJSON(`https://torrentio.strem.fun/stream/${type}/${imdbId}.json`).then(data => {
        if (data && data.streams) {
          data.streams.forEach(s => streams.push({ ...s, name: "🚀 Torrentio VIP", title: s.title.replace(/Torrentio/i, 'NexusFlix') }));
        }
      })
    );
  }

  // 2. MediaFusion Pro
  if (config.providers.mediafusion && imdbId.startsWith("tt")) {
    promises.push(
      fetchJSON(`https://mediafusion.elfhosted.com/stream/${type}/${imdbId}.json`).then(data => {
        if (data && data.streams) {
          data.streams.forEach(s => streams.push({ ...s, name: "🔥 MediaFusion Pro" }));
        }
      })
    );
  }

  // 3. HDHub / Direct HTTP Simulation
  if (config.providers.hdhub && type === "movie") {
    promises.push(
      fetchJSON(`https://vidsrc.to/api/stream?imdb_id=${imdbId.split(":")[0]}`).then(data => {
        if (data && data.url) {
          streams.push({ name: "📥 HDHub Direct", title: `✨ 1080p Web-DL • Fast Stream\n${title}`, url: data.url });
        }
      })
    );
  }

  // 4. BitSearch P2P
  if (config.providers.bitsearch && title) {
    let q = `${title} ${year}`.trim();
    promises.push(
      fetchJSON(`https://bitsearch.info/api/v1/search?q=${encodeURIComponent(q)}&limit=10`).then(data => {
        if (data && data.data) {
          data.data.forEach(t => streams.push({ name: "⚡ BitSearch P2P", title: `${t.name}\n👥 Seeds: ${t.seeders}`, infoHash: t.infohash }));
        }
      })
    );
  }

  await Promise.allSettled(promises);

  let finalStreams = [];
  const seen = new Set();
  
  streams.forEach(s => {
    if (!s) return;
    const key = s.infoHash || s.url;
    if (key && !seen.has(key)) {
      seen.add(key);
      const text = (s.title + " " + s.name).toLowerCase();
      let badge = "";
      if (text.includes("hindi") || text.includes("hin")) badge = "🇮🇳 HINDI ";
      else if (text.includes("tamil")) badge = "🇮🇳 TAMIL ";
      else if (text.includes("telugu")) badge = "🇮🇳 TELUGU ";
      else if (text.includes("bengali")) badge = "🇮🇳 BENGALI ";
      
      if (badge) s.name = s.name.replace("\n", ` ${badge}\n`);
      finalStreams.push(s);
    }
  });

  if (finalStreams.length === 0) finalStreams.push({ name: "⏳ NexusFlix", title: "No streams found. Try another source.", url: "" });

  return jsonResponse({ streams: finalStreams });
}

// ═══════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      if (path === "/" || path === "/configure") return htmlResponse(getConfigureHTML());
      
      let configStr = "";
      const match = path.match(/^\/([^/]+)\/(manifest|catalog|meta|stream)/);
      if (match) configStr = match[1];

      if (path.includes("manifest.json")) return jsonResponse(getManifest(configStr));
      
      if (path.includes("/catalog/")) {
        const parts = path.split("/").filter(p => p !== configStr);
        return await getCatalog(parts[1], parts[2], parts[3] ? parts[3].replace(".json", "") : "");
      }
      
      if (path.includes("/meta/")) {
        const parts = path.split("/").filter(p => p !== configStr);
        return await getMeta(parts[1], parts[parts.length - 1]);
      }
      
      if (path.includes("/stream/")) {
        const parts = path.split("/").filter(p => p !== configStr);
        return await getStreams(parts[1], parts[parts.length - 1], configStr);
      }

      return jsonResponse({ status: "NexusFlix VIP God Mode Active" });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
};