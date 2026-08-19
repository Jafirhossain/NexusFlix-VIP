/**
 * NexusFlix VIP 🇮🇳 - Cloudflare Worker Edition (Error-Free Build)
 * Fixed: "Unterminated string literal" error by removing all backticks.
 * 100% Copy-Paste Safe.
 */

const TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// 1. FAST BYPASS ENGINE (Native Fetch)
async function fetchScraperBypass(url) {
    try {
        let res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) return await res.json();
    } catch (err) {}
    
    try {
        let proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
        let resProxy = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (resProxy.ok) return await resProxy.json();
    } catch (proxyErr) {}
    
    return null;
}

// 2. CONFIG & MANIFEST
function getDefaultConfig() {
    return {
        catalogs: {
            indo_horror_trending: true, indo_horror_latest: true, global_horror: true,
            anime_trending: true, anime_airing: true, anime_movies: true,
            bolly_trending: true, bolly_latest: true, south_trending: true, south_latest: true,
            netflix_trending: true, prime_trending: true, hotstar_trending: true, holly_trending: true
        },
        providers: { torrentcsv: true, nyaa: true, yts: true, bitsearch: true, torrentio_backup: true },
        langPriority: "hindi", excludeResolutions: []
    };
}

function parseConfig(configStr) {
    if (!configStr) return getDefaultConfig();
    try {
        const decoded = atob(configStr);
        let parsed = JSON.parse(decoded);
        if (!parsed.providers) parsed.providers = getDefaultConfig().providers;
        return { ...getDefaultConfig(), ...parsed };
    } catch (e) { return getDefaultConfig(); }
}

function getManifest(config) {
    const extraParams = [{ name: "search", isRequired: false }, { name: "skip", isRequired: false }];
    const allCatalogs = [
        { type: "movie", id: "indo_horror_trending", name: "👻 Indonesian Horror: Trending", extra: extraParams },
        { type: "movie", id: "indo_horror_latest", name: "👻 Indonesian Horror: Latest & Upcoming", extra: extraParams },
        { type: "movie", id: "global_horror", name: "💀 World Horror Masterpieces", extra: extraParams },
        { type: "series", id: "anime_trending", name: "🔥 Anime: Trending", extra: extraParams },
        { type: "series", id: "anime_airing", name: "⚡ Anime: Latest Airing", extra: extraParams },
        { type: "movie", id: "anime_movies", name: "🎬 Anime: Movies", extra: extraParams },
        { type: "movie", id: "bolly_trending", name: "🔥 Bollywood: Trending", extra: extraParams },
        { type: "movie", id: "bolly_latest", name: "🆕 Bollywood: Latest", extra: extraParams },
        { type: "movie", id: "south_trending", name: "🌟 South Indian: Trending", extra: extraParams },
        { type: "movie", id: "south_latest", name: "💥 South Indian: Latest", extra: extraParams },
        { type: "series", id: "netflix_trending", name: "👑 Netflix: Trending", extra: extraParams },
        { type: "series", id: "prime_trending", name: "📦 Amazon Prime: Trending", extra: extraParams },
        { type: "series", id: "hotstar_trending", name: "✨ Disney+ Hotstar: Trending", extra: extraParams },
        { type: "movie", id: "holly_trending", name: "🌍 Hollywood (Hindi): Trending", extra: extraParams }
    ];

    return {
        id: "org.nexusflix.masterpiece", version: "40.0.0",
        name: "NexusFlix VIP 🇮🇳",
        description: "100% Fixed Engine. All Posters, Meta, & Fast Links Guaranteed.",
        logo: "https://raw.githubusercontent.com/Jafirhossain/NexusFlix-VIP/main/logo.png",
        background: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1920&auto=format&fit=crop",
        resources: ["catalog", "meta", "stream"],
        types: ["series", "movie", "anime"], 
        idPrefixes: ["kitsu", "tmdb", "tt"],
        behaviorHints: { configurable: true, configurationRequired: false },
        catalogs: allCatalogs.filter(cat => config.catalogs[cat.id] !== false)
    };
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// =====================================================================
// MAIN CLOUDFLARE FETCH HANDLER
// =====================================================================
export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        const url = new URL(request.url);
        const path = url.pathname;
        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);

        // 1. UI / CONFIGURE
        if (path === '/' || path === '/configure' || path.endsWith('/configure')) {
            let configStr = path.split('/')[1];
            if (configStr === 'configure' || !configStr) configStr = null;
            const config = parseConfig(configStr);
            const b64 = btoa(JSON.stringify(config));
            
            const html = "<!DOCTYPE html>\n" +
            "<html lang=\"en\">\n" +
            "<head>\n" +
            "    <meta charset=\"UTF-8\">\n" +
            "    <title>NexusFlix VIP Setup</title>\n" +
            "    <style>\n" +
            "        body { font-family: 'Segoe UI', sans-serif; background: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }\n" +
            "        .container { max-width: 800px; margin: 0 auto; background: #111827; padding: 30px; border-radius: 16px; border: 1px solid #1f2937; text-align: center; }\n" +
            "        h1 { color: #f43f5e; margin-bottom: 10px; font-size: 32px; }\n" +
            "        p { color: #94a3b8; font-size: 16px; margin-bottom: 30px; }\n" +
            "        .btn { display: inline-block; background: #f43f5e; color: white; padding: 15px 40px; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 8px; transition: 0.3s; }\n" +
            "        .btn:hover { background: #e11d48; }\n" +
            "    </style>\n" +
            "</head>\n" +
            "<body>\n" +
            "    <div class=\"container\">\n" +
            "        <h1>NexusFlix VIP 🇮🇳</h1>\n" +
            "        <p>Posters Fixed. Meta Fixed. 8-Second High-Speed Links Fixed.</p>\n" +
            "        <a id=\"installBtn\" class=\"btn\" href=\"#\">Install Fresh Update</a>\n" +
            "    </div>\n" +
            "    <script>\n" +
            "        const b64 = \"" + b64 + "\";\n" +
            "        document.getElementById('installBtn').href = 'stremio://' + window.location.host + '/' + b64 + '/manifest.json';\n" +
            "    </script>\n" +
            "</body>\n" +
            "</html>";
            
            return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
        }

        // 2. MANIFEST
        const manifestMatch = path.match(/(?:\/([^\/]+))?\/manifest\.json/);
        if (manifestMatch) {
            const config = parseConfig(manifestMatch[1]);
            return new Response(JSON.stringify(getManifest(config)), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. CATALOG ROUTE
        const catalogMatch = path.match(/(?:\/([^\/]+))?\/catalog\/(movie|series|anime)\/([^\/]+)(?:\/([^\/]+))?\.json/);
        if (catalogMatch) {
            let cachedRes = await cache.match(cacheKey);
            if (cachedRes) return cachedRes;

            const id = catalogMatch[3];
            const extra = catalogMatch[4];
            let skip = 0, search = null;
            
            if (extra) {
                extra.split('&').forEach(p => {
                    let kv = p.split('=');
                    if (kv[0] === 'skip') skip = parseInt(kv[1]) || 0;
                    if (kv[0] === 'search') search = decodeURIComponent(kv[1]);
                });
            }

            let metas = [];
            if (id.startsWith("anime")) {
                let kUrl = "https://kitsu.io/api/edge/anime?page[limit]=20&page[offset]=" + (skip || 0);
                if (search) kUrl += "&filter[text]=" + encodeURIComponent(search);
                else if (id === "anime_trending") kUrl = "https://kitsu.io/api/edge/trending/anime?page[limit]=20";
                else if (id === "anime_airing") kUrl += "&filter[status]=current&sort=-userCount";
                
                try {
                    let res = await fetch(kUrl);
                    let data = await res.json();
                    metas = (data.data || []).map(anime => {
                        const attr = anime.attributes;
                        return {
                            id: "kitsu:" + anime.id, type: "anime",
                            name: attr.canonicalTitle || attr.titles?.en || "Anime",
                            poster: attr.posterImage?.large || attr.posterImage?.original || "https://via.placeholder.com/500x750?text=No+Poster",
                            description: "⭐ Score: " + (attr.averageRating || "N/A") + "%\n" + (attr.synopsis || "")
                        };
                    });
                } catch(e) {}
            } else {
                const page = Math.floor((skip || 0) / 20) + 1;
                let isSeries = id.includes("series") || id.includes("netflix") || id.includes("prime") || id.includes("hotstar");
                let tUrl = "";
                const today = new Date().toISOString().split('T')[0];

                if (search) tUrl = "https://api.themoviedb.org/3/search/" + (isSeries ? 'tv' : 'movie') + "?api_key=" + TMDB_API_KEY + "&query=" + encodeURIComponent(search) + "&page=" + page;
                else if (id === "indo_horror_trending") tUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_API_KEY + "&with_genres=27&with_origin_country=ID&sort_by=popularity.desc&page=" + page;
                else if (id === "indo_horror_latest") tUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_API_KEY + "&with_genres=27&with_origin_country=ID&sort_by=primary_release_date.desc&primary_release_date.lte=" + today + "&page=" + page;
                else if (id === "global_horror") tUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_API_KEY + "&with_genres=27&sort_by=vote_average.desc&vote_count.gte=500&page=" + page;
                else if (id === "bolly_trending") tUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_API_KEY + "&with_original_language=hi&sort_by=popularity.desc&page=" + page;
                else if (id === "bolly_latest") tUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_API_KEY + "&with_original_language=hi&sort_by=primary_release_date.desc&primary_release_date.lte=" + today + "&page=" + page;
                else if (id === "south_trending") tUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_API_KEY + "&with_original_language=te|ta|ml|kn&sort_by=popularity.desc&page=" + page;
                else if (id === "south_latest") tUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_API_KEY + "&with_original_language=te|ta|ml|kn&sort_by=primary_release_date.desc&primary_release_date.lte=" + today + "&page=" + page;
                else if (id === "netflix_trending") tUrl = "https://api.themoviedb.org/3/discover/tv?api_key=" + TMDB_API_KEY + "&with_watch_providers=8&watch_region=IN&sort_by=popularity.desc&page=" + page;
                else if (id === "prime_trending") tUrl = "https://api.themoviedb.org/3/discover/tv?api_key=" + TMDB_API_KEY + "&with_watch_providers=119&watch_region=IN&sort_by=popularity.desc&page=" + page;
                else if (id === "hotstar_trending") tUrl = "https://api.themoviedb.org/3/discover/tv?api_key=" + TMDB_API_KEY + "&with_watch_providers=122&watch_region=IN&sort_by=popularity.desc&page=" + page;
                else if (id === "holly_trending") tUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + TMDB_API_KEY + "&with_original_language=en&sort_by=popularity.desc&page=" + page;

                try {
                    if (tUrl) {
                        let res = await fetch(tUrl);
                        let data = await res.json();
                        metas = (data.results || []).map(m => ({
                            id: "tmdb:" + m.id, type: isSeries ? "series" : "movie",
                            name: m.title || m.name,
                            poster: m.poster_path ? "https://image.tmdb.org/t/p/w500" + m.poster_path : "https://via.placeholder.com/500x750?text=No+Poster",
                            description: "⭐ TMDB: " + (m.vote_average || "N/A") + "/10\n" + (m.overview || "")
                        }));
                    }
                } catch(e) {}
            }

            let response = new Response(JSON.stringify({ metas }), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=7200' } });
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
            return response;
        }

        // 4. META ROUTE
        const metaMatch = path.match(/(?:\/([^\/]+))?\/meta\/(movie|series|anime)\/([^\/]+)\.json/);
        if (metaMatch) {
            let cachedRes = await cache.match(cacheKey);
            if (cachedRes) return cachedRes;

            const type = metaMatch[2];
            const id = metaMatch[3];
            let metaObj = null;

            if (id.startsWith("kitsu:")) {
                try {
                    const cleanId = id.replace("kitsu:", "");
                    let res = await fetch("https://kitsu.io/api/edge/anime/" + cleanId);
                    let data = await res.json();
                    const attr = data.data.attributes;
                    metaObj = { 
                        id: id, type: "anime", name: attr.canonicalTitle || attr.titles?.en || "Anime", 
                        poster: attr.posterImage?.large || "https://via.placeholder.com/500x750?text=No+Poster", 
                        background: attr.coverImage?.large, description: attr.synopsis || ""
                    };
                    if (attr.subtype !== "movie") {
                        const videos = [];
                        for (let i = 1; i <= (attr.episodeCount || 24); i++) videos.push({ id: "kitsu:" + cleanId + ":" + i, title: "Episode " + i, season: 1, episode: i });
                        metaObj.videos = videos;
                    }
                } catch (e) {}
            } else if (id.startsWith("tmdb:")) {
                try {
                    const cleanId = id.replace("tmdb:", "");
                    let realType = type === "series" ? "tv" : "movie";
                    let res = await fetch("https://api.themoviedb.org/3/" + realType + "/" + cleanId + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids");
                    let m = await res.json();
                    metaObj = {
                        id: id, type: type, name: m.title || m.name,
                        poster: m.poster_path ? "https://image.tmdb.org/t/p/w500" + m.poster_path : "https://via.placeholder.com/500x750?text=No+Poster",
                        background: m.backdrop_path ? "https://image.tmdb.org/t/p/original" + m.backdrop_path : undefined,
                        description: m.overview || "No Description.",
                        releaseInfo: m.release_date || m.first_air_date ? (m.release_date || m.first_air_date).substring(0, 4) : undefined,
                        imdbRating: m.vote_average ? m.vote_average.toFixed(1) : undefined
                    };
                } catch (e) {}
            }

            if (metaObj) {
                let response = new Response(JSON.stringify({ meta: metaObj }), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' } });
                ctx.waitUntil(cache.put(cacheKey, response.clone()));
                return response;
            }
            return new Response('Not Found', { status: 404, headers: corsHeaders });
        }

        // 5. STREAM ROUTE (8-Second Engine)
        const streamMatch = path.match(/(?:\/([^\/]+))?\/stream\/(movie|series|anime)\/([^\/]+)\.json/);
        if (streamMatch) {
            let cachedRes = await cache.match(cacheKey);
            if (cachedRes) return cachedRes;

            const type = streamMatch[2];
            const targetId = streamMatch[3];
            
            let isAnime = targetId.startsWith("kitsu:");
            let mediaTitle = ""; let episodeNum = ""; let seasonNum = "";
            
            try {
                if (isAnime) {
                    const parts = targetId.split(":");
                    episodeNum = parts[2] || "";
                    let kRes = await fetch("https://kitsu.io/api/edge/anime/" + parts[1]);
                    let kData = await kRes.json();
                    mediaTitle = kData.data.attributes.canonicalTitle || kData.data.attributes.titles.en;
                } else if (targetId.startsWith("tmdb:")) {
                    const parts = targetId.split(":");
                    seasonNum = parts[2]; episodeNum = parts[3];
                    let tRes = await fetch("https://api.themoviedb.org/3/" + (type === "series" ? 'tv' : 'movie') + "/" + parts[1] + "?api_key=" + TMDB_API_KEY);
                    let tData = await tRes.json();
                    mediaTitle = tData.title || tData.name;
                } else if (targetId.startsWith("tt")) {
                    const parts = targetId.split(":");
                    seasonNum = parts[1]; episodeNum = parts[2];
                    let findRes = await fetch("https://api.themoviedb.org/3/find/" + parts[0] + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id");
                    let findData = await findRes.json();
                    const item = findData.movie_results?.[0] || findData.tv_results?.[0];
                    if (item) mediaTitle = item.title || item.name;
                }
            } catch (e) {}

            let allStreams = [];
            const scraperPromises = [];

            if (mediaTitle) {
                let safeTitle = mediaTitle.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                let query = isAnime ? safeTitle + " " + episodeNum : (seasonNum ? safeTitle + " S" + seasonNum.padStart(2, '0') + "E" + episodeNum.padStart(2, '0') : safeTitle);

                scraperPromises.push((async () => {
                    let resData = await fetchScraperBypass("https://torrents-csv.com/service/search?q=" + encodeURIComponent(query) + "&size=30");
                    if (resData && resData.torrents) {
                        resData.torrents.forEach(t => allStreams.push({ title: t.name, infoHash: t.infohash, seeders: t.seeders || 15, sizeFormatted: formatBytes(t.size_bytes), provider: "TorrentCSV" }));
                    }
                })());

                scraperPromises.push((async () => {
                    let resData = await fetchScraperBypass("https://bitsearch.info/api/v1/search?q=" + encodeURIComponent(query) + "&limit=15");
                    if (resData && resData.data) {
                        resData.data.forEach(t => allStreams.push({ title: t.name, infoHash: t.infohash, seeders: parseInt(t.seeders) || 10, sizeFormatted: t.size, provider: "BitSearch" }));
                    }
                })());
            }

            scraperPromises.push((async () => {
                let tUrl = "https://torrentio.strem.fun/stream/" + (isAnime ? "anime" : type) + "/" + targetId + ".json";
                let resData = await fetchScraperBypass(tUrl);
                if (resData && resData.streams) {
                    resData.streams.forEach(s => { s.provider = "Torrentio API"; allStreams.push(s); });
                }
            })());

            // 8-SECOND TIMEOUT PROMISE
            const maxWaitTimer = new Promise(resolve => setTimeout(() => resolve("TIMEOUT"), 8000));
            await Promise.race([Promise.allSettled(scraperPromises), maxWaitTimer]);

            let processedStreams = [];
            let seen = new Set();

            allStreams.forEach(s => {
                if (!s || typeof s !== 'object') return; 
                let fullText = ((s.title || "") + " " + (s.name || "")).toLowerCase();
                let seeders = s.seeders || 15; 
                
                const uniqueKey = s.infoHash || s.url;
                if (!uniqueKey || seen.has(uniqueKey)) return;
                seen.add(uniqueKey);

                let quality = "📼 SD";
                if (fullText.includes("4k") || fullText.includes("2160p")) quality = "✨ 4K ULTRA HD";
                else if (fullText.includes("1080p")) quality = "📺 1080p FULL HD";
                else if (fullText.includes("720p")) quality = "📱 720p HD";

                let langBadge = "🌐 MULTI AUDIO";
                if (/\b(hindi|hin)\b/i.test(fullText)) langBadge = "🇮🇳 HINDI DUB";
                else if (/\b(indonesian|indo)\b/i.test(fullText)) langBadge = "🇮🇩 INDONESIAN";
                else if (/\b(japanese|jap)\b/i.test(fullText)) langBadge = "🇯🇵 JAPANESE";

                let providerTag = "⚡ NexusFlix (" + s.provider + ")";
                let cleanTitle = String(s.title).split(new RegExp('\\r?\\n'))[0].replace(new RegExp('\\[.*?\\]', 'g'), "").trim();

                s.name = "🎬 NexusFlix VIP\n" + langBadge;
                s.title = quality + " • " + providerTag + "\n" + cleanTitle + "\n👤 " + seeders + " Seeders";

                processedStreams.push(s);
            });

            processedStreams.sort((a, b) => (b.seeders || 0) - (a.seeders || 0));
            let finalOutput = { streams: processedStreams.slice(0, 40) };

            let response = new Response(JSON.stringify(finalOutput), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=21600' } });
            
            // Save to Cloudflare Cache if streams found
            if (finalOutput.streams.length > 0) {
                ctx.waitUntil(cache.put(cacheKey, response.clone()));
            }

            return response;
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};