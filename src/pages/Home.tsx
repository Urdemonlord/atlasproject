import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Compass, Star, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import PropertyCard from '../components/PropertyCard';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';
import Map from '../components/Map';
import { useProperties } from '../hooks/useProperties';

const QUICK_AREAS = [
  { label: 'Tembalang / UNDIP', value: 'tembalang' },
  { label: 'Simpang Lima', value: 'simpang lima' },
  { label: 'Pleburan', value: 'pleburan' },
  { label: 'Ngaliyan', value: 'ngaliyan' },
  { label: 'Banyumanik', value: 'banyumanik' },
  { label: 'Semarang Tengah', value: 'semarang tengah' },
];

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { properties, total, loading } = useProperties(undefined, { limit: 120 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&view=map`);
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const mapProperties = useMemo(() => {
    const grouped: globalThis.Map<string, typeof properties> = new globalThis.Map();

    properties.forEach((property) => {
      const key = `${property.coordinates.lat.toFixed(4)},${property.coordinates.lng.toFixed(4)}`;
      const group = grouped.get(key) || [];
      group.push(property);
      grouped.set(key, group);
    });

    const diverse: typeof properties = [];
    const leftovers: typeof properties = [];

    grouped.forEach((group) => {
      diverse.push(group[0]);
      leftovers.push(...group.slice(1, 3));
    });

    return [...diverse, ...leftovers].slice(0, 24);
  }, [properties]);
  const featuredProperties = useMemo(
    () => properties.filter((p) => p.is_premium).slice(0, 3),
    [properties]
  );
  const districtCount = useMemo(
    () => new Set(properties.map((p) => p.address.district).filter(Boolean)).size,
    [properties]
  );

  return (
    <Layout>
      <div className="bg-slate-950 text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.28),_transparent_28%),radial-gradient(circle_at_left,_rgba(16,185,129,0.14),_transparent_24%)]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[420px,1fr] gap-6 lg:gap-8 items-stretch">
              <div className="bg-slate-900/88 backdrop-blur rounded-3xl border border-white/10 p-6 lg:p-7 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-200 border border-blue-400/20 rounded-full px-3 py-1 text-sm font-medium mb-5">
                    <Compass className="w-4 h-4" />
                    <span>Peta kos Semarang</span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                    Cari kos lewat <span className="text-blue-400">peta</span>, bukan scroll tanpa akhir.
                  </h1>

                  <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6">
                    KosAtlas bantu kamu eksplor area Semarang, bandingin kos lebih cepat, lalu lanjut ke sumber aslinya di Mamikos.
                  </p>

                  <form onSubmit={handleSearch} className="space-y-3 mb-5">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Contoh: Tembalang, Pleburan, UNDIP"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-900 placeholder-slate-500 border-0 focus:ring-4 focus:ring-blue-400/30"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      <span>Eksplor lewat peta</span>
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {QUICK_AREAS.map((area) => (
                      <Link
                        key={area.value}
                        to={`/search?location=${encodeURIComponent(area.value)}`}
                        className="px-3 py-2 rounded-full text-sm bg-white/8 hover:bg-white/14 border border-white/10 text-slate-200 transition-colors"
                      >
                        {area.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-7 pt-6 border-t border-white/10">
                  <div>
                    <div className="text-2xl font-bold text-white">{total || properties.length || '1000+'}</div>
                    <div className="text-sm text-slate-400">Listing</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{districtCount || '10+'}</div>
                    <div className="text-sm text-slate-400">Area</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">Map-first</div>
                    <div className="text-sm text-slate-400">Discovery</div>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[460px] lg:min-h-[640px] rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                <Map
                  key={`hero-map-${mapProperties.length}-${mapProperties[0]?.id || 'empty'}`}
                  center={[-7.0051, 110.4381]}
                  zoom={12}
                  properties={mapProperties}
                  onPropertyClick={handlePropertyClick}
                  className="h-[460px] lg:h-[640px] w-full"
                />

                <div className="absolute left-4 right-4 bottom-4 pointer-events-none">
                  <div className="max-w-md bg-slate-950/82 backdrop-blur text-slate-100 rounded-2xl border border-white/10 p-4 shadow-xl">
                    <div className="text-sm font-semibold mb-1">Why this works</div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      User langsung paham sebaran kos per area. Value KosAtlas jadi jelas dalam sekali lihat: peta dulu, detail setelah itu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white text-slate-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold mb-3">Lihat area dulu</h2>
                <p className="text-slate-600 leading-relaxed">
                  Cocok buat anak rantau yang belum hafal Semarang. Tinggal zoom area target lalu lihat kos yang paling relevan.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold mb-3">Bandingin lebih cepat</h2>
                <p className="text-slate-600 leading-relaxed">
                  Nggak perlu bolak-balik antar halaman list. Peta bikin user langsung lihat klaster lokasi dan rentang harga sekitar.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold mb-3">Lanjut ke sumber asli</h2>
                <p className="text-slate-600 leading-relaxed">
                  Saat sudah cocok, user tinggal buka halaman Mamikos dari detail properti. Discovery di KosAtlas, transaksi di sumbernya.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white text-slate-900 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-3">Kos pilihan buat mulai eksplor</h2>
                <p className="text-slate-600 max-w-2xl">
                  Entry point terbaik tetap visual. Tapi beberapa kos unggulan tetap gue tampilkan buat user yang mau langsung klik tanpa buka peta dulu.
                </p>
              </div>
              <Link
                to="/search"
                className="hidden sm:inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
              >
                <span>Lihat semua</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-950 border-t border-white/10 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 text-yellow-300 mb-4">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-medium">Positioning yang lebih jelas</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">KosAtlas = peta kos Semarang</h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8">
              Bukan copycat Mamikos. Bukan juga portal booking baru. Fokusnya discovery: buka peta, pilih area, bandingkan cepat, lalu lanjut ke sumber asli.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Compass className="w-5 h-5" />
              <span>Buka semua listing</span>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
