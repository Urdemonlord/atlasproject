import { useEffect } from 'react';

const SITE_NAME = 'KosAtlas';
const DEFAULT_IMAGE = 'https://kos.meowlabs.id/og-cover.svg';

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  robots?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: JsonLd | null;
}

const ensureMeta = (selector: string, create: () => HTMLElement) => {
  let element = document.head.querySelector(selector) as HTMLElement | null;
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  return element;
};

const setMetaContent = (selector: string, attributeName: 'name' | 'property', attributeValue: string, content: string) => {
  const meta = ensureMeta(selector, () => {
    const node = document.createElement('meta');
    node.setAttribute(attributeName, attributeValue);
    return node;
  }) as HTMLMetaElement;

  meta.setAttribute(attributeName, attributeValue);
  meta.content = content;
};

const upsertLink = (selector: string, rel: string, href: string) => {
  const link = ensureMeta(selector, () => {
    const node = document.createElement('link');
    node.setAttribute('rel', rel);
    return node;
  }) as HTMLLinkElement;

  link.rel = rel;
  link.href = href;
};

const toAbsoluteUrl = (value?: string) => {
  const fallback = DEFAULT_IMAGE;
  if (!value) return fallback;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return new URL(value, window.location.origin).toString();
};

const normalizeTitle = (title: string) => {
  if (title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
};

export default function SEOHead({
  title,
  description,
  canonicalPath,
  image,
  robots = 'index,follow',
  type = 'website',
  jsonLd,
}: SEOHeadProps) {
  useEffect(() => {
    const finalTitle = normalizeTitle(title);
    const canonicalUrl = canonicalPath
      ? new URL(canonicalPath, window.location.origin).toString()
      : window.location.href;
    const imageUrl = toAbsoluteUrl(image);

    document.title = finalTitle;
    document.documentElement.lang = 'id';

    setMetaContent('meta[name="description"]', 'name', 'description', description);
    setMetaContent('meta[name="robots"]', 'name', 'robots', robots);
    setMetaContent('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    setMetaContent('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    setMetaContent('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaContent('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaContent('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaContent('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMetaContent('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaContent('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    setMetaContent('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaContent('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    upsertLink('link[rel="canonical"]', 'canonical', canonicalUrl);

    const existingJsonLd = document.getElementById('seo-jsonld');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'seo-jsonld';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [canonicalPath, description, image, jsonLd, robots, title, type]);

  return null;
}
