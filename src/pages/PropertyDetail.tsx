import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, Wifi, Car, Users, Phone, Mail, 
  Calendar, CreditCard, ArrowLeft, Heart, Share2,
  CheckCircle, Clock, Crown
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import Map from '../components/Map';
import { useProperty } from '../hooks/useProperties';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { useNotification } from '../contexts/NotificationContext';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { property, loading, error } = useProperty(id!);
  const { user, isAuthenticated } = useAuth();
  const { createBooking } = useBookings();
  const { addNotification } = useNotification();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    start_date: '',
    end_date: '',
    booking_notes: ''
  });
  const [isBooking, setIsBooking] = useState(false);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-64 md:h-96 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-200 h-8 rounded w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                <div className="bg-gray-200 h-20 rounded"></div>
              </div>
              <div className="bg-gray-200 h-64 rounded-lg"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Kos tidak ditemukan
            </h2>
            <p className="text-gray-600 mb-6">
              Maaf, kos yang Anda cari tidak dapat ditemukan.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Pencarian
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility) {
      case 'wifi':
        return <Wifi className="w-5 h-5" />;
      case 'parking':
        return <Car className="w-5 h-5" />;
      case 'ac':
        return <div className="w-5 h-5 text-sm font-bold flex items-center justify-center">AC</div>;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsBooking(true);
    
    try {
      await createBooking({
        room_id: property.id, // Using property ID as room ID for simplicity
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        monthly_rent: property.pricing.monthly_rent,
        deposit: property.pricing.deposit,
        booking_notes: bookingData.booking_notes
      });
      
      addNotification({
        type: 'success',
        title: 'Booking Berhasil',
        message: 'Booking Anda telah dikirim. Menunggu konfirmasi dari pemilik kos.'
      });
      
      setShowBookingModal(false);
      navigate('/bookings');
    } catch (error) {
      console.error('Booking failed:', error);
      addNotification({
        type: 'error',
        title: 'Booking Gagal',
        message: 'Terjadi kesalahan saat melakukan booking. Silakan coba lagi.'
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative">
            <img
              src={property.images[selectedImageIndex]}
              alt={property.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
            
            {/* Premium Badge */}
            {property.is_premium && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Thumbnail Gallery */}
          {property.images.length > 1 && (
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 animate-fade-in">
            {/* Property Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>
                      {property.address.street}, {property.address.district}, {property.address.city}
                    </span>
                  </div>
                </div>
                
                {property.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold text-gray-900">
                      {property.rating}
                    </span>
                    <span className="text-gray-600">
                      ({property.review_count} ulasan)
                    </span>
                  </div>
                )}
              </div>

              {/* Property Type & Availability */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.property_type === 'putra' ? 'Khusus Putra' : 
                   property.property_type === 'putri' ? 'Khusus Putri' : 'Campur'}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{property.available_rooms} kamar tersedia</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Deskripsi</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Facilities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Fasilitas</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.facilities.map((facility, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-blue-600">
                      {getFacilityIcon(facility)}
                    </div>
                    <span className="text-gray-700 capitalize">
                      {facility.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lokasi</h2>
              <div className="bg-white rounded-lg shadow-md p-4">
                <Map
                  center={[property.coordinates.lat, property.coordinates.lng]}
                  zoom={15}
                  properties={[{
                    id: property.id,
                    title: property.title,
                    coordinates: property.coordinates,
                    pricing: property.pricing,
                    property_type: property.property_type,
                    images: property.images
                  }]}
                  className="h-64 w-full"
                />
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Alamat lengkap:</strong> {property.address.street}, {property.address.district}, {property.address.city} {property.address.postal_code}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              {/* Pricing */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(property.pricing.monthly_rent)}
                </div>
                <div className="text-gray-600">per bulan</div>
                
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Deposit:</span>
                    <span>{formatPrice(property.pricing.deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilitas:</span>
                    <span>{formatPrice(property.pricing.utilities)}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Kontak Pemilik</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>+62 812-3456-7890</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>owner@example.com</span>
                  </div>
                </div>
              </div>

              {/* Booking Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Booking Sekarang</span>
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Booking gratis, bayar setelah konfirmasi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Booking Kos
            </h2>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.start_date}
                  onChange={(e) => setBookingData({...bookingData, start_date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Berakhir
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.end_date}
                  onChange={(e) => setBookingData({...bookingData, end_date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={bookingData.booking_notes}
                  onChange={(e) => setBookingData({...bookingData, booking_notes: e.target.value})}
                  placeholder="Ceritakan sedikit tentang diri Anda..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isBooking ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PropertyDetail;