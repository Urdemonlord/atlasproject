export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'tenant' | 'owner' | 'admin';
  profile: {
    name: string;
    photo?: string;
    identity_verified: boolean;
    student_info?: {
      university: string;
      student_id: string;
      year: number;
    };
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  address: {
    street: string;
    district: string;
    city: string;
    postal_code: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  property_type: 'putra' | 'putri' | 'campur';
  facilities: string[];
  pricing: {
    monthly_rent: number;
    deposit: number;
    utilities: number;
  };
  room_count: number;
  available_rooms: number;
  images: string[];
  status: 'active' | 'inactive' | 'pending';
  rating?: number;
  review_count?: number;
  is_premium?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  size: number;
  status: 'available' | 'occupied' | 'maintenance';
  monthly_rent: number;
  facilities: string[];
}

export interface Booking {
  id: string;
  tenant_id: string;
  room_id: string;
  property?: Property;
  room?: Room;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  booking_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  property_id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  aspects: {
    cleanliness: number;
    location: number;
    facilities: number;
    owner_responsiveness: number;
    value: number;
  };
  created_at: string;
}

export interface SearchFilters {
  location?: string;
  property_type?: 'putra' | 'putri' | 'campur';
  min_price?: number;
  max_price?: number;
  facilities?: string[];
  sort_by?: 'price_low' | 'price_high' | 'rating' | 'distance';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}