import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Mock bookings data
const mockBookings: Booking[] = [
  {
    id: '1',
    tenant_id: '1',
    room_id: '1',
    start_date: '2024-02-01',
    end_date: '2024-08-01',
    monthly_rent: 800000,
    deposit: 800000,
    status: 'confirmed',
    booking_notes: 'Mahasiswa semester 4, butuh tempat yang tenang untuk belajar',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-21T09:00:00Z'
  },
  {
    id: '2',
    tenant_id: '1',
    room_id: '2',
    start_date: '2024-03-01',
    end_date: '2024-09-01',
    monthly_rent: 1200000,
    deposit: 1200000,
    status: 'pending',
    booking_notes: 'Ingin pindah ke lokasi yang lebih dekat dengan kampus',
    created_at: '2024-01-22T14:30:00Z',
    updated_at: '2024-01-22T14:30:00Z'
  }
];

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filter bookings by user
        const userBookings = mockBookings.filter(b => b.tenant_id === user.id);
        setBookings(userBookings);
      } catch (err) {
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const createBooking = async (bookingData: {
    room_id: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    deposit: number;
    booking_notes?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        tenant_id: user.id,
        ...bookingData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (error) {
      throw new Error('Failed to create booking');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status, updated_at: new Date().toISOString() }
            : booking
        )
      );
    } catch (error) {
      throw new Error('Failed to update booking status');
    }
  };

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus
  };
};