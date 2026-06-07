import type { Metadata } from "next"

import { cn } from "@/utilities/ui"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import { Playfair_Display, Gentium_Book_Plus, Montserrat } from "next/font/google"
import React from "react"

import { AdminBar } from "@/components/AdminBar"
import { Footer } from "@/Footer/Component"
import { Header } from "@/Header/Component"
import { Providers } from "@/providers"
import { InitTheme } from "@/providers/Theme/InitTheme"
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph"
import { draftMode, headers } from "next/headers"
import { getTenant } from "@/utilities/getGlobals"

import "../globals.css"
import { notFound } from "next/navigation"
import { getServerSideURL } from "@/utilities/getURL"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
})

const gentium = Gentium_Book_Plus({
  subsets: ["latin"],
  variable: "--font-gentium",
  weight: ["400", "700"],
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "700"],
})

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const { isEnabled } = await draftMode()
  const tenant = await getTenant()

  // Trigger 404 if the requested tenant does not exist in the database (ignoring default fallback)

  if (tenantSlug !== "default" && !tenant) {
    return notFound()
  }

  const themeClass = tenant?.slug ? `theme-${tenant.slug}` : ""

  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        playfair.variable,
        gentium.variable,
        montserrat.variable,
      )}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className={cn(themeClass)}>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: "summary_large_image",
    creator: "@payloadcms",
  },
}
