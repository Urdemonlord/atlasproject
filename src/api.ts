import { Property, SearchFilters } from '../types';

const API_BASE = '/api';

const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  tembalang: { lat: -7.0526, lng: 110.4381 },
  'semarang tengah': { lat: -6.9892, lng: 110.4203 },
  'semarang selatan': { lat: -7.0051, lng: 110.4381 },
  'semarang utara': { lat: -6.9536, lng: 110.4287 },
  'semarang timur': { lat: -6.9828, lng: 110.4458 },
  'semarang barat': { lat: -6.9802, lng: 110.3895 },
  banyumanik: { lat: -7.0619, lng: 110.4208 },
  ngaliyan: { lat: -6.9908, lng: 110.3472 },
  candisari: { lat: -7.0247, lng: 110.4354 },
  gajahmungkur: { lat: -7.0129, lng: 110.4217 },
  gunungpati: { lat: -7.0495, lng: 110.3507 },
  genuk: { lat: -6.9656, lng: 110.4852 },
  gayamsari: { lat: -6.9898, lng: 110.4523 },
  mijen: { lat: -7.0255, lng: 110.2949 },
  pedurungan: { lat: -6.9728, lng: 110.4676 },
  pleburan: { lat: -7.0054, lng: 110.4388 },
  'simpang lima': { lat: -6.9932, lng: 110.4208 },
};

function resolveCoordinates(areaLabel?: string, area?: string) {
  const haystack = `${areaLabel || ''} ${area || ''}`.toLowerCase();
  const match = Object.entries(AREA_COORDINATES).find(([key]) => haystack.includes(key));
  return match?.[1] || { lat: -6.9667, lng: 110.4167 };
}

const LANDMARK_ALIASES: Array<{
  key: string;
  terms: string[];
  districts?: string[];
  areaKeywords?: string[];
}> = [
  {
    key: 'tembalang',
    terms: ['tembalang', 'undip', 'universitas diponegoro', 'kampus undip', 'diponegoro'],
    districts: ['semarang selatan'],
    areaKeywords: ['pleburan', 'candisari', 'gajahmungkur', 'banyumanik'],
  },
  {
    key: 'simpang-lima',
    terms: ['simpang lima', 'simpanglima', 'pahlawan'],
    districts: ['semarang tengah', 'semarang selatan'],
    areaKeywords: ['pleburan'],
  },
  {
    key: 'unnes',
    terms: ['unnes', 'universitas negeri semarang', 'sekaran', 'gunungpati'],
    districts: ['gunungpati', 'ngaliyan'],
    areaKeywords: ['sekaran'],
  },
];

function getSearchAliases(property: Property): string[] {
  const district = property.address.district.toLowerCase();
  const street = property.address.street.toLowerCase();

  return LANDMARK_ALIASES.flatMap((alias) => {
    const districtMatch = alias.districts?.some((value) => district.includes(value)) ?? false;
    const areaMatch = alias.areaKeywords?.some((value) => street.includes(value)) ?? false;
    return districtMatch || areaMatch ? alias.terms : [];
  });
}

function buildSearchableText(property: Property): string {
  return [
    property.title,
    property.description,
    property.address.street,
    property.address.district,
    property.address.city,
    ...getSearchAliases(property),
  ]
    .join(' ')
    .toLowerCase();
}

function matchesLocation(property: Property, rawLocation: string): boolean {
  const location = rawLocation.trim().toLowerCase();
  if (!location) return true;

  const searchableText = buildSearchableText(property);
  return searchableText.includes(location);
}

export interface KosListing {
  id: number;
  name: string;
  price: number;
  price_raw: string;
  area: string;
  city: string;
  area_label: string;
  property_type: string;
  facilities: string[];
  available_rooms: number;
  rating: number;
  review_count?: number;
  is_singgahsini: boolean;
  is_promoted: boolean;
  is_booking: boolean;
  status: string;
  photo: string;
  url: string;
  source: string;
  latitude?: number;
  longitude?: number;
}

export interface KosListingsResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  listings: KosListing[];
}

/**
 * Map raw Mamikos listing from API to frontend Property interface
 */
function mapToListing(item: KosListing): Property {
  const price = item.price || 0;
  const hasRealCoordinates = typeof item.latitude === 'number' && typeof item.longitude === 'number';
  const coordinates = hasRealCoordinates
    ? { lat: item.latitude!, lng: item.longitude! }
    : resolveCoordinates(item.area_label, item.area);

  return {
    id: String(item.id),
    title: item.name,
    url: item.url || undefined,
    description: `Kos ${item.property_type} di ${item.area || item.city}. Fasilitas: ${(item.facilities || []).slice(0, 5).join(', ')}. ${item.available_rooms > 0 ? `${item.available_rooms} kamar tersedia.` : ''}`,
    address: {
      street: item.area_label?.split(',')[0] || item.area || '',
      district: item.area?.replace('Kecamatan ', '') || '',
      city: item.city || 'Semarang',
      postal_code: '',
    },
    coordinates,
    property_type: (item.property_type === 'putra' || item.property_type === 'putri' || item.property_type === 'campur')
      ? item.property_type as 'putra' | 'putri' | 'campur'
      : 'campur',
    facilities: item.facilities || [],
    pricing: {
      monthly_rent: price,
      deposit: Math.round(price * 0.8),
      utilities: Math.round(price * 0.1),
    },
    room_count: item.available_rooms || 0,
    available_rooms: item.available_rooms || 0,
    images: [`/api/photos/mamikos/${item.id}`],
    status: item.status === 'verified' ? 'active' : 'active',
    rating: item.rating || 0,
    review_count: item.review_count || 0,
    is_premium: item.is_promoted || false,
    created_at: '',
    updated_at: '',
  };
}

/**
 * Fetch paginated listing dari backend API
 */
export async function fetchListings(params: {
  page?: number;
  limit?: number;
  filters?: SearchFilters;
  query?: string;
} = {}): Promise<{ properties: Property[]; total: number; loading: boolean; error: string | null }> {
  try {
    const { page = 1, limit = 50 } = params;

    const url = `${API_BASE}/kos/listings?page=${page}&limit=${limit}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data: KosListingsResponse = await res.json();
    const properties = data.listings.map(mapToListing);

    // Apply client-side filters
    let filtered = properties;
    if (params.filters) {
      const f = params.filters;
      if (f.property_type) {
        filtered = filtered.filter(p => p.property_type === f.property_type);
      }
      if (f.min_price) {
        filtered = filtered.filter(p => p.pricing.monthly_rent >= f.min_price!);
      }
      if (f.max_price) {
        filtered = filtered.filter(p => p.pricing.monthly_rent <= f.max_price!);
      }
      if (f.facilities && f.facilities.length > 0) {
        filtered = filtered.filter(p =>
          f.facilities!.some((fac: string) => p.facilities.some((pfac: string) => pfac.toLowerCase().includes(fac.toLowerCase())))
        );
      }
      if (f.location) {
        filtered = filtered.filter((p) => matchesLocation(p, f.location!));
      }
      if (params.query?.trim()) {
        const query = params.query.trim().toLowerCase();
        filtered = filtered.filter((p) => buildSearchableText(p).includes(query));
      }
      // Sorting
      if (f.sort_by) {
        switch (f.sort_by) {
          case 'price_low':
            filtered.sort((a, b) => a.pricing.monthly_rent - b.pricing.monthly_rent);
            break;
          case 'price_high':
            filtered.sort((a, b) => b.pricing.monthly_rent - a.pricing.monthly_rent);
            break;
          case 'rating':
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        }
      }
    }

    return {
      properties: filtered,
      total: data.total,
      loading: false,
      error: null,
    };
  } catch (err) {
    return {
      properties: [],
      total: 0,
      loading: false,
      error: err instanceof Error ? err.message : 'Gagal memuat data kos',
    };
  }
}

/**
 * Fetch single listing by ID
 */
export async function fetchListingById(id: string): Promise<{ property: Property | null; error: string | null }> {
  try {
    // Fetch first page and find the listing
    const res = await fetch(`${API_BASE}/kos/listings?page=1&limit=1000`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: KosListingsResponse = await res.json();
    const item = data.listings.find(l => String(l.id) === id);

    if (!item) {
      return { property: null, error: 'Kos tidak ditemukan' };
    }

    return { property: mapToListing(item), error: null };
  } catch (err) {
    return {
      property: null,
      error: err instanceof Error ? err.message : 'Gagal memuat detail kos',
    };
  }
}
