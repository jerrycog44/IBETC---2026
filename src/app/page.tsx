import Link from 'next/link';
import { Mic2, Trophy, Video, Shield, ArrowRight, Star, Users, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* ====================================================================
          HERO SECTION — Editorial Art-Directed Composition
          ==================================================================== */}
      <section className="hero-editorial-bg relative text-white overflow-hidden border-b border-emerald-900/30">
        {/* Top Header Bar */}
        <header className="border-b border-emerald-500/20 bg-emerald-950/40 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
            {/* Brand identity */}
            <Link href="/" className="flex items-center gap-4 group">
              <img
                src="/eygii-logo.png"
                alt="EYGII Logo"
                className="h-11 object-contain transition-transform group-hover:scale-[1.02]"
              />
              <div className="hidden sm:block border-l border-emerald-500/20 pl-4 text-left">
                <span className="block text-xs font-black tracking-wider text-emerald-100 uppercase font-display">
                  Eloquent Youth &amp; Global Integrity (EYGII)
                </span>
                <span className="block text-[11px] text-emerald-400/90 italic font-serif mt-0.5">
                  Motive: Reviving world integrity and moral values
                </span>
              </div>
            </Link>

            {/* Quick Links */}
            <nav className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/gallery"
                className="text-xs font-semibold uppercase tracking-wider text-emerald-200/80 hover:text-white transition-colors hidden md:inline-flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 text-gold-400" />
                Gallery
              </Link>
              <Link
                href="/staff/login"
                className="text-xs font-semibold uppercase tracking-wider text-emerald-200/80 hover:text-white transition-colors hidden sm:inline-flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Staff Portal
              </Link>
              <Link
                href="/submit"
                className="btn-editorial-primary text-xs px-4 py-2.5"
              >
                <Video className="w-3.5 h-3.5" />
                Submit Entry
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Editorial Grid Content */}
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Dominant Editorial Headline & Narrative */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Metadata Eyebrow */}
              <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded border border-emerald-500/30 bg-emerald-900/30 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span>IBETC 2026</span>
                <span className="text-emerald-500">•</span>
                <span>IBADAN, NIGERIA</span>
              </div>

              {/* Dominant Editorial Display Typography */}
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-[0.25em] text-gold-400/90 font-semibold">
                  ANNUAL YOUTH &amp; TEENS DEBATE COMPETITION
                </p>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.05] tracking-tight text-white">
                  IBADAN ELOQUENT <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500">
                    YOUTH &amp; TEENS
                  </span> <br />
                  CONFERENCE
                </h1>
              </div>

              {/* Narrative Subtitle */}
              <p className="text-base sm:text-lg text-emerald-100/85 leading-relaxed max-w-xl font-normal border-l-2 border-emerald-500/40 pl-4 py-1">
                Organized by the <strong className="text-white font-semibold">Eloquent Youth &amp; Global Integrity Initiative</strong>, IBETC’26 is Nigeria&apos;s premier annual debate platform — bringing together young debaters to demonstrate persuasive advocacy, intellectual excellence, and moral leadership.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/submit" className="btn-editorial-primary">
                  <Video className="w-4 h-4" />
                  Submit Debate Video
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link href="/gallery" className="btn-editorial-secondary">
                  <Star className="w-4 h-4 text-gold-400" />
                  Explore Gallery
                </Link>
              </div>
            </div>

            {/* Right Column: Architectural Conference Details Card */}
            <div className="lg:col-span-5">
              <div className="bg-emerald-950/70 border border-emerald-500/30 rounded-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                  <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider font-bold">
                    [ EVENT SPECIFICATION ]
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-mono text-emerald-200 uppercase tracking-wider font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ENTRIES OPEN
                  </span>
                </div>

                {/* Key Spec Grid */}
                <div className="space-y-4 font-sans text-xs">
                  <div className="border-b border-emerald-500/10 pb-3">
                    <span className="text-emerald-400/70 uppercase text-[10px] font-mono font-bold tracking-widest block mb-1">
                      ORGANIZER
                    </span>
                    <p className="text-sm font-bold text-white leading-snug">
                      Eloquent Youth &amp; Global Integrity Initiative (EYGII)
                    </p>
                  </div>

                  <div className="border-b border-emerald-500/10 pb-3">
                    <span className="text-emerald-400/70 uppercase text-[10px] font-mono font-bold tracking-widest block mb-1">
                      MOTIVE &amp; MISSION
                    </span>
                    <p className="text-xs italic font-serif text-emerald-200/90 leading-relaxed">
                      &quot;Reviving world integrity and moral values&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-emerald-500/10 pb-3">
                    <div>
                      <span className="text-emerald-400/70 uppercase text-[10px] font-mono font-bold tracking-widest block mb-1">
                        FORMAT
                      </span>
                      <p className="text-xs font-semibold text-white">MP4 Debate Video</p>
                    </div>
                    <div>
                      <span className="text-emerald-400/70 uppercase text-[10px] font-mono font-bold tracking-widest block mb-1">
                        ELIGIBILITY
                      </span>
                      <p className="text-xs font-semibold text-white">Youth &amp; Teens (Nigeria)</p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-emerald-400/70 uppercase text-[10px] font-mono font-bold tracking-widest block mb-1">
                      PARTICIPANT ACCESS SYSTEM
                    </span>
                    <p className="text-xs text-emerald-200/80 leading-relaxed">
                      Instant participant key issuance for direct status tracking and score verification.
                    </p>
                  </div>
                </div>

                {/* Card footer CTA */}
                <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400/80 uppercase">
                    CONFERENCE YEAR: 2026
                  </span>
                  <Link
                    href="/submit"
                    className="text-xs font-bold text-gold-400 hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    Start Entry <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          STATS STRIP
          ==================================================================== */}
      <section className="bg-white border-y border-slate-100 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '2026', label: 'Conference Year', icon: Award },
            { value: 'Annual', label: 'Competition', icon: Trophy },
            { value: 'Nigeria-wide', label: 'Participation', icon: Users },
            { value: 'MP4 Video', label: 'Submission Format', icon: Video },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-brand-900 font-display">{value}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          THREE PORTALS
          ==================================================================== */}
      <section className="py-20 px-4 bg-[#f8f9fc]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-eyebrow mx-auto mb-4">
              <Mic2 className="w-3.5 h-3.5" />
              Platform Portals
            </div>
            <h2 className="section-title text-4xl sm:text-5xl">
              Everything You Need
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              A complete competition platform — from entry submission to judging and public gallery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Submission */}
            <Link
              href="/submit"
              id="portal-submit"
              className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-card card-hover overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white mb-6 shadow-button group-hover:shadow-button-hover transition-shadow">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Submit Entry</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Upload your MP4 debate video. No account required. Track status with your private link.
                </p>
                <div className="flex items-center text-brand-600 text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                  Submit Now
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Gallery */}
            <Link
              href="/gallery"
              id="portal-gallery"
              className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-card card-hover overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white mb-6 shadow-[0_2px_8px_rgba(234,179,8,0.35)]">
                  <Star className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Public Gallery</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Watch approved student debate videos from schools across Nigeria.
                </p>
                <div className="flex items-center text-gold-600 text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                  Explore Gallery
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Staff Portal */}
            <Link
              href="/staff/login"
              id="portal-staff"
              className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-card card-hover overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white mb-6 shadow-[0_2px_8px_rgba(15,23,42,0.25)]">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Staff Portal</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Authorized admin and judge access. Review submissions, score entries, manage staff.
                </p>
                <div className="flex items-center text-slate-700 text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                  Staff Login
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          HOW IT WORKS
          ==================================================================== */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-eyebrow mx-auto mb-4">
              <Trophy className="w-3.5 h-3.5" />
              Process
            </div>
            <h2 className="section-title text-3xl sm:text-4xl">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Record & Upload',
                desc: 'Record your debate video in MP4 format and upload it through our secure submission form.',
                color: 'text-brand-600 bg-brand-50',
              },
              {
                step: '02',
                title: 'Organizer Review',
                desc: 'The IBETC organizing committee reviews your submission and approves qualified entries.',
                color: 'text-gold-700 bg-gold-50',
              },
              {
                step: '03',
                title: 'Public Gallery',
                desc: 'Approved entries appear in the public gallery for the community to watch and support.',
                color: 'text-emerald-700 bg-emerald-50',
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="text-center">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4 font-black text-lg font-display`}>
                  {step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="bg-brand-950 text-white py-12 px-4 mt-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display font-black text-xl gradient-text-gold">IBETC 2026</p>
              <p className="text-xs text-white/50 mt-1">
                Ibadan Eloquent Youth and Teens Conference
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Organized by Eloquent Youth Global Integrity Initiative
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <Link href="/submit" className="hover:text-white transition-colors">Submit Entry</Link>
              <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
              <Link href="/staff/login" className="hover:text-white transition-colors">Staff</Link>
            </div>
          </div>
          <div className="gradient-divider my-8" />
          <p className="text-center text-xs text-white/30">
            © 2026 Eloquent Youth Global Integrity Initiative. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
