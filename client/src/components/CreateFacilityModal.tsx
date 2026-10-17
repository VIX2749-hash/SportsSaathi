import React, { useState } from 'react';
import { X, Building, DollarSign, Clock, ShieldAlert } from 'lucide-react';
import { apiRequest } from '../services/api';
import { SportsFacility } from '../types';

interface CreateFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFacilityCreated: (facility: SportsFacility) => void;
}

export const CreateFacilityModal: React.FC<CreateFacilityModalProps> = ({
  isOpen,
  onClose,
  onFacilityCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [facilityType, setFacilityType] = useState('Badminton Court');
  const [sportCategories, setSportCategories] = useState('Badminton, Racket');
  const [photos, setPhotos] = useState('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80');
  const [location, setLocation] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [amenities, setAmenities] = useState('Showers, Lockers, Water Fountain');
  const [openingHours, setOpeningHours] = useState('07:00 - 22:00');
  const [bookingDurationRules, setBookingDurationRules] = useState('60 min slots');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [pricePerSlot, setPricePerSlot] = useState(0);
  const [capacity, setCapacity] = useState(4);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !facilityType) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest<{ facility: SportsFacility }>('/facilities', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          facilityType,
          sportCategories,
          photos,
          location,
          addressDetails,
          amenities,
          openingHours,
          bookingDurationRules,
          slotDurationMinutes: Number(slotDurationMinutes),
          pricePerSlot: Number(pricePerSlot),
          capacity: Number(capacity),
          requiresApproval,
        }),
      });

      onFacilityCreated(res.facility);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to list facility. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FAF7F0] text-[#221013] rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-200 text-[#221013]/60 hover:text-[#221013] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#221013] text-[#CCFF00] rounded-2xl">
            <Building size={24} />
          </div>
          <div>
            <h2 className="font-display text-2xl uppercase font-bold tracking-tight text-[#221013]">
              List a Sports Space
            </h2>
            <p className="text-xs text-[#221013]/70 font-sans">
              Share your court, turf, or training space with local community athletes.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
              Facility Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Capitol Hill Indoor Badminton Court 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Facility Type *
              </label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              >
                <option value="Badminton Court">Badminton Court</option>
                <option value="Football Ground">Football / Turf Pitch</option>
                <option value="Tennis Court">Tennis Court</option>
                <option value="Cricket Nets">Cricket Nets</option>
                <option value="Basketball Court">Basketball Court</option>
                <option value="Running Track">Running Track</option>
                <option value="Indoor Sports Hall">Indoor Sports Hall</option>
                <option value="Squash Court">Squash Court</option>
                <option value="Other">Other Sports Space</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Supported Sports
              </label>
              <input
                type="text"
                placeholder="e.g. Badminton, Pickleball"
                value={sportCategories}
                onChange={(e) => setSportCategories(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
              Description & Ground Rules
            </label>
            <textarea
              rows={3}
              placeholder="Describe flooring, non-marking shoes requirement, lighting, equipment available, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Public Area / Neighborhood *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Indiranagar, Bengaluru or Bandra, Mumbai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Shown publicly to all athletes.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Precise Address (Private Tier)
              </label>
              <input
                type="text"
                placeholder="e.g. Court 3, Sports Complex, 12th Main Road"
                value={addressDetails}
                onChange={(e) => setAddressDetails(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              />
              <span className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
                <ShieldAlert size={11} className="text-[#E76244]" />
                Revealed only to athletes with confirmed bookings.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Slot Length (Mins)
              </label>
              <select
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (Standard)</option>
                <option value={90}>90 mins</option>
                <option value={120}>120 mins</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Price Per Slot (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-neutral-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="350"
                  value={pricePerSlot}
                  onChange={(e) => setPricePerSlot(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                0 = Free community ground
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Player Capacity
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Opening Hours
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="06:00 - 22:00"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Amenities (comma separated)
              </label>
              <input
                type="text"
                placeholder="Floodlights, Lockers, Showers, Parking"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
              Photo URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={photos}
              onChange={(e) => setPhotos(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-300 bg-white cursor-pointer hover:bg-neutral-50 transition-colors">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="w-4 h-4 text-[#221013] rounded focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-bold text-[#221013] block">
                  Require Host Approval Before Confirmation
                </span>
                <span className="text-neutral-500 block">
                  If unchecked, slots are instantly auto-confirmed upon booking request.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-display uppercase tracking-wider text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#221013] hover:bg-neutral-800 text-[#FAF7F0] px-6 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-bold transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Sports Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
