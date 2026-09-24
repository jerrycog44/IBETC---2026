import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'IBETC 2026 — Ibadan Eloquent Youth and Teens Conference',
    template: '%s | IBETC 2026',
  },
  description:
    'Official debate competition platform for the Ibadan Eloquent Youth and Teens Conference 2026, organized by Eloquent Youth Global Integrity Initiative.',
  keywords: [
    'IBETC 2026',
    'Ibadan Eloquent Youth',
    'debate competition',
    'youth conference',
    'teens debate',
    'Eloquent Youth Global Integrity Initiative',
  ],
  openGraph: {
    title: 'IBETC 2026 — Ibadan Eloquent Youth and Teens Conference',
    description: 'Submit your debate entry for IBETC 2026.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#f8faf7] text-slate-900">
        {children}
      </body>
    </html>
  );
}
