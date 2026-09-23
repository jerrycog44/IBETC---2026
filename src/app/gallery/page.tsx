'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { Search, Play, ArrowLeft, RefreshCw, CheckCircle2, Trophy, Users, Mic2, Filter } from 'lucide-react';

interface ApprovedSubmission {
  id: string;
  full_name: string;
  school: string;
  debate_topic: string;
  video_path: string;
  created_at: string;
}

export default function PublicGalleryPage() {
  const [items, setItems] = useState<ApprovedSubmission[]>([]);
  const [filteredItems, setFilteredItems] = useState<ApprovedSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('public_approved_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data as ApprovedSubmission[]);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredItems(items); return; }
    const q = searchQuery.toLowerCase();
    setFilteredItems(
      items.filter(
        (item) =>
          item.full_name.toLowerCase().includes(q) ||
          item.school.toLowerCase().includes(q) ||
          item.debate_topic.toLowerCase().includes(q)
      )
    );
  }, [items, searchQuery]);

  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">IBETC 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="badge badge-approved hidden sm:inline-flex">
              <CheckCircle2 className="w-3 h-3" />
              Live Gallery
            </span>
            <button
              onClick={fetchGallery}
              className="btn-ghost text-xs gap-1.5"
              title="Refresh gallery"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="section-eyebrow mx-auto">
            <Mic2 className="w-3.5 h-3.5" />
            Approved Debate Entries
          </div>
          <h1 className="section-title text-4xl sm:text-5xl">Public Debate Gallery</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            Watch approved youth and teen debate competition entries from schools across Nigeria.
          </p>

          {/* Stats bar */}
          {!isLoading && (
            <div className="flex items-center justify-center gap-6 pt-2 animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="w-4 h-4 text-brand-400" />
                <span><strong className="text-slate-800">{items.length}</strong> approved {items.length === 1 ? 'entry' : 'entries'}</span>
              </div>
              {searchQuery && (
                <>
                  <div className="w-px h-4 bg-slate-200" />
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Filter className="w-3.5 h-3.5 text-brand-400" />
                    <span><strong className="text-slate-800">{filteredItems.length}</strong> matching</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto search-bar">
          <Search className="search-icon w-4 h-4" />
          <input
            type="text"
            id="gallery-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, school, or topic..."
          />
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="aspect-video skeleton" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Mic2 className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-800 font-semibold mb-1">
              {searchQuery ? 'No matches found' : 'No entries yet'}
            </p>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? 'Try a different search term'
                : 'Approved debate entries will appear here once the competition begins.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 btn-ghost text-xs"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => (
              <Link
                key={item.id}
                href={`/gallery/${item.id}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-card card-hover overflow-hidden flex flex-col animate-slide-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Video thumbnail */}
                <div className="video-thumbnail rounded-none">
                  <div className="play-button">
                    <Play className="w-5 h-5 fill-brand-600 text-brand-600 ml-0.5" />
                  </div>
                  {/* School badge overlay */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold max-w-[70%] truncate">
                    {item.school}
                  </div>
                </div>

                {/* Card content */}
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                      {item.full_name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.debate_topic}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{formatDate(item.created_at)}</span>
                    <span className="badge badge-approved">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © 2026 Eloquent Youth Global Integrity Initiative · IBETC 2026
          </p>
          <Link href="/submit" className="btn-primary text-sm px-5 py-2.5">
            <Mic2 className="w-4 h-4" />
            Submit Your Entry
          </Link>
        </div>
      </footer>
    </main>
  );
}
