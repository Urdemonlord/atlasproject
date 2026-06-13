import { useState, useEffect } from 'react';
import { Property, SearchFilters } from '../types';
import { fetchListings, fetchListingById } from '../api';

// ──────────────────────────────────────────────
// Mock data fallback (when backend is down)
// ──────────────────────────────────────────────
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Kos Putri Premium Dekat UNDIP',
    description: 'Kos nyaman dan aman khusus putri, dekat dengan kampus UNDIP. Fasilitas lengkap dengan WiFi, AC, dapur bersama, dan keamanan 24 jam.',
    address: { street: 'Jl. Prof. Soedarto No. 15', district: 'Tembalang', city: 'Semarang', postal_code: '50275' },
    coordinates: { lat: -7.0505, lng: 110.4375 },
    property_type: 'putri',
    facilities: ['wifi', 'ac', 'parking', 'dapur_bersama', 'laundry', 'security_24jam'],
    pricing: { monthly_rent: 800000, deposit: 800000, utilities: 100000 },
    room_count: 20, available_rooms: 5,
    images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
    status: 'active', rating: 4.5, review_count: 12, is_premium: true,
    created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Kos Putra Strategis Pleburan',
    description: 'Lokasi strategis di Pleburan, dekat dengan berbagai kampus dan pusat kota.',
    address: { street: 'Jl. Pleburan Raya No. 88', district: 'Semarang Selatan', city: 'Semarang', postal_code: '50241' },
    coordinates: { lat: -7.0051, lng: 110.4381 },
    property_type: 'putra',
    facilities: ['wifi', 'ac', 'parking', 'gym', 'rooftop', 'cctv'],
    pricing: { monthly_rent: 1200000, deposit: 1200000, utilities: 150000 },
    room_count: 15, available_rooms: 3,
    images: ['https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg'],
    status: 'active', rating: 4.2, review_count: 8, is_premium: false,
    created_at: '2024-01-10T08:30:00Z', updated_at: '2024-01-10T08:30:00Z'
  },
  {
    id: '3',
    title: 'Kos Campur Ekonomis Ngaliyan',
    description: 'Kos dengan harga terjangkau di daerah Ngaliyan.',
    address: { street: 'Jl. Ngaliyan Raya No. 45', district: 'Ngaliyan', city: 'Semarang', postal_code: '50185' },
    coordinates: { lat: -7.0611, lng: 110.3539 },
    property_type: 'campur',
    facilities: ['wifi', 'parking', 'dapur_bersama', 'laundry'],
    pricing: { monthly_rent: 500000, deposit: 500000, utilities: 75000 },
    room_count: 25, available_rooms: 8,
    images: ['https://images.pexels.com/photos/1571452/pexels-photo-1571452.jpeg'],
    status: 'active', rating: 3.8, review_count: 15, is_premium: false,
    created_at: '2024-01-05T14:20:00Z', updated_at: '2024-01-05T14:20:00Z'
  },
  {
    id: '4',
    title: 'Kos Putri Modern Banyumanik',
    description: 'Kos modern dengan desain kontemporer di Banyumanik.',
    address: { street: 'Jl. Banyumanik Raya No. 123', district: 'Banyumanik', city: 'Semarang', postal_code: '50264' },
    coordinates: { lat: -7.0625, lng: 110.4056 },
    property_type: 'putri',
    facilities: ['wifi', 'ac', 'parking', 'laundry', 'security_24jam', 'cctv'],
    pricing: { monthly_rent: 950000, deposit: 950000, utilities: 120000 },
    room_count: 18, available_rooms: 4,
    images: ['https://images.pexels.com/photos/1571455/pexels-photo-1571455.jpeg'],
    status: 'active', rating: 4.7, review_count: 20, is_premium: true,
    created_at: '2024-01-20T09:15:00Z', updated_at: '2024-01-20T09:15:00Z'
  },
];

// ──────────────────────────────────────────────
// useProperties — fetch listing list
// ──────────────────────────────────────────────
export const useProperties = (
  filters?: SearchFilters,
  options?: { limit?: number; query?: string }
) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchListings({
          page: 1,
          limit: options?.limit || 120,
          filters,
          query: options?.query,
        });

        if (cancelled) return;

        if (result.error) {
          // Fallback to mock data
          console.warn('API fetch failed, using mock data:', result.error);
          let filtered = [...mockProperties];
          if (filters) {
            if (filters.property_type) {
              filtered = filtered.filter(p => p.property_type === filters.property_type);
            }
            if (filters.min_price) {
              filtered = filtered.filter(p => p.pricing.monthly_rent >= filters.min_price!);
            }
            if (filters.max_price) {
              filtered = filtered.filter(p => p.pricing.monthly_rent <= filters.max_price!);
            }
            if (filters.sort_by === 'price_low') {
              filtered.sort((a, b) => a.pricing.monthly_rent - b.pricing.monthly_rent);
            } else if (filters.sort_by === 'price_high') {
              filtered.sort((a, b) => b.pricing.monthly_rent - a.pricing.monthly_rent);
            } else if (filters.sort_by === 'rating') {
              filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            }
          }
          filtered.sort((a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0));
          setProperties(filtered);
          setTotal(filtered.length);
        } else {
          let sorted = [...result.properties];
          sorted.sort((a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0));
          setProperties(sorted);
          setTotal(result.total);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Error loading properties, using mock data:', err);
          setProperties(mockProperties);
          setTotal(mockProperties.length);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [filters, options?.limit, options?.query]);

  return { properties, total, loading, error };
};

// ──────────────────────────────────────────────
// useProperty — fetch single listing
// ──────────────────────────────────────────────
export const useProperty = (id: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchListingById(id);

        if (cancelled) return;

        if (result.property) {
          setProperty(result.property);
        } else {
          // Fallback to mock
          const found = mockProperties.find(p => p.id === id);
          if (found) {
            setProperty(found);
          } else {
            setError('Kos tidak ditemukan');
          }
        }
      } catch (err) {
        if (!cancelled) {
          // Fallback to mock
          const found = mockProperties.find(p => p.id === id);
          if (found) {
            setProperty(found);
          } else {
            setError('Gagal memuat data');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) load();
    return () => { cancelled = true; };
  }, [id]);

  return { property, loading, error };
};
