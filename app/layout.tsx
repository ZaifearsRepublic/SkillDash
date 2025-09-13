import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import Navbar from "@/components/Navbar"; // <-- Import the Navbar

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
      <body className={`${GeistSans.className} antialiased bg-white dark:bg-black`}>
        <Navbar /> {/* <-- Add the Navbar here */}
        <main className="pt-16"> {/* <-- Add padding to push content down */}
          {children}
        </main>
      </body>
    </html>
  );
}
