const TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

async function fetchDirect(url, timeoutMs = 4000) {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
            signal: controller.signal
        });
        clearTimeout(timer);
        if (res.ok) return await res.json();
    } catch (e) {}
    return null;
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        const url = new URL(request.url);
        const path = url.pathname;

        // 1. MANIFEST (Professional Setup)
        if (path === '/' || path === '/manifest.json' || path.endsWith('/manifest.json')) {
            const manifest = {
                id: "org.nexusflix.pro",
                version: "100.0.0",
                name: "NexusFlix VIP 🇮🇳 (PRO Engine)",
                description: "4K/1080p | 20+ Providers | No CAM | Web + P2P",
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

            let data = await fetchDirect(tUrl);
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
            let m = await fetchDirect(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${cleanId}?api_key=${TMDB_API_KEY}`);
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

        // 4. STREAMS (Web + P2P with Provider, Quality, Size, and CAM Filter)
        const streamMatch = path.match(/\/stream\/(movie|series)\/([^\/]+)\.json/);
        if (streamMatch) {
            const type = streamMatch[1];
            const targetId = streamMatch[2];
            let imdbId = "", tmdbId = "", mediaTitle = "", releaseYear = "", season = "1", episode = "1";

            // IDs Conversion
            if (targetId.startsWith("tmdb:")) {
                const parts = targetId.replace("tmdb:", "").split(":");
                tmdbId = parts[0];
                if (parts.length > 2) { season = parts[1]; episode = parts[2]; }
                let tData = await fetchDirect(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`);
                imdbId = tData?.external_ids?.imdb_id || "";
                mediaTitle = tData?.title || tData?.name || "";
                releaseYear = (tData?.release_date || tData?.first_air_date || "").split('-')[0];
            } else if (targetId.startsWith("tt")) {
                const parts = targetId.split(":");
                imdbId = parts[0];
                if (parts.length > 2) { season = parts[1]; episode = parts[2]; }
                let findData = await fetchDirect(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
                const item = findData?.movie_results?.[0] || findData?.tv_results?.[0];
                if (item) {
                    tmdbId = item.id;
                    mediaTitle = item.title || item.name;
                    releaseYear = (item.release_date || item.first_air_date || "").split('-')[0];
                }
            }

            let streamsList = [];
            const fetchTasks = [];

            // ==========================================
            // PART A: DIRECT WEB STREAMS (Browser Safe)
            // ==========================================
            if (imdbId) {
                const vidsrcUrl = type === 'series' 
                    ? `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`
                    : `https://vidsrc.me/embed/movie?imdb=${imdbId}`;
                
                streamsList.push({
                    name: "🎬 NexusFlix VIP\n🌐 WEB STREAM",
                    title: "📺 Server 1 (VidSrc)\n⚡ Opens fast in Browser (No App Crash)",
                    externalUrl: vidsrcUrl, // Safe linking
                    score: 1000
                });
                
                const autoEmbedUrl = type === 'series' 
                    ? `https://player.autoembed.cc/embed/tv/${imdbId}/${season}/${episode}`
                    : `https://player.autoembed.cc/embed/movie/${imdbId}`;
                
                streamsList.push({
                    name: "🎬 NexusFlix VIP\n🌐 WEB STREAM",
                    title: "📱 Server 2 (AutoEmbed)\n⚡ Mobile Friendly Browser Player",
                    externalUrl: autoEmbedUrl,
                    score: 990
                });
            }

            // ==========================================
            // PART B: 20+ P2P PROVIDERS (Detailed Info & Filters)
            // ==========================================
            if (imdbId) {
                const streamQuery = type === 'series' ? `${imdbId}:${season}:${episode}` : imdbId;
                fetchTasks.push((async () => {
                    let res = await fetchDirect(`https://torrentio.strem.fun/stream/${type}/${streamQuery}.json`, 4000);
                    if (res?.streams && res.streams.length > 0) {
                        res.streams.forEach(s => {
                            let titleLower = (s.title || "").toLowerCase();
                            
                            // 🚫 BLOCK CAM/SCREENER PRINTS
                            if (/(camrip|cam|ts|telesync|hdcam|screener|tc)/i.test(titleLower)) {
                                return; // Skip this stream completely
                            }

                            let score = 100;

                            // Extract Exact Size
                            let sizeMatch = s.title.match(/💾\s*([\d.]+\s*[KMG]B)/i);
                            let fileSize = sizeMatch ? sizeMatch[1] : "Unknown Size";

                            // Language Priority
                            let langTag = "🌐 MULTI AUDIO";
                            if (/\b(hindi|hin|dubbed)\b/i.test(titleLower)) { langTag = "🇮🇳 HINDI"; score += 500; }
                            else if (/\b(telugu|tamil|malayalam)\b/i.test(titleLower)) { langTag = "🌟 SOUTH INDIAN"; score += 400; }
                            else if (/\b(indonesian|indo)\b/i.test(titleLower)) { langTag = "🇮🇩 INDONESIAN"; score += 450; }

                            // Quality Definition
                            let qualTag = "📺 SD";
                            if (titleLower.includes("2160p") || titleLower.includes("4k")) { qualTag = "✨ 4K ULTRA HD"; score += 300; }
                            else if (titleLower.includes("1080p")) { qualTag = "📺 1080p FULL HD"; score += 200; }
                            else if (titleLower.includes("720p")) { qualTag = "📱 720p HD"; score += 50; }

                            // Explicit Provider Extraction
                            let provName = "Unknown Tracker";
                            if (titleLower.includes("yts")) provName = "YTS";
                            else if (titleLower.includes("1337x")) provName = "1337x";
                            else if (titleLower.includes("rarbg")) provName = "RARBG";
                            else if (titleLower.includes("nyaa")) provName = "NyaaSi";
                            else if (titleLower.includes("rutracker") || titleLower.includes("rutor")) provName = "Rutracker 🇷🇺";
                            else if (titleLower.includes("galaxy") || titleLower.includes("tgx")) provName = "TorrentGalaxy";
                            else if (titleLower.includes("eztv")) provName = "EZTV";
                            else if (titleLower.includes("piratebay") || titleLower.includes("tpb")) provName = "ThePirateBay";

                            streamsList.push({
                                name: `🎬 NexusFlix VIP\n${langTag} • [${provName}]`,
                                title: `${qualTag} • 💾 ${fileSize}\n${s.title.split('\n')[0]}`,
                                infoHash: s.infoHash,
                                fileIdx: s.fileIdx,
                                score: score
                            });
                        });
                    }
                })());
            }

            await Promise.allSettled(fetchTasks);
            
            // Sort to keep Hindi & 4K/1080p at the very top
            streamsList.sort((a, b) => b.score - a.score);

            // Remove duplicates
            let uniqueStreams = [];
            let seenHashes = new Set();
            streamsList.forEach(s => {
                if (s.infoHash) {
                    if (!seenHashes.has(s.infoHash)) { seenHashes.add(s.infoHash); uniqueStreams.push(s); }
                } else {
                    uniqueStreams.push(s); // Allow external URLs
                }
            });

            return new Response(JSON.stringify({ streams: uniqueStreams }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};