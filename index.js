const TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

async function fetchDirect(url, timeoutMs = 3500) {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
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

        // 1. Manifest
        if (path === '/' || path === '/manifest.json' || path.endsWith('/manifest.json')) {
            const manifest = {
                id: "org.nexusflix.hybridultimate",
                version: "99.0.0",
                name: "NexusFlix VIP 🇮🇳 (Hybrid Ultimate)",
                description: "Direct Web Streams + All 20+ Trackers (Hindi & 4K Top)",
                resources: ["catalog", "meta", "stream"],
                types: ["movie", "series"],
                idPrefixes: ["tmdb", "tt"],
                catalogs: [
                    { type: "movie", id: "indo_horror", name: "👻 Indonesian Horror" },
                    { type: "movie", id: "world_horror", name: "💀 World Horror (Thai/Jap/Russian)" },
                    { type: "movie", id: "bolly_trending", name: "🔥 Bollywood: Trending" },
                    { type: "movie", id: "south_trending", name: "🌟 South Indian: Trending" },
                    { type: "series", id: "netflix_trending", name: "👑 Netflix: Trending" }
                ]
            };
            return new Response(JSON.stringify(manifest), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 2. Catalogs (TMDB)
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

            let data = await fetchDirect(tUrl, 4000);
            let metas = (data?.results || []).map(m => ({
                id: "tmdb:" + m.id,
                type: catId === "netflix_trending" ? "series" : "movie",
                name: m.title || m.name,
                poster: m.poster_path ? "https://image.tmdb.org/t/p/w500" + m.poster_path : "https://via.placeholder.com/500x750?text=No+Poster",
                description: "⭐ TMDB: " + (m.vote_average || "N/A") + "/10\n" + (m.overview || "")
            }));

            return new Response(JSON.stringify({ metas }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. Meta Route
        const metaMatch = path.match(/\/meta\/(movie|series)\/([^\/]+)\.json/);
        if (metaMatch) {
            const type = metaMatch[1];
            const cleanId = metaMatch[2].replace("tmdb:", "").replace(".json", "");
            let m = await fetchDirect(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${cleanId}?api_key=${TMDB_API_KEY}`, 4000);
            
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

        // 4. Stream Route (HYBRID: DIRECT WEB EXTRACTOR + ALL P2P TRACKERS)
        const streamMatch = path.match(/\/stream\/(movie|series)\/([^\/]+)\.json/);
        if (streamMatch) {
            const type = streamMatch[1];
            const targetId = streamMatch[2];
            let imdbId = "";
            let tmdbId = "";
            let mediaTitle = "";
            let releaseYear = "";
            let season = "1", episode = "1";

            if (targetId.startsWith("tmdb:")) {
                const parts = targetId.replace("tmdb:", "").split(":");
                tmdbId = parts[0];
                if (parts.length > 2) { season = parts[1]; episode = parts[2]; }
                let tData = await fetchDirect(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`, 4000);
                imdbId = tData?.external_ids?.imdb_id || "";
                mediaTitle = tData?.title || tData?.name || "";
                releaseYear = (tData?.release_date || tData?.first_air_date || "").split('-')[0];
            } else if (targetId.startsWith("tt")) {
                const parts = targetId.split(":");
                imdbId = parts[0];
                if (parts.length > 2) { season = parts[1]; episode = parts[2]; }
                let findData = await fetchDirect(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`, 4000);
                const item = findData?.movie_results?.[0] || findData?.tv_results?.[0];
                if (item) {
                    tmdbId = item.id;
                    mediaTitle = item.title || item.name;
                    releaseYear = (item.release_date || item.first_air_date || "").split('-')[0];
                }
            }

            let directWebStreams = [];
            let p2pTorrentStreams = [];
            const fetchTasks = [];

            // ----------------------------------------------------
            // SECTION A: DIRECT FAST WEB STREAM EXTRACTORS (No P2P required)
            // ----------------------------------------------------
            if (imdbId || tmdbId) {
                // 1. Direct Web Stream 1: VidSrc PRO (Fast Multi-Server)
                const vidsrcUrl = type === 'series'
                    ? `https://vidsrc.icu/embed/tv/${imdbId || tmdbId}/${season}/${episode}`
                    : `https://vidsrc.icu/embed/movie/${imdbId || tmdbId}`;
                directWebStreams.push({
                    name: "🎬 NexusFlix VIP\n⚡ DIRECT STREAM",
                    title: "✨ 1080p FULL HD (Fast Server 1)\n⚡ Instant Play • Zero Buffering",
                    url: vidsrcUrl,
                    score: 950
                });

                // 2. Direct Web Stream 2: SuperEmbed / MultiEmbed Direct Stream
                const superUrl = type === 'series'
                    ? `https://multiembed.mov/directstream.php?video_id=${imdbId || tmdbId}&s=${season}&e=${episode}`
                    : `https://multiembed.mov/directstream.php?video_id=${imdbId || tmdbId}`;
                directWebStreams.push({
                    name: "🎬 NexusFlix VIP\n⚡ DIRECT STREAM",
                    title: "📺 1080p HD (Fast Server 2 - MultiEmbed)\n⚡ Instant Play • Multi-Source",
                    url: superUrl,
                    score: 940
                });

                // 3. Direct Web Stream 3: AutoEmbed Direct Stream
                const autoEmbedUrl = type === 'series'
                    ? `https://player.autoembed.cc/embed/tv/${imdbId || tmdbId}/${season}/${episode}`
                    : `https://player.autoembed.cc/embed/movie/${imdbId || tmdbId}`;
                directWebStreams.push({
                    name: "🎬 NexusFlix VIP\n⚡ DIRECT STREAM",
                    title: "🌐 1080p HD (Server 3 - AutoEmbed)\n⚡ Instant Play • Mobile Friendly",
                    url: autoEmbedUrl,
                    score: 930
                });
            }

            // ----------------------------------------------------
            // SECTION B: ALL 20+ P2P TRACKERS (YTS, 1337x, RARBG, NyaaSi, Rutracker)
            // ----------------------------------------------------
            if (imdbId) {
                const streamQuery = type === 'series' ? `${imdbId}:${season}:${episode}` : imdbId;
                fetchTasks.push((async () => {
                    let res = await fetchDirect(`https://torrentio.strem.fun/stream/${type}/${streamQuery}.json`, 3500);
                    if (res?.streams && res.streams.length > 0) {
                        res.streams.forEach(s => {
                            let titleLower = (s.title || "").toLowerCase();
                            let score = 100;

                            // Hindi / Indian Language Priority
                            let langTag = "🌐 MULTI AUDIO";
                            if (/\b(hindi|hin|dubbed)\b/i.test(titleLower)) {
                                langTag = "🇮🇳 HINDI DUB";
                                score += 500;
                            } else if (/\b(telugu|tamil|kannada|malayalam)\b/i.test(titleLower)) {
                                langTag = "🌟 SOUTH INDIAN";
                                score += 400;
                            } else if (/\b(indonesian|indo)\b/i.test(titleLower)) {
                                langTag = "🇮🇩 INDONESIAN";
                                score += 450;
                            }

                            // Quality Ranking
                            let qualTag = "📺 1080p HD";
                            if (titleLower.includes("2160p") || titleLower.includes("4k")) {
                                qualTag = "✨ 4K ULTRA HD";
                                score += 300;
                            } else if (titleLower.includes("1080p")) {
                                qualTag = "📺 1080p FULL HD";
                                score += 200;
                            } else if (titleLower.includes("720p")) {
                                qualTag = "📱 720p HD";
                                score += 50;
                            }

                            // Trackers Matching
                            let provName = "P2P Network";
                            if (titleLower.includes("yts")) provName = "YTS";
                            else if (titleLower.includes("1337x")) provName = "1337x";
                            else if (titleLower.includes("rarbg")) provName = "RARBG";
                            else if (titleLower.includes("nyaa")) provName = "NyaaSi";
                            else if (titleLower.includes("rutracker") || titleLower.includes("rutor")) provName = "Rutracker 🇷🇺";
                            else if (titleLower.includes("galaxy")) provName = "TorrentGalaxy";

                            p2pTorrentStreams.push({
                                name: `🎬 NexusFlix VIP\n${langTag} • [${provName}]`,
                                title: `${qualTag} • ⚡ High Speed\n${s.title}`,
                                infoHash: s.infoHash,
                                fileIdx: s.fileIdx,
                                score: score
                            });
                        });
                    }
                })());
            }

            // Fallback P2P Scraper (Title + Year)
            if (mediaTitle) {
                let cleanTitle = mediaTitle.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                let query = `${cleanTitle} ${releaseYear}`.trim();

                fetchTasks.push((async () => {
                    let resData = await fetchDirect(`https://torrents-csv.com/service/search?q=${encodeURIComponent(query)}&size=20`, 3500);
                    if (resData?.torrents && resData.torrents.length > 0) {
                        resData.torrents.forEach(t => {
                            let name = (t.name || "").toLowerCase();
                            let score = 50 + (t.seeders || 0);

                            let langTag = "🌐 MULTI AUDIO";
                            if (/\b(hindi|hin)\b/i.test(name)) { langTag = "🇮🇳 HINDI"; score += 500; }
                            else if (/\b(indonesian|indo)\b/i.test(name)) { langTag = "🇮🇩 INDONESIAN"; score += 450; }

                            p2pTorrentStreams.push({
                                name: `🎬 NexusFlix VIP\n${langTag} • [Direct P2P]`,
                                title: `📺 Direct Stream (${t.seeders || 1} Seeders)\n${t.name}\n💾 ${formatBytes(t.size_bytes)}`,
                                infoHash: t.infohash,
                                score: score
                            });
                        });
                    }
                })());
            }

            // Wait for P2P tasks with 3.8s strict timeout
            await Promise.allSettled(fetchTasks);

            // Sort P2P streams: Highest Score (Hindi > 4K > 1080p > Seeders) at the top
            p2pTorrentStreams.sort((a, b) => b.score - a.score);

            // Combine Direct Web Streams + Sorted P2P Streams
            let combinedStreams = [...p2pTorrentStreams, ...directWebStreams];

            // Remove Duplicate Torrents
            let uniqueStreams = [];
            let seenHashes = new Set();
            combinedStreams.forEach(s => {
                if (s.infoHash) {
                    if (!seenHashes.has(s.infoHash)) {
                        seenHashes.add(s.infoHash);
                        uniqueStreams.push(s);
                    }
                } else {
                    uniqueStreams.push(s);
                }
            });

            return new Response(JSON.stringify({ streams: uniqueStreams }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};