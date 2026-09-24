'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, MessageSquare } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  size?: 'normal' | 'large';
}

export default function ShareButton({ title, text, url, size = 'normal' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback manual copy
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const isLarge = size === 'large';

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleShare}
        className={`w-full flex items-center justify-center gap-2 font-bold rounded-lg transition-all border border-neutral-300 hover:border-brand-600 bg-white text-neutral-800 hover:bg-brand-50 hover:text-brand-700 shadow-sm ${
          isLarge ? 'py-3.5 px-6 text-base' : 'py-2.5 px-4 text-sm'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span>LINK COPIED TO CLIPBOARD!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 text-brand-600" />
            <span>SHARE ENTRY LINK</span>
          </>
        )}
      </button>

      {/* Quick WhatsApp Share Button */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\nVote for me here: ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Share directly on WhatsApp</span>
      </a>
    </div>
  );
}
