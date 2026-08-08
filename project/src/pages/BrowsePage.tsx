import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Hostel } from '@/types';
import HostelCard from '@/components/HostelCard';

interface BrowsePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function BrowsePage({ onNavigate }: BrowsePageProps) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [foodFilter, setFoodFilter] = useState('All');
  const [sort, setSort] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('hostels').select('*').eq('is_active', true);
      setHostels(data ?? []);
      setLoading(false);
    })();
  }, []);

  const cities = useMemo(() => ['All', ...Array.from(new Set(hostels.map((h) => h.city)))], [hostels]);
  const foodTypes = useMemo(() => ['All', ...Array.from(new Set(hostels.map((h) => h.food_type)))], [hostels]);

  const filtered = useMemo(() => {
    let result = hostels.filter((h) => {
      const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.area.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase()) || h.description.toLowerCase().includes(search.toLowerCase());
      const matchCity = cityFilter === 'All' || h.city === cityFilter;
      const matchFood = foodFilter === 'All' || h.food_type === foodFilter;
      return matchSearch && matchCity && matchFood;
    });
    if (sort === 'rating') result = result.sort((a, b) => b.rating - a.rating);
    else if (sort === 'price-low') result = result.sort((a, b) => a.monthly_price - b.monthly_price);
    else if (sort === 'price-high') result = result.sort((a, b) => b.monthly_price - a.monthly_price);
    return result;
  }, [hostels, search, cityFilter, foodFilter, sort]);

  const hasActiveFilters = cityFilter !== 'All' || foodFilter !== 'All' || search !== '';

  return (
    <div className="min-h-screen pt-20 pb-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 mb-2">Browse Mess</h1>
          <p className="text-neutral-600">Find hostels and PGs serving fresh daily meals near you.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mb-6 sticky top-16 z-30">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input type="text" placeholder="Search by name, area, or city..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm transition-all" />
            </div>
            <div className="flex gap-3">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-white transition-all">
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters || hasActiveFilters ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-100 grid sm:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">City</label>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <button key={city} onClick={() => setCityFilter(city)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${cityFilter === city ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{city}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">Food Type</label>
                <div className="flex flex-wrap gap-2">
                  {foodTypes.map((type) => (
                    <button key={type} onClick={() => setFoodFilter(type)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${foodFilter === type ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{type}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-500">Active filters:</span>
              {cityFilter !== 'All' && <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs"><MapPin className="w-3 h-3" /> {cityFilter}<button onClick={() => setCityFilter('All')}><X className="w-3 h-3" /></button></span>}
              {foodFilter !== 'All' && <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs">{foodFilter}<button onClick={() => setFoodFilter('All')}><X className="w-3 h-3" /></button></span>}
              <button onClick={() => { setSearch(''); setCityFilter('All'); setFoodFilter('All'); }} className="text-xs text-neutral-500 hover:text-error-500 underline">Clear all</button>
            </div>
          )}
        </div>

        <div className="mb-4"><p className="text-sm text-neutral-500">{loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'hostel' : 'hostels'} found`}</p></div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-neutral-200">
                <div className="h-48 skeleton" />
                <div className="p-4 space-y-3"><div className="h-4 w-3/4 skeleton rounded" /><div className="h-3 w-1/2 skeleton rounded" /><div className="h-8 w-1/3 skeleton rounded" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-neutral-400" /></div>
            <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">No hostels found</h3>
            <p className="text-neutral-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((hostel) => <HostelCard key={hostel.id} hostel={hostel} onClick={() => onNavigate('detail', { id: hostel.id })} />)}
          </div>
        )}
      </div>
    </div>
  );
}
