import { useState, useEffect } from 'react';
import { Property, SearchFilters } from '../types';

// Mock data for development
const mockProperties: Property[] = [
  {
    id: '1',
    owner_id: '1',
    title: 'Kos Putri Premium Dekat UNDIP',
    description: 'Kos nyaman dan aman khusus putri, dekat dengan kampus UNDIP. Fasilitas lengkap dengan WiFi, AC, dapur bersama, dan keamanan 24 jam. Lingkungan yang tenang dan kondusif untuk belajar.',
    address: {
      street: 'Jl. Prof. Soedarto No. 15',
      district: 'Tembalang',
      city: 'Semarang',
      postal_code: '50275'
    },
    coordinates: { lat: -7.0505, lng: 110.4375 },
    property_type: 'putri',
    facilities: ['wifi', 'ac', 'parking', 'dapur_bersama', 'laundry', 'security_24jam', 'cctv', 'jemuran'],
    pricing: {
      monthly_rent: 800000,
      deposit: 800000,
      utilities: 100000
    },
    room_count: 20,
    available_rooms: 5,
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg',
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg',
      'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg'
    ],
    status: 'active',
    rating: 4.5,
    review_count: 12,
    is_premium: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    owner_id: '2',
    title: 'Kos Putra Strategis Pleburan',
    description: 'Lokasi strategis di Pleburan, dekat dengan berbagai kampus dan pusat kota. Kamar luas dengan fasilitas modern termasuk gym dan rooftop. Cocok untuk mahasiswa yang aktif.',
    address: {
      street: 'Jl. Pleburan Raya No. 88',
      district: 'Semarang Selatan',
      city: 'Semarang',
      postal_code: '50241'
    },
    coordinates: { lat: -7.0051, lng: 110.4381 },
    property_type: 'putra',
    facilities: ['wifi', 'ac', 'parking', 'gym', 'rooftop', 'cctv', 'dapur_bersama', 'laundry'],
    pricing: {
      monthly_rent: 1200000,
      deposit: 1200000,
      utilities: 150000
    },
    room_count: 15,
    available_rooms: 3,
    images: [
      'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg',
      'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg',
      'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg'
    ],
    status: 'active',
    rating: 4.2,
    review_count: 8,
    is_premium: false,
    created_at: '2024-01-10T08:30:00Z',
    updated_at: '2024-01-10T08:30:00Z'
  },
  {
    id: '3',
    owner_id: '3',
    title: 'Kos Campur Ekonomis Ngaliyan',
    description: 'Kos dengan harga terjangkau di daerah Ngaliyan. Cocok untuk mahasiswa dengan budget terbatas namun tetap nyaman. Lingkungan yang ramah dan dekat dengan transportasi umum.',
    address: {
      street: 'Jl. Ngaliyan Raya No. 45',
      district: 'Ngaliyan',
      city: 'Semarang',
      postal_code: '50185'
    },
    coordinates: { lat: -7.0611, lng: 110.3539 },
    property_type: 'campur',
    facilities: ['wifi', 'parking', 'dapur_bersama', 'jemuran', 'laundry'],
    pricing: {
      monthly_rent: 500000,
      deposit: 500000,
      utilities: 75000
    },
    room_count: 25,
    available_rooms: 8,
    images: [
      'https://images.pexels.com/photos/1571452/pexels-photo-1571452.jpeg',
      'https://images.pexels.com/photos/1571454/pexels-photo-1571454.jpeg'
    ],
    status: 'active',
    rating: 3.8,
    review_count: 15,
    is_premium: false,
    created_at: '2024-01-05T14:20:00Z',
    updated_at: '2024-01-05T14:20:00Z'
  },
  {
    id: '4',
    owner_id: '4',
    title: 'Kos Putri Modern Banyumanik',
    description: 'Kos modern dengan desain kontemporer di Banyumanik. Dekat dengan berbagai kampus dan pusat perbelanjaan. Fasilitas lengkap dan lingkungan yang asri.',
    address: {
      street: 'Jl. Banyumanik Raya No. 123',
      district: 'Banyumanik',
      city: 'Semarang',
      postal_code: '50264'
    },
    coordinates: { lat: -7.0625, lng: 110.4056 },
    property_type: 'putri',
    facilities: ['wifi', 'ac', 'parking', 'dapur_bersama', 'laundry', 'security_24jam', 'cctv', 'gym', 'rooftop'],
    pricing: {
      monthly_rent: 950000,
      deposit: 950000,
      utilities: 120000
    },
    room_count: 18,
    available_rooms: 4,
    images: [
      'https://images.pexels.com/photos/1571455/pexels-photo-1571455.jpeg',
      'https://images.pexels.com/photos/1571456/pexels-photo-1571456.jpeg',
      'https://images.pexels.com/photos/1571457/pexels-photo-1571457.jpeg'
    ],
    status: 'active',
    rating: 4.7,
    review_count: 20,
    is_premium: true,
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-01-20T09:15:00Z'
  },
  {
    id: '5',
    owner_id: '5',
    title: 'Kos Putra Dekat UNNES',
    description: 'Kos strategis dekat kampus UNNES dengan akses mudah ke berbagai fasilitas kampus. Lingkungan yang tenang dan cocok untuk mahasiswa yang fokus belajar.',
    address: {
      street: 'Jl. Sekaran Raya No. 67',
      district: 'Gunungpati',
      city: 'Semarang',
      postal_code: '50229'
    },
    coordinates: { lat: -7.0500, lng: 110.4000 },
    property_type: 'putra',
    facilities: ['wifi', 'ac', 'parking', 'dapur_bersama', 'laundry', 'cctv', 'jemuran'],
    pricing: {
      monthly_rent: 650000,
      deposit: 650000,
      utilities: 90000
    },
    room_count: 22,
    available_rooms: 6,
    images: [
      'https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg',
      'https://images.pexels.com/photos/1571462/pexels-photo-1571462.jpeg'
    ],
    status: 'active',
    rating: 4.0,
    review_count: 10,
    is_premium: false,
    created_at: '2024-01-12T11:30:00Z',
    updated_at: '2024-01-12T11:30:00Z'
  },
  {
    id: '6',
    owner_id: '6',
    title: 'Kos Campur Premium Semarang Tengah',
    description: 'Kos premium di pusat kota Semarang dengan akses mudah ke berbagai tempat wisata dan pusat perbelanjaan. Fasilitas lengkap dan pelayanan terbaik.',
    address: {
      street: 'Jl. Pemuda No. 89',
      district: 'Semarang Tengah',
      city: 'Semarang',
      postal_code: '50132'
    },
    coordinates: { lat: -6.9667, lng: 110.4167 },
    property_type: 'campur',
    facilities: ['wifi', 'ac', 'parking', 'dapur_bersama', 'laundry', 'security_24jam', 'cctv', 'gym', 'rooftop', 'jemuran'],
    pricing: {
      monthly_rent: 1500000,
      deposit: 1500000,
      utilities: 200000
    },
    room_count: 12,
    available_rooms: 2,
    images: [
      'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg',
      'https://images.pexels.com/photos/1571464/pexels-photo-1571464.jpeg',
      'https://images.pexels.com/photos/1571465/pexels-photo-1571465.jpeg'
    ],
    status: 'active',
    rating: 4.8,
    review_count: 25,
    is_premium: true,
    created_at: '2024-01-18T14:45:00Z',
    updated_at: '2024-01-18T14:45:00Z'
  }
];

export const useProperties = (filters?: SearchFilters) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let filteredProperties = [...mockProperties];
        
        if (filters) {
          // Apply filters
          if (filters.property_type) {
            filteredProperties = filteredProperties.filter(
              p => p.property_type === filters.property_type
            );
          }
          
          if (filters.min_price) {
            filteredProperties = filteredProperties.filter(
              p => p.pricing.monthly_rent >= filters.min_price!
            );
          }
          
          if (filters.max_price) {
            filteredProperties = filteredProperties.filter(
              p => p.pricing.monthly_rent <= filters.max_price!
            );
          }
          
          if (filters.facilities && filters.facilities.length > 0) {
            filteredProperties = filteredProperties.filter(
              p => filters.facilities!.some(f => p.facilities.includes(f))
            );
          }
          
          // Apply sorting
          if (filters.sort_by) {
            switch (filters.sort_by) {
              case 'price_low':
                filteredProperties.sort((a, b) => a.pricing.monthly_rent - b.pricing.monthly_rent);
                break;
              case 'price_high':
                filteredProperties.sort((a, b) => b.pricing.monthly_rent - a.pricing.monthly_rent);
                break;
              case 'rating':
                filteredProperties.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            }
          }
        }
        
        // Premium properties first
        filteredProperties.sort((a, b) => {
          if (a.is_premium && !b.is_premium) return -1;
          if (!a.is_premium && b.is_premium) return 1;
          return 0;
        });
        
        setProperties(filteredProperties);
      } catch (err) {
        setError('Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  return { properties, loading, error };
};

export const useProperty = (id: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundProperty = mockProperties.find(p => p.id === id);
        if (foundProperty) {
          setProperty(foundProperty);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        setError('Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  return { property, loading, error };
};