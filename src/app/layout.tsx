import type {Metadata} from 'next';
import { Inter, Space_Grotesk, EB_Garamond } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const ebGaramond = EB_Garamond({ 
  subsets: ['latin'], 
  variable: '--font-eb-garamond', 
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic']
});

export const metadata: Metadata = {
  title: 'ResumeLatex',
  description: 'Create beautiful, ATS-compliant resumes from LaTeX code.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("font-body antialiased", inter.variable, spaceGrotesk.variable, ebGaramond.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
