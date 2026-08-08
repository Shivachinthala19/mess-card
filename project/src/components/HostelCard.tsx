import { Star, MapPin, Users, Utensils } from 'lucide-react';
import type { Hostel } from '@/types';

interface HostelCardProps {
  hostel: Hostel;
  onClick: () => void;
}

export default function HostelCard({ hostel, onClick }: HostelCardProps) {
  const spotsLeft = hostel.total_capacity - hostel.filled_capacity;
  const fillPercent = (hostel.filled_capacity / hostel.total_capacity) * 100;

  return (
    <button onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-200/60 transition-all duration-300 text-left w-full hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img src={hostel.image_url} alt={hostel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
          <Star className="w-3.5 h-3.5 text-accent-500 fill-accent-500" />
          <span className="text-sm font-semibold text-neutral-900">{hostel.rating.toFixed(1)}</span>
        </div>
        <div className="absolute top-3 right-3 bg-primary-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm">{hostel.food_type}</div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display font-bold text-lg text-white">{hostel.name}</h3>
          <p className="text-sm text-white/80 flex items-center gap-1"><MapPin className="w-3 h-3" /> {hostel.area}, {hostel.city}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-neutral-600 line-clamp-2 mb-3 leading-relaxed">{hostel.description}</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 text-xs text-neutral-500"><Users className="w-3.5 h-3.5" /> {hostel.filled_capacity}/{hostel.total_capacity} filled</div>
          <div className="flex items-center gap-1 text-xs text-neutral-500"><Utensils className="w-3.5 h-3.5" /> Daily meals</div>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-3">
          <div className={`h-full rounded-full transition-all ${fillPercent > 90 ? 'bg-error-500' : 'bg-primary-500'}`} style={{ width: `${fillPercent}%` }} />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-neutral-900">₹{hostel.monthly_price.toLocaleString('en-IN')}</span>
            <span className="text-sm text-neutral-500">/month</span>
          </div>
          {spotsLeft > 0 ? (
            <span className="text-xs font-medium text-success-600 bg-success-50 px-2 py-1 rounded-md">{spotsLeft} spots left</span>
          ) : (
            <span className="text-xs font-medium text-error-600 bg-error-50 px-2 py-1 rounded-md">Full</span>
          )}
        </div>
      </div>
    </button>
  );
}
