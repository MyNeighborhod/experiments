import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js Server vs Client Experiment",
  description: "Learn Next.js server & client components, routing, and data fetching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="font-semibold text-lg tracking-tight text-blue-600 dark:text-blue-400">Next.js Experiment</span>
            <nav className="flex items-center gap-6">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Home (Server)
              </Link>
              <Link href="/client" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Client Component
              </Link>
              <Link href="/data" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Data Page
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-sm text-zinc-500">
          BlockVibe Experiments • Learning Next.js by Doing
        </footer>
      </body>
    </html>
  );
}

