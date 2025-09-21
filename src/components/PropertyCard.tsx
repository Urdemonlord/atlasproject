import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, Users, Crown } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
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
        return <Wifi className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'ac':
        return <div className="w-4 h-4 text-xs font-bold">AC</div>;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'putra':
        return 'Khusus Putra';
      case 'putri':
        return 'Khusus Putri';
      case 'campur':
        return 'Campur';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      <div className="relative overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Premium Badge */}
        {property.is_premium && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>Premium</span>
          </div>
        )}
        
        {/* Property Type Badge */}
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
          {getPropertyTypeLabel(property.property_type)}
        </div>
        
        {/* Available Rooms */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {property.available_rooms} kamar tersedia
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {property.title}
          </h3>
          {property.rating && (
            <div className="flex items-center space-x-1 ml-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {property.rating}
              </span>
              <span className="text-xs text-gray-500">
                ({property.review_count})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {property.address.district}, {property.address.city}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>

        {/* Facilities */}
        <div className="flex items-center space-x-3 mb-4">
          {property.facilities.slice(0, 4).map((facility, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 text-gray-500 text-xs"
              title={facility}
            >
              {getFacilityIcon(facility)}
              <span className="capitalize">{facility.replace('_', ' ')}</span>
            </div>
          ))}
          {property.facilities.length > 4 && (
            <span className="text-xs text-gray-500">
              +{property.facilities.length - 4} lainnya
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-blue-600">
              {formatPrice(property.pricing.monthly_rent)}
            </div>
            <div className="text-xs text-gray-500">per bulan</div>
          </div>
          
          <Link
            to={`/property/${property.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;