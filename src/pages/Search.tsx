import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, MapPin, Grid, List, Star, Home } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import PropertyCard from '../components/PropertyCard';
import AdvancedSearch from '../components/AdvancedSearch';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Map from '../components/Map';
import { useProperties } from '../hooks/useProperties';
import { SearchFilters as SearchFiltersType } from '../types';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const navigate = useNavigate();

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: SearchFiltersType = {};
    
    if (searchParams.get('property_type')) {
      initialFilters.property_type = searchParams.get('property_type') as any;
    }
    if (searchParams.get('min_price')) {
      initialFilters.min_price = parseInt(searchParams.get('min_price')!);
    }
    if (searchParams.get('max_price')) {
      initialFilters.max_price = parseInt(searchParams.get('max_price')!);
    }
    if (searchParams.get('location')) {
      initialFilters.location = searchParams.get('location')!;
    }
    
    setFilters(initialFilters);
  }, [searchParams]);

  const { properties, loading, error } = useProperties(filters);

  const handleSearch = (query: string, searchFilters: SearchFiltersType) => {
    setSearchQuery(query);
    setFilters(searchFilters);
    
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, value.toString());
        }
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, value.toString());
        }
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Advanced Search */}
          <AdvancedSearch
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            filters={filters}
            loading={loading}
          />

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {searchQuery ? `Hasil pencarian "${searchQuery}"` : 'Semua Kos'}
              </h1>
              {!loading && (
                <p className="text-gray-600 mt-1">
                  Ditemukan {properties.length} kos
                </p>
              )}
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <ErrorState
              title="Terjadi Kesalahan"
              message={error}
              onRetry={handleRetry}
              onGoHome={handleGoHome}
              showSearchButton={true}
              onSearch={handleSearchClick}
            />
          )}

          {/* No Results */}
          {!loading && !error && properties.length === 0 && (
            <EmptyState
              title="Tidak ada kos yang ditemukan"
              message="Coba ubah kata kunci pencarian atau filter yang Anda gunakan"
              action={{
                label: 'Hapus semua filter',
                onClick: () => {
                  setSearchQuery('');
                  setFilters({});
                  setSearchParams({});
                },
                icon: <SearchIcon className="w-4 h-4" />
              }}
              secondaryAction={{
                label: 'Ke Beranda',
                onClick: handleGoHome,
                icon: <Home className="w-4 h-4" />
              }}
            />
          )}

          {/* Results */}
          {!loading && !error && properties.length > 0 && (
            <>
              {viewMode === 'map' ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Map
                    center={[-7.0051, 110.4381]} // Semarang center
                    zoom={12}
                    properties={properties}
                    onPropertyClick={handlePropertyClick}
                    className="h-96 w-full"
                  />
                </div>
              ) : viewMode === 'list' ? (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-48 h-32 flex-shrink-0">
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {property.title}
                            </h3>
                            {property.rating && (
                              <div className="flex items-center space-x-1 ml-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium text-gray-700">
                                  {property.rating}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {property.address.district}, {property.address.city}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {property.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-xl font-bold text-blue-600">
                              Rp {property.pricing.monthly_rent.toLocaleString('id-ID')}/bulan
                            </div>
                            <button
                              onClick={() => handlePropertyClick(property.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Lihat Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;