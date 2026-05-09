import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Vera - Introspective Companion',
  description: 'Vera subtly mirrors your thinking style.',
};

import { Providers } from '@/components/Providers';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans bg-[#030508] text-slate-200 antialiased selection:bg-blue-500/30 selection:text-blue-200 min-h-screen flex flex-col relative" suppressHydrationWarning>
        <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
