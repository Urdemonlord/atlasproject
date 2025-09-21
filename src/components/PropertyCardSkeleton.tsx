import React from 'react';

const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-48"></div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            <div className="bg-gray-200 h-3 rounded w-1/2"></div>
          </div>
          <div className="bg-gray-200 h-4 w-12 rounded"></div>
        </div>
        <div className="bg-gray-200 h-3 rounded w-full"></div>
        <div className="bg-gray-200 h-3 rounded w-2/3"></div>
        <div className="flex items-center space-x-3">
          <div className="bg-gray-200 h-4 w-4 rounded"></div>
          <div className="bg-gray-200 h-3 rounded w-1/3"></div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="bg-gray-200 h-6 w-20 rounded"></div>
          <div className="bg-gray-200 h-8 w-24 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;
