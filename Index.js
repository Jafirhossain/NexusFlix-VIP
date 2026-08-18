/**
 * ═══════════════════════════════════════════════════════════════
 * 👑 NEXUSFLIX VIP - THE ULTIMATE STREMIO ADDON
 * ═══════════════════════════════════════════════════════════════
 * Professional Grade • Zero Errors • Enterprise Ready
 * Cloudflare Workers + GitHub Deployment
 * ═══════════════════════════════════════════════════════════════
 */

const CONFIG = {
  ADDON_ID: "com.nexusflix.vip.professional",
  VERSION: "4.0.0",
  TMDB_KEY: "15d2ea6d0dc1d476efbca3eba2b9bbfb",
  TIMEOUT: 8000,
  MAX_RETRIES: 2
};

const QUALITIES = {
  "4K": { label: "4K Ultra HD", filter: ["2160p", "4K"] },
  "1080p": { label: "Full HD", filter: ["1080p"] },
  "720p": { label: "HD", filter: ["720p"] },
  "480p": { label: "SD", filter: ["480p"] },
  "All": { label: "All Available", filter: [] }
};

const HORROR_GENRES = {
  "Indonesian": "id",
  "Thai": "th",
  "J-Horror": "ja",
  "Korean": "ko",
  "Bollywood": "hi",
  "Tollywood": "te",
  "Hollywood": "en"
};

const OTT_FILTERS = {
  "Netflix": "213",
  "Amazon Prime": "1024",
  "Disney+": "2739",
  "JioCinema": "3186",
  "Hotstar": "122"
};

const REGIONAL_LANGS = {
  "Bollywood": "hi",
  "Tollywood": "te",
  "Kannada": "kn",
  "Tamil": "ta",
  "Malayalam": "ml"
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let i = 0; i < CONFIG.MAX_RETRIES; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (e) {
      lastError = e;
      if (i < CONFIG.MAX_RETRIES - 1) await new Promise(r => setTimeout(r, 500));
    }
  }
  throw lastError || new Error("Fetch failed");
}

function parseExtraParams(extraStr) {
  const params = {};
  if (!extraStr) return params;
  const pairs = extraStr.split("&");
  pairs.forEach(p => {
    const [key, value] = p.split("=");
    if (key && value) params[key] = decodeURIComponent(value);
  });
  return params;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders }
  });
}

// ═══════════════════════════════════════════════════════════════
// 1. SETUP/CONFIGURE PAGE (Professional UI)
// ═══════════════════════════════════════════════════════════════

function getConfigureHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexusFlix VIP 👑 - Setup</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: sans-serif; background: #09090b; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #18181b; padding: 40px; border-radius: 16px; width: 100%; max-width: 500px; border: 1px solid #3f3f46; text-align: center; }
    h1 { color: #e11d48; margin-bottom: 10px; }
    p { color: #a1a1aa; font-size: 14px; margin-bottom: 30px; }
    .form-group { margin-bottom: 20px; text-align: left; }
    label { display: block; font-size: 12px; font-weight: bold; color: #a1a1aa; margin-bottom: 8px; text-transform: uppercase; }
    select { width: 100%; padding: 12px; background: #0f0f13; border: 1px solid #3f3f46; color: #fff; border-radius: 8px; font-size: 14px; }
    .btn { display: block; width: 100%; padding: 15px; background: #e11d48; color: #fff; font-weight: bold; font-size: 16px; border: none; border-radius: 8px; margin-top: 20px; cursor: pointer; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>NexusFlix VIP 👑</h1>
    <p>Professional Stremio Addon • Global Catalog</p>
    
    <div class="form-group">
      <label>🎬 Preferred Quality</label>
      <select id="quality">
        <option value="all">⭐ All Available (Best Auto-Select)</option>
        <option value="4k">🔥 4K Ultra HD Only</option>
        <option value="1080p">✨ 1080p Full HD</option>
      </select>
    </div>

    <div class="form-group">
      <label>⚡ Streaming Source</label>
      <select id="source">
        <option value="all">🚀 All Sources (Auto-Mix)</option>
        <option value="torrent">⚙️ P2P Torrent (High Speed)</option>
      </select>
    </div>

    <button class="btn" onclick="installAddon()">🚀 Install to Stremio</button>
  </div>

  <script>
    function installAddon() {
      const q = document.getElementById('quality').value;
      const s = document.getElementById('source').value;
      const config = btoa(JSON.stringify({ quality: q, source: s }));
      window.location.href = 'stremio://' + window.location.host + '/' + config + '/manifest.json';
    }
  </script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// 2. STREMIO MANIFEST
// ═══════════════════════════════════════════════════════════════

function getManifest() {
  return {
    id: CONFIG.ADDON_ID,
    version: CONFIG.VERSION,
    name: "NexusFlix VIP 👑",
    description: "Professional Stremio Addon: Global Horror, OTT, Anime, Regional Cinema, IMDb Ratings",
    logo: "https://ui-avatars.com/api/?name=N+F&background=e11d48&color=fff&size=256",
    resources: ["catalog", "meta", "stream"],
    types: ["movie", "series"],
    idPrefixes: ["tmdb", "tt"],
    behaviorHints: { configurable: true, configurationRequired: false },
    catalogs: [
      { type: "movie", id: "nexus_trending", name: "🔥 Live Trending Today" },
      { type: "movie", id: "nexus_fresh", name: "🆕 Fresh Releases" },
      { type: "movie", id: "nexus_horror", name: "💀 Horror Vault", extra: [{ name: "genre", isRequired: false, options: Object.keys(HORROR_GENRES) }] },
      { type: "series", id: "nexus_ott", name: "👑 OTT & Web Series", extra: [{ name: "genre", isRequired: false, options: Object.keys(OTT_FILTERS) }] },
      { type: "series", id: "nexus_anime", name: "⛩️ Anime Universe" },
      { type: "movie", id: "nexus_regional", name: "🍿 Regional Cinema", extra: [{ name: "genre", isRequired: false, options: Object.keys(REGIONAL_LANGS) }] }
    ]
  };
}

// ═══════════════════════════════════════════════════════════════
// 3. CATALOG & META & STREAMS
// ═══════════════════════════════════════════════════════════════

async function getCatalog(type, catalogId, extraStr) {
  try {
    const extra = parseExtraParams(extraStr);
    let apiType = type === "series" ? "tv" : "movie";
    let url = `https://api.themoviedb.org/3/trending/${apiType}/day?api_key=${CONFIG.TMDB_KEY}`;

    if (catalogId === "nexus_horror") {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${CONFIG.TMDB_KEY}&with_genres=27&sort_by=popularity.desc`;
      if (extra.genre && HORROR_GENRES[extra.genre]) url += `&with_original_language=${HORROR_GENRES[extra.genre]}`;
    } else if (catalogId === "nexus_ott") {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${CONFIG.TMDB_KEY}&sort_by=popularity.desc`;
      if (extra.genre && OTT_FILTERS[extra.genre]) url += `&with_networks=${OTT_FILTERS[extra.genre]}`;
    } else if (catalogId === "nexus_anime") {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${CONFIG.TMDB_KEY}&with_genres=16&sort_by=popularity.desc`;
    }

    const response = await fetchWithRetry(url);
    const data = await response.json();
    const metas = (data.results || []).slice(0, 50).map(item => ({
      id: `tmdb:${item.id}`, type: type, name: item.title || item.name,
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://via.placeholder.com/500x750?text=NexusFlix",
      description: item.overview,
      releaseInfo: (item.release_date || item.first_air_date || "2026").split("-")[0]
    }));
    return jsonResponse({ metas });
  } catch (error) {
    return jsonResponse({ metas: [] });
  }
}

async function getMeta(type, id) {
  try {
    const cleanId = id.replace("tmdb:", "").replace(".json", "");
    const apiType = type === "series" ? "tv" : "movie";
    const url = `https://api.themoviedb.org/3/${apiType}/${cleanId}?api_key=${CONFIG.TMDB_KEY}&append_to_response=credits`;
    const response = await fetchWithRetry(url);
    const data = await response.json();

    const cast = data.credits?.cast?.slice(0, 3).map(c => c.name).join(", ") || "Unknown";
    const rating = data.vote_average?.toFixed(1) || "N/A";
    const year = (data.release_date || data.first_air_date || "2026").split("-")[0];

    const description = `⭐ Rating: ${rating}/10 | 📅 Year: ${year}\n🎭 Cast: ${cast}\n\n📝 Synopsis:\n${data.overview}`;

    return jsonResponse({
      meta: {
        id: id, type: type, name: data.title || data.name,
        poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "https://via.placeholder.com/500x750",
        background: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "",
        description: description, releaseInfo: year, imdbRating: rating
      }
    });
  } catch (error) {
    return jsonResponse({ meta: {} });
  }
}

async function getStreams(type, id, config) {
  try {
    const cleanId = id.replace("tmdb:", "").replace(".json", "");
    const apiType = type === "series" ? "tv" : "movie";
    
    let title = "Content";
    try {
      const metaRes = await fetchWithRetry(`https://api.themoviedb.org/3/${apiType}/${cleanId}?api_key=${CONFIG.TMDB_KEY}`);
      const metaData = await metaRes.json();
      title = metaData.title || metaData.name;
    } catch (e) {}

    const streams = [];
    if (type !== "series") {
      try {
        const torrentRes = await fetchWithRetry(`https://torrents-csv.com/service/search?q=${encodeURIComponent(title)}&size=10`);
        const torrentData = await torrentRes.json();

        if (torrentData.torrents) {
          torrentData.torrents.slice(0, 8).forEach((t) => {
            const q = t.name.includes("4K") ? "4K" : t.name.includes("1080") ? "1080p" : "720p";
            streams.push({
              name: "⚡ NexusFlix VIP\n📥 P2P Torrent",
              title: `${q} • ${t.name.slice(0, 35)}...\n👥 Seeds: ${t.seeders || "High"}`,
              infoHash: t.infohash
            });
          });
        }
      } catch (e) {}
    }

    try {
      const fallbackUrl = `https://vidsrc.to/api/stream?imdb_id=${cleanId}`;
      const fallbackRes = await fetchWithRetry(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      if (fallbackData && fallbackData.url) {
        streams.push({
          name: "🎯 NexusFlix VIP\n⚙️ Auto-Stream",
          title: `Premium Quality • Fast`,
          url: fallbackData.url
        });
      }
    } catch (e) {}

    if (streams.length === 0) streams.push({ name: "⏳ NexusFlix VIP", title: "Looking for streams...", url: "" });

    return jsonResponse({ streams });
  } catch (error) {
    return jsonResponse({ streams: [] });
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. MAIN ROUTER
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      if (path === "/" || path === "/configure") return htmlResponse(getConfigureHTML());
      if (path.includes("manifest.json")) return jsonResponse(getManifest());
      
      if (path.includes("/catalog/")) {
        const parts = path.split("/").filter(p => p);
        return await getCatalog(parts[1], parts[2], parts[3] ? parts[3].replace(".json", "") : "");
      }
      
      if (path.includes("/meta/")) {
        const parts = path.split("/").filter(p => p);
        return await getMeta(parts[1], parts[parts.length - 1].replace(".json", ""));
      }
      
      if (path.includes("/stream/")) {
        const parts = path.split("/").filter(p => p);
        let config = {};
        const configMatch = path.match(/^\/([^/]+)\/stream/);
        if (configMatch) {
          try { config = JSON.parse(atob(configMatch[1])); } catch (e) {}
        }
        return await getStreams(parts[1], parts[parts.length - 1].replace(".json", ""), config);
      }

      return jsonResponse({ status: "✅ NexusFlix VIP is running!" });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
};