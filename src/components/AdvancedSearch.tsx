import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, Star, Wifi, Car, Shield, Users } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFiltersType) => void;
  onFiltersChange: (filters: SearchFiltersType) => void;
  filters: SearchFiltersType;
  loading?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onFiltersChange,
  filters,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock suggestions data
  const mockSuggestions = [
    'Kos dekat UNDIP',
    'Kos putri Tembalang',
    'Kos murah Ngaliyan',
    'Kos dengan AC',
    'Kos dengan WiFi',
    'Kos dekat UNNES',
    'Kos Banyumanik',
    'Kos Semarang Tengah'
  ];

  const facilities = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'ac', label: 'AC', icon: Users },
    { id: 'parking', label: 'Parkir', icon: Car },
    { id: 'security_24jam', label: 'Security 24 Jam', icon: Shield },
    { id: 'laundry', label: 'Laundry', icon: Users },
    { id: 'gym', label: 'Gym', icon: Users },
    { id: 'rooftop', label: 'Rooftop', icon: Users },
    { id: 'dapur_bersama', label: 'Dapur Bersama', icon: Users }
  ];

  const locations = [
    'Tembalang',
    'Banyumanik',
    'Ngaliyan',
    'Semarang Tengah',
    'Semarang Selatan',
    'Gunungpati',
    'Pleburan',
    'Candisari'
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, filters);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, filters);
  };

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleFacilityToggle = (facilityId: string) => {
    const currentFacilities = filters.facilities || [];
    const newFacilities = currentFacilities.includes(facilityId)
      ? currentFacilities.filter(f => f !== facilityId)
      : [...currentFacilities, facilityId];
    
    handleFilterChange('facilities', newFacilities);
  };

  const clearFilters = () => {
    onFiltersChange({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFiltersType];
    return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Main Search */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan lokasi, nama kos, atau kampus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(searchQuery.length > 2)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 transform"
          >
            <Search className="w-5 h-5" />
            <span>{loading ? 'Mencari...' : 'Cari'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>
      </form>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Filter aktif:</span>
          {filters.property_type && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {filters.property_type === 'putra' ? 'Putra' : 
               filters.property_type === 'putri' ? 'Putri' : 'Campur'}
            </span>
          )}
          {filters.min_price && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              Min Rp {filters.min_price.toLocaleString('id-ID')}
            </span>
          )}
          {filters.max_price && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              Max Rp {filters.max_price.toLocaleString('id-ID')}
            </span>
          )}
          {filters.facilities && filters.facilities.length > 0 && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
              {filters.facilities.length} fasilitas
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700 text-xs flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>Hapus semua</span>
          </button>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jenis Kos
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'putra', label: 'Khusus Putra', color: 'blue' },
                { value: 'putri', label: 'Khusus Putri', color: 'pink' },
                { value: 'campur', label: 'Campur', color: 'green' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleFilterChange('property_type', 
                    filters.property_type === type.value ? undefined : type.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    filters.property_type === type.value
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                      filters.property_type === type.value ? `bg-${type.color}-500` : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rentang Harga
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Harga Minimum</label>
                <input
                  type="number"
                  placeholder="Rp 0"
                  value={filters.min_price || ''}
                  onChange={(e) => handleFilterChange('min_price', 
                    e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Harga Maksimum</label>
                <input
                  type="number"
                  placeholder="Rp 2.000.000"
                  value={filters.max_price || ''}
                  onChange={(e) => handleFilterChange('max_price', 
                    e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Lokasi
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {locations.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => handleFilterChange('location', 
                    filters.location === location ? undefined : location)}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    filters.location === location
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fasilitas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {facilities.map((facility) => (
                <label
                  key={facility.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(filters.facilities || []).includes(facility.id)}
                    onChange={() => handleFacilityToggle(facility.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <facility.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{facility.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Urutkan Berdasarkan
            </label>
            <select
              value={filters.sort_by || ''}
              onChange={(e) => handleFilterChange('sort_by', e.target.value || undefined)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Default</option>
              <option value="price_low">Harga Terendah</option>
              <option value="price_high">Harga Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="distance">Jarak Terdekat</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
