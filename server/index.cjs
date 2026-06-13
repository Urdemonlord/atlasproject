const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;
const CACHE_DIR = path.join(__dirname, '..', 'cache', 'photos');
const DATA_DIR = path.join(__dirname, '..');

// Ensure cache dir exists
fs.mkdirSync(CACHE_DIR, { recursive: true });

app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// Helper: download & cache image from URL
// ──────────────────────────────────────────────
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('Timeout')); });
  });
}

// ──────────────────────────────────────────────
// GET /api/kos — ringkasan data
// ──────────────────────────────────────────────
app.get('/api/kos', (req, res) => {
  try {
    const sources = {};

    const mamikosPath = path.join(DATA_DIR, 'mamikos_listings.json');
    if (fs.existsSync(mamikosPath)) {
      const raw = JSON.parse(fs.readFileSync(mamikosPath, 'utf-8'));
      if (Array.isArray(raw)) {
        sources.mamikos = raw;
      } else {
        const listKey = Object.keys(raw).find(k => Array.isArray(raw[k]) && raw[k].length > 0);
        sources.mamikos = listKey ? raw[listKey] : [];
      }
    }

    const allKosPath = path.join(DATA_DIR, 'all_kos_data.json');
    if (fs.existsSync(allKosPath)) {
      const raw = JSON.parse(fs.readFileSync(allKosPath, 'utf-8'));
      if (Array.isArray(raw)) {
        sources.merged = raw;
      } else if (raw.listings) {
        sources.merged = raw.listings;
      }
    }

    const scrapedPath = path.join(DATA_DIR, 'scraped_photos.json');
    if (fs.existsSync(scrapedPath)) {
      sources.scraped = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
    }

    res.json({
      total: (sources.mamikos?.length || 0) + (sources.merged?.length || 0) + (sources.scraped?.length || 0),
      sources: Object.keys(sources),
      mamikos_count: sources.mamikos?.length || 0,
      merged_count: sources.merged?.length || 0,
      scraped_count: sources.scraped?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/kos/listings — paginated Mamikos listings
// ──────────────────────────────────────────────
app.get('/api/kos/listings', (req, res) => {
  try {
    const mamikosPath = path.join(DATA_DIR, 'mamikos_listings.json');
    if (!fs.existsSync(mamikosPath)) {
      return res.json({ listings: [] });
    }
    const raw = JSON.parse(fs.readFileSync(mamikosPath, 'utf-8'));
    let listings;
    if (Array.isArray(raw)) {
      listings = raw;
    } else {
      const listKey = Object.keys(raw).find(k => Array.isArray(raw[k]) && raw[k].length > 0);
      listings = listKey ? raw[listKey] : [];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const paged = listings.slice(start, start + limit);

    res.json({
      total: listings.length,
      page,
      limit,
      total_pages: Math.ceil(listings.length / limit),
      listings: paged
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/photos/mamikos/:id — proxy & cache Mamikos photo
// ──────────────────────────────────────────────
app.get('/api/photos/mamikos/:id', async (req, res) => {
  const mamikosPath = path.join(DATA_DIR, 'mamikos_listings.json');
  if (!fs.existsSync(mamikosPath)) {
    return res.status(404).json({ error: 'No data' });
  }

  try {
    const raw = JSON.parse(fs.readFileSync(mamikosPath, 'utf-8'));
    let listings;
    if (Array.isArray(raw)) listings = raw;
    else {
      const listKey = Object.keys(raw).find(k => Array.isArray(raw[k]));
      listings = listKey ? raw[listKey] : [];
    }

    const listing = listings.find(l => String(l.id) === req.params.id || String(l._id) === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    let imageUrl = listing.photo_url?.medium || listing.photo_url?.large || listing.photo;
    if (!imageUrl) return res.status(404).json({ error: 'No photo for this listing' });

    const cacheKey = `mamikos_${req.params.id}_${path.basename(imageUrl)}`;
    const cachePath = path.join(CACHE_DIR, cacheKey);
    if (fs.existsSync(cachePath)) {
      return res.sendFile(cachePath);
    }

    const imageBuffer = await downloadImage(imageUrl);
    fs.writeFileSync(cachePath, imageBuffer);

    const ext = path.extname(imageUrl).toLowerCase();
    const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
    res.set('Content-Type', mimeTypes[ext] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Mamikos photo error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/photos/kostsemarang/:name — proxy kostsemarang photo
// ──────────────────────────────────────────────
app.get('/api/photos/kostsemarang/:name', async (req, res) => {
  const scrapedPath = path.join(DATA_DIR, 'scraped_photos.json');
  if (!fs.existsSync(scrapedPath)) return res.status(404).json({ error: 'No scraped data' });

  try {
    const scraped = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
    const name = decodeURIComponent(req.params.name);
    const listing = scraped.find(l => l.source === 'kostsemarang' && l.name.toLowerCase().includes(name.toLowerCase()));
    if (!listing || !listing.photo_urls?.length) return res.status(404).json({ error: 'No photos' });

    const idx = parseInt(req.query.index) || 0;
    const imageUrl = listing.photo_urls[idx] || listing.photo_urls[0];

    const cacheKey = `kostsemarang_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${idx}.jpg`;
    const cachePath = path.join(CACHE_DIR, cacheKey);
    if (fs.existsSync(cachePath)) return res.sendFile(cachePath);

    const imageBuffer = await downloadImage(imageUrl);
    fs.writeFileSync(cachePath, imageBuffer);
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(imageBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/photos/tantekos/:name — proxy tantekos photo
// ──────────────────────────────────────────────
app.get('/api/photos/tantekos/:name', async (req, res) => {
  const scrapedPath = path.join(DATA_DIR, 'scraped_photos.json');
  if (!fs.existsSync(scrapedPath)) return res.status(404).json({ error: 'No scraped data' });

  try {
    const scraped = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
    const name = decodeURIComponent(req.params.name);
    const listing = scraped.find(l => l.source === 'tantekos' && l.name.toLowerCase().includes(name.toLowerCase()));
    if (!listing || !listing.photo_urls?.length) return res.status(404).json({ error: 'No photos' });

    const idx = parseInt(req.query.index) || 0;
    const imageUrl = listing.photo_urls[idx] || listing.photo_urls[0];

    const cacheKey = `tantekos_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${idx}.jpg`;
    const cachePath = path.join(CACHE_DIR, cacheKey);
    if (fs.existsSync(cachePath)) return res.sendFile(cachePath);

    const imageBuffer = await downloadImage(imageUrl);
    fs.writeFileSync(cachePath, imageBuffer);
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(imageBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const cacheSize = fs.existsSync(CACHE_DIR) 
    ? fs.readdirSync(CACHE_DIR).length 
    : 0;
  res.json({ status: 'ok', cached_photos: cacheSize, port: PORT });
});

// ──────────────────────────────────────────────
// Static files (built frontend production)
// ──────────────────────────────────────────────
const distPath = path.join(DATA_DIR, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback for non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

app.listen(PORT, () => {
  console.log(` KosAtlas API server running on http://localhost:${PORT}`);
  console.log(` Photo cache: ${CACHE_DIR}`);
  console.log(` Data dir: ${DATA_DIR}`);
});
