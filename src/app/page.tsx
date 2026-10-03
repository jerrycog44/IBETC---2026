import React from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DebaterCard from '@/components/DebaterCard';
import { createClient } from '@/lib/supabase/server';
import {
  Trophy,
  Video,
  ThumbsUp,
  Award,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  School,
  CheckCircle2,
  Share2,
  Calendar,
  Flame,
} from 'lucide-react';

export default async function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let debaters: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalists: any[] = [];

  try {
    const supabase = await createClient();

    // Fetch approved debaters for live gallery section
    const { data: debatersData } = await (supabase.from('public_approved_submissions') as any)
      .select('*')
      .order('vote_count', { ascending: false })
      .limit(6);
    if (debatersData) debaters = debatersData;

    // Fetch finalists if any marked
    const { data: finalistsData } = await (supabase.from('public_approved_submissions') as any)
      .select('*')
      .eq('is_finalist', true)
      .order('finalist_rank', { ascending: true, nullsFirst: false });
    if (finalistsData) finalists = finalistsData;
  } catch (error) {
    console.error('[HomePage] Supabase fetch error:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      <Navbar />

      <main className="flex-1">
        {/* ====================================================================
            1. HERO SECTION — ARCHITECTURAL COMPETITION BRANDING
            ==================================================================== */}
        <section className="relative bg-[#031c0e] text-white py-16 lg:py-24 overflow-hidden border-b border-brand-600/30">
          {/* Subtle geometric pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#027b3915_1px,transparent_1px),linear-gradient(to_bottom,#027b3915_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Dominant Headline & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#062915] border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>IBETC 2026 OFFICIAL DEBATE CHALLENGE</span>
                </div>

                {/* Main Titles */}
                <div className="space-y-3">
                  <h2 className="text-emerald-400 text-sm sm:text-base font-extrabold uppercase tracking-widest">
                    Eloquent Youth & Global Integrity Initiative Presents
                  </h2>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
                    BATTLE OF WITS & WORDS
                  </h1>
                  <p className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight">
                    OYO DEBATERS 2026
                  </p>
                </div>

                {/* Subtitle / Mission */}
                <p className="text-base sm:text-lg text-neutral-200 leading-relaxed max-w-2xl font-normal border-l-2 border-[#027B39] pl-4">
                  An Inter-School Debate Challenge for Secondary Schools in Oyo State. Bringing together the brightest student minds to debate critical national topics, showcase eloquence, and compete for top honors.
                </p>

                {/* Action Strip */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    href="/submit"
                    className="btn-primary py-4 px-8 text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl"
                  >
                    <Video className="w-5 h-5" />
                    <span>SUBMIT YOUR ENTRY</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/gallery"
                    className="btn-secondary py-4 px-8 text-sm uppercase tracking-wider flex items-center justify-center gap-3 border border-emerald-500/40"
                  >
                    <ThumbsUp className="w-5 h-5 text-emerald-400" />
                    <span>EXPLORE DEBATERS & VOTE</span>
                  </Link>
                </div>

                {/* Live Competition Tagline */}
                <div className="pt-2 flex items-center gap-4 text-xs font-bold text-emerald-300 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" /> WATCH.
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4 text-emerald-400" /> VOTE.
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-emerald-300" /> SUPPORT YOUR SCHOOL.
                  </span>
                </div>

              </div>

              {/* Right Column: Key Spec & Competition Card */}
              <div className="lg:col-span-5">
                <div className="bg-[#062915] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
                  
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/eygii-logo.png"
                        alt="EYGII Logo"
                        width={32}
                        height={32}
                        className="bg-white rounded p-0.5"
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        EYGII IBETC 2026
                      </span>
                    </div>
                    <span className="badge bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px]">
                      ROUND 1 ONLINE
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-neutral-400 uppercase font-bold text-[10px] tracking-widest block">
                        COMPETITION NAME
                      </span>
                      <p className="text-base font-extrabold text-white mt-0.5">
                        Battle of Wits & Words: Oyo Debaters
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-400 uppercase font-bold text-[10px] tracking-widest block">
                        ORGANIZATION
                      </span>
                      <p className="text-sm font-semibold text-emerald-300 mt-0.5">
                        Eloquent Youth & Global Integrity Initiative (EYGII)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-500/20">
                      <div>
                        <span className="text-neutral-400 uppercase font-bold text-[10px] tracking-widest block">
                          STAGE 1
                        </span>
                        <p className="text-xs font-bold text-white mt-0.5">Public Video Voting</p>
                      </div>
                      <div>
                        <span className="text-neutral-400 uppercase font-bold text-[10px] tracking-widest block">
                          STAGE 2
                        </span>
                        <p className="text-xs font-bold text-amber-400 mt-0.5">Top 5 Grand Finale</p>
                      </div>
                    </div>
                  </div>

                  {/* Card CTA */}
                  <div className="pt-2">
                    <Link
                      href="/submit"
                      className="w-full py-3 bg-[#027B39] hover:bg-[#02632f] text-white rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <span>Submit Student Video Entry</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ====================================================================
            2. STATS STRIP
            ==================================================================== */}
        <section className="bg-white border-b border-neutral-200 py-8 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Competition Stage', val: 'Round 1 Voting', sub: 'Public Online Stage', icon: Trophy },
              { label: 'Eligible Schools', val: 'Oyo State Secondary', sub: 'Public & Private', icon: School },
              { label: 'Grand Finale', val: 'Top 5 Debaters', sub: 'Live Finalist Debate', icon: Award },
              { label: 'Organizer', val: 'EYGII Initiative', sub: 'Reviving Moral Integrity', icon: ShieldCheck },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#027B39]/10 text-[#027B39] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="text-base sm:text-lg font-extrabold text-neutral-900">{item.val}</h4>
                  <p className="text-xs font-bold text-[#027B39] uppercase tracking-wider">{item.label}</p>
                  <p className="text-[11px] text-neutral-500">{item.sub}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================================
            3. HOW IT WORKS — STEP BY STEP COMPETITION FLOW
            ==================================================================== */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-[#027B39]" />
              Simple Competition Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              How The Debate Competition Works
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              From school selection to public online voting and the Grand Finale live debate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Student Selection',
                desc: 'Each secondary school in Oyo State selects ONE student representative to enter the debate.',
              },
              {
                num: '02',
                title: 'Video Submission',
                desc: 'The student records and submits their debate video through our easy mobile upload form.',
              },
              {
                num: '03',
                title: 'Admin Review & Link',
                desc: 'Organizers review and approve the entry, issuing a shareable public debater link.',
              },
              {
                num: '04',
                title: 'Vote & Top 5 Finale',
                desc: 'Supporters watch and vote for their debater. The Top 5 advance to the live Grand Finale!',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm relative space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-[#027B39] font-mono">{step.num}</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">{step.title}</h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================
            4. FEATURED / CURRENT DEBATERS & PUBLIC VOTING GALLERY
            ==================================================================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-neutral-200">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#027B39]">
                  ROUND 1 — ONLINE VOTING
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-1">
                  Meet the Debaters & Vote
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Watch student debate performances and cast your vote to support your school.
                </p>
              </div>

              <Link
                href="/gallery"
                className="btn-outline text-xs uppercase font-bold py-2.5 px-5 shrink-0 self-start sm:self-auto flex items-center gap-2"
              >
                <span>View All Debaters</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Debaters Cards Grid */}
            {debaters && debaters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {debaters.map((item: {
                  id: string;
                  full_name: string;
                  school: string;
                  debate_topic: string;
                  vote_count: number;
                  slug: string | null;
                  is_finalist: boolean;
                  finalist_rank: number | null;
                }) => (
                  <DebaterCard
                    key={item.id}
                    id={item.id}
                    fullName={item.full_name}
                    school={item.school}
                    debateTopic={item.debate_topic}
                    voteCount={item.vote_count || 0}
                    slug={item.slug}
                    isFinalist={item.is_finalist}
                    finalistRank={item.finalist_rank}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#f8faf7] border border-dashed border-neutral-300 rounded-xl p-12 text-center space-y-3">
                <Video className="w-10 h-10 text-neutral-400 mx-auto" />
                <h3 className="text-base font-bold text-neutral-800">No approved debaters yet</h3>
                <p className="text-xs text-neutral-600 max-w-md mx-auto">
                  Be the first student to submit a debate video for your school in Oyo State!
                </p>
                <Link href="/submit" className="btn-primary text-xs py-2.5 px-6 inline-flex">
                  Submit First Entry
                </Link>
              </div>
            )}

          </div>
        </section>

        {/* ====================================================================
            5. THE GRAND FINALE / TOP 5 FINALISTS SECTION
            ==================================================================== */}
        <section id="finalists" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#031c0e] text-white">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="badge badge-finalist inline-flex items-center gap-1.5 px-3 py-1 text-xs">
                <Trophy className="w-4 h-4 text-amber-600" />
                STAGE 2 COMPETITION
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                THE GRAND FINALE
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                The top 5 best-performing debaters from Round 1 qualify for the live Grand Finale debate challenge.
              </p>
            </div>

            {/* If Finalists Exist */}
            {finalists && finalists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {finalists.map((item: {
                  id: string;
                  full_name: string;
                  school: string;
                  debate_topic: string;
                  vote_count: number;
                  slug: string | null;
                  is_finalist: boolean;
                  finalist_rank: number | null;
                }) => (
                  <DebaterCard
                    key={item.id}
                    id={item.id}
                    fullName={item.full_name}
                    school={item.school}
                    debateTopic={item.debate_topic}
                    voteCount={item.vote_count || 0}
                    slug={item.slug}
                    isFinalist={true}
                    finalistRank={item.finalist_rank}
                  />
                ))}
              </div>
            ) : (
              /* Preview Banner when voting is in progress */
              <div className="bg-[#062915] border border-emerald-500/30 rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-xl">
                <div className="w-16 h-16 bg-amber-400/20 border border-amber-400/40 rounded-full flex items-center justify-center mx-auto text-amber-400">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Round 1 Online Voting In Progress
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl mx-auto">
                    Finalists will be announced upon conclusion of Round 1 public voting. The five debaters with the highest public engagement and judge evaluation will take the stage at the Grand Finale.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/gallery"
                    className="btn-primary text-xs uppercase tracking-wider py-3 px-6 inline-flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Vote To Help Your School Qualify</span>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ====================================================================
            6. ORGANIZER & BRAND IDENTITY (EYGII / IBETC)
            ==================================================================== */}
        <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4 flex flex-col items-center text-center p-6 bg-[#f0f7f2] rounded-xl border border-[#d1ebd9]">
              <Image
                src="/eygii-logo.png"
                alt="EYGII Logo"
                width={120}
                height={120}
                className="object-contain mb-4"
              />
              <h3 className="text-base font-extrabold text-neutral-900">
                Eloquent Youth & Global Integrity Initiative
              </h3>
              <p className="text-xs text-[#027B39] font-bold mt-1 uppercase tracking-wider">
                EYGII Nigeria
              </p>
              <p className="text-xs text-neutral-600 italic mt-3 font-serif">
                &quot;Reviving world integrity and moral values&quot;
              </p>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#027B39]">
                ABOUT THE ORGANIZERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                Building Tomorrow&apos;s Ethical Leaders in Oyo State
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                The Ibadan Eloquent Youth and Teens Conference (IBETC 2026) is powered by the Eloquent Youth and Global Integrity Initiative (EYGII). Our mandate is to equip secondary school youth with persuasive communication, critical analysis, and unshakeable moral integrity.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Oratory Excellence</h4>
                  <p className="text-xs text-neutral-600 mt-1">Fostering articulate debate on issues of social development and ethics.</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase">Youth Empowerment</h4>
                  <p className="text-xs text-neutral-600 mt-1">Providing secondary school students with platform recognition and mentorship.</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
