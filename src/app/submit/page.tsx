'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { CONFIG } from '@/lib/config';
import { formatBytes, generateParticipantKey } from '@/lib/utils/formatters';
import { createSubmissionAction } from '@/app/actions/submissions';
import {
  Upload, CheckCircle2, AlertCircle, Copy, Check, FileVideo,
  RefreshCw, ArrowLeft, Mic2, Trophy, Shield, Video, Phone,
  Mail, User, School, MessageSquare
} from 'lucide-react';

interface SubmissionResult {
  id: string;
  fullName: string;
  school: string;
  debateTopic: string;
  participantKey: string;
  createdAt: string;
}

export default function SubmitPage() {
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [debateTopic, setDebateTopic] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const validateFile = (file: File): string | null => {
    if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
      return 'Please select an MP4 video file.';
    }
    if (file.size > CONFIG.MAX_VIDEO_SIZE_BYTES) {
      return `Video size exceeds the maximum limit of ${CONFIG.MAX_VIDEO_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const err = validateFile(file);
    if (err) { setErrorMessage(err); return; }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setErrorMessage(err); return; }
    setSelectedFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !school.trim() || !phone.trim() || !email.trim() || !debateTopic.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }
    if (!selectedFile) {
      setErrorMessage('Please select a debate video file to upload.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    const supabase = createClient();
    const tempId = crypto.randomUUID();
    const randomHash = generateParticipantKey().substring(0, 12);
    const videoPath = `submissions/${tempId}/${randomHash}.mp4`;

    try {
      setUploadProgress(30);
      const { error: uploadError } = await supabase.storage
        .from(CONFIG.STORAGE_BUCKET_VIDEOS)
        .upload(videoPath, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`Video upload failed: ${uploadError.message}`);

      setUploadProgress(70);

      const participantKey = generateParticipantKey();
      const result = await createSubmissionAction({
        fullName, school, phone, email, debateTopic, videoPath, participantKey,
      });

      if (!result.success || !result.data) {
        await supabase.storage.from(CONFIG.STORAGE_BUCKET_VIDEOS).remove([videoPath]);
        throw new Error(result.error || 'Failed to save submission.');
      }

      setUploadProgress(100);
      setSubmissionResult(result.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusLink = submissionResult
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/submission/${submissionResult.id}?key=${submissionResult.participantKey}`
    : '';

  const handleCopyLink = () => {
    if (!statusLink) return;
    navigator.clipboard.writeText(statusLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  /* ============================================================
     SUCCESS VIEW
     ============================================================ */
  if (submissionResult) {
    return (
      <main className="min-h-screen bg-[#f8f9fc] py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden animate-slide-up">
            {/* Gradient header bar */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />

            <div className="p-8">
              {/* Success icon */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mb-4 animate-pulse-glow">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-display font-black text-slate-900">Submission Received!</h1>
                <p className="text-slate-500 text-sm mt-2 max-w-sm">
                  Your entry for <strong className="text-slate-700">IBETC 2026</strong> is now pending organizer review.
                </p>
              </div>

              {/* Submission details */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 mb-6">
                <DetailRow label="Submission ID" value={submissionResult.id} mono />
                <DetailRow label="Participant" value={`${submissionResult.fullName} · ${submissionResult.school}`} />
                <DetailRow label="Debate Topic" value={submissionResult.debateTopic} />
                <div className="px-5 py-3.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                  <span className="badge badge-pending">Pending Review</span>
                </div>
              </div>

              {/* Private link section */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900 mb-1">Your Private Status Link</p>
                <p className="text-xs text-slate-400 mb-3">
                  Save this link to check your submission status anytime. Keep your access key private.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={statusLink}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all ${
                      copiedLink
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/submission/${submissionResult.id}?key=${submissionResult.participantKey}`}
                  className="btn-primary flex-1 justify-center"
                >
                  View Submission Status
                </Link>
                <Link
                  href="/"
                  className="btn-ghost flex-1 justify-center border-slate-200"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     SUBMISSION FORM VIEW
     ============================================================ */
  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      {/* Page Header */}
      <div className="bg-white border-b border-emerald-900/10 shadow-sm sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
            <div className="w-px h-6 bg-emerald-900/15" />
            <Link href="/" className="flex items-center gap-3">
              <img src="/eygii-logo.png" alt="EYGII Logo" className="h-10 object-contain" />
              <div className="text-left">
                <span className="block text-xs font-black text-emerald-900 uppercase tracking-tight">EYGII — IBETC 2026</span>
                <span className="block text-[10px] text-emerald-700 italic hidden sm:block">Reviving world integrity and moral values</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <div className="section-eyebrow mx-auto mb-4">
            <Trophy className="w-3.5 h-3.5" />
            Debate Competition Entry
          </div>
          <h1 className="section-title text-4xl">Submit Your Entry</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
            No account required. Upload your MP4 debate video and receive a private status link.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          {/* Gradient top accent */}
          <div className="h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-600" />

          <div className="p-8">
            {/* Error alert */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-slide-up">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chukwuma Adebayo"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* School */}
              <div>
                <label htmlFor="school" className="form-label">
                  School / Institution <span className="required">*</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="school"
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Loyola College, Ibadan"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08012345678"
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="form-input pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Debate Topic */}
              <div>
                <label htmlFor="debateTopic" className="form-label">
                  Debate Topic <span className="required">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="debateTopic"
                    type="text"
                    required
                    value={debateTopic}
                    onChange={(e) => setDebateTopic(e.target.value)}
                    placeholder="e.g. Digital Integrity in Youth Governance"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="form-label">
                  Debate Video (MP4, Max {CONFIG.MAX_VIDEO_SIZE_MB}MB) <span className="required">*</span>
                </label>

                {!selectedFile ? (
                  <label
                    className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-7 h-7 text-brand-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      {isDragging ? 'Drop your video here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs text-slate-400">MP4 format · Max {CONFIG.MAX_VIDEO_SIZE_MB}MB</p>
                    <input
                      type="file"
                      accept="video/mp4,.mp4"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="mt-4">
                      <span className="btn-outline text-sm px-5 py-2.5">
                        <Video className="w-4 h-4" />
                        Browse File
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-600">
                      <FileVideo className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{formatBytes(selectedFile.size)}</p>
                    </div>
                    {!isSubmitting && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {isSubmitting && (
                <div className="space-y-2 animate-slide-up">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Uploading and saving your entry...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Security notice */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Shield className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your submission is securely stored. You&apos;ll receive a private link to track your status after submitting.
                </p>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-entry-btn"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center py-4 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing Submission...
                    </>
                  ) : (
                    <>
                      <Mic2 className="w-5 h-5" />
                      Submit My Entry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-5 py-3.5 flex items-start justify-between gap-4">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">{label}</span>
      <span className={`text-sm text-slate-800 text-right ${mono ? 'font-mono text-xs' : 'font-medium'}`}>{value}</span>
    </div>
  );
}
