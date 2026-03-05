import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Bro-Mon: Greek Life RPG',
  description: 'A frat-themed Pokemon parody RPG. Pledge Sigma Sigma Sigma, recruit Bros, and battle through Greek Row!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
