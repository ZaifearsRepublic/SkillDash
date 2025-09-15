import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // Corrected path
import { AuthProvider } from "../contexts/AuthContext"; // Corrected path

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
        <AuthProvider> {/* Wrap with AuthProvider */}
          <Navbar />
          <main className="pt-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

