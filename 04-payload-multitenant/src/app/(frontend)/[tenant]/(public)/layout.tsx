import React from "react"
import { Header } from "@/Header/Component"
import { Footer } from "@/Footer/Component"
import { headers } from "next/headers"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers()
  const host = headerList.get("host") || ""
  const hostname = host.split(":")[0]

  const isPlatformLanding =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "blockvibe.org" ||
    hostname === "info.blockvibe.org"

  if (isPlatformLanding) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <header className="border-b border-gray-100 bg-white">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2 select-none">
                <svg
                  className="w-5 h-5 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                BlockVibe
              </span>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a
                href="#try"
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Give it a try
              </a>
            </nav>
          </div>
        </header>
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <footer className="border-t border-gray-100 bg-white py-8">
          <div className="container max-w-4xl mx-auto px-4 text-center text-xs text-gray-400">
            <p>© {new Date().getFullYear()} BlockVibe. All rights reserved.</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  )
}

