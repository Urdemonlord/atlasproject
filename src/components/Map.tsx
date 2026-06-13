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

const getSpreadCoordinates = (
  coordinates: { lat: number; lng: number },
  index: number,
  total: number
) => {
  if (total <= 1) return coordinates;

  const ring = Math.floor(index / 8);
  const positionInRing = index % 8;
  const angle = (positionInRing / 8) * Math.PI * 2;
  const offset = 0.0012 * (ring + 1);

  return {
    lat: coordinates.lat + Math.sin(angle) * offset,
    lng: coordinates.lng + Math.cos(angle) * offset,
  };
};

const getPropertyTypeLabel = (type: string) => {
  switch (type) {
    case 'putra':
      return 'Khusus Putra';
    case 'putri':
      return 'Khusus Putri';
    default:
      return 'Campur';
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

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
      const coordinateGroups = new globalThis.Map<string, typeof properties>();
      properties.forEach((property) => {
        const key = `${property.coordinates.lat.toFixed(4)},${property.coordinates.lng.toFixed(4)}`;
        const group = coordinateGroups.get(key) || [];
        group.push(property);
        coordinateGroups.set(key, group);
      });

      const getIconColor = (type: string) => {
        switch (type) {
          case 'putra': return '#3B82F6';
          case 'putri': return '#EC4899';
          case 'campur': return '#10B981';
          default: return '#6B7280';
        }
      };

      coordinateGroups.forEach((group) => {
        const firstProperty = group[0];
        const { lat, lng } = firstProperty.coordinates;

        if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn(`Invalid coordinates for property group ${firstProperty.id}:`, { lat, lng });
          return;
        }

        if (group.length >= 8) {
          const clusterIcon = L.divIcon({
            className: 'custom-marker custom-marker-cluster',
            html: `
              <div style="
                background: radial-gradient(circle at 30% 30%, #60A5FA, #1D4ED8);
                width: 40px;
                height: 40px;
                border-radius: 999px;
                border: 3px solid white;
                box-shadow: 0 8px 20px rgba(29, 78, 216, 0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 800;
                font-size: 12px;
              ">
                ${group.length}
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          const prices = group.map((item: any) => item.pricing.monthly_rent).filter((price: number) => price > 0);
          const minPrice = prices.length ? Math.min(...prices) : 0;
          const maxPrice = prices.length ? Math.max(...prices) : 0;
          const previewItems = group.slice(0, 6).map((item: any) => `
            <li style="margin-bottom: 6px; line-height: 1.4;">
              <strong>${escapeHtml(item.title)}</strong><br />
              <span style="color: #6B7280; font-size: 12px;">${getPropertyTypeLabel(item.property_type)} · Rp ${item.pricing.monthly_rent.toLocaleString('id-ID')}/bulan</span>
            </li>
          `).join('');

          const clusterPopup = `
            <div style="min-width: 240px; max-width: 280px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #1F2937;">
                ${group.length} kos di area ini
              </h3>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6B7280;">
                ${minPrice > 0 ? `Harga ${minPrice.toLocaleString('id-ID')} - ${maxPrice.toLocaleString('id-ID')} / bulan` : 'Beberapa listing berbagi titik area yang sama'}
              </p>
              <ul style="padding-left: 18px; margin: 0;">
                ${previewItems}
              </ul>
              ${group.length > 6 ? `<p style="margin: 10px 0 0 0; font-size: 12px; color: #2563EB; font-weight: 600;">+${group.length - 6} listing lainnya di titik ini</p>` : ''}
            </div>
          `;

          const clusterMarker = L.marker([lat, lng], { icon: clusterIcon }).addTo(mapInstanceRef.current!);
          clusterMarker.bindPopup(clusterPopup);
          clusterMarker.on('click', () => {
            mapInstanceRef.current?.setView([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 14));
          });
          markersRef.current.push(clusterMarker);
          return;
        }

        group.forEach((property, index) => {
          const spreadCoordinates = getSpreadCoordinates({ lat, lng }, index, group.length);
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

          const marker = L.marker([spreadCoordinates.lat, spreadCoordinates.lng], { icon: customIcon })
            .addTo(mapInstanceRef.current!);

          const popupContent = `
            <div style="min-width: 200px;">
              <img src="${property.images[0]}" alt="${escapeHtml(property.title)}"
                   style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #1F2937;">
                ${escapeHtml(property.title)}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280;">
                ${getPropertyTypeLabel(property.property_type)}
              </p>
              <p style="margin: 0; font-size: 14px; font-weight: bold; color: #059669;">
                Rp ${property.pricing.monthly_rent.toLocaleString('id-ID')}/bulan
              </p>
            </div>
          `;

          marker.bindPopup(popupContent);

          if (onPropertyClick) {
            marker.on('click', () => {
              onPropertyClick(property.id);
            });
          }

          markersRef.current.push(marker);
        });
      });

      // Fit map to show all markers if there are properties
      if (properties.length > 0) {
        try {
          const group = new L.featureGroup(markersRef.current);
          const bounds = group.getBounds();
          
          // Check if bounds are valid
          if (bounds.isValid && bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds.pad(0.1));
          } else if (markersRef.current.length === 1) {
            // For single marker, just center on it
            const marker = markersRef.current[0];
            const latlng = marker.getLatLng();
            mapInstanceRef.current.setView([latlng.lat, latlng.lng], 15);
          }
        } catch (error) {
          console.warn('Error fitting bounds:', error);
          // Fallback to center on first property if bounds calculation fails
          if (properties.length > 0) {
            const firstProperty = properties[0];
            mapInstanceRef.current.setView([firstProperty.coordinates.lat, firstProperty.coordinates.lng], 13);
          }
        }
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
