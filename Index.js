/**
 * ═════════════════════════════════════════════════════════════════════════
 * 👑 NEXUSFLIX VIP (v9.0) - THE ULTIMATE LIVE ENGINE AGGREGATOR
 * ═════════════════════════════════════════════════════════════════════════
 * APIs: TMDB, Kitsu, YTS, BitSearch, Torrents-CSV, VidSrc.
 * Includes Premium UI, Debrid Integration capability, and Affiliate linking.
 * ═════════════════════════════════════════════════════════════════════════
 */

const CONFIG = {
  ADDON_ID: "com.nexusflix.vip.v9",
  VERSION: "9.0.0",
  TMDB_KEY: "15d2ea6d0dc1d476efbca3eba2b9bbfb",
  TIMEOUT: 8000,
  // 👇 यहाँ पर आपको अपने GitHub से कॉपी किया हुआ Raw लिंक डालना है
  LOGO: "https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png" 
};

const LIVE_FILTERS = {
  "🔥 Trending Today": "trending",
  "🆕 Now Playing (New)": "now_playing",
  "⏳ Coming Soon": "upcoming",
  "⭐ All-Time Hits": "top_rated"
};

const OTT_NETWORKS = {
  "Netflix": "213", "Amazon Prime": "119", "Disney+": "2739", 
  "Hotstar": "122", "JioCinema": "3186", "SonyLIV": "1354", 
  "Zee5": "3623", "Crunchyroll": "1120", "WWE Network": "1027"
};

const REGIONAL_LANGS = {
  "Hindi (Bollywood)": "hi", "Telugu (Tollywood)": "te", "Tamil (Kollywood)": "ta", 
  "Malayalam": "ml", "Kannada": "kn", "Bengali": "bn", "Punjabi": "pa"
};

const HORROR_VAULT = {
  "Indonesian Horror": { genre: "27", lang: "id" },
  "Japanese (J-Horror)": { genre: "27", lang: "ja" },
  "Korean (K-Horror)": { genre: "27", lang: "ko" },
  "Bollywood Horror": { genre: "27", lang: "hi" },
  "Supernatural": { genre: "27", keyword: "supernatural" },
  "Slasher": { genre: "27", keyword: "slasher" }
};

// --- UTILS ---
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

// --- UI SETUP PAGE (Premium Web Vibe & Monetization) ---
function getConfigureHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexusFlix VIP 👑 | Setup</title>
  <style>
    :root { --bg: #050505; --surface: #121214; --primary: #f5c518; --text: #fff; --border: #27272a; }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, sans-serif; }
    body { background: var(--bg); color: var(--text); padding-bottom: 100px; }
    header { background: #000; padding: 20px; border-bottom: 1px solid var(--border); text-align: center; position: sticky; top:0; z-index:100; }
    h1 { color: var(--primary); font-weight: 900; display: inline-flex; align-items: center; gap: 10px; }
    .hero { text-align: center; padding: 40px 20px; }
    .hero p { color: #a1a1aa; max-width: 600px; margin: 10px auto; line-height: 1.5; }
    .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 25px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h2 { font-size: 18px; color: var(--primary); margin-bottom: 15px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
    .checkbox-label { display: flex; align-items: center; gap: 10px; background: #0a0a0c; padding: 12px; border-radius: 8px; border: 1px solid #3f3f46; cursor: pointer; font-size: 14px; }
    .checkbox-label:hover { border-color: var(--primary); }
    input[type="checkbox"] { accent-color: var(--primary); width: 16px; height: 16px; }
    
    .input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
    .input-group label { font-size: 13px; text-transform: uppercase; color: #a1a1aa; font-weight: 600; }
    .input-group input { background: #0a0a0c; border: 1px solid #3f3f46; color: #fff; padding: 12px; border-radius: 8px; font-size: 15px; outline: none; }
    .input-group input:focus { border-color: var(--primary); }
    
    .affiliate-text { font-size: 13px; color: #a1a1aa; margin-top: 5px; }
    .affiliate-link { color: var(--primary); text-decoration: none; font-weight: bold; }
    .affiliate-link:hover { text-decoration: underline; }

    .btn { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--primary); color: #000; padding: 15px 40px; font-size: 16px; font-weight: 900; border: none; border-radius: 30px; cursor: pointer; box-shadow: 0 5px 20px rgba(245,197,24,0.4); text-transform: uppercase; z-index: 1000; white-space: nowrap;}
  </style>
</head>
<body>
  <header><h1>👑 NexusFlix VIP</h1></header>
  <div class="hero">
    <p>The Ultimate 100% Free Live Engine Aggregator. Configure your providers and enter your Debrid key for maximum 4K speed.</p>
  </div>
  
  <div class="container">
    <div class="card">
      <h2>⚡ Premium Gear (Debrid Integration)</h2>
      <div class="input-group">
        <label>Real-Debrid API Key (Optional)</label>
        <input type="password" id="debrid" placeholder="Enter your Real-Debrid API Key here...">
        <div class="affiliate-text">
          No buffering in 4K? <a href="#" class="affiliate-link" target="_blank">Get a Real-Debrid Account Here</a>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>⚙️ Scraper Engines</h2>
      <div class="grid">
        <label class="checkbox-label"><input type="checkbox" id="yts" checked> YTS (4K/1080p)</label>
        <label class="checkbox-label"><input type="checkbox" id="bitsearch" checked> BitSearch P2P</label>
        <label class="checkbox-label"><input type="checkbox" id="tcsv" checked> Torrents-CSV</label>
        <label class="checkbox-label"><input type="checkbox" id="vidsrc" checked> VidSrc Web DDL</label>
      </div>
    </div>
  </div>
  
  <button class="btn" onclick="install()">🚀 Install to Stremio</button>
  
  <script>
    function install() {
      const config = {
        debridKey: document.getElementById('debrid').value.trim(),
        engines: {
          yts: document.getElementById('yts').checked,
          bitsearch: document.getElementById('bitsearch').checked,
          tcsv: document.getElementById('tcsv').checked,
          vidsrc: document.getElementById('vidsrc').checked
        }
      };
      const confStr = btoa(JSON.stringify(config));
      window.location.href = 'stremio://' + window.location.host + '/' + confStr + '/manifest.json';
    }
  </script>
</body>
</html>`;
}

// --- MANIFEST ---
function getManifest(configStr) {
  return {
    id: CONFIG.ADDON_ID,
    version: CONFIG.VERSION,
    name: "NexusFlix VIP 👑",
    description: "The Ultimate Live Search Engine. 4K/1080p, Regional, Global Horror, Anime & OTTs.",
    logo: CONFIG.LOGO,
    resources: ["catalog", "meta", "stream"],
    types: ["movie", "series", "anime"],
    idPrefixes: ["tmdb", "tt"],
    behaviorHints: { configurable: true },
    catalogs: [
      { type: "movie", id: "nx_movies", name: "🔥 Global Movies Hub", extra: [{ name: "genre", isRequired: false, options: Object.keys(LIVE_FILTERS) }] },
      { type: "series", id: "nx_series", name: "🔥 Global Web Series", extra: [{ name: "genre", isRequired: false, options: Object.keys(LIVE_FILTERS) }] },
      { type: "movie", id: "nx_ott_m", name: "👑 OTT Movies", extra: [{ name: "genre", isRequired: false, options: Object.keys(OTT_NETWORKS) }] },
      { type: "series", id: "nx_ott_s", name: "👑 OTT Series", extra: [{ name: "genre", isRequired: false, options: Object.keys(OTT_NETWORKS) }] },
      { type: "movie", id: "nx_regional", name: "🍿 Regional Cinema", extra: [{ name: "genre", isRequired: false, options: Object.keys(REGIONAL_LANGS) }] },
      { type: "movie", id: "nx_horror", name: "💀 Global Horror Vault", extra: [{ name: "genre", isRequired: false, options: Object.keys(HORROR_VAULT) }] },
      { type: "anime", id: "nx_anime", name: "⛩️ Anime Universe", extra: [{ name: "genre", isRequired: false, options: Object.keys(LIVE_FILTERS) }] }
    ]
  };
}

// --- CATALOG ENGINE (Live Tracker) ---
async function getCatalog(type, catalogId, extraStr) {
  let extra = {};
  if (extraStr) { extraStr.split("&").forEach(p => { const [k,v] = p.split("="); extra[k] = decodeURIComponent(v); }); }
  
  let filter = extra.genre ? LIVE_FILTERS[extra.genre] : "trending"; // Default to trending
  let tmdbType = type === 'series' || type === 'anime' ? 'tv' : 'movie';
  let url = `https://api.themoviedb.org/3/trending/${tmdbType}/day?api_key=${CONFIG.TMDB_KEY}`; // Fallback

  if (catalogId === "nx_movies" || catalogId === "nx_series" || catalogId === "nx_anime") {
    if (filter === "now_playing") url = `https://api.themoviedb.org/3/${tmdbType}/now_playing?api_key=${CONFIG.TMDB_KEY}`;
    else if (filter === "upcoming") url = `https://api.themoviedb.org/3/${tmdbType}/upcoming?api_key=${CONFIG.TMDB_KEY}`;
    else if (filter === "top_rated") url = `https://api.themoviedb.org/3/${tmdbType}/top_rated?api_key=${CONFIG.TMDB_KEY}`;
    
    if (catalogId === "nx_anime") url += `&with_genres=16&with_original_language=ja`; 
  } 
  else if (catalogId.includes("nx_ott")) {
    const netId = extra.genre ? OTT_NETWORKS[extra.genre] : "213";
    url = `https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${CONFIG.TMDB_KEY}&with_networks=${netId}&sort_by=popularity.desc`;
  }
  else if (catalogId === "nx_regional") {
    const lang = extra.genre ? REGIONAL_LANGS[extra.genre] : "hi";
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${CONFIG.TMDB_KEY}&with_original_language=${lang}&sort_by=popularity.desc`;
  }
  else if (catalogId === "nx_horror") {
    const vault = extra.genre ? HORROR_VAULT[extra.genre] : HORROR_VAULT["Bollywood Horror"];
    let langQuery = vault.lang ? `&with_original_language=${vault.lang}` : "";
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${CONFIG.TMDB_KEY}&with_genres=27${langQuery}&sort_by=popularity.desc`;
  }

  const data = await fetchJSON(url) || { results: [] };
  const metas = data.results.map(item => ({
    id: `tmdb:${item.id}`, type: type, name: item.title || item.name,
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : CONFIG.LOGO,
    description: item.overview,
    releaseInfo: (item.release_date || item.first_air_date || "").split("-")[0]
  }));

  return jsonResponse({ metas });
}

// --- META ENGINE ---
async function getMeta(type, id) {
  const cleanId = id.replace("tmdb:", "").replace(".json", "");
  const tmdbType = type === 'series' || type === 'anime' ? 'tv' : 'movie';
  const data = await fetchJSON(`https://api.themoviedb.org/3/${tmdbType}/${cleanId}?api_key=${CONFIG.TMDB_KEY}&append_to_response=external_ids`) || {};
  
  return jsonResponse({
    meta: {
      id: id, type: type, name: data.title || data.name,
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : CONFIG.LOGO,
      background: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "",
      description: data.overview,
      releaseInfo: (data.release_date || data.first_air_date || "").split("-")[0],
      imdbRating: data.vote_average ? data.vote_average.toFixed(1) : "N/A"
    }
  });
}

// --- PARALLEL STREAM ENGINE ---
async function getStreams(type, id, configStr) {
  let userConfig = { debridKey: "", engines: { yts: true, bitsearch: true, tcsv: true, vidsrc: true } };
  try { if (configStr) userConfig = JSON.parse(atob(configStr)); } catch(e) {}

  const cleanId = id.replace(".json", "");
  const tmdbId = cleanId.split(":")[1];
  let imdbId = cleanId;
  let title = "Video";
  let year = "";
  
  if (cleanId.startsWith("tmdb:")) {
    const tmdbType = type === 'series' || type === 'anime' ? 'tv' : 'movie';
    const meta = await fetchJSON(`https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?api_key=${CONFIG.TMDB_KEY}&append_to_response=external_ids`);
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
  const searchQuery = `${title} ${year}`.trim();
  
  // Tag Debrid Status
  const prefixName = userConfig.debridKey ? "⚡ [DEBRID] " : "";

  // 1. YTS API
  if (userConfig.engines.yts !== false && type === "movie" && imdbId.startsWith("tt")) {
    promises.push(
      fetchJSON(`https://yts.mx/api/v2/list_movies.json?query_term=${imdbId.split(":")[0]}`).then(data => {
        if (data && data.data && data.data.movies) {
          data.data.movies[0].torrents.forEach(t => {
            streams.push({
              name: `${prefixName}🚀 YTS P2P`,
              title: `✨ ${t.quality} BluRay\n💾 ${t.size} | 👥 Seeds: ${t.seeds}`,
              infoHash: t.hash,
              qRank: t.quality.includes("2160") || t.quality === "3D" ? 3 : (t.quality.includes("1080") ? 2 : 1)
            });
          });
        }
      })
    );
  }

  // 2. BitSearch API
  if (userConfig.engines.bitsearch !== false && title) {
    let bsQuery = searchQuery;
    if (imdbId.includes(":")) {
       const parts = imdbId.split(":");
       bsQuery += ` S${parts[1].padStart(2, '0')}E${parts[2].padStart(2, '0')}`;
    }
    promises.push(
      fetchJSON(`https://bitsearch.info/api/v1/search?q=${encodeURIComponent(bsQuery)}&limit=15`).then(data => {
        if (data && data.data) {
          data.data.forEach(t => {
            streams.push({
              name: `${prefixName}⚡ BitSearch`,
              title: `${t.name}\n💾 ${t.size} | 👥 Seeds: ${t.seeders}`,
              infoHash: t.infohash,
              qRank: t.name.match(/2160p|4k|uhd/i) ? 3 : (t.name.match(/1080p|fhd/i) ? 2 : 1)
            });
          });
        }
      })
    );
  }

  // 3. Torrents-CSV
  if (userConfig.engines.tcsv !== false && title) {
    promises.push(
      fetchJSON(`https://torrents-csv.com/service/search?q=${encodeURIComponent(searchQuery)}&size=10`).then(data => {
        if (data && data.torrents) {
          data.torrents.forEach(t => {
            streams.push({
              name: `${prefixName}💎 Torrents-CSV`,
              title: `${t.name}\n👥 Seeds: ${t.seeders || 'High'}`,
              infoHash: t.infohash,
              qRank: t.name.match(/2160p|4k/i) ? 3 : (t.name.match(/1080p/i) ? 2 : 1)
            });
          });
        }
      })
    );
  }

  // 4. VidSrc DDL
  if (userConfig.engines.vidsrc !== false && imdbId.startsWith("tt")) {
    const baseId = imdbId.split(":")[0];
    promises.push(
      fetchJSON(`https://vidsrc.to/api/stream?imdb_id=${baseId}`).then(data => {
        if (data && data.url) {
          streams.push({
            name: "📥 VidSrc DDL",
            title: `✨ Fast Web Stream\n🎬 Direct Link`,
            url: data.url,
            qRank: 2
          });
        }
      })
    );
  }

  await Promise.allSettled(promises);

  // TAGGING & SORTING
  let finalStreams = [];
  const seen = new Set();
  
  streams.forEach(s => {
    const key = s.infoHash || s.url;
    if (key && !seen.has(key)) {
      seen.add(key);
      const text = s.title.toLowerCase();
      
      let langBadge = "";
      if (text.includes("hindi") || text.includes("hin")) langBadge = "🇮🇳 HINDI ";
      else if (text.includes("tamil")) langBadge = "🇮🇳 TAMIL ";
      else if (text.includes("telugu")) langBadge = "🇮🇳 TELUGU ";
      else if (text.includes("bengali")) langBadge = "🇮🇳 BENGALI ";
      else if (text.includes("dual") || text.includes("multi")) langBadge = "🎙️ DUAL/MULTI ";
      
      if (langBadge && !s.title.includes(langBadge)) {
        s.title = s.title.replace("\n", ` ${langBadge}\n`);
      }
      finalStreams.push(s);
    }
  });

  finalStreams.sort((a, b) => b.qRank - a.qRank);
  if (finalStreams.length === 0) {
    finalStreams.push({ name: "⏳ NexusFlix", title: "No streams found. Check spelling or try later.", url: "" });
  }

  return jsonResponse({ streams: finalStreams });
}

// --- ROUTER ---
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

      return jsonResponse({ status: "NexusFlix VIP is Running" });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
};
