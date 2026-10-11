import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ride, SeatRequest } from '../types';
import {
  Car,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Filter,
  DollarSign,
  AlertCircle,
  UserCheck,
  ArrowRight,
  ArrowRightLeft,
  Navigation,
  Sparkles,
  Info,
  Check,
  User,
  Ticket,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Leaflet marker icons for the 2 stops
const kurlaStationIcon = L.divIcon({
  html: `<div style="background-color: #2563EB; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px -1px rgba(37,99,235,0.5); border: 3px solid white; font-weight: bold; font-size: 18px;">🚆</div>`,
  className: 'custom-station-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const vesitCampusIcon = L.divIcon({
  html: `<div style="background-color: #F97316; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px -1px rgba(249,115,22,0.5); border: 3px solid white; font-weight: bold; font-size: 18px;">🎓</div>`,
  className: 'custom-campus-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// The ONLY 2 Stops in the system
const KURLA_STATION_COORDS: [number, number] = [19.0657, 72.8794];
const VESIT_CAMPUS_COORDS: [number, number] = [19.0465, 72.8890];
const MAP_CENTER_COORDS: [number, number] = [19.0560, 72.8842];

// Direct 2-stop route corridor
const ROUTE_LINE: [number, number][] = [
  KURLA_STATION_COORDS,
  [19.0620, 72.8818],
  [19.0560, 72.8855],
  [19.0500, 72.8875],
  VESIT_CAMPUS_COORDS,
];

export const RidesPage: React.FC = () => {
  const {
    user,
    rides,
    seatRequests,
    allProfiles,
    switchProfile,
    openProfileSwitcher,
    createRide,
    requestSeat,
    cancelSeatRequest,
    respondToSeatRequest,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all_rides' | 'my_rides'>('all_rides');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'to_campus' | 'from_campus'>('all');
  const [fareFilter, setFareFilter] = useState<'all' | '30' | '45'>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [requestConfirmRide, setRequestConfirmRide] = useState<Ride | null>(null);

  // Form state for publishing (strictly locked to the 2 stops)
  const [direction, setDirection] = useState<'to_campus' | 'from_campus'>('to_campus');
  const [departureTime, setDepartureTime] = useState('08:30 AM');
  const [farePlan, setFarePlan] = useState<'3_sharing' | '2_sharing' | 'custom'>('3_sharing');
  const [totalSeats, setTotalSeats] = useState(3);
  const [fareContribution, setFareContribution] = useState(30);
  const [customFareInput, setCustomFareInput] = useState(30);
  const [vehicleInfo, setVehicleInfo] = useState('Shared Auto-Rickshaw • MH 03 BK 5521');
  const [notes, setNotes] = useState('Direct 2-stop ride. Leaving on time.');

  // Handle fare plan selection in modal
  const handleSelectFarePlan = (plan: '3_sharing' | '2_sharing' | 'custom') => {
    setFarePlan(plan);
    if (plan === '3_sharing') {
      setTotalSeats(3);
      setFareContribution(30);
    } else if (plan === '2_sharing') {
      setTotalSeats(2);
      setFareContribution(45);
    } else {
      setFareContribution(customFareInput);
    }
  };

  const handleCustomFareChange = (val: number) => {
    setCustomFareInput(val);
    if (farePlan === 'custom') {
      setFareContribution(val);
    }
  };

  // Filter rides along the 2-stop route
  const filteredRides = rides.filter((ride) => {
    if (directionFilter !== 'all' && ride.direction !== directionFilter) return false;
    if (onlyVerified && !ride.driverVerified) return false;
    if (fareFilter === '30' && ride.fareContribution !== 30) return false;
    if (fareFilter === '45' && ride.fareContribution !== 45) return false;
    return true;
  });

  const toCampusCount = rides.filter(r => r.direction === 'to_campus').length;
  const fromCampusCount = rides.filter(r => r.direction === 'from_campus').length;

  // Requests on rides hosted by the current user
  const myHostedRides = rides.filter(r => r.driverId === user?.userId);
  const incomingRequestsForUser = seatRequests.filter((req) => {
    const r = rides.find(ride => ride.id === req.rideId);
    return r && r.driverId === user?.userId && req.status === 'pending';
  });

  // Rides that the current user has requested or joined
  const myBookedRequests = seatRequests.filter(r => r.passengerId === user?.userId);
  const myAcceptedBookingsCount = myBookedRequests.filter(r => r.status === 'accepted').length;

  const handlePublishRide = (e: React.FormEvent) => {
    e.preventDefault();

    // The ONLY 2 Stops:
    const origin = direction === 'to_campus' ? 'Kurla Station' : 'VESIT Campus';
    const destination = direction === 'to_campus' ? 'VESIT Campus' : 'Kurla Station';
    const originCoords: [number, number] = direction === 'to_campus' ? KURLA_STATION_COORDS : VESIT_CAMPUS_COORDS;
    const destCoords: [number, number] = direction === 'to_campus' ? VESIT_CAMPUS_COORDS : KURLA_STATION_COORDS;

    createRide({
      origin,
      destination,
      originCoords,
      destCoords,
      direction,
      departureTime,
      departureDate: 'Today',
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      fareContribution: Number(fareContribution),
      vehicleInfo,
      notes,
    });

    setIsPublishModalOpen(false);
    showToast(`Ride published: ${origin} ➔ ${destination} at ₹${fareContribution}!`, 'success');
  };

  const handleConfirmSeatRequest = () => {
    if (!requestConfirmRide) return;
    requestSeat(requestConfirmRide.id, 1);
    setRequestConfirmRide(null);
  };

  // Preset student profiles for live switching demonstration
  const studentProfiles = allProfiles.filter(p => p.role !== 'admin');

  return (
    <div className="space-y-7">
      {/* LIVE PROFILE SWITCHER BAR (Requested: shown live between profiles) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#171916] text-white border border-neutral-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold text-sm shrink-0">
              ⚡
            </span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Active Profile Live View:</span>
                <span className="text-[#F97316]">{user?.name}</span>
                <span className="text-[11px] font-mono text-neutral-400">({user?.username})</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Switch profiles in 1 click below to test ride requests and host approvals live.
              </div>
            </div>
          </div>

          <button
            onClick={openProfileSwitcher}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Users className="w-3.5 h-3.5 text-[#F97316]" />
            <span>All Profiles Modal</span>
          </button>
        </div>

        {/* Quick 1-Click Profile Switching Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] font-semibold text-neutral-400 shrink-0">Simulate Student:</span>
          {studentProfiles.map((p) => {
            const isCurrent = p.userId === user?.userId;
            const isHostOfAny = rides.some(r => r.driverId === p.userId);
            const hasPending = seatRequests.some(r => r.passengerId === p.userId && r.status === 'pending');
            const hasAccepted = seatRequests.some(r => r.passengerId === p.userId && r.status === 'accepted');

            return (
              <button
                key={p.userId}
                onClick={() => switchProfile(p)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#F97316] text-white font-bold shadow-xs'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                }`}
                title={`Switch to ${p.name}`}
              >
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {p.name.charAt(0)}
                </div>
                <span>{p.name.split(' ')[0]}</span>
                {isHostOfAny && (
                  <span className="text-[9px] bg-black/30 px-1.5 py-0.2 rounded font-semibold text-orange-200">
                    Host
                  </span>
                )}
                {hasAccepted && (
                  <span className="text-[9px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                    Rider
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
              2 Stops Only: Kurla Station ⇄ VESIT Campus
            </span>
            <span>·</span>
            <span>Live Co-Rider Rosters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] tracking-tight">
            Kurla Station ⇄ VESIT Carpool
          </h1>
          <p className="text-xs sm:text-sm text-[#555952] mt-0.5 max-w-2xl">
            Exclusive 2-stop carpool with live lists of requested and accepted co-riders across student profiles.
          </p>
        </div>

        <button
          onClick={() => setIsPublishModalOpen(true)}
          className="px-4 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Ride (2 Stops)</span>
        </button>
      </div>

      {/* 2-STOP ROUTE & FARE CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DC] shadow-xs space-y-4">
        {/* Stops Diagram */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E3DC]">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2">
              <span className="text-base">🚆</span>
              <div>
                <div className="text-[10px] text-blue-800 uppercase font-bold tracking-wider">Stop 1</div>
                <div className="text-xs font-extrabold text-[#171916]">Kurla Station</div>
              </div>
            </div>

            <div className="flex items-center text-[#737871]">
              <ArrowRightLeft className="w-4 h-4 text-[#F97316]" />
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-2">
              <span className="text-base">🎓</span>
              <div>
                <div className="text-[10px] text-[#EA580C] uppercase font-bold tracking-wider">Stop 2</div>
                <div className="text-xs font-extrabold text-[#171916]">VESIT Campus</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-[#737871]">
            Direct connection · No intermediate stops
          </div>
        </div>

        {/* Fare Contribution Rule */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#171916] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#F97316]" />
              <span>Designated Sharing Fare Formula</span>
            </div>
            <div className="text-[11px] text-[#555952] mt-0.5">
              Standard auto fare for this route is ₹90 total. Students split the ride based on headcount:
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-200 shadow-2xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <div className="text-[9px] uppercase font-bold text-emerald-800">3 People Sharing</div>
                <div className="text-sm font-extrabold text-[#171916] font-mono">
                  ₹30 <span className="text-[10px] font-normal text-[#737871]">/ person</span>
                </div>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 shadow-2xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div>
                <div className="text-[9px] uppercase font-bold text-blue-800">2 People Sharing</div>
                <div className="text-sm font-extrabold text-[#171916] font-mono">
                  ₹45 <span className="text-[10px] font-normal text-[#737871]">/ person</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PENDING REQUESTS BANNER (If host has pending seat requests) */}
      {incomingRequestsForUser.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50 border-2 border-[#F97316] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#171916] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#F97316]" />
              <span>Action Needed: You Have {incomingRequestsForUser.length} Pending Seat Request(s) to Review</span>
            </span>
            <span className="text-[11px] text-[#737871] font-semibold">Logged in as Host ({user?.name})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incomingRequestsForUser.map((req) => {
              const r = rides.find(ride => ride.id === req.rideId);
              return (
                <div key={req.id} className="p-3.5 rounded-xl bg-white border border-orange-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-[#F97316] font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                      {req.passengerAvatar ? (
                        <img src={req.passengerAvatar} alt={req.passengerName} className="w-full h-full object-cover" />
                      ) : (
                        req.passengerName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-[#171916] flex items-center gap-1">
                        <span>{req.passengerName}</span>
                        {req.passengerUsername && (
                          <span className="text-[10px] font-mono text-[#737871] font-normal">{req.passengerUsername}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#555952]">
                        Requested {req.seatsRequested} seat on {r ? `${r.origin} ➔ ${r.destination}` : 'your ride'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => respondToSeatRequest(req.id, 'accepted')}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Accept passenger onto your ride"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => respondToSeatRequest(req.id, 'declined')}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200 cursor-pointer"
                      title="Decline request"
                    >
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW TABS: ALL RIDES vs MY RIDES & BOOKINGS */}
      <div className="flex items-center gap-2 border-b border-[#E5E3DC] pb-1">
        <button
          onClick={() => setActiveTab('all_rides')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'all_rides'
              ? 'bg-[#171916] text-white shadow-2xs'
              : 'bg-[#FAF9F5] text-[#555952] hover:text-[#171916]'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>All Kurla ⇄ VESIT Rides ({filteredRides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_rides')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'my_rides'
              ? 'bg-[#171916] text-white shadow-2xs'
              : 'bg-[#FAF9F5] text-[#555952] hover:text-[#171916]'
          }`}
        >
          <Ticket className="w-4 h-4 text-[#F97316]" />
          <span>My Carpool Passes & Hosted Rides ({myHostedRides.length + myBookedRequests.length})</span>
        </button>
      </div>

      {activeTab === 'my_rides' ? (
        /* MY RIDES & BOOKINGS TAB */
        <div className="space-y-6">
          {/* Section 1: Rides I am Hosting */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#171916] flex items-center gap-2">
              <Car className="w-4 h-4 text-[#F97316]" />
              <span>Rides You Are Hosting ({myHostedRides.length})</span>
            </h3>

            {myHostedRides.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E5E3DC] text-center text-xs text-[#737871]">
                You haven&apos;t published any rides yet. Click &ldquo;Publish Ride (2 Stops)&rdquo; to offer seats to classmates!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myHostedRides.map((ride) => {
                  const accepted = seatRequests.filter(r => r.rideId === ride.id && r.status === 'accepted');
                  const pending = seatRequests.filter(r => r.rideId === ride.id && r.status === 'pending');

                  return (
                    <div key={ride.id} className="p-4 rounded-2xl bg-white border border-[#E5E3DC] space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#171916]">
                          {ride.origin} ➔ {ride.destination}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-[#EA580C]">
                          {ride.departureTime}
                        </span>
                      </div>

                      {/* Accepted Co-Riders */}
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                        <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                          <span>Accepted Passengers ({accepted.length} of {ride.totalSeats}):</span>
                          <span className="font-mono">{ride.availableSeats} open seats</span>
                        </div>
                        {accepted.length === 0 ? (
                          <div className="text-[11px] text-[#737871] italic">No accepted passengers yet.</div>
                        ) : (
                          <div className="space-y-1.5">
                            {accepted.map((p) => (
                              <div key={p.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-emerald-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                                    {p.passengerName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#171916]">{p.passengerName}</div>
                                    <div className="text-[10px] text-[#737871] font-mono">{p.passengerUsername}</div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Confirmed (₹{ride.fareContribution})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pending Requests on this ride */}
                      {pending.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                          <div className="text-[11px] font-bold text-amber-800">
                            Pending Requests ({pending.length}):
                          </div>
                          <div className="space-y-1.5">
                            {pending.map((p) => (
                              <div key={p.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-amber-200">
                                <div>
                                  <div className="font-bold text-[#171916]">{p.passengerName}</div>
                                  <div className="text-[10px] text-[#737871] font-mono">{p.passengerUsername}</div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => respondToSeatRequest(p.id, 'accepted')}
                                    className="p-1 px-2 text-[10px] font-bold bg-emerald-600 text-white rounded cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => respondToSeatRequest(p.id, 'declined')}
                                    className="p-1 px-2 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Rides I Have Requested / Joined */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#171916] flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-600" />
              <span>Your Booked Passes & Seat Requests ({myBookedRequests.length})</span>
            </h3>

            {myBookedRequests.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E5E3DC] text-center text-xs text-[#737871]">
                You haven&apos;t requested any seats yet. Switch to the &ldquo;All Kurla ⇄ VESIT Rides&rdquo; tab to request a seat on any carpool!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBookedRequests.map((req) => {
                  const ride = rides.find(r => r.id === req.rideId);
                  if (!ride) return null;

                  const isAccepted = req.status === 'accepted';
                  const isPending = req.status === 'pending';

                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-2xl bg-white border space-y-3 shadow-xs ${
                        isAccepted ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isAccepted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isAccepted ? '✓ Seat Confirmed' : '⏳ Awaiting Host Approval'}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#171916]">
                          ₹{ride.fareContribution} contribution
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-extrabold text-[#171916]">
                          {ride.origin} ➔ {ride.destination}
                        </div>
                        <div className="text-[11px] text-[#737871]">
                          Host: <strong>{ride.driverName}</strong> · Departure: {ride.departureTime}
                        </div>
                        <div className="text-[11px] text-[#737871]">
                          Vehicle: {ride.vehicleInfo}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E5E3DC] flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#555952]">
                          {isAccepted
                            ? `Pay ₹${ride.fareContribution} to ${ride.driverName.split(' ')[0]} upon boarding`
                            : 'Host will review your seat request'}
                        </span>

                        {isPending && (
                          <button
                            onClick={() => cancelSeatRequest(req.id)}
                            className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ALL RIDES VIEW */
        <>
          {/* LEAFLET MAP: STRICTLY THE 2 STOPS */}
          <div className="rounded-2xl border border-[#E5E3DC] overflow-hidden bg-white shadow-xs">
            <div className="p-3 bg-[#FAF9F5] border-b border-[#E5E3DC] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#171916]">
                <Navigation className="w-4 h-4 text-[#F97316]" />
                <span>Route Map: Stop 1 (Kurla Station) ⇄ Stop 2 (VESIT Campus)</span>
              </div>
              <div className="text-[11px] text-[#737871] font-mono">
                ~3.4 km direct route · 2 stops only
              </div>
            </div>

            <div className="h-64 w-full z-10">
              <MapContainer center={MAP_CENTER_COORDS} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Direct 2-stop corridor path */}
                <Polyline
                  positions={ROUTE_LINE}
                  pathOptions={{ color: '#F97316', weight: 4, dashArray: '6, 8', opacity: 0.9 }}
                />

                {/* ONLY STOP 1: Kurla Station */}
                <Marker position={KURLA_STATION_COORDS} icon={kurlaStationIcon}>
                  <Popup>
                    <div className="text-xs font-bold text-blue-700">Stop 1: Kurla Station</div>
                    <div className="text-[11px] text-[#171916]">Local Train Interchange (Central & Harbour)</div>
                  </Popup>
                </Marker>

                {/* ONLY STOP 2: VESIT Campus */}
                <Marker position={VESIT_CAMPUS_COORDS} icon={vesitCampusIcon}>
                  <Popup>
                    <div className="text-xs font-bold text-[#F97316]">Stop 2: VESIT Campus</div>
                    <div className="text-[11px] text-[#171916]">College Main Gate / Entrance</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* FILTER BAR (2 DIRECTIONS ONLY) */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E5E3DC] shadow-xs text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#171916] flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5 text-[#737871]" />
                <span>Direction:</span>
              </span>

              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: `All Rides (${rides.length})` },
                  { id: 'to_campus', label: `Kurla Station ➔ VESIT Campus (${toCampusCount})` },
                  { id: 'from_campus', label: `VESIT Campus ➔ Kurla Station (${fromCampusCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDirectionFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer text-xs ${
                      directionFilter === tab.id
                        ? 'bg-[#F97316] text-white shadow-2xs'
                        : 'bg-[#FAF9F5] text-[#555952] hover:text-[#171916]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Fare Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#737871]">Fare:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: '30', label: '₹30 (3-share)' },
                    { id: '45', label: '₹45 (2-share)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFareFilter(f.id as any)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        fareFilter === f.id
                          ? 'bg-neutral-900 text-white'
                          : 'bg-[#FAF9F5] text-[#555952] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#555952] border-l border-[#E5E3DC] pl-3">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded-sm accent-[#F97316]"
                />
                <span>Verified Students</span>
              </label>
            </div>
          </div>

          {/* RIDE CARDS GRID (WITH LIVE REQUESTED & ACCEPTED PASSENGER LIST) */}
          {filteredRides.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-[#E5E3DC] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-[#F97316] flex items-center justify-center mx-auto text-xl">
                🛺
              </div>
              <h3 className="text-sm font-bold text-[#171916]">No matching rides found</h3>
              <p className="text-xs text-[#737871] max-w-sm mx-auto">
                Try resetting filters or publish your own ride between Kurla Station and VESIT Campus!
              </p>
              <button
                onClick={() => {
                  setDirectionFilter('all');
                  setFareFilter('all');
                  setOnlyVerified(false);
                }}
                className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#F2EFE9] text-xs font-semibold text-[#171916] rounded-xl border border-[#E5E3DC]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRides.map((ride) => {
                const isUserRide = ride.driverId === user?.userId;
                const acceptedPassengers = seatRequests.filter(r => r.rideId === ride.id && r.status === 'accepted');
                const pendingRequests = seatRequests.filter(r => r.rideId === ride.id && r.status === 'pending');

                const userPendingReq = seatRequests.find(
                  r => r.rideId === ride.id && r.passengerId === user?.userId && r.status === 'pending'
                );
                const userAcceptedReq = seatRequests.find(
                  r => r.rideId === ride.id && r.passengerId === user?.userId && r.status === 'accepted'
                );

                const isToCampus = ride.direction === 'to_campus';

                return (
                  <div
                    key={ride.id}
                    className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-4 shadow-xs ${
                      ride.status === 'full'
                        ? 'border-[#E5E3DC] opacity-90'
                        : isUserRide
                        ? 'border-orange-300 ring-1 ring-orange-200'
                        : 'border-[#E5E3DC] hover:border-[#F97316]'
                    }`}
                  >
                    {/* Top Row: Route Direction Badge & Open Seats */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                        isToCampus
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-orange-50 text-[#EA580C] border border-orange-200'
                      }`}>
                        <ArrowRight className="w-3 h-3" />
                        <span>{isToCampus ? 'Kurla Station ➔ VESIT Campus' : 'VESIT Campus ➔ Kurla Station'}</span>
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ride.status === 'full' ? 'bg-neutral-100 text-[#737871]' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {ride.status === 'full' ? 'Full' : `${ride.availableSeats} of ${ride.totalSeats} seats open`}
                      </span>
                    </div>

                    {/* Host details */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#FAF9F5] border border-[#E5E3DC] overflow-hidden flex items-center justify-center text-xs font-bold text-[#F97316] shrink-0">
                          {ride.driverAvatar ? (
                            <img src={ride.driverAvatar} alt={ride.driverName} className="w-full h-full object-cover" />
                          ) : (
                            ride.driverName.charAt(0)
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-[#171916] flex items-center gap-1 truncate">
                            <span className="truncate">{ride.driverName}</span>
                            {isUserRide && (
                              <span className="text-[9px] bg-orange-100 text-[#EA580C] font-bold px-1.5 py-0.2 rounded shrink-0">
                                You (Host)
                              </span>
                            )}
                            {ride.driverVerified && (
                              <span title="Verified Student" className="shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#737871] truncate">{ride.vehicleInfo}</div>
                        </div>
                      </div>
                    </div>

                    {/* Strictly 2 Stops Display */}
                    <div className="space-y-2 text-xs bg-[#FAF9F5] p-3 rounded-xl border border-[#E5E3DC]/70">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                          <div>
                            <div className="text-[9px] uppercase font-bold text-[#737871]">Pickup (Stop 1)</div>
                            <div className="font-bold text-[#171916]">{ride.origin}</div>
                          </div>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-[#737871] shrink-0 mx-2" />

                        <div className="flex items-center gap-2 text-right">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-[#737871]">Drop (Stop 2)</div>
                            <div className="font-bold text-[#171916]">{ride.destination}</div>
                          </div>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shrink-0" />
                        </div>
                      </div>
                    </div>

                    {/* Designated Fare Contribution Box */}
                    <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[#737871] font-semibold">Designated Contribution</div>
                        <div className="text-lg font-black text-[#171916] font-mono leading-none mt-0.5">
                          ₹{ride.fareContribution} <span className="text-[11px] font-normal text-[#555952]">/ person</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-orange-200 text-[#EA580C]">
                          {ride.totalSeats === 3
                            ? '3 Sharing (₹30 each)'
                            : ride.totalSeats === 2
                            ? '2 Sharing (₹45 each)'
                            : `${ride.totalSeats} seats split`}
                        </span>
                        <div className="text-[9px] text-[#737871] mt-0.5">Standard Kurla-VESIT Split</div>
                      </div>
                    </div>

                    {/* LIVE LIST: ACCEPTED PASSENGERS BY THE HOST */}
                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#171916] flex items-center gap-1.5 text-[11px]">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Accepted Co-Riders ({acceptedPassengers.length}/{ride.totalSeats}):</span>
                        </span>
                        <span className="text-[10px] text-[#737871]">
                          {ride.availableSeats === 0 ? 'Fully booked' : `${ride.availableSeats} open`}
                        </span>
                      </div>

                      {acceptedPassengers.length === 0 ? (
                        <div className="text-[11px] text-[#737871] italic py-1">
                          No co-riders accepted yet. Be the first to join!
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {acceptedPassengers.map((p) => {
                            const isMe = p.passengerId === user?.userId;
                            return (
                              <div
                                key={p.id}
                                className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-xs transition-colors ${
                                  isMe
                                    ? 'bg-emerald-50 border-emerald-300'
                                    : 'bg-white border-[#E5E3DC]'
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                                    {p.passengerAvatar ? (
                                      <img src={p.passengerAvatar} alt={p.passengerName} className="w-full h-full object-cover" />
                                    ) : (
                                      p.passengerName.charAt(0)
                                    )}
                                  </div>
                                  <div className="overflow-hidden">
                                    <div className="font-bold text-[#171916] truncate flex items-center gap-1">
                                      <span>{p.passengerName}</span>
                                      {isMe && (
                                        <span className="text-[9px] bg-emerald-200 text-emerald-800 font-bold px-1 rounded">
                                          You
                                        </span>
                                      )}
                                      {p.passengerVerified && (
                                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                      )}
                                    </div>
                                    {p.passengerUsername && (
                                      <div className="text-[10px] font-mono text-[#737871] truncate">
                                        {p.passengerUsername}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                                  Confirmed
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* LIVE LIST: PENDING REQUESTS (FOR HOST APPROVAL OR PASSENGER STATUS) */}
                    {pendingRequests.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending Requests ({pendingRequests.length}):</span>
                          </span>
                          {isUserRide && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                              Your Action Required
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {pendingRequests.map((p) => {
                            const isMe = p.passengerId === user?.userId;
                            return (
                              <div
                                key={p.id}
                                className="p-2 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                    {p.passengerName.charAt(0)}
                                  </div>
                                  <div className="overflow-hidden">
                                    <div className="font-bold text-[#171916] truncate flex items-center gap-1">
                                      <span>{p.passengerName}</span>
                                      {isMe && (
                                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    {p.passengerUsername && (
                                      <div className="text-[10px] font-mono text-[#737871] truncate">
                                        {p.passengerUsername}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {isUserRide ? (
                                  /* HOST ACTION BUTTONS */
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => respondToSeatRequest(p.id, 'accepted')}
                                      className="px-2 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer flex items-center gap-1"
                                      title="Accept seat request"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Accept</span>
                                    </button>
                                    <button
                                      onClick={() => respondToSeatRequest(p.id, 'declined')}
                                      className="px-2 py-1 text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded cursor-pointer"
                                      title="Decline request"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                ) : isMe ? (
                                  /* CURRENT PASSENGER CAN CANCEL */
                                  <button
                                    onClick={() => cancelSeatRequest(p.id)}
                                    className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 underline shrink-0 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-amber-700 italic shrink-0">
                                    Awaiting Host
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Departure Time & Notes */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-[#555952]">
                        <span className="flex items-center gap-1 font-mono tabular-nums font-semibold text-[#171916]">
                          <Clock className="w-3.5 h-3.5 text-[#737871]" />
                          {ride.departureTime} ({ride.departureDate})
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Direct 2 Stops
                        </span>
                      </div>

                      {ride.notes && (
                        <div className="text-[11px] text-[#737871] line-clamp-1 italic">
                          &ldquo;{ride.notes}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-1">
                      {isUserRide ? (
                        <div className="text-center py-2 text-xs font-bold text-orange-700 bg-orange-50 rounded-xl border border-orange-200">
                          Your Hosted Ride ({acceptedPassengers.length} passengers accepted)
                        </div>
                      ) : userAcceptedReq ? (
                        <div className="text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Your Seat is Confirmed! (Pay ₹{ride.fareContribution})</span>
                        </div>
                      ) : userPendingReq ? (
                        <div className="text-center py-2 text-xs font-semibold text-amber-800 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between px-3">
                          <span>Request Pending Host Approval</span>
                          <button
                            onClick={() => cancelSeatRequest(userPendingReq.id)}
                            className="text-[10px] text-rose-600 underline font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : ride.availableSeats === 0 ? (
                        <div className="text-center py-2 text-xs font-semibold text-[#737871] bg-[#FAF9F5] rounded-xl border border-[#E5E3DC]">
                          Carpool Full ({ride.totalSeats} seats filled)
                        </div>
                      ) : (
                        <button
                          onClick={() => setRequestConfirmRide(ride)}
                          className="w-full py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Request 1 Seat</span>
                          <span>·</span>
                          <span>₹{ride.fareContribution} Contribution</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* CONFIRM SEAT REQUEST MODAL */}
      {requestConfirmRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E3DC] p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#171916]">Confirm Seat Request</h2>
              <button onClick={() => setRequestConfirmRide(null)} className="text-[#737871] hover:text-[#171916]">
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#737871]">Route:</span>
                <span className="font-bold text-[#171916]">
                  {requestConfirmRide.origin} ➔ {requestConfirmRide.destination}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737871]">Host:</span>
                <span className="font-semibold text-[#171916]">{requestConfirmRide.driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737871]">Departure:</span>
                <span className="font-mono text-[#171916]">{requestConfirmRide.departureTime}</span>
              </div>
              <div className="pt-2 border-t border-[#E5E3DC] flex items-center justify-between">
                <span className="font-semibold text-[#171916]">Designated Fare:</span>
                <span className="text-base font-extrabold text-[#F97316] font-mono">
                  ₹{requestConfirmRide.fareContribution}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#555952]">
              You will contribute ₹{requestConfirmRide.fareContribution} upon boarding. Direct 2-stop ride between Kurla Station and VESIT Campus.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRequestConfirmRide(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#555952] hover:bg-[#FAF9F5] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSeatRequest}
                className="px-4 py-1.5 text-xs font-bold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH RIDE MODAL (STRICTLY 2 STOPS ONLY) */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E3DC] p-6 max-w-lg w-full space-y-4 my-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171916]">Publish Ride (2 Stops Only)</h2>
                <p className="text-[11px] text-[#737871]">Kurla Station and VESIT Campus are the only 2 stops</p>
              </div>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-[#737871] hover:text-[#171916]">
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishRide} className="space-y-4">
              {/* Route Direction Selector: The Only 2 Stops */}
              <div>
                <label className="block text-xs font-semibold text-[#3B4036] mb-1.5">
                  Select Direction (Strictly 2 Stops)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection('to_campus')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      direction === 'to_campus'
                        ? 'border-[#F97316] bg-orange-50/50 shadow-2xs'
                        : 'border-[#E5E3DC] hover:border-[#D7D4CB] bg-[#FAF9F5]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#171916] flex items-center gap-1.5">
                      <span>🚆 Kurla Station ➔ 🎓 VESIT</span>
                    </div>
                    <div className="text-[10px] text-[#737871] mt-0.5">Morning Inbound to College</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirection('from_campus')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      direction === 'from_campus'
                        ? 'border-[#F97316] bg-orange-50/50 shadow-2xs'
                        : 'border-[#E5E3DC] hover:border-[#D7D4CB] bg-[#FAF9F5]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#171916] flex items-center gap-1.5">
                      <span>🎓 VESIT ➔ 🚆 Kurla Station</span>
                    </div>
                    <div className="text-[10px] text-[#737871] mt-0.5">Evening Return to Station</div>
                  </button>
                </div>

                {/* Visual Route Locks (No other locations allowed) */}
                <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#E5E3DC] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <div>
                      <div className="text-[9px] uppercase font-bold text-[#737871]">Pickup Stop</div>
                      <div className="font-extrabold text-[#171916]">
                        {direction === 'to_campus' ? 'Kurla Station' : 'VESIT Campus'}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#F97316]" />

                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-[#737871]">Destination Stop</div>
                      <div className="font-extrabold text-[#171916]">
                        {direction === 'to_campus' ? 'VESIT Campus' : 'Kurla Station'}
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                  </div>
                </div>
              </div>

              {/* Designated Fare Contribution (User Requirement) */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#171916] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Designated Fare Contribution</span>
                  </label>
                  <span className="text-[10px] text-[#737871]">Total auto fare: ₹90</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Preset 1: 3 People Sharing (30 Rs) */}
                  <button
                    type="button"
                    onClick={() => handleSelectFarePlan('3_sharing')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      farePlan === '3_sharing'
                        ? 'border-emerald-500 bg-emerald-50/80 shadow-2xs'
                        : 'border-[#E5E3DC] bg-white hover:border-[#D7D4CB]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800">3 People Sharing</span>
                      {farePlan === '3_sharing' && <Check className="w-3 h-3 text-emerald-600" />}
                    </div>
                    <div className="text-base font-extrabold text-[#171916] font-mono mt-0.5">
                      ₹30 <span className="text-[10px] font-normal text-[#737871]">/ person</span>
                    </div>
                    <div className="text-[9px] text-[#555952] mt-0.5">3 students split ₹90 auto</div>
                  </button>

                  {/* Preset 2: 2 People Sharing (45 Rs) */}
                  <button
                    type="button"
                    onClick={() => handleSelectFarePlan('2_sharing')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      farePlan === '2_sharing'
                        ? 'border-blue-500 bg-blue-50/80 shadow-2xs'
                        : 'border-[#E5E3DC] bg-white hover:border-[#D7D4CB]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-800">2 People Sharing</span>
                      {farePlan === '2_sharing' && <Check className="w-3 h-3 text-blue-600" />}
                    </div>
                    <div className="text-base font-extrabold text-[#171916] font-mono mt-0.5">
                      ₹45 <span className="text-[10px] font-normal text-[#737871]">/ person</span>
                    </div>
                    <div className="text-[9px] text-[#555952] mt-0.5">2 students split ₹90 auto</div>
                  </button>

                  {/* Custom designated fare */}
                  <button
                    type="button"
                    onClick={() => handleSelectFarePlan('custom')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      farePlan === 'custom'
                        ? 'border-[#F97316] bg-orange-50/80 shadow-2xs'
                        : 'border-[#E5E3DC] bg-white hover:border-[#D7D4CB]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#171916]">Custom Amount</span>
                      {farePlan === 'custom' && <Check className="w-3 h-3 text-[#F97316]" />}
                    </div>
                    <div className="text-base font-extrabold text-[#171916] font-mono mt-0.5">
                      ₹{farePlan === 'custom' ? customFareInput : 'Custom'}
                    </div>
                    <div className="text-[9px] text-[#555952] mt-0.5">Enter designated fare</div>
                  </button>
                </div>

                {/* Custom Fare inputs if custom selected */}
                {farePlan === 'custom' && (
                  <div className="pt-2 flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold text-[#737871] mb-1">
                        Designated Amount (₹ per passenger)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={150}
                        value={customFareInput}
                        onChange={(e) => handleCustomFareChange(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#737871] mb-1">
                        Total Sharing Seats
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={totalSeats}
                        onChange={(e) => setTotalSeats(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB] bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-[#555952] flex items-center gap-1.5 bg-white p-2 rounded-lg border border-[#E5E3DC]">
                  <Info className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                  <span>
                    Each passenger contributes <strong>₹{fareContribution}</strong> ({totalSeats} total sharing seats).
                  </span>
                </div>
              </div>

              {/* Departure & Vehicle Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3B4036] mb-1">Departure Time</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                    />
                    <div className="flex gap-1 shrink-0">
                      {['08:15 AM', '08:30 AM', '04:45 PM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setDepartureTime(t)}
                          className="px-1.5 py-1 text-[10px] bg-[#FAF9F5] hover:bg-[#F2EFE9] border border-[#E5E3DC] rounded-md font-mono"
                        >
                          {t.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3B4036] mb-1">Vehicle Description</label>
                  <input
                    type="text"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B4036] mb-1">Ride Note</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leaving on time, 2-stop direct ride."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D7D4CB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E3DC]">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#555952] hover:bg-[#FAF9F5] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#F97316] text-white rounded-xl hover:bg-[#EA580C] shadow-xs cursor-pointer"
                >
                  Publish Ride (₹{fareContribution} / person)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
