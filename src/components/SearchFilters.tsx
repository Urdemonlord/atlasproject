import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const facilities = [
    { id: 'wifi', label: 'WiFi' },
    { id: 'ac', label: 'AC' },
    { id: 'parking', label: 'Parkir' },
    { id: 'dapur_bersama', label: 'Dapur Bersama' },
    { id: 'laundry', label: 'Laundry' },
    { id: 'security_24jam', label: 'Security 24 Jam' },
    { id: 'gym', label: 'Gym' },
    { id: 'rooftop', label: 'Rooftop' },
  ];

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
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
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFiltersType];
    return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filter Pencarian</span>
          <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            <span>Hapus Filter</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-4 border-t pt-4">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kos
            </label>
            <select
              value={filters.property_type || ''}
              onChange={(e) => handleFilterChange('property_type', e.target.value || undefined)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Jenis</option>
              <option value="putra">Khusus Putra</option>
              <option value="putri">Khusus Putri</option>
              <option value="campur">Campur</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Minimum
              </label>
              <input
                type="number"
                placeholder="Rp 0"
                value={filters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Maksimum
              </label>
              <input
                type="number"
                placeholder="Rp 2.000.000"
                value={filters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fasilitas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {facilities.map((facility) => (
                <label
                  key={facility.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(filters.facilities || []).includes(facility.id)}
                    onChange={() => handleFacilityToggle(facility.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{facility.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urutkan Berdasarkan
            </label>
            <select
              value={filters.sort_by || ''}
              onChange={(e) => handleFilterChange('sort_by', e.target.value || undefined)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

export default SearchFilters;