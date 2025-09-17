import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next"; // Added Vercel Analytics

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillDash",
  description: "The AI-Powered platform for Bangladesh's youth.",
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
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-black`}>
        <Analytics /> {/* Added Analytics component */}
        <AuthProvider>
          <ErrorBoundary>
            <Navbar />
            <main className="pt-20">
              {children}
            </main>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}