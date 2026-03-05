'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white">
      <h1 className="text-6xl font-bold tracking-tight mb-4">
        BRO-MON
      </h1>
      <p className="text-xl text-gray-400 mb-2">Greek Life RPG</p>
      <p className="text-sm text-gray-500 mb-12 max-w-md text-center">
        Pledge Sigma Sigma Sigma. Recruit Bros. Battle through Greek Row.
        Challenge the Dean of Greek Life.
      </p>
      <Link
        href="/play"
        className="px-8 py-4 bg-yellow-500 text-black font-bold text-lg rounded hover:bg-yellow-400 transition-colors"
      >
        RUSH NOW
      </Link>
    </main>
  );
}
