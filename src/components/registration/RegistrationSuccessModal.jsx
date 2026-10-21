import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Download,
  Home,
  ShieldCheck,
  Award,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function RegistrationSuccessModal({ registration, onReset }) {
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const passRef = useRef(null);

  if (!registration) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(registration.registrationId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dedicated Print Handler: ensures only the registration pass is printed
  const handlePrint = () => {
    document.body.classList.add('printing-pass');
    window.print();

    const handleAfterPrint = () => {
      document.body.classList.remove('printing-pass');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);

    // Fallback cleanup in case afterprint does not fire
    setTimeout(() => {
      document.body.classList.remove('printing-pass');
    }, 2000);
  };

  // Download Pass as Single-Page PDF Handler using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!passRef.current || downloadingPdf) return;
    setDownloadingPdf(true);
    setPdfError(null);

    try {
      // Ensure web fonts are completely ready before rendering
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // Ensure all images in pass (logos) are completely loaded
      const imgElements = passRef.current.querySelectorAll('img');
      const imageLoadPromises = Array.from(imgElements).map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(imageLoadPromises);

      const element = passRef.current;

      // Capture only the pass card at retina 2x scale with desktop viewport context
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#121916',
        logging: false,
        windowWidth: 1024,
        onclone: (clonedDoc) => {
          // Standardize cloned tree width so PDF renders identical desktop layout on all devices
          if (clonedDoc.body) {
            clonedDoc.body.style.width = '1024px';
            clonedDoc.body.style.minWidth = '1024px';
          }

          const clonedCard = clonedDoc.getElementById('registration-pass-card');
          if (clonedCard) {
            clonedCard.style.width = '780px';
            clonedCard.style.maxWidth = '780px';
            clonedCard.style.margin = '0 auto';
            clonedCard.style.overflow = 'visible';
            clonedCard.style.boxShadow = 'none';

            // Remove truncation so team name, leader, mentor, and members are fully visible without clipping
            const truncatedEls = clonedCard.querySelectorAll('.truncate');
            truncatedEls.forEach((el) => {
              el.classList.remove('truncate');
              el.style.overflow = 'visible';
              el.style.textOverflow = 'clip';
              el.style.whiteSpace = 'normal';
              el.style.wordBreak = 'break-word';
            });

            // Prevent text overlapping from tight line-heights in html2canvas
            const textEls = clonedCard.querySelectorAll('span, p, h2, h3, h4');
            textEls.forEach((el) => {
              el.style.lineHeight = '1.35';
            });

            // Ensure registration ID badge remains crisp and unclipped
            const regIdBadge = clonedCard.querySelector('.font-mono');
            if (regIdBadge) {
              regIdBadge.style.letterSpacing = '0.05em';
              regIdBadge.style.whiteSpace = 'nowrap';
            }
          }

          // Hide on-screen copy button in exported PDF
          const copyBtn = clonedDoc.getElementById('pass-copy-button');
          if (copyBtn) {
            copyBtn.style.display = 'none';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');

      // Calculate actual card rendered dimensions and aspect ratio
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const aspectRatio = canvasWidth / canvasHeight;

      // Define minimal margins (8mm) so pass occupies most of the page without excessive empty space
      const margin = 8;
      const pdfWidth = 210; // Standard 210mm width (A4 width)
      const printWidth = pdfWidth - (margin * 2); // 194mm printable width
      const printHeight = printWidth / aspectRatio;
      const pdfHeight = printHeight + (margin * 2);

      // Create PDF with custom page size matching the card dimensions with clean margins
      const isLandscape = pdfWidth > pdfHeight;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fill page background with brand dark color #121916 for seamless framing
      pdf.setFillColor(18, 25, 22);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Position pass centered within the page margins
      const posX = (pageWidth - printWidth) / 2;
      const posY = (pageHeight - printHeight) / 2;

      pdf.addImage(
        imgData,
        'PNG',
        posX,
        posY,
        printWidth,
        printHeight,
        undefined,
        'FAST'
      );

      const sanitizedId = (registration.registrationId || 'Team').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`THINKTANK_Pass_${sanitizedId}.pdf`);
    } catch (err) {
      console.error('Pass PDF generation error:', err);
      setPdfError({
        title: "Couldn't Generate Your Pass",
        message: "Your registration is verified, but the pass couldn't be downloaded. Please try again."
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto w-full space-y-6 printable-pass-wrapper"
    >
      {/* Success Banner (Hidden during Print) */}
      <div className="text-center space-y-3 print:hidden">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#22A447]/15 border border-[#22A447]/30 text-[#22A447] shadow-md mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#171F1B] border border-[#28342D] text-[#22A447] text-xs font-semibold">
            Official Confirmation Pass Ready
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F5] tracking-tight">
            Registration Verified
          </h2>
          <p className="text-[#A2ADA6] text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Your team registration has been verified successfully. Your official confirmation pass is ready.
          </p>
        </div>
      </div>

      {/* Official Registration Pass (The exact single component printed and exported to PDF) */}
      <div
        id="registration-pass-card"
        ref={passRef}
        className="relative rounded-2xl bg-[#121916] border border-[#28342D] shadow-2xl overflow-hidden"
      >
        {/* Top Header Strip */}
        <div className="p-4 sm:p-6 border-b border-[#28342D] bg-[#171F1B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Logos Lockup */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-[#28342D] flex items-center justify-center shadow-sm">
                <img
                  src="/assets/gfg-official-logo.png"
                  alt="GFG Campus Body Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-[#28342D] flex items-center justify-center shadow-sm">
                <img
                  src="/assets/jamia-logo.png"
                  alt="Jamia Hamdard Crest"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#A2ADA6]">
                <span className="font-semibold text-[#22A447]">GFG Campus Body</span>
                <span>•</span>
                <span>Jamia Hamdard</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#F5F7F5] mt-0.5 tracking-tight truncate">
                {registration.eventName || 'THINKTANK IDEATHON 2026'}
              </h3>
              <span className="text-[11px] text-[#A2ADA6] block">
                Under 5G Use Case Lab • Official Entry Pass
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end flex-shrink-0">
            <span className="text-[11px] text-[#707E75] uppercase tracking-wider font-medium">
              Registration Pass ID
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm sm:text-base font-bold text-[#22A447] px-3 py-1 rounded-md bg-[#121916] border border-[#28342D] tracking-wider whitespace-nowrap shadow-inner">
                {registration.registrationId}
              </span>
              <button
                id="pass-copy-button"
                type="button"
                onClick={handleCopyId}
                title="Copy Registration ID"
                className="p-1.5 rounded-md bg-[#121916] border border-[#28342D] text-[#A2ADA6] hover:text-[#F5F7F5] hover:border-[#22A447] transition-colors print:hidden"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#22A447]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Body Grid */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Key Metas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-xl bg-[#171F1B] border border-[#28342D]">
              <span className="text-[11px] text-[#707E75] block">Team Name</span>
              <span className="text-sm font-bold text-[#F5F7F5] mt-0.5 block truncate" title={registration.teamName}>
                {registration.teamName}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#171F1B] border border-[#28342D]">
              <span className="text-[11px] text-[#707E75] block">Category Track</span>
              <span className="text-sm font-semibold text-[#22A447] mt-0.5 block truncate">
                {registration.category}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#171F1B] border border-[#28342D]">
              <span className="text-[11px] text-[#707E75] block">Total Members</span>
              <span className="text-sm font-semibold text-[#F5F7F5] mt-0.5 block">
                {registration.teamSize || (registration.members?.length ? registration.members.length + 1 : 0)} Members
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#171F1B] border border-[#28342D]">
              <span className="text-[11px] text-[#707E75] block">Faculty Mentor</span>
              <span className="text-sm font-semibold text-[#F5F7F5] mt-0.5 block truncate" title={registration.facultyMentor}>
                {registration.facultyMentor}
              </span>
            </div>
          </div>

          {/* Leader and Members List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#A2ADA6] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22A447]" /> Team Composition
              </h4>
              <span className="text-[10px] text-[#707E75] font-mono uppercase tracking-wider">
                Jamia Hamdard Verification
              </span>
            </div>

            <div className="space-y-2">
              {/* Leader Card */}
              <div className="p-3 rounded-xl bg-[#171F1B] border border-[#28342D] border-l-4 border-l-[#22A447] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#22A447]/20 text-[#22A447] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    L
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#F5F7F5] flex items-center gap-2">
                      <span className="truncate">{registration.leader?.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#22A447]/20 text-[#22A447] font-semibold flex-shrink-0">
                        Team Leader
                      </span>
                    </div>
                    <div className="text-[11px] text-[#707E75] truncate mt-0.5">
                      {registration.leader?.email} • {registration.leader?.mobile}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-[#A2ADA6] sm:text-right font-medium flex-shrink-0">
                  {registration.leader?.department}
                </div>
              </div>

              {/* Other Members */}
              {registration.members?.map((mem) => (
                <div
                  key={mem.memberIndex || mem.email}
                  className="p-2.5 sm:p-3 rounded-xl bg-[#171F1B] border border-[#28342D] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#121916] text-[#707E75] text-xs font-medium flex items-center justify-center flex-shrink-0 border border-[#28342D]">
                      {mem.memberIndex}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#F5F7F5] truncate">
                        {mem.name}
                      </div>
                      <div className="text-[11px] text-[#707E75] truncate mt-0.5">
                        {mem.email} • {mem.mobile}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#707E75] sm:text-right flex-shrink-0">
                    {mem.department}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Verification Footer Strip */}
          <div className="p-3 rounded-xl bg-[#171F1B] border border-[#28342D] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5 text-[#A2ADA6]">
              <Award className="w-4 h-4 text-[#22A447] flex-shrink-0" />
              <div>
                <p className="text-[#F5F7F5] font-semibold text-xs">Verified University Participant Record</p>
                <p className="text-[10px] text-[#707E75]">
                  Officially confirmed under the Jamia Hamdard 5G Use Case Lab.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#22A447]/10 border border-[#22A447]/30 text-[#22A447] text-[10px] font-mono font-bold uppercase tracking-wider">
                <FileCheck className="w-3 h-3" /> Confirmed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official WhatsApp Group for Team Leaders & Participants (Hidden during Print) */}
      <div className="rounded-2xl p-5 sm:p-6 bg-[#121916] border border-[#28342D] shadow-xl print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#25D366] block">
                IMPORTANT FOR TEAM LEADERS
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#F5F7F5]">
                Official Ideathon WhatsApp Group
              </h3>
              <p className="text-xs text-[#A2ADA6] mt-0.5">
                Join for round schedules, problem statements releases, and coordinator announcements.
              </p>
            </div>
          </div>

          <a
            href="https://chat.whatsapp.com/FBOMzvQOl2t1YhIQDnYlnL?s=sh&p=a&mlu=4&ilr=4"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all flex-shrink-0"
          >
            <span>Join WhatsApp Group</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* PDF Generation Error Notice (if any) */}
      {pdfError && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs space-y-1.5 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-rose-200 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{pdfError.title}</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="text-xs font-semibold text-rose-200 hover:text-white underline cursor-pointer"
            >
              Try Again
            </button>
          </div>
          <p className="text-xs text-rose-300/90 pl-6 leading-relaxed">
            {pdfError.message}
          </p>
        </div>
      )}

      {/* Action Buttons (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 print:hidden">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Print Pass Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#171F1B] hover:bg-[#1E2924] border border-[#28342D] text-xs sm:text-sm font-semibold text-[#F5F7F5] flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 text-[#22A447]" />
            <span>Print Pass</span>
          </button>

          {/* Prominent Download Pass as PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="px-5 py-2.5 rounded-xl bg-[#22A447] hover:bg-[#1E943F] disabled:opacity-60 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Pass (PDF)</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-[#171F1B] hover:bg-[#1E2924] border border-[#28342D] text-xs sm:text-sm font-medium text-[#A2ADA6] hover:text-[#F5F7F5] transition-all"
          >
            Look Up Another Pass
          </button>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl bg-[#171F1B] hover:bg-[#28342D] border border-[#28342D] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Home className="w-4 h-4 text-[#22A447]" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

