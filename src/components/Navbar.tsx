'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Trophy, Video, Send, ShieldAlert, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#031c0e]/95 backdrop-blur-md border-b border-brand-600/20 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Image 
                src="/eygii-logo.png" 
                alt="EYGII Logo" 
                width={40} 
                height={40} 
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                EYGII Presenting
              </span>
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                IBETC 2026
              </span>
              <span className="text-[10px] text-neutral-300 font-medium tracking-wide hidden xs:inline-block">
                Battle of Wits & Words
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className="px-3.5 py-2 text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Home
            </Link>
            <Link
              href="/gallery"
              className="px-3.5 py-2 text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Video className="w-4 h-4 text-emerald-400" />
              Meet Debaters
            </Link>
            <Link
              href="/#finalists"
              className="px-3.5 py-2 text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Grand Finale
            </Link>
            <Link
              href="/#about"
              className="px-3.5 py-2 text-sm font-medium text-neutral-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              About Competition
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/submit"
              className="btn-primary text-xs uppercase tracking-wider py-2.5 px-5 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Entry
            </Link>
            <Link
              href="/staff/login"
              className="text-xs font-semibold text-neutral-300 hover:text-emerald-400 px-3 py-2 transition-colors flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Staff Login
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/submit"
              className="btn-primary text-[11px] uppercase tracking-wider py-2 px-3 flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              Submit
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-neutral-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#02160b] border-b border-brand-600/30 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-base font-medium text-neutral-100 hover:bg-brand-600/20"
          >
            Home
          </Link>
          <Link
            href="/gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-base font-medium text-neutral-100 hover:bg-brand-600/20 flex items-center gap-2"
          >
            <Video className="w-4 h-4 text-emerald-400" />
            Meet the Debaters & Vote
          </Link>
          <Link
            href="/#finalists"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-base font-medium text-neutral-100 hover:bg-brand-600/20 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            The Grand Finale
          </Link>
          <Link
            href="/submit"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-lg text-base font-bold bg-[#027B39] text-white text-center flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Debate Video
          </Link>
          <div className="pt-2 border-t border-brand-600/20 flex justify-between items-center px-4">
            <span className="text-xs text-neutral-400">Judges & Admins:</span>
            <Link
              href="/staff/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Staff Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
