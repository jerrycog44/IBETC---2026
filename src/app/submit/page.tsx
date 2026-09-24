'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { CONFIG } from '@/lib/config';
import { formatBytes, generateParticipantKey } from '@/lib/utils/formatters';
import { createSubmissionAction } from '@/app/actions/submissions';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileVideo,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  School,
  Phone,
  Mail,
  MessageSquare,
  Video,
  Share2,
  Info,
} from 'lucide-react';

interface SubmissionResult {
  id: string;
  fullName: string;
  school: string;
  debateTopic: string;
  slug: string;
  participantKey: string;
  createdAt: string;
}

export default function SubmitPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [debateTopic, setDebateTopic] = useState('');

  // File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success State
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const validateFile = (file: File): string | null => {
    if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
      return 'Please select an MP4 video file.';
    }
    if (file.size > CONFIG.MAX_VIDEO_SIZE_BYTES) {
      return `Video file size exceeds the maximum allowed limit of ${CONFIG.MAX_VIDEO_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setErrorMessage(err);
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!fullName.trim() || !school.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Please fill out all participant contact details.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!debateTopic.trim()) {
      setErrorMessage('Please enter your debate topic or motion.');
      return;
    }
    setCurrentStep(3);
  };

  const handleStep3Next = () => {
    setErrorMessage(null);
    if (!selectedFile) {
      setErrorMessage('Please select a valid MP4 debate video to proceed.');
      return;
    }
    setCurrentStep(4);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!selectedFile) {
      setErrorMessage('Please attach your debate video file.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);

    const supabase = createClient();
    const tempId = crypto.randomUUID();
    const randomHash = generateParticipantKey().substring(0, 12);
    const videoPath = `submissions/${tempId}/${randomHash}.mp4`;

    try {
      setUploadProgress(40);
      const { error: uploadError } = await supabase.storage
        .from(CONFIG.STORAGE_BUCKET_VIDEOS)
        .upload(videoPath, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`Video upload failed: ${uploadError.message}`);

      setUploadProgress(75);

      const participantKey = generateParticipantKey();
      const result = await createSubmissionAction({
        fullName,
        school,
        phone,
        email,
        debateTopic,
        videoPath,
        participantKey,
      });

      if (!result.success || !result.data) {
        await supabase.storage.from(CONFIG.STORAGE_BUCKET_VIDEOS).remove([videoPath]);
        throw new Error(result.error || 'Failed to complete submission.');
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

  const publicLink = submissionResult
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/entry/${submissionResult.slug || submissionResult.id}`
    : '';

  const handleCopyLink = () => {
    if (!statusLink) return;
    navigator.clipboard.writeText(statusLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  /* ====================================================================
     SUCCESS VIEW
     ==================================================================== */
  if (submissionResult) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8faf7]">
        <Navbar />

        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-8 sm:p-10 space-y-8 animate-fade-in">
            
            {/* Header Icon */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-[#027B39] border border-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Submission Received!
              </h1>
              <span className="badge badge-pending text-xs py-1 px-3">
                Your entry is awaiting review
              </span>
            </div>

            {/* Explanation Banner */}
            <div className="bg-[#f0f7f2] border border-[#d1ebd9] rounded-xl p-5 text-sm text-neutral-800 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-[#027B39]">
                <Info className="w-4 h-4" />
                <span>What happens next?</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Organizers are currently reviewing your debate video. <strong>Once your entry is approved, you can share your public competition link and begin gathering votes!</strong>
              </p>
            </div>

            {/* Submission Overview */}
            <div className="bg-neutral-50 rounded-xl border border-neutral-200 divide-y divide-neutral-200 text-xs">
              <div className="p-3.5 flex justify-between">
                <span className="font-bold text-neutral-500 uppercase">Participant</span>
                <span className="font-bold text-neutral-900">{submissionResult.fullName}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="font-bold text-neutral-500 uppercase">School</span>
                <span className="font-semibold text-neutral-800">{submissionResult.school}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="font-bold text-neutral-500 uppercase">Debate Topic</span>
                <span className="font-medium text-neutral-800 italic max-w-xs text-right truncate">&quot;{submissionResult.debateTopic}&quot;</span>
              </div>
            </div>

            {/* Private Management Link Box */}
            <div className="space-y-3 border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-extrabold text-neutral-900">
                Your Private Participant Management Link
              </h3>
              <p className="text-xs text-neutral-600">
                Bookmark or copy this link. You will need it to view your review status and manage your entry:
              </p>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={statusLink}
                  className="flex-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-xs font-mono text-neutral-800 truncate outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-100">
              <Link
                href={`/submission/${submissionResult.id}?key=${submissionResult.participantKey}`}
                className="btn-primary flex-1 justify-center text-xs py-3"
              >
                View Submission Dashboard
              </Link>
              <Link
                href="/"
                className="btn-outline flex-1 justify-center text-xs py-3"
              >
                Return to Homepage
              </Link>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ====================================================================
     4-STEP SUBMISSION FORM
     ==================================================================== */
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-[#027B39] uppercase tracking-wider">
            BATTLE OF WITS & WORDS — OYO DEBATERS
          </span>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
            Submit Debate Video Entry
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Follow the 4 quick steps below. No account required.
          </p>
        </div>

        {/* Progress Indicator (1 .. 4) */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
          {[
            { step: 1, label: 'Participant' },
            { step: 2, label: 'Debate Topic' },
            { step: 3, label: 'Video File' },
            { step: 4, label: 'Review & Submit' },
          ].map((s, idx) => (
            <React.Fragment key={s.step}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep === s.step
                      ? 'bg-[#027B39] text-white shadow-sm'
                      : currentStep > s.step
                      ? 'bg-emerald-100 text-[#027B39] border border-emerald-300'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {currentStep > s.step ? <Check className="w-4 h-4" /> : s.step}
                </div>
                <span className="text-[10px] font-bold text-neutral-600 hidden sm:inline-block">
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep > s.step ? 'bg-[#027B39]' : 'bg-neutral-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Wizard Card Body */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* STEP 1: Participant Information */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="text-base font-extrabold text-neutral-900">
                  Step 1: Participant Contact Information
                </h3>
                <p className="text-xs text-neutral-500">
                  Provide your student full name, school, and contact details.
                </p>
              </div>

              <div>
                <label className="form-label">
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Ade"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  School / Secondary School <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Lagelu Grammar School, Ibadan"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
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
                  <label className="form-label">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="form-input pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="btn-primary text-xs py-3 px-6 flex items-center gap-2">
                  <span>Continue to Debate Topic</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Debate Information */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Next} className="space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="text-base font-extrabold text-neutral-900">
                  Step 2: Debate Topic & Motion
                </h3>
                <p className="text-xs text-neutral-500">
                  Enter the specific debate topic or motion you address in your video.
                </p>
              </div>

              <div>
                <label className="form-label">
                  Debate Motion / Topic <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={debateTopic}
                    onChange={(e) => setDebateTopic(e.target.value)}
                    placeholder="e.g. Technology and Ethical Leadership in Nigerian Schools"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button type="submit" className="btn-primary text-xs py-3 px-6 flex items-center gap-2">
                  <span>Continue to Upload Video</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Upload Video */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="text-base font-extrabold text-neutral-900">
                  Step 3: Upload MP4 Debate Video
                </h3>
                <p className="text-xs text-neutral-500">
                  Video format must be MP4. Maximum allowed file size is {CONFIG.MAX_VIDEO_SIZE_MB}MB.
                </p>
              </div>

              {!selectedFile ? (
                <label
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors ${
                    isDragging ? 'border-[#027B39] bg-emerald-50/50' : 'border-neutral-300 hover:border-[#027B39] bg-neutral-50'
                  }`}
                >
                  <div className="w-14 h-14 bg-emerald-100 text-[#027B39] rounded-full flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      Drag and drop your MP4 debate video here
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Or click to select video file from your phone / computer
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,.mp4"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="btn-outline text-xs py-2 px-4 mt-2">
                    Browse Files
                  </span>
                </label>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileVideo className="w-8 h-8 text-[#027B39] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-neutral-500">{formatBytes(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs font-bold text-rose-600 hover:underline shrink-0"
                  >
                    Change File
                  </button>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleStep3Next}
                  disabled={!selectedFile}
                  className="btn-primary text-xs py-3 px-6 flex items-center gap-2"
                >
                  <span>Review Submission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="text-base font-extrabold text-neutral-900">
                  Step 4: Review Details & Submit
                </h3>
                <p className="text-xs text-neutral-500">
                  Please verify your information before submitting to organizers.
                </p>
              </div>

              <div className="bg-neutral-50 rounded-xl border border-neutral-200 divide-y divide-neutral-200 text-xs">
                <div className="p-3.5 flex justify-between">
                  <span className="font-bold text-neutral-500 uppercase">Student Name</span>
                  <span className="font-bold text-neutral-900">{fullName}</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="font-bold text-neutral-500 uppercase">School</span>
                  <span className="font-semibold text-neutral-800">{school}</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="font-bold text-neutral-500 uppercase">Phone & Email</span>
                  <span className="font-medium text-neutral-800">{phone} · {email}</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="font-bold text-neutral-500 uppercase">Debate Topic</span>
                  <span className="font-medium text-neutral-800 italic max-w-xs text-right">&quot;{debateTopic}&quot;</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="font-bold text-neutral-500 uppercase">Video File</span>
                  <span className="font-semibold text-[#027B39]">{selectedFile?.name} ({selectedFile ? formatBytes(selectedFile.size) : ''})</span>
                </div>
              </div>

              {/* Uploading progress indicator */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-neutral-700">
                    <span>Uploading debate video to secure storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#027B39] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={isSubmitting}
                  className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Entry...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Submit Entry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
