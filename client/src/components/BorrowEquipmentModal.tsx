import React, { useState } from 'react';
import { X, Calendar, Package, DollarSign, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/api';
import { EquipmentItem, EquipmentReservation } from '../types';

interface BorrowEquipmentModalProps {
  isOpen: boolean;
  item: EquipmentItem | null;
  onClose: () => void;
  onReservationSuccess: (reservation: EquipmentReservation) => void;
}

export const BorrowEquipmentModal: React.FC<BorrowEquipmentModalProps> = ({
  isOpen,
  item,
  onClose,
  onReservationSuccess,
}) => {
  if (!isOpen || !item) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const maxAvailable = item.availableQuantity !== undefined ? item.availableQuantity : item.totalQuantity;

  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [agreedGuidelines, setAgreedGuidelines] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReservation, setSuccessReservation] = useState<EquipmentReservation | null>(null);

  // Calculate day difference
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffDays = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));
  const totalCost = item.pricePerLoan * quantity;
  const depositTotal = item.depositRequired * quantity;

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedGuidelines) {
      setError('Please agree to the equipment care and handover audit guidelines.');
      return;
    }

    if (diffDays > item.maxLoanDays) {
      setError(`Maximum loan period for this equipment is ${item.maxLoanDays} days.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest<{ reservation: EquipmentReservation; message: string }>(
        `/equipment/${item.id}/reserve`,
        {
          method: 'POST',
          body: JSON.stringify({
            quantity: Number(quantity),
            startAt: new Date(startDate).toISOString(),
            endAt: new Date(endDate).toISOString(),
            notes,
          }),
        }
      );

      setSuccessReservation(res.reservation);
      onReservationSuccess(res.reservation);
    } catch (err: any) {
      setError(err.message || 'Failed to reserve gear. It may be fully allocated for these dates.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FAF7F0] text-[#221013] rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-200 text-[#221013]/60 hover:text-[#221013] transition-colors"
        >
          <X size={20} />
        </button>

        {successReservation ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-[#CCFF00] rounded-full flex items-center justify-center mx-auto text-[#121212] shadow-lg">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="font-display text-2xl uppercase font-bold text-[#221013]">
              Reservation Submitted!
            </h3>

            <p className="text-xs text-[#221013]/70 font-sans max-w-sm mx-auto leading-relaxed">
              Your borrow request for {item.name} has been placed. Once confirmed by the owner, exact handover instructions will unlock.
            </p>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Gear:</span>
                <span className="font-bold text-[#221013]">{item.name} ({quantity}x)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Loan Period:</span>
                <span className="font-bold text-[#221013]">{startDate} to {endDate} ({diffDays} days)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Deposit:</span>
                <span className="font-bold text-[#221013]">${depositTotal} (Refundable)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Rental Fee:</span>
                <span className="font-bold text-[#221013]">{totalCost === 0 ? 'Free Lending' : `$${totalCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Pickup Area:</span>
                <span className="font-bold text-[#221013]">{item.pickupArea}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full bg-[#221013] text-[#FAF7F0] font-display uppercase tracking-wider text-xs font-bold py-3.5 rounded-full hover:bg-neutral-800 transition-colors shadow-md"
              >
                Close & View My Bookings
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E76244] font-bold">
                COMMUNITY GEAR LIBRARY
              </span>
              <h2 className="font-display text-2xl uppercase font-bold tracking-tight text-[#221013] mt-1">
                {item.name}
              </h2>
              <p className="text-xs text-[#221013]/70 font-sans mt-0.5">
                Condition: {item.condition} • Pickup: {item.pickupArea}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleReserve} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1.5 flex items-center gap-1.5">
                    <Package size={14} />
                    Quantity Needed
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-sans focus:outline-none focus:border-[#221013]"
                  >
                    {Array.from({ length: maxAvailable }, (_, i) => i + 1).map((qty) => (
                      <option key={qty} value={qty}>
                        {qty} {qty === 1 ? 'unit' : 'units'}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    {maxAvailable} available right now
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} />
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-sans focus:outline-none focus:border-[#221013]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} />
                  Expected Return Date (Max {item.maxLoanDays} days)
                </label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-sans focus:outline-none focus:border-[#221013]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1.5">
                  Message for Owner (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Introduce yourself and share how you plan to use this gear."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-sans focus:outline-none focus:border-[#221013]"
                />
              </div>

              {/* Deposit and Fee Summary */}
              <div className="p-4 rounded-2xl bg-[#FAF3E0] border border-neutral-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#221013]/70 font-sans">Sharing Type:</span>
                  <span className="font-bold text-[#221013]">
                    {item.sharingType === 'FREE_LENDING' ? 'Free Community Lending' : item.sharingType}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#221013]/70 font-sans">Borrowing Fee:</span>
                  <span className="font-bold text-[#221013]">
                    {totalCost === 0 ? '$0 (Free)' : `$${totalCost}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#221013]/70 font-sans">Refundable Deposit:</span>
                  <span className="font-bold text-emerald-700">
                    {depositTotal === 0 ? '$0 (No deposit)' : `$${depositTotal}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-300/60 flex items-center justify-between text-[11px] font-mono text-neutral-600">
                  <span>Return Reward:</span>
                  <span className="font-bold text-[#E76244]">+20 Community Points</span>
                </div>
              </div>

              <div>
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-300 bg-white cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreedGuidelines}
                    onChange={(e) => setAgreedGuidelines(e.target.checked)}
                    className="w-4 h-4 text-[#221013] rounded focus:ring-0 mt-0.5"
                  />
                  <div className="text-[11px] text-[#221013]/80 leading-snug">
                    <span className="font-bold text-[#221013] block">Community Gear Care Pledge</span>
                    I promise to inspect the gear upon pickup, use it responsibly, return it clean and on schedule, and complete the digital handover checklist.
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] font-display uppercase tracking-wider text-xs font-bold py-3.5 rounded-full transition-transform hover:scale-[1.01] shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Checking Availability...' : 'Submit Borrow Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
