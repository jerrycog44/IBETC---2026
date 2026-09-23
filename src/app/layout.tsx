import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IBETC 2026 — Ibadan Eloquent Youth and Teens Conference',
  description: 'Official debate platform for the Ibadan Eloquent Youth and Teens Conference 2026, organized by Eloquent Youth Global Integrity Initiative.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
