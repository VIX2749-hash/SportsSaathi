import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  MapPin, 
  Clock, 
  Search, 
  Plus, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  Award
} from 'lucide-react';
import { EquipmentItem, EquipmentReservation } from '../types';
import { apiRequest } from '../services/api';
import { BorrowEquipmentModal } from '../components/BorrowEquipmentModal';
import { CreateEquipmentModal } from '../components/CreateEquipmentModal';

interface EquipmentLibraryProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const EquipmentLibrary: React.FC<EquipmentLibraryProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedSharingType, setSelectedSharingType] = useState<string>('ALL');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Modals
  const [selectedItemForBorrow, setSelectedItemForBorrow] = useState<EquipmentItem | null>(null);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchEquipment = () => {
    setLoading(true);
    let url = '/equipment?';
    if (selectedSport !== 'ALL') {
      url += `sportCategory=${encodeURIComponent(selectedSport)}&`;
    }
    if (selectedSharingType !== 'ALL') {
      url += `sharingType=${encodeURIComponent(selectedSharingType)}&`;
    }
    if (searchQuery) {
      url += `search=${encodeURIComponent(searchQuery)}&`;
    }

    apiRequest<{ equipment: EquipmentItem[] }>(url)
      .then((res) => {
        setEquipmentList(res.equipment || []);
      })
      .catch((err) => {
        console.error('Failed to load equipment:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEquipment();
  }, [selectedSport, selectedSharingType, searchQuery]);

  const sportsFilters = [
    { id: 'ALL', label: 'All Equipment' },
    { id: 'Cricket', label: 'Cricket 🏏' },
    { id: 'Badminton', label: 'Badminton 🏸' },
    { id: 'Football', label: 'Football ⚽' },
    { id: 'Tennis', label: 'Tennis 🎾' },
    { id: 'Yoga', label: 'Yoga 🧘' },
    { id: 'Cycling', label: 'Cycling 🚴' },
  ];

  const filteredItems = equipmentList.filter((item) => {
    if (availableOnly && (item.availableQuantity !== undefined && item.availableQuantity <= 0)) {
      return false;
    }
    return true;
  });

  const handleOpenBorrowModal = (item: EquipmentItem) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setSelectedItemForBorrow(item);
    setBorrowModalOpen(true);
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
        
        {/* Header Hero Banner */}
        <div className="bg-[#231215] text-[#FAF7F0] rounded-[32px] p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#341b20] border border-[#4d2830] text-[11px] font-mono tracking-wider uppercase text-white/90">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
              PILLAR 3: EQUIPMENT LIBRARY & SHARING
            </div>

            <h1 className="font-display text-4xl sm:text-6xl uppercase font-bold tracking-tight text-white leading-tight">
              GEAR UP & <br />
              <span className="text-[#CCFF00]">SHARE THE PLAY.</span>
            </h1>

            <p className="text-white/70 text-sm sm:text-base font-sans">
              Don't let missing equipment stop your workout. Borrow tournament-grade rackets, footballs, agility cones, and yoga gear from trusted community athletes. Earn +20 reputation points on every verified return.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenCreateModal}
                className="bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] font-display font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-full transition-transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Share Your Equipment</span>
              </button>

              {user && (
                <button
                  onClick={() => onNavigate('my-bookings')}
                  className="bg-transparent hover:bg-white/10 text-white font-display font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-full border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <Award size={15} className="text-[#CCFF00]" />
                  <span>My Borrowed Gear & Handovers</span>
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80"
              alt="Sports Gear and Athletic Mats"
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

          {/* Search, Sharing Type & Availability Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-56">
              <Search size={15} className="absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search gear or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-neutral-300 text-xs font-sans text-[#221013] focus:outline-none focus:border-[#221013]"
              />
            </div>

            <select
              value={selectedSharingType}
              onChange={(e) => setSelectedSharingType(e.target.value)}
              className="bg-white border border-neutral-300 text-xs font-sans text-[#221013] px-3 py-2 rounded-full focus:outline-none focus:border-[#221013]"
            >
              <option value="ALL">All Types</option>
              <option value="FREE_LENDING">Free Lending</option>
              <option value="PAID_RENTAL">Paid Rental</option>
              <option value="COMMUNITY_POOL">Community Pool</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer bg-white border border-neutral-300 px-3.5 py-2 rounded-full text-xs font-sans select-none hover:border-[#221013]">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#221013] focus:ring-0"
              />
              <span className="font-bold text-[#221013]">In Stock</span>
            </label>
          </div>

        </div>

        {/* Equipment Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-[#221013] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Loading equipment library...
            </span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
            <Package size={40} className="mx-auto text-neutral-300 mb-3" />
            <h3 className="font-display text-xl uppercase font-bold text-[#221013]">
              No Equipment Listed
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
              No equipment found matching your criteria. Contribute your spare rackets or training gear to help fellow players!
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#221013] text-[#FAF7F0] font-display text-xs uppercase tracking-wider font-bold px-6 py-2.5 rounded-full hover:bg-neutral-800 transition-colors"
            >
              Share Your Equipment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const available = item.availableQuantity !== undefined ? item.availableQuantity : item.totalQuantity;
              const isAvailable = available > 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Photo & Badges */}
                  <div className="relative h-48 overflow-hidden bg-neutral-100">
                    <img
                      src={item.photos}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Condition Badge */}
                    <div className="absolute top-3 left-3 bg-[#221013]/90 backdrop-blur-md text-[#FAF7F0] text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                      {item.condition}
                    </div>

                    {/* Sharing Type Pill */}
                    <div className="absolute top-3 right-3 bg-[#CCFF00] text-[#121212] text-xs font-display uppercase tracking-wider px-3 py-1 rounded-full font-bold shadow-sm">
                      {item.sharingType === 'FREE_LENDING'
                        ? 'FREE LENDING'
                        : item.sharingType === 'PAID_RENTAL'
                        ? `₹${item.pricePerLoan} RENTAL`
                        : 'COMMUNITY POOL'}
                    </div>

                    {/* Availability Tag */}
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-[#221013] text-[10px] font-mono px-2.5 py-1 rounded-md flex items-center gap-1.5 font-bold">
                      <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span>{available} of {item.totalQuantity} Available</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#E76244] font-bold">
                          {item.sportCategory}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          Max {item.maxLoanDays} Days
                        </span>
                      </div>

                      <h3 className="font-display text-lg uppercase font-bold text-[#221013] leading-snug">
                        {item.name}
                      </h3>

                      <p className="text-xs text-[#221013]/70 font-sans line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Neighborhood and Security Deposit */}
                    <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-neutral-600">
                        <span className="flex items-center gap-1 font-sans text-neutral-500">
                          <MapPin size={12} className="text-[#E76244]" />
                          {item.pickupArea}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-[#221013]">
                          {item.depositRequired > 0 ? `₹${item.depositRequired} Deposit` : 'No Deposit'}
                        </span>
                      </div>

                      <div className="bg-[#FAF7F0] p-2.5 rounded-xl flex items-center justify-between text-[10px] font-mono text-neutral-600">
                        <span>Pledge & Return Bonus:</span>
                        <span className="font-bold text-[#E76244]">+20 Points</span>
                      </div>
                    </div>

                    {/* Owner & Borrow CTA */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.owner?.avatarUrl ? (
                          <img
                            src={item.owner.avatarUrl}
                            alt={item.owner.displayName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#221013] text-[#FAF7F0] text-[10px] font-bold flex items-center justify-center">
                            {item.owner?.displayName?.charAt(0) || 'O'}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-[#221013]">
                          {item.owner?.displayName?.split(' ')[0]}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenBorrowModal(item)}
                        disabled={!isAvailable}
                        className="bg-[#221013] hover:bg-[#CCFF00] hover:text-[#121212] text-[#FAF7F0] font-display uppercase tracking-wider text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm disabled:opacity-40 disabled:hover:bg-[#221013] disabled:hover:text-[#FAF7F0]"
                      >
                        {isAvailable ? 'Borrow Gear' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Borrow Modal */}
      <BorrowEquipmentModal
        isOpen={borrowModalOpen}
        item={selectedItemForBorrow}
        onClose={() => setBorrowModalOpen(false)}
        onReservationSuccess={() => {
          fetchEquipment();
        }}
      />

      {/* Share Equipment Modal */}
      <CreateEquipmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onItemCreated={(newItem) => {
          setEquipmentList([newItem, ...equipmentList]);
        }}
      />
    </div>
  );
};
