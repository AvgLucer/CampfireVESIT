import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, CheckCircle, ArrowRight, RotateCcw, MapPin, Calculator, Car, Trophy, Calendar, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const JudgeGuideModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    user,
    resetDemoData,
    completeChallenge,
    requestSeat,
    rides,
    challenges,
    showToast,
  } = useApp();

  const [activeStep, setActiveStep] = useState(1);

  const workflows = [
    {
      step: 1,
      title: '1. Unified Campus Dashboard',
      desc: "Live digital home screen aggregating Today's Lecture timeline, estimated SGPA, real-time carpools, and contextual recommendations.",
      icon: Sparkles,
      link: '/dashboard',
    },
    {
      step: 2,
      title: '2. Academics & SGPA What-If Simulator',
      desc: 'Credit-weighted Mumbai University formula. Visibly locks mathematically impossible grades with clear warnings. Interactive sliders update projections.',
      icon: Calculator,
      link: '/academics',
    },
    {
      step: 3,
      title: '3. Student Carpool Discovery & Safety',
      desc: 'Interactive Leaflet OpenStreetMap centered at Chembur/VESIT. Ride lifecycle (available, pending, accepted, full) with anti-overbooking concurrency guards.',
      icon: Car,
      link: '/rides',
      action: () => {
        const availableRide = rides.find(r => r.id === 'ride_01');
        if (availableRide) {
          requestSeat(availableRide.id, 1);
        } else {
          showToast('Ride 01 requested', 'info');
        }
      },
      actionLabel: '1-Click Test: Request Carpool Seat',
    },
    {
      step: 4,
      title: '4. Peer Challenges & Live Leaderboard',
      desc: 'Idempotent completion logic prevents duplicate point exploitation. Completing a challenge updates user points, streak, and class rank dynamically.',
      icon: Trophy,
      link: '/challenges',
      action: () => {
        completeChallenge('ch_01');
      },
      actionLabel: '1-Click Test: Complete C++ Challenge (+80 pts)',
    },
    {
      step: 5,
      title: '5. Interactive Campus Directory',
      desc: 'Classrooms, computer labs, library, canteen, and first-aid facilities with walking directions and floor details. Lectures link straight to classroom locations.',
      icon: MapPin,
      link: '/campus',
    },
    {
      step: 6,
      title: '6. Events & Peer Study Time-Credits',
      desc: 'One-click RSVP with real capacity constraints, and a double-entry time credit ledger where students earn credits teaching and spend credits learning.',
      icon: BookOpen,
      link: '/learning',
    },
  ];

  return (
    <>
      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#171916] text-white text-xs font-semibold shadow-lg hover:bg-[#20231F] border border-white/10 transition-all cursor-pointer group"
      >
        <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
        <span>Hackathon Judge Guide</span>
      </button>

      {/* Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E3DC] p-6 text-[#20231F] max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737871] hover:text-[#20231F] hover:bg-[#F2EFE9] transition-colors"
              aria-label="Close Judge Guide"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#171916] tracking-tight">
                  GENESIS 2.0 Evaluation Guide — Campfire
                </h2>
                <div className="text-xs text-[#737871]">
                  PS-02: Campus360 · All-in-One First-Year Companion
                </div>
              </div>
            </div>

            {/* Overview Banner */}
            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DC] mb-5 text-xs text-[#3B4036] leading-relaxed">
              <div className="font-semibold text-[#171916] mb-1">
                Evaluation Highlights & Architecture:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[#555952]">
                <li><strong className="text-[#20231F]">Backend:</strong> Live Google Cloud Firebase Firestore provisioned & synchronized with local demo fallback.</li>
                <li><strong className="text-[#20231F]">Authentication:</strong> Explicit MiniMoth OTP adapter boundary with demo simulation and verified student state.</li>
                <li><strong className="text-[#20231F]">Cross-Feature Sync:</strong> Actions in any module (rides, challenges, events, learning) immediately reflect on the Dashboard.</li>
              </ul>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-3 mb-6">
              {workflows.map((wf) => {
                const Icon = wf.icon;
                const isSelected = activeStep === wf.step;
                return (
                  <div
                    key={wf.step}
                    onClick={() => setActiveStep(wf.step)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#F97316] bg-[#FFF8F5] shadow-xs'
                        : 'border-[#E5E3DC] bg-white hover:border-[#D7D4CB]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSelected ? 'bg-[#F97316] text-white' : 'bg-[#F2EFE9] text-[#737871]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#171916]">{wf.title}</div>
                          <div className="text-xs text-[#555952] mt-0.5 leading-relaxed">{wf.desc}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {wf.action && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              wf.action!();
                            }}
                            className="text-[11px] font-semibold text-[#F97316] bg-white border border-[#F97316]/30 px-2.5 py-1 rounded-lg hover:bg-[#F97316] hover:text-white transition-colors cursor-pointer"
                          >
                            {wf.actionLabel}
                          </button>
                        )}
                        <Link
                          to={wf.link}
                          onClick={() => setIsOpen(false)}
                          className="p-1 text-[#737871] hover:text-[#F97316] transition-colors"
                          title="Navigate to module"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E3DC]">
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-[#737871] hover:text-rose-600 font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Baseline</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-[#171916] hover:bg-[#20231F] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
