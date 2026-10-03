import React from 'react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import VoteButton from '@/components/VoteButton';
import ShareButton from '@/components/ShareButton';
import { ArrowLeft, School, Trophy, MessageSquare, ShieldCheck, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface EntryPageProps {
  params: Promise<{ slug: string }>;
}

async function getEntry(slugOrId: string) {
  try {
    const supabase = await createClient();

    // Query public approved submission via RPC or direct select
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_public_entry_by_slug_or_id', {
      p_identifier: slugOrId,
    });

    if (!error && data && data.length > 0) {
      return data[0];
    }

    // Fallback: direct select from public_approved_submissions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: directData } = await (supabase.from('public_approved_submissions') as any)
      .select('*')
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .limit(1);

    if (directData && directData.length > 0) {
      return directData[0];
    }
  } catch (err) {
    console.error('[getEntry] Error fetching entry:', err);
  }

  return null;
}

export async function generateMetadata({ params }: EntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) {
    return {
      title: 'Debater Entry Not Found | IBETC 2026',
    };
  }

  const title = `${entry.full_name} — Battle of Wits & Words | IBETC 2026`;
  const description = `Watch ${entry.full_name} from ${entry.school} debate on: "${entry.debate_topic}". Vote for this debater in the Oyo Debaters Challenge!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.other',
      siteName: 'IBETC 2026 — Oyo Debaters',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PublicEntryPage({ params }: EntryPageProps) {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) {
    notFound();
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: isVotingOpen } = await (supabase as any).rpc('is_voting_open');

  const shareUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/entry/${entry.slug || entry.id}`
    : `https://ibetc.eygii.org/entry/${entry.slug || entry.id}`;

  const shareText = `Vote for ${entry.full_name} from ${entry.school} in the IBETC 2026 Battle of Wits & Words debate competition!`;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#027B39] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore All Debaters</span>
          </Link>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#027B39]" />
            Official Debater Entry
          </span>
        </div>

        {/* Entry Main Card */}
        <article className="bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-[#031c0e] text-white p-6 sm:p-8 relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#027b3915_1px,transparent_1px),linear-gradient(to_bottom,#027b3915_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                  BATTLE OF WITS & WORDS — OYO DEBATERS 2026
                </span>
                {entry.is_finalist && (
                  <span className="badge badge-finalist">
                    <Trophy className="w-3 h-3 text-amber-600" />
                    Grand Finale Finalist {entry.finalist_rank ? `#${entry.finalist_rank}` : ''}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {entry.full_name}
              </h1>

              <div className="flex items-center gap-2 text-sm text-neutral-200">
                <School className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{entry.school}</span>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="p-4 sm:p-6 bg-neutral-900 border-b border-neutral-200">
            <VideoPlayer
              submissionId={entry.id}
              posterTitle={`${entry.full_name} — ${entry.school}`}
            />
          </div>

          {/* Details & Actions Section */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Debate Topic Box */}
            <div className="bg-[#f0f7f2] border border-[#d1ebd9] rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#027B39] uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>Debate Motion / Topic</span>
              </div>
              <p className="text-base sm:text-lg font-medium text-neutral-900 italic leading-relaxed">
                &quot;{entry.debate_topic}&quot;
              </p>
            </div>

            {/* Voting & Share CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-neutral-100">
              
              {/* Voting Column */}
              <div className="space-y-3 bg-emerald-50/50 border border-emerald-100 p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
                    Support This Debater
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Round 1 Voting
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  Cast your vote to help {entry.full_name} qualify for the Grand Finale!
                </p>

                <VoteButton
                  submissionId={entry.id}
                  initialVoteCount={entry.vote_count || 0}
                  votingOpen={isVotingOpen ?? true}
                  size="large"
                />
              </div>

              {/* Share Column */}
              <div className="space-y-3 bg-neutral-50 border border-neutral-200 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
                    Share Entry
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    Spread the word on WhatsApp, Facebook, Instagram and school groups to gather votes.
                  </p>
                </div>

                <ShareButton
                  title={`Vote for ${entry.full_name} — IBETC 2026`}
                  text={shareText}
                  url={shareUrl}
                  size="large"
                />
              </div>

            </div>

            {/* Verification Footer */}
            <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Submitted on {formatDate(entry.created_at)}
              </span>
              <span>Eloquent Youth & Global Integrity Initiative (EYGII)</span>
            </div>

          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
