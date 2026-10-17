import React, { useState } from 'react';
import { X, Calendar, Clock, DollarSign, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/api';
import { SportsFacility, FacilityBooking } from '../types';

interface BookFacilityModalProps {
  isOpen: boolean;
  facility: SportsFacility | null;
  onClose: () => void;
  onBookingSuccess: (booking: FacilityBooking) => void;
}

export const BookFacilityModal: React.FC<BookFacilityModalProps> = ({
  isOpen,
  facility,
  onClose,
  onBookingSuccess,
}) => {
  if (!isOpen || !facility) return null;

  // Default to today or tomorrow
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [durationSlots, setDurationSlots] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<FacilityBooking | null>(null);

  const slotMinutes = facility.slotDurationMinutes || 60;
  const totalPrice = facility.pricePerSlot * durationSlots;

  // Generate selectable time slots across day
  const availableHours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
    '20:00', '21:00'
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const [hour, min] = selectedTime.split(':').map(Number);
      const start = new Date(`${selectedDate}T${selectedTime}:00`);
      const totalMinutes = slotMinutes * durationSlots;
      const end = new Date(start.getTime() + totalMinutes * 60000);

      const res = await apiRequest<{ booking: FacilityBooking; message: string }>(
        `/facilities/${facility.id}/bookings`,
        {
          method: 'POST',
          body: JSON.stringify({
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            notes,
          }),
        }
      );

      setSuccessBooking(res.booking);
      onBookingSuccess(res.booking);
    } catch (err: any) {
      setError(err.message || 'Slot already booked or overlaps with existing reservation.');
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

        {successBooking ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-[#CCFF00] rounded-full flex items-center justify-center mx-auto text-[#121212] shadow-lg">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="font-display text-2xl uppercase font-bold text-[#221013]">
              {successBooking.status === 'CONFIRMED' ? 'Slot Confirmed!' : 'Booking Request Sent!'}
            </h3>

            <p className="text-xs text-[#221013]/70 font-sans max-w-sm mx-auto leading-relaxed">
              {successBooking.status === 'CONFIRMED'
                ? `Your booking at ${facility.name} is confirmed. Precise access details have been unlocked in your bookings.`
                : `Your booking request has been forwarded to ${facility.owner?.displayName || 'the space host'}. You'll be notified upon approval.`}
            </p>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Date:</span>
                <span className="font-bold text-[#221013]">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Time Window:</span>
                <span className="font-bold text-[#221013]">{selectedTime} ({slotMinutes * durationSlots} mins)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Price:</span>
                <span className="font-bold text-[#221013]">{totalPrice === 0 ? 'Free' : `₹${totalPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status:</span>
                <span className={`font-mono uppercase font-bold text-[10px] px-2 py-0.5 rounded-full ${
                  successBooking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {successBooking.status}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full bg-[#221013] text-[#FAF7F0] font-display uppercase tracking-wider text-xs font-bold py-3.5 rounded-full hover:bg-neutral-800 transition-colors shadow-md"
              >
                Close & View in My Bookings
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E76244] font-bold">
                RESERVE SPACE
              </span>
              <h2 className="font-display text-2xl uppercase font-bold tracking-tight text-[#221013] mt-1">
                {facility.name}
              </h2>
              <p className="text-xs text-[#221013]/70 font-sans mt-0.5">
                {facility.facilityType} • {facility.location}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} />
                  Booking Date
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm font-sans focus:outline-none focus:border-[#221013]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1.5 flex items-center gap-1.5">
                    <Clock size={14} />
                    Start Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-sans focus:outline-none focus:border-[#221013]"
                  >
                    {availableHours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1.5">
                    Slot Units ({slotMinutes}m each)
                  </label>
                  <select
                    value={durationSlots}
                    onChange={(e) => setDurationSlots(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-sans focus:outline-none focus:border-[#221013]"
                  >
                    <option value={1}>1 Slot ({slotMinutes} mins)</option>
                    <option value={2}>2 Slots ({slotMinutes * 2} mins)</option>
                    <option value={3}>3 Slots ({slotMinutes * 3} mins)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#221013]/70 mb-1.5">
                  Session Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 4 players doubles badminton session, bringing our own shuttles."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-sans focus:outline-none focus:border-[#221013]"
                />
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 rounded-2xl bg-[#FAF3E0] border border-neutral-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#221013]/70 font-sans">Rate per slot:</span>
                  <span className="font-bold text-[#221013]">
                    {facility.pricePerSlot === 0 ? 'Free Community Space' : `₹${facility.pricePerSlot}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#221013]/70 font-sans">Duration:</span>
                  <span className="font-bold text-[#221013]">{durationSlots * slotMinutes} Minutes</span>
                </div>
                <div className="pt-2 border-t border-neutral-300/60 flex justify-between items-center">
                  <span className="font-display uppercase text-xs font-bold text-[#221013]">Total Estimated Fee:</span>
                  <span className="font-display text-xl font-bold text-[#221013]">
                    {totalPrice === 0 ? 'FREE' : `₹${totalPrice}`}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-500 font-sans pt-1">
                  * Sports Saathi provides informational directory pricing only; ground fees are settled directly on arrival.
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] font-display uppercase tracking-wider text-xs font-bold py-3.5 rounded-full transition-transform hover:scale-[1.01] shadow-lg disabled:opacity-50"
                >
                  {submitting
                    ? 'Checking Availability...'
                    : facility.requiresApproval
                    ? 'Request Space Booking'
                    : 'Confirm Space Booking Instantly'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
