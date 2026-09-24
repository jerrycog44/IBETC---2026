'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DebaterCard from '@/components/DebaterCard';
import { createClient } from '@/lib/supabase/client';
import { Search, Trophy, ThumbsUp, Sparkles, Filter, RefreshCw, Video } from 'lucide-react';

interface ApprovedSubmission {
  id: string;
  full_name: string;
  school: string;
  debate_topic: string;
  video_path: string;
  vote_count: number;
  is_finalist: boolean;
  finalist_rank: number | null;
  slug: string | null;
  created_at: string;
}

export default function PublicGalleryPage() {
  const [items, setItems] = useState<ApprovedSubmission[]>([]);
  const [filteredItems, setFilteredItems] = useState<ApprovedSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'top' | 'finalists'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('public_approved_submissions') as any)
      .select('*')
      .order('vote_count', { ascending: false });

    if (!error && data) {
      setItems(data as ApprovedSubmission[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    let result = [...items];

    // Tab Filter
    if (activeTab === 'finalists') {
      result = result.filter((item) => item.is_finalist);
    } else if (activeTab === 'top') {
      result = result.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.full_name.toLowerCase().includes(q) ||
          item.school.toLowerCase().includes(q) ||
          item.debate_topic.toLowerCase().includes(q)
      );
    }

    setFilteredItems(result);
  }, [items, searchQuery, activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header Title Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Trophy className="w-3.5 h-3.5 text-[#027B39]" />
            BATTLE OF WITS & WORDS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Meet the Debaters
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Discover student debaters from secondary schools across Oyo State. Watch their debate performances and cast your vote!
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Debaters ({items.length})
            </button>

            <button
              onClick={() => setActiveTab('top')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'top'
                  ? 'bg-white text-[#027B39] shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              Most Voted
            </button>

            <button
              onClick={() => setActiveTab('finalists')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'finalists'
                  ? 'bg-amber-100 text-amber-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              Finalists
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search debater, school..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-900 outline-none focus:border-[#027B39] focus:bg-white transition-all"
            />
          </div>

        </div>

        {/* Debater Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3 animate-pulse">
                <div className="aspect-video bg-neutral-200 rounded-lg" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
                <div className="h-8 bg-neutral-200 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center space-y-3">
            <Video className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="text-base font-bold text-neutral-800">
              {searchQuery ? 'No debaters matching your search' : 'No approved debaters yet'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Try searching with a different student name or school.'
                : 'Debater entries will appear here once approved by organizers.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-ghost text-xs py-1.5 px-4 inline-flex"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
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
        )}

      </main>

      <Footer />
    </div>
  );
}
