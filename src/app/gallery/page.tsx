'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/formatters';
import { Search, Play, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

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

    // Query strictly against the safe public view
    const { data, error } = await supabase
      .from('public_approved_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data as ApprovedSubmission[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }
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
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 mb-2 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Official Competition
              </span>
              <span className="text-xs font-bold text-slate-400">IBETC 2026</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Approved Debate Gallery</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Watch approved youth and teen debate competition entries from across the country.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search speaker, school, topic..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </header>

        {/* GALLERY GRID */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
            <span>Loading approved debate entries...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            {searchQuery ? 'No approved debate entries match your search.' : 'No approved debate entries yet. Check back soon!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/gallery/${item.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-500 transition-all overflow-hidden flex flex-col group"
              >
                <div className="aspect-video bg-slate-900 relative flex items-center justify-center text-white overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-brand-600 block uppercase tracking-wider truncate">
                      {item.school}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors mt-0.5">
                      {item.full_name}
                    </h2>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {item.debate_topic}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Submitted {formatDate(item.created_at)}</span>
                    <span className="text-emerald-600 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
