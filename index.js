const TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

async function fetchDirect(url) {
    try {
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });
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
                id: "org.nexusflix.powerstream",
                version: "80.0.0",
                name: "NexusFlix VIP 🇮🇳 (Power Engine)",
                description: "Multi-Source Scraping - All Providers Active",
                resources: ["catalog", "meta", "stream"],
                types: ["movie", "series"],
                idPrefixes: ["tmdb", "tt"],
                catalogs: [
                    { type: "movie", id: "indo_horror", name: "👻 Indonesian Horror" },
                    { type: "movie", id: "world_horror", name: "💀 World Horror Masterpieces" },
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

        // 3. Meta Route
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

        // 4. Stream Route (MULTI-INDEXER POWER ENGINE)
        const streamMatch = path.match(/\/stream\/(movie|series)\/([^\/]+)\.json/);
        if (streamMatch) {
            const type = streamMatch[1];
            const targetId = streamMatch[2];
            let mediaTitle = "", releaseYear = "", imdbId = "";

            if (targetId.startsWith("tmdb:")) {
                const cleanId = targetId.replace("tmdb:", "");
                let tData = await fetchDirect(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${cleanId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`);
                mediaTitle = tData?.title || tData?.name || "";
                releaseYear = (tData?.release_date || tData?.first_air_date || "").split('-')[0];
                imdbId = tData?.external_ids?.imdb_id || "";
            } else if (targetId.startsWith("tt")) {
                imdbId = targetId.split(":")[0];
                let findData = await fetchDirect(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
                const item = findData?.movie_results?.[0] || findData?.tv_results?.[0];
                if (item) {
                    mediaTitle = item.title || item.name;
                    releaseYear = (item.release_date || item.first_air_date || "").split('-')[0];
                }
            }

            let allStreams = [];
            const fetchTasks = [];

            // 1. Direct Torrentio Scraper (By IMDb ID)
            if (imdbId) {
                fetchTasks.push((async () => {
                    let res = await fetchDirect(`https://torrentio.strem.fun/stream/${type}/${imdbId}.json`);
                    if (res?.streams) {
                        res.streams.forEach(s => {
                            allStreams.push({
                                name: "🎬 NexusFlix VIP\n⚡ Torrentio",
                                title: s.title || "1080p Stream",
                                infoHash: s.infoHash
                            });
                        });
                    }
                })());
            }

            // 2. Torrents-CSV + BitSearch (By Movie Title + Year)
            if (mediaTitle) {
                let cleanTitle = mediaTitle.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                let query = `${cleanTitle} ${releaseYear}`.trim();

                fetchTasks.push((async () => {
                    let resData = await fetchDirect(`https://torrents-csv.com/service/search?q=${encodeURIComponent(query)}&size=20`);
                    if (resData?.torrents) {
                        resData.torrents.forEach(t => {
                            allStreams.push({
                                name: "🎬 NexusFlix VIP\n🌐 P2P Direct",
                                title: `📺 Direct Stream\n${t.name}\n💾 ${formatBytes(t.size_bytes)} | 👤 ${t.seeders || 5} Seeders`,
                                infoHash: t.infohash
                            });
                        });
                    }
                })());
            }

            // 3.5 सेकंड का सुपरफास्ट रेस टाइमर
            const waitTimer = new Promise(res => setTimeout(() => res("TIMEOUT"), 3500));
            await Promise.race([Promise.allSettled(fetchTasks), waitTimer]);

            // डुप्लीकेट हटाना
            let uniqueStreams = [];
            let seen = new Set();
            allStreams.forEach(s => {
                if (s.infoHash && !seen.has(s.infoHash)) {
                    seen.add(s.infoHash);
                    uniqueStreams.push(s);
                }
            });

            return new Response(JSON.stringify({ streams: uniqueStreams }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};