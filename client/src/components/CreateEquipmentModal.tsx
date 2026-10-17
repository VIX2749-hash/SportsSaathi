import React, { useState } from 'react';
import { X, Package, ShieldCheck, DollarSign, Clock } from 'lucide-react';
import { apiRequest } from '../services/api';
import { EquipmentItem } from '../types';

interface CreateEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: EquipmentItem) => void;
}

export const CreateEquipmentModal: React.FC<CreateEquipmentModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sportCategory, setSportCategory] = useState('Badminton');
  const [condition, setCondition] = useState('Excellent');
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [sharingType, setSharingType] = useState<'FREE_LENDING' | 'PAID_RENTAL' | 'COMMUNITY_POOL'>('FREE_LENDING');
  const [pickupArea, setPickupArea] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [maxLoanDays, setMaxLoanDays] = useState(3);
  const [depositRequired, setDepositRequired] = useState(0);
  const [pricePerLoan, setPricePerLoan] = useState(0);
  const [photos, setPhotos] = useState('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=700&q=80');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pickupArea || !sportCategory) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest<{ equipment: EquipmentItem }>('/equipment', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          sportCategory,
          condition,
          totalQuantity: Number(totalQuantity),
          sharingType,
          pickupArea,
          pickupAddress,
          loanDurationRules: `Up to ${maxLoanDays} days loan`,
          maxLoanDays: Number(maxLoanDays),
          depositRequired: Number(depositRequired),
          pricePerLoan: Number(pricePerLoan),
          photos,
        }),
      });

      onItemCreated(res.equipment);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to list equipment.');
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
            <Package size={24} />
          </div>
          <div>
            <h2 className="font-display text-2xl uppercase font-bold tracking-tight text-[#221013]">
              Share Sports Equipment
            </h2>
            <p className="text-xs text-[#221013]/70 font-sans">
              Lend, rent, or contribute gear to your local sports library and earn community points.
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
              Gear Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Yonex Astrox 88D Pro (Pair with Case)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Sport Category *
              </label>
              <select
                value={sportCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setSportCategory(val);
                  if (val === 'Cricket') {
                    setPhotos('https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=800&q=80');
                  } else if (val === 'Badminton') {
                    setPhotos('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80');
                  } else if (val === 'Football') {
                    setPhotos('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80');
                  } else if (val === 'Tennis') {
                    setPhotos('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80');
                  } else if (val === 'Yoga') {
                    setPhotos('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80');
                  } else if (val === 'Cycling') {
                    setPhotos('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80');
                  } else if (val === 'Running') {
                    setPhotos('https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80');
                  }
                }}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              >
                <option value="Badminton">Badminton</option>
                <option value="Tennis">Tennis</option>
                <option value="Football">Football / Soccer</option>
                <option value="Cricket">Cricket</option>
                <option value="Basketball">Basketball</option>
                <option value="Yoga">Yoga</option>
                <option value="Cycling">Cycling</option>
                <option value="Running">Running</option>
                <option value="Fitness">Fitness / Weights</option>
                <option value="Other">Other Gear</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              >
                <option value="Brand New">Brand New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Total Available Units
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              placeholder="Include racket weight/grip size, ball condition, care guidelines, included accessories, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Sharing Type
              </label>
              <select
                value={sharingType}
                onChange={(e) => setSharingType(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              >
                <option value="FREE_LENDING">Free Lending (Community)</option>
                <option value="PAID_RENTAL">Paid Rental</option>
                <option value="COMMUNITY_POOL">Community Pool / Club</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Security Deposit (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-neutral-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={depositRequired}
                  onChange={(e) => setDepositRequired(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Refunded upon verified safe return
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Rental Fee / Loan (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-neutral-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={pricePerLoan}
                  onChange={(e) => setPricePerLoan(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
                />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                0 for free lending
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Pickup Neighborhood / Area *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Koramangala, Bengaluru or Bandra, Mumbai"
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Visible to everyone for distance filtering.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Exact Pickup Address (Private Tier)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Sony World Signal, 100ft Road"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              />
              <span className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                Protected: Released only once borrower request is approved.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Max Loan Days
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-3.5 text-neutral-400" />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={maxLoanDays}
                  onChange={(e) => setMaxLoanDays(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1">
                Photo URL
              </label>
              <input
                type="url"
                value={photos}
                onChange={(e) => setPhotos(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#221013]"
              />
            </div>
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
              {submitting ? 'Listing...' : 'List in Equipment Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
