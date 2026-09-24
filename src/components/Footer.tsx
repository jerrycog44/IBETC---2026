import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Award, Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#02160b] text-white border-t border-brand-600/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-brand-600/20">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
                <Image 
                  src="/eygii-logo.png" 
                  alt="EYGII Logo" 
                  width={36} 
                  height={36} 
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  EYGII — IBETC 2026
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  Eloquent Youth & Global Integrity Initiative
                </p>
              </div>
            </div>
            
            <p className="text-sm text-neutral-300 max-w-md leading-relaxed">
              BATTLE OF WITS & WORDS: Oyo Debaters is an inter-school debate challenge empowering secondary school debaters in Oyo State with critical thinking, eloquence, and ethical leadership skills.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Official Competition Platform
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" /> Oyo State Debaters 2026
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Competition Home
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Meet the Debaters & Vote
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-white transition-colors">
                  Submit Debate Video
                </Link>
              </li>
              <li>
                <Link href="/#finalists" className="hover:text-white transition-colors">
                  The Grand Finale
                </Link>
              </li>
              <li>
                <Link href="/staff/login" className="hover:text-white transition-colors text-xs text-neutral-400">
                  Staff & Judge Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Organizer Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Ibadan, Oyo State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>info@eygii.org</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+234 (0) 800 IBETC 2026</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>
            © 2026 Eloquent Youth & Global Integrity Initiative (EYGII). All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Empowering Nigeria&apos;s Youth Leaders through Oratory & Character.
          </p>
        </div>
      </div>
    </footer>
  );
}
