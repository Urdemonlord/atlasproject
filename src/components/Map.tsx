import React, { useEffect, useRef, useState } from 'react';

interface MapProps {
  center: [number, number];
  zoom?: number;
  properties?: Array<{
    id: string;
    title: string;
    coordinates: { lat: number; lng: number };
    pricing: { monthly_rent: number };
    property_type: string;
    images: string[];
  }>;
  onPropertyClick?: (propertyId: string) => void;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  center,
  zoom = 13,
  properties = [],
  onPropertyClick,
  className = 'h-64 w-full'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet from CDN
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as any).L) {
          resolve((window as any).L);
          return;
        }

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        script.onload = () => {
          const L = (window as any).L;
          
          // Fix for default markers
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
          });
          
          resolve(L);
        };
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = await loadLeaflet() as any;
      if (!L) return;

      // Initialize map
      const map = L.map(mapRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      setIsLoaded(true);
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const updateMarkers = () => {
      const L = (window as any).L;
      if (!L) return;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add property markers
      properties.forEach(property => {
        const { lat, lng } = property.coordinates;
        
        // Create custom icon based on property type
        const getIconColor = (type: string) => {
          switch (type) {
            case 'putra': return '#3B82F6'; // Blue
            case 'putri': return '#EC4899'; // Pink
            case 'campur': return '#10B981'; // Green
            default: return '#6B7280'; // Gray
          }
        };

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${getIconColor(property.property_type)};
              width: 30px;
              height: 30px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">
              ${property.property_type === 'putra' ? 'P' : property.property_type === 'putri' ? 'W' : 'C'}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapInstanceRef.current!);

        // Add popup
        const popupContent = `
          <div style="min-width: 200px;">
            <img src="${property.images[0]}" alt="${property.title}" 
                 style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #1F2937;">
              ${property.title}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280;">
              ${property.property_type === 'putra' ? 'Khusus Putra' : 
                property.property_type === 'putri' ? 'Khusus Putri' : 'Campur'}
            </p>
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #059669;">
              Rp ${property.pricing.monthly_rent.toLocaleString('id-ID')}/bulan
            </p>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Add click handler
        if (onPropertyClick) {
          marker.on('click', () => {
            onPropertyClick(property.id);
          });
        }

        markersRef.current.push(marker);
      });

      // Fit map to show all markers if there are properties
      if (properties.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    };

    updateMarkers();
  }, [properties, onPropertyClick, isLoaded]);

  return (
    <div className={className}>
      <div ref={mapRef} className="h-full w-full rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat peta...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
