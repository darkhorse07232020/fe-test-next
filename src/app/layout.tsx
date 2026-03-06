import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpaceX Explorer",
  description: "Explore SpaceX launches with filters, details, and favorites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-50`}
      >
        <QueryProvider>
          <div className="min-h-screen bg-linear-to-b from-zinc-950 via-slate-950 to-black">
            <Header />
            <main className="mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}

