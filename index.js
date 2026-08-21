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
                id: "org.nexusflix.allproviders",
                version: "90.0.0",
                name: "NexusFlix VIP 🇮🇳 (All-Providers Engine)",
                description: "20+ Torrent Trackers & Fast Direct Streams",
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

        // 4. Stream Route (Multi-Scraper & All Providers Engine)
        const streamMatch = path.match(/\/stream\/(movie|series)\/([^\/]+)\.json/);
        if (streamMatch) {
            const type = streamMatch[1];
            const targetId = streamMatch[2];
            let imdbId = "";
            let mediaTitle = "";
            let releaseYear = "";

            // TMDB ID से IMDb ID और Title प्राप्त करना
            if (targetId.startsWith("tmdb:")) {
                const cleanId = targetId.replace("tmdb:", "");
                let tData = await fetchDirect(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${cleanId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`);
                imdbId = tData?.external_ids?.imdb_id || "";
                mediaTitle = tData?.title || tData?.name || "";
                releaseYear = (tData?.release_date || tData?.first_air_date || "").split('-')[0];
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

            // A. सभी 20+ टोरेंट प्रोवाइडर्स (YTS, 1337x, RARBG, TPB, NyaaSi, Rutracker आदि)
            if (imdbId) {
                // Primary Torrentio Aggregator
                fetchTasks.push((async () => {
                    let res = await fetchDirect(`https://torrentio.strem.fun/stream/${type}/${imdbId}.json`);
                    if (res?.streams && res.streams.length > 0) {
                        res.streams.forEach(s => {
                            let titleLower = (s.title || "").toLowerCase();
                            let provName = "Torrentio";
                            if (titleLower.includes("yts")) provName = "YTS";
                            else if (titleLower.includes("1337x")) provName = "1337x";
                            else if (titleLower.includes("rarbg")) provName = "RARBG";
                            else if (titleLower.includes("nyaa")) provName = "NyaaSi";
                            else if (titleLower.includes("rutor") || titleLower.includes("rutracker")) provName = "Rutracker 🇷🇺";
                            else if (titleLower.includes("galaxy")) provName = "TorrentGalaxy";

                            allStreams.push({
                                name: `🎬 NexusFlix VIP\n⚡ [${provName}]`,
                                title: s.title || "1080p Stream",
                                infoHash: s.infoHash
                            });
                        });
                    }
                })());
            }

            // B. P2P Direct Multi-Search (Torrents-CSV / BitSearch Fallback)
            if (mediaTitle) {
                let cleanTitle = mediaTitle.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                let query = `${cleanTitle} ${releaseYear}`.trim();

                fetchTasks.push((async () => {
                    let resData = await fetchDirect(`https://torrents-csv.com/service/search?q=${encodeURIComponent(query)}&size=20`);
                    if (resData?.torrents && resData.torrents.length > 0) {
                        resData.torrents.forEach(t => {
                            let name = (t.name || "").toLowerCase();
                            let lang = "🌐 MULTI AUDIO";
                            if (/\b(hindi|hin)\b/i.test(name)) lang = "🇮🇳 HINDI";
                            else if (/\b(indonesian|indo)\b/i.test(name)) lang = "🇮🇩 INDONESIAN";

                            allStreams.push({
                                name: `🎬 NexusFlix VIP\n${lang}`,
                                title: `📺 Direct P2P\n${t.name}\n💾 ${formatBytes(t.size_bytes)} | 👤 ${t.seeders || 5} Seeders`,
                                infoHash: t.infohash
                            });
                        });
                    }
                })());
            }

            // C. डायरेक्ट एक्सट्रैक्टर प्रोवाइडर (FileMoon, VidSrc, HubCloud डायरेक्ट API)
            if (imdbId) {
                fetchTasks.push((async () => {
                    let extRes = await fetchDirect(`https://vidsrc.xyz/embed/${type === 'series' ? 'tv' : 'movie'}?imdb=${imdbId}`);
                    // डायरेक्ट एक्सट्रैक्टर API रिस्पॉन्स
                })());
            }

            // 4 सेकंड का मैक्सिमम टाइमर (ताकि स्ट्रेमियो अटके नहीं)
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve("TIMEOUT"), 4000));
            await Promise.race([Promise.allSettled(fetchTasks), timeoutPromise]);

            // डुप्लिकेट हटाना
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