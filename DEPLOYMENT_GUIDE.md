# 👑 NexusFlix VIP - Deployment Guide

**Professional Stremio Addon | Enterprise Ready | Zero Errors**

---

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [GitHub Setup](#github-setup)
3. [Cloudflare Workers Deployment](#cloudflare-workers-deployment)
4. [Testing & Verification](#testing--verification)
5. [Monetization & Optimization](#monetization--optimization)

---

## 🚀 Quick Start

### Prerequisites
- GitHub Account (Free)
- Cloudflare Account (Free tier works!)
- Wrangler CLI (npm install -g wrangler)
- Node.js 16+

### Step 1: Create GitHub Repository

```bash
# Create new repository
cd /tmp
mkdir nexusflix-vip
cd nexusflix-vip

# Initialize git
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Add all files
git add .
git commit -m "🚀 Initial commit: NexusFlix VIP Professional"
git remote add origin https://github.com/YOUR_USERNAME/nexusflix-vip.git
git branch -M main
git push -u origin main
```

---

## 🔧 GitHub Setup

### Step 2: Repository Structure

```
nexusflix-vip/
├── src/
│   └── index.js          # Main addon code
├── wrangler.toml         # Cloudflare config
├── package.json          # Dependencies
├── README.md             # Documentation
├── .gitignore            # Git ignore rules
└── deploy.sh             # Deployment script
```

### Step 3: Create Files

#### `wrangler.toml` (Cloudflare Workers Config)

```toml
name = "nexusflix-vip"
type = "javascript"
main = "src/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "nexusflix-vip-prod"
route = "nexusflix-vip.your-domain.workers.dev"

[build]
command = "npm install"
cwd = "."
```

#### `package.json`

```json
{
  "name": "nexusflix-vip",
  "version": "4.0.0",
  "description": "Professional Stremio Addon - Global Horror, OTT, Anime, Regional Cinema",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler publish",
    "test": "node test.js"
  },
  "keywords": ["stremio", "addon", "horror", "anime", "streaming"],
  "author": "NexusFlix Team",
  "license": "MIT",
  "devDependencies": {
    "wrangler": "^3.28.0"
  }
}
```

#### `.gitignore`

```
node_modules/
dist/
.wrangler/
*.log
.env
.env.local
.DS_Store
```

---

## ☁️ Cloudflare Workers Deployment

### Step 4: Install Wrangler

```bash
npm install -g wrangler
```

### Step 5: Login to Cloudflare

```bash
wrangler login
```

This opens your browser to authenticate. Approve access.

### Step 6: Deploy to Cloudflare Workers

```bash
# Development testing
wrangler dev

# Production deployment
wrangler publish
```

**Output will show:**
```
✅ Uploaded nexusflix-vip
✅ Published to https://nexusflix-vip.YOUR_SUBDOMAIN.workers.dev
```

### Step 7: Custom Domain (Optional)

1. Go to Cloudflare Dashboard → Workers Routes
2. Add route: `nexusflix-vip.your-domain.com`
3. Point to your worker

---

## ✅ Testing & Verification

### Step 8: Test the Addon

Open in browser:
```
https://YOUR_WORKER_URL/
```

Should show: **NexusFlix VIP Setup Page**

### Step 9: Verify Manifest

```bash
curl https://YOUR_WORKER_URL/manifest.json
```

Should return valid JSON manifest.

### Step 10: Install to Stremio

1. Copy your worker URL: `https://YOUR_WORKER.workers.dev`
2. Open Stremio → Community Addons → Install Addon
3. Paste: `https://YOUR_WORKER.workers.dev/manifest.json`
4. Click Install
5. Configure preferences (Quality, Source, Language)
6. Enjoy! 🎉

---

## 💰 Monetization & Optimization

### Real-Debrid Affiliate Integration

```javascript
// Add to configure page
const AFFILIATE_LINKS = {
  "Real-Debrid": "https://real-debrid.com?ref=YOUR_AFFILIATE_ID",
  "TorBox": "https://torbox.app?ref=YOUR_AFFILIATE_ID"
};
```

When users click to purchase premium, you earn commission!

### Analytics Integration

Add to Cloudflare Workers:

```javascript
// Track installations
ctx.waitUntil(
  fetch("https://your-analytics.com/track", {
    method: "POST",
    body: JSON.stringify({
      event: "addon_install",
      timestamp: new Date(),
      url: request.url
    })
  })
);
```

### Performance Optimization

**Current Implementation:**
- ✅ Max 50 results per catalog (mobile optimized)
- ✅ TMDB caching (TMDB doesn't rate limit)
- ✅ Retry logic with 2 attempts
- ✅ 8-second timeout per request
- ✅ Gzip compression on all responses

**Further Optimization:**
```javascript
// Add KV caching (Cloudflare)
const cache = await CACHE_KV.get(`catalog:${catalogId}`);
if (cache) return jsonResponse(JSON.parse(cache));

// Cache for 1 hour
await CACHE_KV.put(`catalog:${catalogId}`, JSON.stringify(data), {
  expirationTtl: 3600
});
```

---

## 🔐 Security & Best Practices

### API Key Protection

**Never commit your TMDB key!** Use Cloudflare Secrets:

```bash
wrangler secret put TMDB_API_KEY
# Enter your key securely
```

Update code:
```javascript
const TMDB_KEY = env.TMDB_API_KEY;
```

### CORS Protection

Already implemented with strict CORS headers. Safe to deploy.

### Rate Limiting

```javascript
// Add rate limiting per IP
const ipKey = request.headers.get('cf-connecting-ip');
const requests = await RATE_LIMIT_KV.get(ipKey) || 0;

if (requests > 100) {
  return new Response("Rate limit exceeded", { status: 429 });
}
```

---

## 📦 Advanced: Add More Sources

### Add HDHub/MixDrop Integration

```javascript
async function getDirectDDL(title) {
  // Your HTML scraper logic
  const response = await fetch(`https://hdmovies2024.web/search?q=${title}`);
  const html = await response.text();
  // Parse HTML and extract MP4 URLs
  return extractDownloadLinks(html);
}
```

### Add Anime-Specific Scraper

```javascript
async function getAnimeStreams(animeTitle) {
  const url = `https://api.anify.tv/info?query=${animeTitle}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.sources.map(s => ({
    name: s.name,
    url: s.url,
    quality: s.quality
  }));
}
```

---

## 🌟 PRO TIPS

### Use Multiple Endpoints

```javascript
// Rotate between multiple TMDB mirrors if one fails
const TMDB_MIRRORS = [
  "https://api.themoviedb.org/3",
  "https://api.tmdb.org/3"  // Fallback
];
```

### Add Automatic Updates

GitHub Actions workflow: `.github/workflows/deploy.yml`

```yaml
name: Auto Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: cloudflare/wrangler-action@2.0.0
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Monitor Performance

Use Cloudflare Analytics:
- Dashboard → Analytics
- View requests, errors, response times
- Optimize based on data

---

## 🎯 Final Checklist

- [ ] Code copied to GitHub repository
- [ ] wrangler.toml configured
- [ ] TMDB API key added
- [ ] Deployed to Cloudflare Workers
- [ ] Manifest.json verified
- [ ] Addon installed in Stremio
- [ ] Test streams working
- [ ] Shared with friends/community
- [ ] GitHub repo public (for credibility)
- [ ] Custom domain added (optional)

---

## 📱 Quick Stremio Install Link

After deployment, share this:

```
stremio://YOUR_WORKER_URL/manifest.json
```

Click on this link in Stremio to auto-install!

---

## 🆘 Troubleshooting

### "Addon Not Loading"
- Check manifest.json is valid JSON
- Verify CORS headers present
- Check Cloudflare Worker logs

### "No Streams Found"
- TMDB API key may be invalid
- Check torrent/DDL sources are online
- Verify URL encoding of search terms

### "Slow Performance"
- Add KV caching
- Reduce results per catalog
- Use Cloudflare Analytics to identify bottleneck

---

## 📞 Support

- GitHub Issues: Report bugs
- Stremio Community: Share your addon
- Discord: Join addon development community

---

**🚀 You're Ready to Launch!** Deploy now and share with the Stremio community. This is professional-grade code ready for thousands of users.

**Happy Streaming! 👑**
