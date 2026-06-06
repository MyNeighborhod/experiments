'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  tenant: any
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, tenant }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const isNog = tenant?.slug === 'nog'
  const logoImage = (data as any)?.logoImage
  const logoUrl = logoImage && typeof logoImage === 'object' ? logoImage.url : null

  if (isNog) {
    return (
      <header className="container relative z-20 pt-8" {...(theme ? { 'data-theme': theme } : {})}>
        <div className="flex flex-col items-center">
          {logoUrl ? (
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={tenant?.name || 'North Of Grand'}
                className="max-h-28 w-auto object-contain mb-2"
                loading="eager"
              />
            </Link>
          ) : (
            <Link href="/" className="font-serif text-3xl font-bold tracking-widest text-[#76b3b8] mb-2">
              North Of Grand
            </Link>
          )}
          <div className="w-full border-t border-b border-[#e2e8f0] py-2 mt-4 flex justify-center">
            <HeaderNav data={data} />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="container relative z-20   " {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between">
        <Link href="/">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
