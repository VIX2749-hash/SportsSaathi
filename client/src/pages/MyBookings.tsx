import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Package, 
  Building, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Award,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { FacilityBooking, EquipmentReservation } from '../types';
import { apiRequest } from '../services/api';

interface MyBookingsProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'SPACES' | 'GEAR' | 'MANAGER'>('SPACES');
  
  // Athlete bookings
  const [facilityBookings, setFacilityBookings] = useState<FacilityBooking[]>([]);
  const [equipmentReservations, setEquipmentReservations] = useState<EquipmentReservation[]>([]);
  
  // Host / Manager items
  const [managedSpaceBookings, setManagedSpaceBookings] = useState<FacilityBooking[]>([]);
  const [managedGearReservations, setManagedGearReservations] = useState<EquipmentReservation[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [handoverNote, setHandoverNote] = useState('');
  const [handoverModalResId, setHandoverModalResId] = useState<string | null>(null);
  const [handoverType, setHandoverType] = useState<'PICKED_UP' | 'RETURNED'>('PICKED_UP');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user's own facility bookings & host requests
      const facRes = await apiRequest<{ bookings: FacilityBooking[]; incomingRequests?: FacilityBooking[] }>('/my/facility-bookings');
      setFacilityBookings(facRes.bookings || []);
      setManagedSpaceBookings(facRes.incomingRequests || []);

      // 2. Fetch user's own equipment reservations & host requests
      const eqRes = await apiRequest<{ reservations: EquipmentReservation[]; incomingRequests?: EquipmentReservation[] }>('/my/equipment-reservations');
      setEquipmentReservations(eqRes.reservations || []);
      setManagedGearReservations(eqRes.incomingRequests || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cancel space booking
  const handleCancelFacilityBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this space booking?')) return;
    setActionLoadingId(bookingId);
    try {
      await apiRequest(`/facilities/bookings/${bookingId}/cancel`, { method: 'POST' });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel equipment reservation
  const handleCancelEquipmentReservation = async (resId: string) => {
    if (!confirm('Are you sure you want to cancel this equipment reservation?')) return;
    setActionLoadingId(resId);
    try {
      await apiRequest(`/equipment/reservations/${resId}/cancel`, { method: 'POST' });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Host: Approve/Reject facility booking
  const handleFacilityStatusUpdate = async (bookingId: string, status: 'CONFIRMED' | 'REJECTED') => {
    setActionLoadingId(bookingId);
    try {
      await apiRequest(`/facilities/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Host: Approve/Reject equipment reservation
  const handleEquipmentStatusUpdate = async (resId: string, status: 'CONFIRMED' | 'REJECTED') => {
    setActionLoadingId(resId);
    try {
      await apiRequest(`/equipment/reservations/${resId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update reservation status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Host: Open Handover modal (Pickup or Return)
  const openHandoverDialog = (resId: string, type: 'PICKED_UP' | 'RETURNED') => {
    setHandoverModalResId(resId);
    setHandoverType(type);
    setHandoverNote('');
  };

  const handleConfirmHandover = async () => {
    if (!handoverModalResId) return;
    setActionLoadingId(handoverModalResId);
    try {
      const endpoint = handoverType === 'PICKED_UP'
        ? `/equipment/reservations/${handoverModalResId}/handover`
        : `/equipment/reservations/${handoverModalResId}/return`;

      await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          conditionReport: handoverNote || 'Inspected and verified.',
          notes: handoverNote,
        }),
      });

      setHandoverModalResId(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to record handover.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold">CONFIRMED</span>;
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold">PENDING APPROVAL</span>;
      case 'PICKED_UP':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold">ACTIVE LOAN</span>;
      case 'RETURNED':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold">RETURNED & VERIFIED</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="bg-neutral-200 text-neutral-600 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold">{status}</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-700 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="bg-[#FAF7F0] text-[#221013] min-h-screen py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E76244] font-bold">
              UNIFIED BOOKING DASHBOARD
            </span>
            <h1 className="font-display text-3xl sm:text-4xl uppercase font-bold text-[#221013] mt-1">
              MY BOOKINGS & GEAR
            </h1>
            <p className="text-xs text-[#221013]/70 font-sans mt-0.5">
              Track court reservations, active equipment loans, and manage your host requests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('spaces')}
              className="bg-[#221013] text-[#FAF7F0] font-display uppercase tracking-wider text-xs font-bold px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors"
            >
              Book a Space
            </button>
            <button
              onClick={() => onNavigate('equipment')}
              className="bg-[#CCFF00] text-[#121212] font-display uppercase tracking-wider text-xs font-bold px-4 py-2 rounded-full hover:bg-[#b8e600] transition-colors"
            >
              Borrow Gear
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-neutral-300 pb-3">
          <button
            onClick={() => setActiveTab('SPACES')}
            className={`font-display uppercase text-xs tracking-wider px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeTab === 'SPACES'
                ? 'bg-[#221013] text-[#FAF7F0] font-bold shadow-sm'
                : 'bg-white border border-neutral-300 text-[#221013]/70 hover:text-[#221013]'
            }`}
          >
            <Building size={14} />
            <span>My Space Bookings ({facilityBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('GEAR')}
            className={`font-display uppercase text-xs tracking-wider px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeTab === 'GEAR'
                ? 'bg-[#221013] text-[#FAF7F0] font-bold shadow-sm'
                : 'bg-white border border-neutral-300 text-[#221013]/70 hover:text-[#221013]'
            }`}
          >
            <Package size={14} />
            <span>My Borrowed Gear ({equipmentReservations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MANAGER')}
            className={`font-display uppercase text-xs tracking-wider px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeTab === 'MANAGER'
                ? 'bg-[#E76244] text-white font-bold shadow-sm'
                : 'bg-white border border-neutral-300 text-[#221013]/70 hover:text-[#221013]'
            }`}
          >
            <Layers size={14} />
            <span>Host Operations ({managedSpaceBookings.length + managedGearReservations.length})</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-[#221013] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Loading your bookings...
            </span>
          </div>
        )}

        {/* TAB 1: FACILITY BOOKINGS */}
        {!loading && activeTab === 'SPACES' && (
          <div className="space-y-4">
            {facilityBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
                <Building size={40} className="mx-auto text-neutral-300 mb-3" />
                <h3 className="font-display text-xl uppercase font-bold text-[#221013]">
                  No Space Bookings Yet
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
                  Looking for a place to play badminton, tennis, or soccer? Explore nearby community sports venues.
                </p>
                <button
                  onClick={() => onNavigate('spaces')}
                  className="bg-[#221013] text-[#FAF7F0] font-display text-xs uppercase tracking-wider font-bold px-6 py-2.5 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Explore Sports Spaces
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilityBookings.map((b) => {
                  const startDate = new Date(b.startAt);
                  const endDate = new Date(b.endAt);
                  const isConfirmed = b.status === 'CONFIRMED';
                  const isCancellable = b.status === 'PENDING' || (isConfirmed && startDate > new Date());

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                              {b.facility?.facilityType || 'SPORTS SPACE'}
                            </span>
                            <h3 className="font-display text-lg uppercase font-bold text-[#221013]">
                              {b.facility?.name}
                            </h3>
                          </div>
                          {getStatusBadge(b.status)}
                        </div>

                        <div className="space-y-1.5 text-xs text-neutral-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#E76244]" />
                            <span className="font-bold text-[#221013]">
                              {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-neutral-400" />
                            <span>
                              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-neutral-400" />
                            <span>{b.facility?.location}</span>
                          </div>
                        </div>

                        {/* Private Location Unlock */}
                        {isConfirmed && b.facility?.addressDetails && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                              <ShieldCheck size={14} />
                              <span>Unlocked Access Location:</span>
                            </div>
                            <p className="text-emerald-900 font-mono text-[11px]">
                              {b.facility.addressDetails}
                            </p>
                          </div>
                        )}

                        {b.notes && (
                          <p className="text-[11px] text-neutral-500 italic bg-neutral-50 p-2 rounded-lg">
                            "{b.notes}"
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <span className="font-display uppercase font-bold text-[#221013]">
                          Fee: {b.totalPrice === 0 ? 'FREE' : `$${b.totalPrice}`}
                        </span>

                        {isCancellable && (
                          <button
                            onClick={() => handleCancelFacilityBooking(b.id)}
                            disabled={actionLoadingId === b.id}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold underline disabled:opacity-50"
                          >
                            {actionLoadingId === b.id ? 'Canceling...' : 'Cancel Booking'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EQUIPMENT BORROWINGS */}
        {!loading && activeTab === 'GEAR' && (
          <div className="space-y-4">
            {equipmentReservations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
                <Package size={40} className="mx-auto text-neutral-300 mb-3" />
                <h3 className="font-display text-xl uppercase font-bold text-[#221013]">
                  No Equipment Borrowed
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
                  Need a tournament badminton racket, football, or agility cones for your next match? Browse the community gear library.
                </p>
                <button
                  onClick={() => onNavigate('equipment')}
                  className="bg-[#221013] text-[#FAF7F0] font-display text-xs uppercase tracking-wider font-bold px-6 py-2.5 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Browse Equipment Library
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipmentReservations.map((res) => {
                  const startD = new Date(res.startAt);
                  const endD = new Date(res.endAt);
                  const isConfirmed = res.status === 'CONFIRMED' || res.status === 'PICKED_UP';

                  return (
                    <div
                      key={res.id}
                      className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-[#E76244] font-bold">
                              {res.equipment?.sportCategory || 'GEAR'}
                            </span>
                            <h3 className="font-display text-lg uppercase font-bold text-[#221013]">
                              {res.equipment?.name} ({res.quantity}x)
                            </h3>
                          </div>
                          {getStatusBadge(res.status)}
                        </div>

                        <div className="space-y-1.5 text-xs text-neutral-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#E76244]" />
                            <span>
                              {startD.toLocaleDateString()} to {endD.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-neutral-400" />
                            <span>Pickup Area: {res.equipment?.pickupArea}</span>
                          </div>
                        </div>

                        {/* Unlocked Pickup Address */}
                        {isConfirmed && res.equipment?.pickupAddress && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                              <ShieldCheck size={14} />
                              <span>Unlocked Handover Address:</span>
                            </div>
                            <p className="text-emerald-900 font-mono text-[11px]">
                              {res.equipment.pickupAddress}
                            </p>
                          </div>
                        )}

                        {/* Handover Audit Events Log */}
                        {res.handoverEvents && res.handoverEvents.length > 0 && (
                          <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                            <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block">
                              Handover Audit Trail:
                            </span>
                            {res.handoverEvents.map((evt) => (
                              <div key={evt.id} className="text-[11px] font-mono bg-neutral-50 p-2 rounded-lg text-neutral-700">
                                <span className="font-bold text-[#221013]">{evt.eventType}:</span> {evt.conditionReport || evt.notes}
                                <span className="text-neutral-400 block text-[9px] mt-0.5">
                                  {new Date(evt.createdAt).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <div className="space-x-3">
                          <span className="font-bold text-[#221013]">
                            Fee: {res.totalCost === 0 ? 'Free' : `$${res.totalCost}`}
                          </span>
                          <span className="text-neutral-500">
                            Deposit: ${res.depositHeld}
                          </span>
                        </div>

                        {res.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelEquipmentReservation(res.id)}
                            disabled={actionLoadingId === res.id}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold underline disabled:opacity-50"
                          >
                            {actionLoadingId === res.id ? 'Canceling...' : 'Cancel Request'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HOST / MANAGER OPERATIONS */}
        {!loading && activeTab === 'MANAGER' && (
          <div className="space-y-8">
            
            {/* 1. Facility Booking Requests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl uppercase font-bold text-[#221013]">
                    Space Booking Requests
                  </h3>
                  <p className="text-xs text-neutral-500 font-sans">
                    Athletes requesting to book your sports facilities.
                  </p>
                </div>
              </div>

              {managedSpaceBookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-neutral-200 text-xs text-neutral-500">
                  No booking requests for your listed spaces.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {managedSpaceBookings.map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#E76244] font-bold">
                            {b.facility?.name}
                          </span>
                          <h4 className="font-display text-base uppercase font-bold text-[#221013]">
                            Requested by {b.user?.displayName || 'Athlete'}
                          </h4>
                        </div>
                        {getStatusBadge(b.status)}
                      </div>

                      <div className="text-xs text-neutral-600 space-y-1">
                        <div>Time: {new Date(b.startAt).toLocaleString()} - {new Date(b.endAt).toLocaleTimeString()}</div>
                        <div>Fee: ${b.totalPrice}</div>
                        {b.notes && <div className="italic text-neutral-500">"{b.notes}"</div>}
                      </div>

                      {b.status === 'PENDING' && (
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleFacilityStatusUpdate(b.id, 'CONFIRMED')}
                            disabled={actionLoadingId === b.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-display uppercase tracking-wider font-bold px-4 py-2 rounded-full transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleFacilityStatusUpdate(b.id, 'REJECTED')}
                            disabled={actionLoadingId === b.id}
                            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-display uppercase tracking-wider px-4 py-2 rounded-full transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Equipment Lending & Handover Requests */}
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-xl uppercase font-bold text-[#221013]">
                  Equipment Lending & Handover Management
                </h3>
                <p className="text-xs text-neutral-500 font-sans">
                  Manage approvals, record pickup condition handovers, and confirm safe gear returns with community points rewards.
                </p>
              </div>

              {managedGearReservations.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-neutral-200 text-xs text-neutral-500">
                  No lending requests for your equipment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {managedGearReservations.map((res) => (
                    <div key={res.id} className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#E76244] font-bold">
                            {res.equipment?.name} ({res.quantity}x)
                          </span>
                          <h4 className="font-display text-base uppercase font-bold text-[#221013]">
                            Borrower: {res.borrower?.displayName || 'Athlete'}
                          </h4>
                        </div>
                        {getStatusBadge(res.status)}
                      </div>

                      <div className="text-xs text-neutral-600 space-y-1">
                        <div>Duration: {new Date(res.startAt).toLocaleDateString()} to {new Date(res.endAt).toLocaleDateString()}</div>
                        <div>Deposit: ${res.depositHeld} • Fee: ${res.totalCost}</div>
                        {res.notes && <div className="italic text-neutral-500">"{res.notes}"</div>}
                      </div>

                      {/* Host Actions according to state */}
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {res.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleEquipmentStatusUpdate(res.id, 'CONFIRMED')}
                              disabled={actionLoadingId === res.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-display uppercase tracking-wider font-bold px-4 py-2 rounded-full transition-colors"
                            >
                              Approve Request
                            </button>
                            <button
                              onClick={() => handleEquipmentStatusUpdate(res.id, 'REJECTED')}
                              disabled={actionLoadingId === res.id}
                              className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-display uppercase tracking-wider px-4 py-2 rounded-full transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {res.status === 'CONFIRMED' && (
                          <button
                            onClick={() => openHandoverDialog(res.id, 'PICKED_UP')}
                            className="bg-[#221013] hover:bg-neutral-800 text-[#FAF7F0] text-xs font-display uppercase tracking-wider font-bold px-4 py-2 rounded-full transition-colors"
                          >
                            Record Handover (Picked Up)
                          </button>
                        )}

                        {res.status === 'PICKED_UP' && (
                          <button
                            onClick={() => openHandoverDialog(res.id, 'RETURNED')}
                            className="bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] text-xs font-display uppercase tracking-wider font-bold px-4 py-2 rounded-full transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <Award size={14} />
                            <span>Confirm Return & Award Points (+20)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Handover Modal */}
      {handoverModalResId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#FAF7F0] text-[#221013] rounded-3xl max-w-md w-full p-6 relative shadow-2xl">
            <h3 className="font-display text-xl uppercase font-bold text-[#221013] mb-2">
              {handoverType === 'PICKED_UP' ? 'Record Pickup Handover' : 'Confirm Return & Release Deposit'}
            </h3>
            <p className="text-xs text-neutral-600 mb-4">
              {handoverType === 'PICKED_UP'
                ? 'Document the item condition upon handover to the borrower.'
                : 'Confirm the gear has been returned safely. The deposit will be released and 20 reputation points will be awarded to the borrower.'}
            </p>

            <textarea
              rows={3}
              placeholder="Condition notes (e.g. Clean, racket string intact, all cones accounted for)"
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-sans focus:outline-none focus:border-[#221013] mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setHandoverModalResId(null)}
                className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-display uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHandover}
                disabled={actionLoadingId === handoverModalResId}
                className="bg-[#221013] text-[#FAF7F0] px-5 py-2 rounded-full text-xs font-display uppercase font-bold hover:bg-neutral-800 transition-colors"
              >
                {actionLoadingId ? 'Recording...' : 'Submit Audit Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
