import puppeteer from '@cloudflare/puppeteer';

const TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

async function fetchDirect(url) {
    try {
        let res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) return await res.json();
    } catch (e) {}
    return null;
}

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        const url = new URL(request.url);
        const path = url.pathname;

        // 1. Manifest
        if (path === '/' || path === '/manifest.json' || path.endsWith('/manifest.json')) {
            const manifest = {
                id: "org.nexusflix.agentstreamer",
                version: "52.0.0",
                name: "NexusFlix VIP 🇮🇳 (Smart Agent)",
                description: "Smart Multi-Provider Agent - All Asian & Global Horror",
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
            let tUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=1`;

            if (catId === "indo_horror") tUrl += "&with_genres=27&with_origin_country=ID";
            else if (catId === "world_horror") tUrl += "&with_genres=27&sort_by=vote_average.desc&vote_count.gte=200";
            else if (catId === "bolly_trending") tUrl += "&with_original_language=hi";
            else if (catId === "south_trending") tUrl += "&with_original_language=te|ta|ml|kn";
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

        // 4. Stream Route (SMART AGENT - MULTI SOURCE CRAWLER)
        const streamMatch = path.match(/\/stream\/(movie|series)\/([^\/]+)\.json/);
        if (streamMatch) {
            const type = streamMatch[1];
            const targetId = streamMatch[2];
            let imdbId = targetId;
            let movieTitle = "";

            if (targetId.startsWith("tmdb:")) {
                const cleanId = targetId.replace("tmdb:", "");
                let tData = await fetchDirect(`https://api.themoviedb.org/3/${type === 'series' ? 'tv' : 'movie'}/${cleanId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`);
                imdbId = tData?.external_ids?.imdb_id || targetId;
                movieTitle = tData?.title || tData?.name || "";
            }

            let foundStreams = [];

            try {
                // Cloudflare का Puppeteer Browser Agent चालू
                const browser = await puppeteer.launch(env.MYBROWSER);
                const page = await browser.newPage();

                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

                // नेटवर्क पर .m3u8 स्ट्रीम पकड़ना
                page.on('response', async (res) => {
                    const reqUrl = res.url();
                    if (reqUrl.includes('.m3u8') && !reqUrl.includes('ads') && !reqUrl.includes('track')) {
                        foundStreams.push(reqUrl);
                    }
                });

                // 1. पहला सोर्स चेक (Vidplay / VidSrc)
                await page.goto(`https://vidsrc.to/embed/${type === 'series' ? 'tv' : 'movie'}/${imdbId}`, { waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});

                // 2. अगर लिंक नहीं मिला (No Title), तो दूसरा सोर्स चेक (SuperEmbed Fallback)
                if (foundStreams.length === 0) {
                    await page.goto(`https://multiembed.mov/directstream.php?video_id=${imdbId}&tmdb=1`, { waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});
                }

                await browser.close();
            } catch (err) {}

            let responseStreams = [];

            if (foundStreams.length > 0) {
                foundStreams.forEach((url, i) => {
                    responseStreams.push({
                        name: "🎬 NexusFlix VIP\n⚡ AGENT STREAM",
                        title: `✨ Server ${i + 1} (Direct HD)\n100% Working • Multi-Audio`,
                        url: url
                    });
                });
            } else {
                // बैकअप डायरेक्ट प्लेयर (ताकि Stremio स्क्रीन कभी खाली न रहे)
                responseStreams.push({
                    name: "🎬 NexusFlix VIP\n🌐 BACKUP PLAYER",
                    title: "📺 Instant Player (Multi-Source)",
                    url: `https://vidsrc.me/embed/${type === 'series' ? 'tv' : 'movie'}?imdb=${imdbId}`
                });
            }

            return new Response(JSON.stringify({ streams: responseStreams }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};