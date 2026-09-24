'use client';

import React, { useState, useEffect } from 'react';
import { Play, Loader2, VideoOff, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  submissionId: string;
  participantKey?: string;
  posterTitle?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  submissionId,
  participantKey,
  posterTitle,
  autoPlay = false,
}: VideoPlayerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(autoPlay);

  const fetchSignedUrl = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/video/signed-url?submissionId=${encodeURIComponent(submissionId)}`;
      if (participantKey) {
        url += `&participantKey=${encodeURIComponent(participantKey)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.signedUrl) {
        throw new Error(data.error || 'Failed to load video');
      }

      setSignedUrl(data.signedUrl);
    } catch (err) {
      setError((err as Error).message || 'Unable to load debate video');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoPlay) {
      fetchSignedUrl();
    }
  }, [submissionId, participantKey, autoPlay]);

  const handlePlayClick = () => {
    setHasStarted(true);
    if (!signedUrl) {
      fetchSignedUrl();
    }
  };

  return (
    <div className="relative w-full aspect-video bg-[#031c0e] rounded-xl overflow-hidden shadow-lg border border-brand-600/30 group">
      {!hasStarted ? (
        /* Poster / Play Overlay */
        <div
          onClick={handlePlayClick}
          className="absolute inset-0 bg-gradient-to-br from-[#062915] via-[#031c0e] to-[#01140a] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
        >
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#027b3915_1px,transparent_1px),linear-gradient(to_bottom,#027b3915_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Large Play Button */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-[#027B39] text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300 border-2 border-emerald-400/40">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-current" />
          </div>

          <div className="relative z-10 mt-4 max-w-md">
            <span className="inline-block px-3 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider rounded-full mb-2">
              Debate Entry Video
            </span>
            {posterTitle && (
              <h4 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-tight">
                {posterTitle}
              </h4>
            )}
            <p className="text-xs text-neutral-300 mt-1">
              Click to watch performance
            </p>
          </div>
        </div>
      ) : loading ? (
        /* Loading Spinner */
        <div className="absolute inset-0 bg-[#031c0e] flex flex-col items-center justify-center gap-3 text-emerald-400">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="text-xs font-semibold tracking-wide">Loading Secure Stream...</span>
        </div>
      ) : error ? (
        /* Error State */
        <div className="absolute inset-0 bg-[#031c0e] flex flex-col items-center justify-center p-6 text-center gap-2">
          <AlertCircle className="w-10 h-10 text-amber-500" />
          <p className="text-sm font-semibold text-white">{error}</p>
          <button
            onClick={fetchSignedUrl}
            className="mt-2 text-xs font-bold text-emerald-400 underline hover:text-white"
          >
            Try Again
          </button>
        </div>
      ) : signedUrl ? (
        /* Native Video Player */
        <video
          src={signedUrl}
          controls
          autoPlay
          controlsList="nodownload"
          playsInline
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="absolute inset-0 bg-[#031c0e] flex flex-col items-center justify-center gap-2 text-neutral-400">
          <VideoOff className="w-10 h-10" />
          <span className="text-xs font-medium">Video unavailable</span>
        </div>
      )}
    </div>
  );
}
