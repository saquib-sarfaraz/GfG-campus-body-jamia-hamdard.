import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Trophy, Sparkles, Users, Award } from 'lucide-react';

export default function RegistrationAnnouncementModal({
  isOpen,
  onClose,
  onRegisterCTA,
  onExploreDetails
}) {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll while modal is visible
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-announcement-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-2xl bg-[#121916] border border-[#28342D] shadow-2xl p-5 sm:p-7 text-[#F5F7F5] z-10 overflow-hidden"
          >
            {/* Subtle Top Ambient Glow Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-amber-500/80 rounded-full blur-[2px]" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close announcement"
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#171F1B] border border-[#28342D] text-[#A2ADA6] hover:text-white hover:border-[#22A447]/60 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#22A447]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Body */}
            <div className="space-y-4 pt-1">
              {/* Eyebrow & Status Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#171F1B] border border-[#28342D] text-[11px] font-semibold text-[#A2ADA6]">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  GFG CAMPUS BODY • JAMIA HAMDARD
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Registration Closed
                </span>
              </div>

              {/* Main Heading */}
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
                  <span>Under 5G Use Case Lab</span>
                </div>
                <h2
                  id="modal-announcement-title"
                  className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F5] tracking-tight leading-tight"
                >
                  REGISTRATIONS ARE CLOSED
                </h2>
              </div>

              {/* Description */}
              <p className="text-sm text-[#A2ADA6] leading-relaxed">
                Thank you for the tremendous response! Online registrations for{' '}
                <strong className="text-white font-semibold">THINKTANK IDEATHON 2026</strong> under
                the 5G Use Case Lab have officially closed. Shortlisted teams and presentation schedules will be announced soon.
              </p>

              {/* Prize Pool & Track Highlights */}
              <div className="rounded-xl bg-[#171F1B] border border-[#28342D] p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#707E75] block uppercase font-medium">
                      Competition Pool
                    </span>
                    <span className="text-base font-bold text-[#F5F7F5]">
                      ₹9,000 Prize Pool 🏆
                    </span>
                  </div>
                </div>
                <div className="text-right border-l border-[#28342D] pl-3">
                  <span className="text-[11px] text-[#707E75] block">Team Format</span>
                  <span className="text-xs font-semibold text-[#A2ADA6]">3 to 6 Members</span>
                </div>
              </div>

              {/* Quick Info Tags */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A2ADA6]">
                <span className="px-2 py-0.5 rounded bg-[#171F1B] border border-[#28342D]">
                  ⚡ Tech & Non-Tech Tracks
                </span>
                <span className="px-2 py-0.5 rounded bg-[#171F1B] border border-[#28342D]">
                  🎓 Faculty Mentored
                </span>
                <span className="px-2 py-0.5 rounded bg-[#171F1B] border border-[#28342D]">
                  🚀 Offline Presentation
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={onExploreDetails}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-[#28342D] hover:bg-[#34443b] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 border border-[#3A4B41] transition-all focus:outline-none focus:ring-2 focus:ring-[#22A447]"
                >
                  <span>Explore Event Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#171F1B] hover:bg-[#28342D]/60 active:scale-[0.98] border border-[#28342D] text-[#A2ADA6] hover:text-white font-medium text-xs sm:text-sm transition-all focus:outline-none"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
