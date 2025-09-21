import React from 'react';
import { Calendar, Clock, MapPin, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { useBookings } from '../hooks/useBookings';
import { useAuth } from '../contexts/AuthContext';

const Bookings: React.FC = () => {
  const { bookings, loading, error, updateBookingStatus } = useBookings();
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Silakan masuk terlebih dahulu
            </h2>
            <p className="text-gray-600">
              Anda perlu masuk untuk melihat booking Anda.
            </p>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Konfirmasi';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'rejected':
        return 'Ditolak';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Saya
          </h1>
          <p className="text-gray-600">
            Kelola semua booking kos Anda di sini
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-200 w-24 h-24 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <ErrorState
            title="Terjadi Kesalahan"
            message={error}
            onRetry={() => window.location.reload()}
            onGoHome={() => window.location.href = '/'}
          />
        )}

        {!loading && !error && bookings.length === 0 && (
          <EmptyState
            title="Belum ada booking"
            message="Anda belum memiliki booking kos. Mulai cari kos impian Anda!"
            action={{
              label: 'Cari Kos',
              onClick: () => window.location.href = '/search',
              icon: <Calendar className="w-4 h-4" />
            }}
          />
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(booking.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Booking ID</div>
                      <div className="font-mono text-sm">{booking.id}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Property Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {booking.room_id === '1' ? 'Kos Putri Premium Dekat UNDIP' : 
                         booking.room_id === '2' ? 'Kos Putra Strategis Pleburan' : 
                         'Kos Premium Tembalang'}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {booking.room_id === '1' ? 'Jl. Prof. Soedarto No. 15, Tembalang, Semarang' :
                             booking.room_id === '2' ? 'Jl. Pleburan Raya No. 88, Semarang Selatan, Semarang' :
                             'Jl. Prof. Soedarto No. 15, Tembalang, Semarang'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Dibuat pada {formatDate(booking.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Detail Pembayaran</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sewa per bulan:</span>
                          <span className="font-medium">{formatPrice(booking.monthly_rent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deposit:</span>
                          <span className="font-medium">{formatPrice(booking.deposit)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-blue-600">
                              {formatPrice(booking.monthly_rent + booking.deposit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Notes */}
                  {booking.booking_notes && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Catatan:</h4>
                      <p className="text-gray-700 text-sm">{booking.booking_notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Batalkan Booking
                      </button>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Bayar Sekarang</span>
                      </button>
                    )}
                    
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      Lihat Detail
                    </button>
                    
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      Hubungi Pemilik
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bookings;