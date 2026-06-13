import React from 'react';
import { useLocation } from 'react-router-dom';
import SEOHead from './SEOHead';

const SITE_URL = 'https://kos.meowlabs.id';
const DEFAULT_DESCRIPTION = 'KosAtlas adalah peta kos Semarang untuk eksplor area, banding harga, dan lanjut ke listing asli dengan lebih cepat.';
const DEFAULT_IMAGE = `${SITE_URL}/og-cover.svg`;

const buildSearchDescription = (query: string | null, location: string | null) => {
  if (query) {
    return `Cari kos di Semarang untuk kata kunci ${query} lewat peta interaktif, bandingkan harga, fasilitas, dan lokasi di KosAtlas.`;
  }

  if (location) {
    return `Temukan kos di area ${location} Semarang lewat peta interaktif KosAtlas. Bandingkan harga bulanan, fasilitas, dan lokasi lebih cepat.`;
  }

  return 'Jelajahi 1000+ kos di Semarang lewat peta interaktif. Bandingkan harga, fasilitas, dan area tanpa scroll listing tanpa akhir.';
};

const buildRouteMeta = (pathname: string, search: string) => {
  const params = new URLSearchParams(search);

  if (pathname === '/') {
    return {
      title: 'Peta Kos Semarang untuk Cari Kos Lebih Cepat',
      description: DEFAULT_DESCRIPTION,
      canonicalPath: '/',
      image: DEFAULT_IMAGE,
      robots: 'index,follow',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'KosAtlas',
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'id-ID',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    };
  }

  if (pathname === '/search') {
    const query = params.get('q');
    const location = params.get('location');
    const title = query
      ? `Cari Kos ${query} di Semarang lewat Peta`
      : location
        ? `Kos ${location} Semarang lewat Peta`
        : 'Cari Kos Semarang lewat Peta Interaktif';

    return {
      title,
      description: buildSearchDescription(query, location),
      canonicalPath: `/search${query ? `?q=${encodeURIComponent(query)}` : location ? `?location=${encodeURIComponent(location)}` : ''}`,
      image: DEFAULT_IMAGE,
      robots: 'index,follow',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        url: `${SITE_URL}${pathname}${query ? `?q=${encodeURIComponent(query)}` : location ? `?location=${encodeURIComponent(location)}` : ''}`,
        description: buildSearchDescription(query, location),
        isPartOf: {
          '@type': 'WebSite',
          name: 'KosAtlas',
          url: SITE_URL,
        },
      },
    };
  }

  if (pathname === '/about') {
    return {
      title: 'Tentang KosAtlas, Peta Kos Semarang',
      description: 'Pelajari cara kerja KosAtlas sebagai platform discovery kos berbasis peta untuk area Semarang.',
      canonicalPath: '/about',
      image: DEFAULT_IMAGE,
      robots: 'index,follow',
      jsonLd: null,
    };
  }

  if (pathname === '/help') {
    return {
      title: 'Bantuan Cari Kos di Semarang',
      description: 'Panduan menggunakan KosAtlas untuk mencari kos di Semarang lewat peta, filter harga, dan detail listing.',
      canonicalPath: '/help',
      image: DEFAULT_IMAGE,
      robots: 'index,follow',
      jsonLd: null,
    };
  }

  if (pathname === '/login' || pathname === '/register' || pathname === '/dashboard' || pathname === '/bookings') {
    return {
      title: 'KosAtlas',
      description: DEFAULT_DESCRIPTION,
      canonicalPath: pathname,
      image: DEFAULT_IMAGE,
      robots: 'noindex,nofollow',
      jsonLd: null,
    };
  }

  if (pathname.startsWith('/property/')) {
    return {
      title: 'Detail Kos di Semarang',
      description: 'Lihat detail kos, harga bulanan, fasilitas, dan lokasi lengkap di KosAtlas.',
      canonicalPath: pathname,
      image: DEFAULT_IMAGE,
      robots: 'index,follow',
      jsonLd: null,
    };
  }

  return {
    title: 'KosAtlas',
    description: DEFAULT_DESCRIPTION,
    canonicalPath: pathname,
    image: DEFAULT_IMAGE,
    robots: 'index,follow',
    jsonLd: null,
  };
};

const RouteSeo: React.FC = () => {
  const location = useLocation();
  const meta = buildRouteMeta(location.pathname, location.search);

  return <SEOHead {...meta} />;
};

export default RouteSeo;
