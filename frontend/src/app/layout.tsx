import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TrialMatch - NSCLC Clinical Trial Matching",
  description: "Find clinical trials matched to your NSCLC diagnosis. Get personalized matches based on your biomarkers, stage, and treatment history.",
  keywords: ["NSCLC", "clinical trials", "lung cancer", "biomarkers", "cancer treatment", "oncology"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body
        className={`${inter.variable} font-sans antialiased bg-white min-h-screen text-gray-900 flex flex-col`}
      >
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
