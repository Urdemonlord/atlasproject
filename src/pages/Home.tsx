import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Shield, Clock, Users } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import PropertyCard from '../components/PropertyCard';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';
import { useProperties } from '../hooks/useProperties';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { properties, loading } = useProperties();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const featuredProperties = properties.filter(p => p.is_premium).slice(0, 3);
  const stats = [
    { icon: Users, label: 'Pengguna Aktif', value: '1,200+' },
    { icon: MapPin, label: 'Kos Terdaftar', value: '500+' },
    { icon: Star, label: 'Rating Rata-rata', value: '4.5' },
    { icon: Shield, label: 'Transaksi Aman', value: '100%' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Temukan Kos Impian Anda di{' '}
              <span className="text-yellow-400">Semarang</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Platform terpercaya untuk mencari dan menyewa kos dengan mudah, aman, dan terjangkau
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan lokasi, nama kos, atau kampus..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 text-gray-900 rounded-lg border-0 focus:ring-4 focus:ring-blue-300 text-lg placeholder-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 transform"
                >
                  <Search className="w-5 h-5" />
                  <span>Cari Kos</span>
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/search?property_type=putri"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-colors"
              >
                Kos Putri
              </Link>
              <Link
                to="/search?property_type=putra"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-colors"
              >
                Kos Putra
              </Link>
              <Link
                to="/search?location=tembalang"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-colors"
              >
                Dekat UNDIP
              </Link>
              <Link
                to="/search?max_price=1000000"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-colors"
              >
                Under 1 Juta
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white bg-opacity-10 rounded-full"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kos Premium Pilihan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan kos-kos terbaik dengan fasilitas lengkap dan lokasi strategis
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property, index) => (
                <div key={property.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/search"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Lihat Semua Kos</span>
              <Search className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Memilih KosAtlas?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan platform yang aman, mudah, dan terpercaya untuk kebutuhan hunian Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Pencarian Mudah
              </h3>
              <p className="text-gray-600">
                Filter berdasarkan lokasi, harga, fasilitas, dan preferensi Anda untuk menemukan kos yang tepat
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Transaksi Aman
              </h3>
              <p className="text-gray-600">
                Sistem pembayaran terintegrasi dengan berbagai metode pembayaran digital yang aman dan terpercaya
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Booking Instan
              </h3>
              <p className="text-gray-600">
                Proses booking yang cepat dan mudah, dengan konfirmasi langsung dari pemilik kos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Menemukan Kos Impian Anda?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan mahasiswa dan pekerja yang telah menemukan hunian ideal mereka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 transform"
            >
              Daftar Sekarang
            </Link>
            <Link
              to="/search"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 hover:scale-105 transform"
            >
              Mulai Pencarian
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;