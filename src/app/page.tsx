import Link from 'next/link';
import { Mic2, Trophy, Video, Shield, ArrowRight, Star, Users, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* ====================================================================
          HERO SECTION
          ==================================================================== */}
      <section className="hero-bg relative flex flex-col items-center justify-center min-h-screen px-4 py-16 text-white text-center overflow-hidden">
        {/* Animated Mesh Orbs */}
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,185,129,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          {/* Logo Card */}
          <div className="animate-slide-up flex justify-center">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-emerald-400/30 shadow-2xl shadow-emerald-950/50 inline-flex flex-col sm:flex-row items-center gap-4">
              {/* Logo Image */}
              <img
                src="/eygii-logo.png"
                alt="EYGII Logo"
                className="h-16 sm:h-20 object-contain drop-shadow"
              />
              <div className="text-left border-t sm:border-t-0 sm:border-l border-emerald-900/15 pt-2 sm:pt-0 sm:pl-4">
                <p className="text-emerald-800 font-black text-sm sm:text-base tracking-tight uppercase leading-tight font-display">
                  Eloquent Youth &amp; Global Integrity (EYGII)
                </p>
                <p className="text-emerald-700 italic font-serif text-xs sm:text-sm mt-0.5">
                  Motive: Reviving world integrity and moral values
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="animate-slide-up animation-delay-100 space-y-2">
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.1] tracking-tight"
            >
              <span className="block text-white">Ibadan Eloquent</span>
              <span className="block gradient-text-gold">Youth &amp; Teens</span>
              <span className="block text-white">Conference</span>
            </h1>
          </div>

          {/* Year Badge */}
          <div className="animate-slide-up animation-delay-200 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-950/60 backdrop-blur-md border border-emerald-400/30 shadow-lg">
              <Trophy className="w-5 h-5 text-gold-400" />
              <span className="text-2xl font-black text-white tracking-tight">IBETC 2026</span>
              <Trophy className="w-5 h-5 text-gold-400" />
            </div>
          </div>

          {/* Subtitle */}
          <p className="animate-slide-up animation-delay-300 text-lg sm:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-medium">
            The premier annual debate competition for youth and teens across Nigeria.
            Submit your video entry, track your status, and compete for excellence.
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up animation-delay-400 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/submit" className="btn-gold w-full sm:w-auto text-base px-8 py-4">
              <Video className="w-5 h-5" />
              Submit Your Entry
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/gallery" className="btn-outline border-emerald-400/40 text-emerald-100 hover:bg-emerald-900/40 hover:border-emerald-400 w-full sm:w-auto text-base px-8 py-4">
              <Star className="w-4 h-4 text-gold-400" />
              View Approved Entries
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
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
