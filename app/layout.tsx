import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // Corrected path
import { AuthProvider } from "../contexts/AuthContext"; // Corrected path
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

// FIXED: Added comprehensive favicon and metadata
export const metadata: Metadata = {
  title: "SkillDash | AI-Powered Skill Platform for Bangladesh's Youth",
  description: "The AI-Powered platform for Bangladesh's youth to discover, grow, and showcase their real-world skills.",
  keywords: "SkillDash, AI, skills, learning, Bangladesh, youth, career, jobs, freelance",
  authors: [{ name: "SkillDash Team" }],
  creator: "SkillDash",
  publisher: "SkillDash",
  
  // Open Graph metadata (for social sharing)
  openGraph: {
    title: "SkillDash | Bridge the Skill Gap",
    description: "From Classroom to Career. The AI-powered platform for Bangladesh's youth.",
    url: "https://skilldash.live",
    siteName: "SkillDash",
    type: "website",
    locale: "en_US",
  },
  
  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "SkillDash | AI-Powered Skill Platform",
    description: "Bridge the Skill Gap - From Classroom to Career",
    creator: "@skilldash",
  },
  
  // Favicon configuration
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    shortcut: [
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/favicon.ico', sizes: '180x180', type: 'image/x-icon' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        url: '/favicon.ico',
      },
    ],
  },
  
  // Additional metadata
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification (add your verification codes here)
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Additional favicon links for maximum browser compatibility */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//vercel.com" />
        <link rel="dns-prefetch" href="//vitals.vercel-analytics.com" />
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-black`}>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <Navbar />
          <main className="pt-20">
            {children}
          </main>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
