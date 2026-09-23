'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { CONFIG } from '@/lib/config';
import { formatBytes, generateParticipantKey } from '@/lib/utils/formatters';
import { createSubmissionAction } from '@/app/actions/submissions';
import { Upload, CheckCircle2, AlertCircle, Copy, Check, FileVideo, RefreshCw, ArrowLeft } from 'lucide-react';

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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate MP4 format
    if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
      setErrorMessage('Please select an MP4 video file.');
      return;
    }

    // Validate size limit
    if (file.size > CONFIG.MAX_VIDEO_SIZE_BYTES) {
      setErrorMessage(`Video size exceeds the maximum limit of ${CONFIG.MAX_VIDEO_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
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
      // 1. Direct browser-to-storage upload
      setUploadProgress(30);
      const { error: uploadError } = await supabase.storage
        .from(CONFIG.STORAGE_BUCKET_VIDEOS)
        .upload(videoPath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Video upload failed: ${uploadError.message}`);
      }

      setUploadProgress(70);

      // 2. Generate secret participant access key
      const participantKey = generateParticipantKey();

      // 3. Create database submission record
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
        // Cleanup storage file on database failure
        await supabase.storage.from(CONFIG.STORAGE_BUCKET_VIDEOS).remove([videoPath]);
        throw new Error(result.error || 'Failed to save submission.');
      }

      setUploadProgress(100);
      setSubmissionResult(result.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
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

  // SUCCESS CONFIRMATION VIEW
  if (submissionResult) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center space-x-3 text-emerald-600 mb-4">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-slate-900">Submission Received!</h1>
          </div>

          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Thank you for submitting your entry for the <strong>Ibadan Eloquent Youth and Teens Conference 2026</strong>.
            Your submission is currently <strong>Pending Organizer Review</strong>.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 mb-6 text-sm">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 block">Submission ID</span>
              <span className="font-mono text-slate-900 font-medium">{submissionResult.id}</span>
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 block">Participant</span>
              <span className="text-slate-900 font-medium">{submissionResult.fullName} ({submissionResult.school})</span>
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 block">Debate Topic</span>
              <span className="text-slate-900 font-medium">{submissionResult.debateTopic}</span>
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 block">Status</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Pending Review
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Your Private Status Link</h2>
            <p className="text-xs text-slate-500 mb-3">
              Save this private link to check your submission status at any time. Do not share your access key publicly.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={statusLink}
                className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-xs text-brand-900 space-y-2 mb-6">
            <p className="font-semibold">Optional Account Creation</p>
            <p>
              Account creation is optional. You can create an account later to manage your submissions conveniently in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/submission/${submissionResult.id}?key=${submissionResult.participantKey}`}
              className="flex-1 text-center py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              View Submission Status
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-sm text-center transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // SUBMISSION FORM VIEW
  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <header className="mb-6">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">IBETC 2026 Competition</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Student Debate Entry</h1>
            <p className="text-xs text-slate-500 mt-1">
              Submit your debate video for IBETC 2026. No account required.
            </p>
          </header>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Chukwuma Adebayo"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label htmlFor="school" className="block text-xs font-semibold text-slate-700 mb-1">
                School / Institution <span className="text-red-500">*</span>
              </label>
              <input
                id="school"
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Loyola College Ibadan"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08012345678"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="participant@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="debateTopic" className="block text-xs font-semibold text-slate-700 mb-1">
                Debate Topic <span className="text-red-500">*</span>
              </label>
              <input
                id="debateTopic"
                type="text"
                required
                value={debateTopic}
                onChange={(e) => setDebateTopic(e.target.value)}
                placeholder="e.g. Digital Integrity in Youth Governance"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* VIDEO FILE UPLOADER */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Debate Video (MP4, Max {CONFIG.MAX_VIDEO_SIZE_MB}MB) <span className="text-red-500">*</span>
              </label>

              {!selectedFile ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer block transition-colors bg-slate-50 hover:bg-brand-50/30">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-brand-600">Choose MP4 Video File</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Primary accepted format: MP4</span>
                  <input
                    type="file"
                    accept="video/mp4,.mp4"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-700">
                      <FileVideo className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">{formatBytes(selectedFile.size)}</p>
                    </div>
                  </div>
                  {!isSubmitting && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 font-medium"
                    >
                      Change
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* UPLOAD PROGRESS BAR */}
            {isSubmitting && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Uploading video & submitting entry...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Submission...</span>
                  </>
                ) : (
                  <span>Submit Entry</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
