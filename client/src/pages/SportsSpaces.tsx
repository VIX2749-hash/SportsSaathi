import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building, 
  MapPin, 
  Clock, 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  DollarSign, 
  Sparkles,
  CheckCircle,
  Filter
} from 'lucide-react';
import { SportsFacility, FacilityBooking } from '../types';
import { apiRequest } from '../services/api';
import { BookFacilityModal } from '../components/BookFacilityModal';
import { CreateFacilityModal } from '../components/CreateFacilityModal';

interface SportsSpacesProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const SportsSpaces: React.FC<SportsSpacesProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<SportsFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [freeOnly, setFreeOnly] = useState(false);

  // Modals state
  const [selectedFacilityForBooking, setSelectedFacilityForBooking] = useState<SportsFacility | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchFacilities = () => {
    setLoading(true);
    let url = '/facilities?';
    if (selectedSport !== 'ALL') {
      url += `sportCategory=${encodeURIComponent(selectedSport)}&`;
    }
    if (searchQuery) {
      url += `search=${encodeURIComponent(searchQuery)}&`;
    }

    apiRequest<{ facilities: SportsFacility[] }>(url)
      .then((res) => {
        setFacilities(res.facilities || []);
      })
      .catch((err) => {
        console.error('Failed to load facilities:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedSport, searchQuery]);

  const sportsFilters = [
    { id: 'ALL', label: 'All Spaces' },
    { id: 'Badminton', label: 'Badminton' },
    { id: 'Football', label: 'Turf Football' },
    { id: 'Tennis', label: 'Tennis' },
    { id: 'Cricket', label: 'Cricket Nets' },
    { id: 'Basketball', label: 'Basketball' },
    { id: 'Running', label: 'Running Tracks' },
  ];

  const filteredFacilities = facilities.filter((f) => {
    if (freeOnly && f.pricePerSlot > 0) return false;
    return true;
  });

  const handleOpenBookModal = (facility: SportsFacility) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setSelectedFacilityForBooking(facility);
    setBookingModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setCreateModalOpen(true);
  };

  return (
    <div className="bg-[#FAF7F0] text-[#221013] min-h-screen py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Hero Section */}
        <div className="bg-[#231215] text-[#FAF7F0] rounded-[32px] p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#341b20] border border-[#4d2830] text-[11px] font-mono tracking-wider uppercase text-white/90">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
              PILLAR 2: COMMUNITY SPORTS SPACES
            </div>
            
            <h1 className="font-display text-4xl sm:text-6xl uppercase font-bold tracking-tight text-white leading-tight">
              FIND & BOOK <br />
              <span className="text-[#CCFF00]">PLACES TO PLAY.</span>
            </h1>

            <p className="text-white/70 text-sm sm:text-base font-sans">
              Discover verified badminton wooden courts, FIFA-grade turf pitches, cricket nets, and public tracks across Bengaluru, Mumbai, Delhi NCR, Hyderabad, and Pune. Book slots atomically without booking clashes.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenCreateModal}
                className="bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] font-display font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-full transition-transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                <Plus size={16} />
                <span>List Your Space</span>
              </button>

              {user && (
                <button
                  onClick={() => onNavigate('my-bookings')}
                  className="bg-transparent hover:bg-white/10 text-white font-display font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-full border border-white/20 transition-all"
                >
                  My Space Bookings
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80"
              alt="Turf Football Arena under Floodlights"
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
            />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
          
          {/* Sports Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {sportsFilters.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSport(tab.id)}
                className={`text-xs font-display font-bold uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedSport === tab.id
                    ? 'bg-[#221013] text-[#FAF7F0] shadow-sm'
                    : 'bg-white border border-neutral-300 text-[#221013]/70 hover:border-[#221013]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Free Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search size={15} className="absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search area (e.g. Indiranagar, Bandra)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-neutral-300 text-xs font-sans text-[#221013] focus:outline-none focus:border-[#221013]"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-white border border-neutral-300 px-3.5 py-2 rounded-full text-xs font-sans select-none hover:border-[#221013]">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#221013] focus:ring-0"
              />
              <span className="font-bold text-[#221013]">Free Only</span>
            </label>
          </div>

        </div>

        {/* Facilities Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-[#221013] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Loading sports spaces...
            </span>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
            <Building size={40} className="mx-auto text-neutral-300 mb-3" />
            <h3 className="font-display text-xl uppercase font-bold text-[#221013]">
              No Sports Spaces Found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
              There are no spaces currently listed matching your selected filters. Be the first to list a facility!
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#221013] text-[#FAF7F0] font-display text-xs uppercase tracking-wider font-bold px-6 py-2.5 rounded-full hover:bg-neutral-800 transition-colors"
            >
              List a Sports Space
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map((facility) => (
              <div
                key={facility.id}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo & Badges */}
                <div className="relative h-48 overflow-hidden bg-neutral-100">
                  <img
                    src={facility.photos}
                    alt={facility.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Facility Type Badge */}
                  <div className="absolute top-3 left-3 bg-[#221013]/90 backdrop-blur-md text-[#FAF7F0] text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                    {facility.facilityType}
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-3 right-3 bg-[#CCFF00] text-[#121212] text-xs font-display uppercase tracking-wider px-3 py-1 rounded-full font-bold shadow-sm">
                    {facility.pricePerSlot === 0 ? 'FREE GROUND' : `₹${facility.pricePerSlot} / SLOT`}
                  </div>

                  {/* Privacy Badge on Location */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#221013] text-[10px] font-mono px-2.5 py-1 rounded-md flex items-center gap-1">
                    <MapPin size={11} className="text-[#E76244]" />
                    <span>{facility.location}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                        {facility.sportCategories}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                        <Users size={12} />
                        Up to {facility.capacity}
                      </span>
                    </div>

                    <h3 className="font-display text-lg uppercase font-bold text-[#221013] leading-snug">
                      {facility.name}
                    </h3>

                    <p className="text-xs text-[#221013]/70 font-sans line-clamp-2 leading-relaxed">
                      {facility.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {facility.amenities.split(',').map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700"
                        >
                          {amenity.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {facility.openingHours}
                      </span>
                      <span>{facility.slotDurationMinutes} min slots</span>
                    </div>
                  </div>

                  {/* Host & Book Button */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {facility.owner?.avatarUrl ? (
                        <img
                          src={facility.owner.avatarUrl}
                          alt={facility.owner.displayName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#221013] text-[#FAF7F0] text-[10px] font-bold flex items-center justify-center">
                          {facility.owner?.displayName?.charAt(0) || 'H'}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-[#221013]">
                        {facility.owner?.displayName?.split(' ')[0]}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenBookModal(facility)}
                      className="bg-[#221013] hover:bg-[#CCFF00] hover:text-[#121212] text-[#FAF7F0] font-display uppercase tracking-wider text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Booking Modal */}
      <BookFacilityModal
        isOpen={bookingModalOpen}
        facility={selectedFacilityForBooking}
        onClose={() => setBookingModalOpen(false)}
        onBookingSuccess={() => {
          fetchFacilities();
        }}
      />

      {/* List Facility Modal */}
      <CreateFacilityModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onFacilityCreated={(newFac) => {
          setFacilities([newFac, ...facilities]);
        }}
      />
    </div>
  );
};
