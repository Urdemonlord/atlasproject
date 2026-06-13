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
const BASE_URL = 'https://kos.meowlabs.id';
const SITE_NAME = 'KosAtlas';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-cover.svg`;
const DIST_PATH = path.join(DATA_DIR, 'dist');

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadMamikosListings() {
  const mamikosPath = path.join(DATA_DIR, 'mamikos_listings.json');
  if (!fs.existsSync(mamikosPath)) return [];

  const raw = JSON.parse(fs.readFileSync(mamikosPath, 'utf-8'));
  if (Array.isArray(raw)) return raw;

  const listKey = Object.keys(raw).find((key) => Array.isArray(raw[key]) && raw[key].length > 0);
  return listKey ? raw[listKey] : [];
}

function findListingById(id) {
  return loadMamikosListings().find((listing) => String(listing.id) === String(id) || String(listing._id) === String(id)) || null;
}

function propertyTypeLabel(type) {
  if (type === 'putra') return 'khusus putra';
  if (type === 'putri') return 'khusus putri';
  return 'campur';
}

function buildPropertyDescription(listing) {
  const area = listing.area || listing.city || 'Semarang';
  const facilities = Array.isArray(listing.facilities) ? listing.facilities.slice(0, 5).join(', ') : '';
  const price = listing.price_raw
    ? String(listing.price_raw).replace(/\s*\/\s*bulan/i, '').trim()
    : (listing.price ? `Rp${Number(listing.price).toLocaleString('id-ID')}` : 'Harga hubungi pemilik');
  return [
    `${listing.name} adalah kos ${propertyTypeLabel(listing.property_type)} di ${area}.`,
    ` Harga mulai ${price}/bulan.`,
    facilities ? ` Fasilitas: ${facilities}.` : '',
    ' Cek lokasi dan detailnya di KosAtlas.',
  ].join('');
}

function buildSearchDescription(query, location) {
  if (query) {
    return `Cari kos di Semarang untuk kata kunci ${query} lewat peta interaktif, bandingkan harga, fasilitas, dan lokasi di KosAtlas.`;
  }

  if (location) {
    return `Temukan kos di area ${location} Semarang lewat peta interaktif KosAtlas. Bandingkan harga bulanan, fasilitas, dan lokasi lebih cepat.`;
  }

  return 'Jelajahi 1000+ kos di Semarang lewat peta interaktif. Bandingkan harga, fasilitas, dan area tanpa scroll listing tanpa akhir.';
}

function buildCanonicalUrl(req) {
  const url = new URL(`${BASE_URL}${req.path}`);
  const allowedParams = ['q', 'location'];
  for (const key of allowedParams) {
    if (typeof req.query[key] === 'string' && req.query[key].trim()) {
      url.searchParams.set(key, req.query[key].trim());
    }
  }
  return url.toString();
}

function buildSeoData(req) {
  const pathName = req.path;
  const canonical = buildCanonicalUrl(req);
  const defaultDescription = 'KosAtlas adalah peta kos Semarang untuk eksplor area, banding harga, dan lanjut ke listing asli dengan lebih cepat.';
  const base = {
    title: 'KosAtlas | Peta Kos Semarang',
    description: defaultDescription,
    canonical,
    robots: 'index,follow',
    ogType: 'website',
    image: DEFAULT_OG_IMAGE,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: BASE_URL,
      description: defaultDescription,
      inLanguage: 'id-ID',
    },
  };

  if (pathName === '/') {
    return {
      ...base,
      title: 'Peta Kos Semarang untuk Cari Kos Lebih Cepat | KosAtlas',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
        description: defaultDescription,
        inLanguage: 'id-ID',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${BASE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    };
  }

  if (pathName === '/search') {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
    const title = query
      ? `Cari Kos ${query} di Semarang lewat Peta | KosAtlas`
      : location
        ? `Kos ${location} Semarang lewat Peta | KosAtlas`
        : 'Cari Kos Semarang lewat Peta Interaktif | KosAtlas';
    const description = buildSearchDescription(query, location);

    return {
      ...base,
      title,
      description,
      canonical,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        url: canonical,
        description,
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: BASE_URL,
        },
      },
    };
  }

  if (pathName.startsWith('/property/')) {
    const id = pathName.split('/').pop();
    const listing = id ? findListingById(id) : null;

    if (listing) {
      const title = `${listing.name} di ${listing.area || listing.city || 'Semarang'} | KosAtlas`;
      const description = buildPropertyDescription(listing);
      return {
        ...base,
        title,
        description,
        canonical: `${BASE_URL}/property/${listing.id}`,
        ogType: 'product',
        image: `${BASE_URL}/api/photos/mamikos/${listing.id}`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'LodgingBusiness',
          name: listing.name,
          description,
          url: `${BASE_URL}/property/${listing.id}`,
          image: `${BASE_URL}/api/photos/mamikos/${listing.id}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: listing.area_label || listing.area || '',
            addressLocality: listing.area || '',
            addressRegion: listing.city || 'Semarang',
            addressCountry: 'ID',
          },
          geo: typeof listing.latitude === 'number' && typeof listing.longitude === 'number'
            ? {
                '@type': 'GeoCoordinates',
                latitude: listing.latitude,
                longitude: listing.longitude,
              }
            : undefined,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'IDR',
            price: listing.price || 0,
            availability: (listing.available_rooms || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            url: `${BASE_URL}/property/${listing.id}`,
          },
        },
      };
    }
  }

  if (pathName === '/about') {
    return {
      ...base,
      title: 'Tentang KosAtlas, Peta Kos Semarang',
      description: 'Pelajari cara kerja KosAtlas sebagai platform discovery kos berbasis peta untuk area Semarang.',
    };
  }

  if (pathName === '/help') {
    return {
      ...base,
      title: 'Bantuan Cari Kos di Semarang | KosAtlas',
      description: 'Panduan menggunakan KosAtlas untuk mencari kos di Semarang lewat peta, filter harga, dan detail listing.',
    };
  }

  if (['/login', '/register', '/dashboard', '/bookings'].includes(pathName)) {
    return {
      ...base,
      title: `${SITE_NAME}`,
      robots: 'noindex,nofollow',
      jsonLd: null,
    };
  }

  return base;
}

function renderSeoHtml(template, seo) {
  const safeJsonLd = seo.jsonLd ? JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c') : '';

  return template
    .replace(/__SEO_TITLE__/g, escapeHtml(seo.title))
    .replace(/__SEO_DESCRIPTION__/g, escapeHtml(seo.description))
    .replace(/__SEO_CANONICAL__/g, escapeHtml(seo.canonical))
    .replace(/__SEO_ROBOTS__/g, escapeHtml(seo.robots))
    .replace(/__SEO_OG_TYPE__/g, escapeHtml(seo.ogType))
    .replace(/__SEO_IMAGE__/g, escapeHtml(seo.image))
    .replace(/__SEO_JSON_LD__/g, safeJsonLd);
}

function buildSitemapXml() {
  const staticUrls = ['/', '/search', '/about', '/help'];
  const listings = loadMamikosListings();
  const urls = [
    ...staticUrls.map((route) => ({
      loc: `${BASE_URL}${route}`,
      changefreq: route === '/' ? 'daily' : 'weekly',
      priority: route === '/' ? '1.0' : '0.8',
    })),
    ...listings.map((listing) => ({
      loc: `${BASE_URL}/property/${listing.id}`,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: listing.updated_at || listing.created_at || undefined,
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((entry) => `  <url>\n    <loc>${escapeHtml(entry.loc)}</loc>${entry.lastmod ? `\n    <lastmod>${escapeHtml(new Date(entry.lastmod).toISOString())}</lastmod>` : ''}\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`).join('\n')}\n</urlset>`;
}

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

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(buildSitemapXml());
});

// ──────────────────────────────────────────────
// Static files (built frontend production)
// ──────────────────────────────────────────────
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH, { index: false }));
  // SPA fallback for non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      const indexPath = path.join(DIST_PATH, 'index.html');
      const template = fs.readFileSync(indexPath, 'utf-8');
      const seo = buildSeoData(req);
      res.type('html').send(renderSeoHtml(template, seo));
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
