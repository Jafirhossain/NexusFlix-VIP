const TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// सुपर सेफ और फास्ट Fetcher (4 सेकंड से ज्यादा स्ट्रेमियो को इंतजार नहीं कराएगा)
async function safeFetch(url) {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        let res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: controller.signal
        });
        clearTimeout(timer);
        if (res.ok) return await res.json();
    } catch (e) {}
    return null;
}

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        const url = new URL(request.url);
        const path = url.pathname;

        // 1. MANIFEST
        if (path === '/' || path === '/manifest.json' || path.endsWith('/manifest.json')) {
            const manifest = {
                id: "org.nexusflix.supernode",
                version: "300.0.0",
                name: "NexusFlix VIP 🇮🇳 (Super Node)",
                description: "Aggregates Torrentio, MediaFusion & KnightCrawler Native Streams",
                resources: ["catalog", "meta", "stream"],
                types: ["movie", "series"],
                idPrefixes: ["tmdb", "tt"],
                catalogs: [
                    { type: "movie", id: "indo_horror", name: "👻 Indonesian Horror" },
                    { type: "movie", id: "world_horror", name: "💀 World Horror" },
                    { type: "movie", id: "bolly_trending", name: "🔥 Bollywood: Trending" },
                    { type: "movie", id: "south_trending", name: "🌟 South Indian: Trending" },
                    { type: "series", id: "netflix_trending", name: "👑 Netflix: Trending" }
                ]
            };
            return new Response(JSON.stringify(manifest), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 2. CATALOGS
        const catalogMatch = path.match(/\/catalog\/(movie|series)\/([^\/]+)\.json/);
        if (catalogMatch) {
            const catId = catalogMatch[2];
            const today = new Date().toISOString().split('T')[0];
            let tUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=1`;

            if (catId === "indo_horror") tUrl += `&with_genres=27&with_origin_country=ID&primary_release_date.lte=${today}`;
            else if (catId === "world_horror") tUrl += `&with_genres=27&sort_by=vote_average.desc&vote_count.gte=300&primary_release_date.lte=${today}`;
            else if (catId === "bolly_trending") tUrl += `&with_original_language=hi&primary_release_date.lte=${today}`;
            else if (catId === "south_trending") tUrl += `&with_original_language=te|ta|ml|kn&primary_release_date.lte=${today}`;
            else if (catId === "netflix_trending") tUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=IN&page=1`;

            let data = await safeFetch(tUrl);
            let metas = (data?.results || []).map(m => ({
                id: "tmdb:" + m.id,
                type: catId === "netflix_trending" ? "series" : "movie",
                name: m.title || m.name,
                poster: m.poster_path ? "https://image.tmdb.org/t/p/w500" + m.poster_path : "https://via.placeholder.com/500x750?text=No+Poster",
                description: "⭐ TMDB: " + (m.vote_average || "N/A") + "/10\n" + (m.overview || "")
            }));
            return new Response(JSON.stringify({ metas }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. META DATA
        const metaMatch = path.match(/\/meta\/(movie|series)\/([^\/]+)\.json/);
        if (metaMatch) {
            const type = metaMatch[1];
            const cleanId = metaMatch[2].replace("tmdb:", "").replace(".json", "");
            let m = await safeFetch(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${cleanId}?api_key=${TMDB_API_KEY}`);
            let metaObj = {
                id: metaMatch[2],
                type: type,
                name: m?.title || m?.name || "Movie",
                poster: m?.poster_path ? "https://image.tmdb.org/t/p/w500" + m.poster_path : "https://via.placeholder.com/500x750?text=No+Poster",
                background: m?.backdrop_path ? "https://image.tmdb.org/t/p/original" + m.backdrop_path : undefined,
                description: m?.overview || ""
            };
            return new Response(JSON.stringify({ meta: metaObj }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 4. STREAMS (THE MASTER AGGREGATOR ENGINE)
        const streamMatch = path.match(/\/stream\/(movie|series)\/([^\/]+)\.json/);
        if (streamMatch) {
            const type = streamMatch[1];
            const targetId = streamMatch[2];
            let imdbId = "";
            let season = "1", episode = "1";

            // ID Conversion (Very strict and safe now)
            if (targetId.startsWith("tt")) {
                const parts = targetId.split(":");
                imdbId = parts[0];
                if (parts.length > 2) { season = parts[1]; episode = parts[2]; }
            } else if (targetId.startsWith("tmdb:")) {
                const parts = targetId.replace("tmdb:", "").split(":");
                let tmdbId = parts[0];
                if (parts.length > 2) { season = parts[1]; episode = parts[2]; }
                let tData = await safeFetch(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`);
                if (tData && tData.external_ids && tData.external_ids.imdb_id) {
                    imdbId = tData.external_ids.imdb_id;
                }
            }

            let rawStreams = [];
            const fetchTasks = [];

            if (imdbId && imdbId.startsWith("tt")) {
                const query = type === 'series' ? `${imdbId}:${season}:${episode}` : imdbId;

                // 1. Torrentio (King of P2P Trackers)
                fetchTasks.push(safeFetch(`https://torrentio.strem.fun/stream/${type}/${query}.json`).then(d => {
                    if (d?.streams) d.streams.forEach(s => rawStreams.push({...s, sourceAPI: 'Torrentio'}));
                }));

                // 2. MediaFusion (King of Direct HTTP Streams & Indian/Bollywood Content)
                fetchTasks.push(safeFetch(`https://mediafusion.elfhosted.com/stream/${type}/${query}.json`).then(d => {
                    if (d?.streams) d.streams.forEach(s => rawStreams.push({...s, sourceAPI: 'MediaFusion'}));
                }));

                // 3. KnightCrawler (Great Backup for New Movies like Obsession 2026)
                fetchTasks.push(safeFetch(`https://knightcrawler.elfhosted.com/stream/${type}/${query}.json`).then(d => {
                    if (d?.streams) d.streams.forEach(s => rawStreams.push({...s, sourceAPI: 'KnightCrawler'}));
                }));
            }

            // Execute all aggregators simultaneously
            await Promise.allSettled(fetchTasks);

            let finalStreams = [];
            let seenHashes = new Set();

            rawStreams.forEach(s => {
                let fullText = (s.title || s.name || "").toLowerCase();

                // 🚫 STRICT CAM / RECORDING FILTER
                if (/(camrip|cam|ts|telesync|hdcam|screener|tc)/i.test(fullText)) return;

                let score = 0;
                
                // --- Quality Extraction ---
                let qualTag = "📺 SD";
                if (fullText.includes("4k") || fullText.includes("2160p")) { qualTag = "✨ 4K ULTRA HD"; score += 300; }
                else if (fullText.includes("1080p")) { qualTag = "📺 1080p FULL HD"; score += 200; }
                else if (fullText.includes("720p")) { qualTag = "📱 720p HD"; score += 100; }

                // --- Language Extraction ---
                let langTag = "🌐 MULTI AUDIO";
                if (/\b(hindi|hin)\b/i.test(fullText)) { langTag = "🇮🇳 HINDI DUB"; score += 500; }
                else if (/\b(telugu|tamil|malayalam)\b/i.test(fullText)) { langTag = "🌟 SOUTH INDIAN"; score += 400; }
                else if (/\b(indonesian|indo)\b/i.test(fullText)) { langTag = "🇮🇩 INDONESIAN"; score += 450; }

                // --- Provider Extraction ---
                let provName = s.sourceAPI === 'MediaFusion' ? "Direct Stream" : "P2P Tracker";
                if (fullText.includes("yts")) provName = "YTS";
                else if (fullText.includes("1337x")) provName = "1337x";
                else if (fullText.includes("rarbg")) provName = "RARBG";
                else if (fullText.includes("nyaa")) provName = "NyaaSi";
                else if (fullText.includes("rutracker") || fullText.includes("rutor")) provName = "Rutracker 🇷🇺";
                else if (fullText.includes("torrentgalaxy") || fullText.includes("tgx")) provName = "TorrentGalaxy";
                else if (fullText.includes("eztv")) provName = "EZTV";
                else if (fullText.includes("piratebay") || fullText.includes("tpb")) provName = "ThePirateBay";

                // --- Size Extraction ---
                let sizeMatch = (s.title || "").match(/([\d.]+\s*[KMG]B)/i);
                let fileSize = sizeMatch ? ` • 💾 ${sizeMatch[1]}` : "";

                // --- Type Indicator ---
                // If it has 'url', it's a direct HTTP stream natively supported by Stremio. If 'infoHash', it's P2P.
                let playType = s.url ? "⚡ NATIVE DIRECT HTTP" : "🌐 DIRECT P2P";

                let cleanTitle = s.title ? s.title.split('\n')[0].replace(/📦.*/g, '').trim() : "Watch Stream";

                let formattedStream = {
                    name: `🎬 NexusFlix VIP\n${langTag} • [${provName}]`,
                    title: `${qualTag}${fileSize}\n${playType}\n${cleanTitle}`,
                    score: score
                };

                // Attach the actual playable data (No external browser links)
                if (s.infoHash) {
                    formattedStream.infoHash = s.infoHash;
                    formattedStream.fileIdx = s.fileIdx;
                }
                if (s.url) formattedStream.url = s.url;
                if (s.behaviorHints) formattedStream.behaviorHints = s.behaviorHints;

                // De-duplicate
                const uniqueKey = s.infoHash || s.url;
                if (uniqueKey) {
                    if (!seenHashes.has(uniqueKey)) {
                        seenHashes.add(uniqueKey);
                        finalStreams.push(formattedStream);
                    }
                }
            });

            // Sort so Hindi, 4K, and 1080p stay at the top
            finalStreams.sort((a, b) => b.score - a.score);

            return new Response(JSON.stringify({ streams: finalStreams }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};