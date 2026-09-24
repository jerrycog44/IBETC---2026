'use client';

import React from 'react';
import Link from 'next/link';
import { Play, ThumbsUp, Trophy, ArrowRight, School, MessageSquare } from 'lucide-react';

export interface DebaterCardProps {
  id: string;
  fullName: string;
  school: string;
  debateTopic: string;
  voteCount: number;
  slug?: string | null;
  isFinalist?: boolean;
  finalistRank?: number | null;
}

export default function DebaterCard({
  id,
  fullName,
  school,
  debateTopic,
  voteCount,
  slug,
  isFinalist,
  finalistRank,
}: DebaterCardProps) {
  const entryLink = `/entry/${slug || id}`;

  return (
    <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-brand-600/40 transition-all duration-200 flex flex-col overflow-hidden group">
      
      {/* Card Header Thumbnail / Banner */}
      <div className="relative aspect-[16/9] bg-[#031c0e] flex flex-col justify-between p-4 overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#027b3915_1px,transparent_1px),linear-gradient(to_bottom,#027b3915_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          {isFinalist ? (
            <span className="badge badge-finalist flex items-center gap-1 shadow-sm">
              <Trophy className="w-3 h-3 text-amber-600" />
              Finalist {finalistRank ? `#${finalistRank}` : ''}
            </span>
          ) : (
            <span className="badge bg-[#027B39]/90 text-white text-[10px] uppercase font-bold tracking-wider">
              Debater Entry
            </span>
          )}

          {/* Vote count pill */}
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold border border-white/10">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{voteCount.toLocaleString()} votes</span>
          </div>
        </div>

        {/* Center Play Indicator */}
        <Link href={entryLink} className="relative z-10 flex items-center justify-center my-auto group-hover:scale-110 transition-transform">
          <div className="w-12 h-12 bg-[#027B39] text-white rounded-full flex items-center justify-center shadow-lg border border-emerald-400/30">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </Link>

        {/* Bottom School Tag */}
        <div className="relative z-10 flex items-center gap-1.5 text-neutral-300 text-xs truncate">
          <School className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate font-medium">{school}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-neutral-900 group-hover:text-[#027B39] transition-colors leading-snug line-clamp-1">
            {fullName}
          </h3>
          
          <div className="mt-2.5 flex items-start gap-2 text-xs text-neutral-600">
            <MessageSquare className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed italic">
              &quot;{debateTopic}&quot;
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={entryLink}
          className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-[#027B39] text-neutral-800 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 group/btn"
        >
          <span>Watch & Vote</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
}
