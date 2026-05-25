import type {Metadata} from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import AuroraBackground from '@/components/aurora-background';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SUVI - AI Healthcare Platform',
  description: 'Agentic AI healthcare platform for hospital and clinics streamlining operations and providing clinical decision support.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body text-deep-blue bg-[#eceef2] antialiased min-h-screen" suppressHydrationWarning>
        <AuroraBackground />
        {children}
      </body>
    </html>
  );
}
