'use client';

import dynamic from 'next/dynamic';

const PhaserGame = dynamic(
  () => import('@/components/PhaserGame').then((m) => ({ default: m.PhaserGame })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-black text-white font-mono">
        Loading...
      </div>
    ),
  }
);

export default function PlayPage() {
  return (
    <main className="flex items-center justify-center w-screen h-screen bg-black overflow-hidden">
      <PhaserGame />
    </main>
  );
}
