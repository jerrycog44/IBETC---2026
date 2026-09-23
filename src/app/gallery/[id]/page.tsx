'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { ArrowLeft, Play, CheckCircle2, Share2, Check } from 'lucide-react';

interface ApprovedSubmission {
  id: string;
  full_name: string;
  school: string;
  debate_topic: string;
  video_path: string;
  created_at: string;
}

export default function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [item, setItem] = useState<ApprovedSubmission | null>(null);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    async function fetchSubmission() {
      setIsLoading(true);
      const supabase = createClient();

      // Query public approved view ONLY
      const { data, error: err } = await supabase
        .from('public_approved_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (err || !data) {
        setError('Debate entry not found or not approved.');
        setIsLoading(false);
        return;
      }

      setItem(data as ApprovedSubmission);

      // Fetch signed video playback URL
      const res = await fetch(`/api/video/signed-url?submissionId=${id}`);
      if (res.ok) {
        const videoData = await res.json();
        if (videoData.signedUrl) {
          setSignedVideoUrl(videoData.signedUrl);
        }
      }
      setIsLoading(false);
    }

    fetchSubmission();
  }, [id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/gallery" className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Gallery</span>
        </Link>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            Loading debate entry...
          </div>
        ) : error || !item ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            {error || 'Submission not found.'}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* VIDEO PLAYER CONTAINER */}
            <div className="aspect-video bg-slate-900 relative">
              {signedVideoUrl ? (
                <video controls src={signedVideoUrl} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  <Play className="w-8 h-8 text-slate-600 mb-1" />
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved Entry</span>
                    </span>
                    <span className="text-xs text-slate-400">IBETC 2026</span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900">{item.full_name}</h1>
                  <p className="text-sm font-medium text-brand-600 mt-0.5">{item.school}</p>
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start"
                >
                  {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedShare ? 'Link Copied!' : 'Share Entry'}</span>
                </button>
              </header>

              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Debate Topic</h2>
                <p className="text-base text-slate-900 font-medium leading-relaxed">{item.debate_topic}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Submitted {formatDate(item.created_at)}</span>
                <span>Eloquent Youth Global Integrity Initiative</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
