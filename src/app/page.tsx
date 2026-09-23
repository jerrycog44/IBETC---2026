import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
      <header className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Eloquent Youth Global Integrity Initiative
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-4">
          Ibadan Eloquent Youth and Teens Conference (IBETC 2026)
        </h1>
        <p className="text-lg text-slate-600 mt-3 max-w-2xl mx-auto">
          Annual Youth & Teens Debate Competition Platform.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <Link
          href="/submit"
          className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-brand-500 transition-colors text-left"
        >
          <h2 className="font-bold text-slate-900 text-lg">Submit Entry</h2>
          <p className="text-xs text-slate-500 mt-1">Upload your debate competition video submission.</p>
        </Link>
        <Link
          href="/gallery"
          className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-brand-500 transition-colors text-left"
        >
          <h2 className="font-bold text-slate-900 text-lg">Public Gallery</h2>
          <p className="text-xs text-slate-500 mt-1">Watch approved student debate entries.</p>
        </Link>
        <Link
          href="/staff/login"
          className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-brand-500 transition-colors text-left"
        >
          <h2 className="font-bold text-slate-900 text-lg">Staff Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Admin and judge login system.</p>
        </Link>
      </div>
    </main>
  );
}
