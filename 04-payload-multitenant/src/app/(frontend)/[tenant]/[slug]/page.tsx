import type { Metadata } from "next"

import { PayloadRedirects } from "@/components/PayloadRedirects"
import configPromise from "@payload-config"
import { getPayload, type RequiredDataFromCollectionSlug } from "payload"
import { draftMode } from "next/headers"
import React, { cache } from "react"
import { homeStatic } from "@/endpoints/seed/home-static"

import { RenderBlocks } from "@/blocks/RenderBlocks"
import { RenderHero } from "@/heros/RenderHero"
import { generateMeta } from "@/utilities/generateMeta"
import PageClient from "./page.client"
import { LivePreviewListener } from "@/components/LivePreviewListener"
import { NogInteractive } from "./NogInteractive.client"

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: "pages",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    depth: 1,
    select: {
      slug: true,
      tenant: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== "home"
    })
    .map((doc) => {
      const tenantSlug =
        typeof doc.tenant === "object" && doc.tenant !== null ? doc.tenant.slug : "default"
      return {
        tenant: tenantSlug,
        slug: doc.slug,
      }
    })

  return params
}

type Args = {
  params: Promise<{
    tenant: string
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = "home", tenant } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = "/" + decodedSlug
  let page: RequiredDataFromCollectionSlug<"pages"> | null

  page = await queryPageBySlug({
    slug: decodedSlug,
    tenant,
  })

  // Remove this code once your website is seeded
  if (!page && slug === "home") {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  const isNog = tenant === "nog"

  if (isNog) {
    if (
      decodedSlug === "yearly-calendar" ||
      decodedSlug === "archives-and-documents" ||
      decodedSlug === "contact" ||
      decodedSlug === "about"
    ) {
      return (
        <article className="pt-8 pb-24 theme-nog">
          <PageClient />
          <PayloadRedirects disableNotFound url={url} />
          {draft && <LivePreviewListener />}

          <div className="container max-w-6xl">
            {decodedSlug === "about" && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-center font-serif text-5xl mb-6">About</h1>
                <NogInteractive pageSlug="about" />
                <div className="text-center my-8 text-gray-600">
                  <strong className="block text-gray-800 text-lg mb-2">About North of Grand</strong>
                  <p className="mb-6 leading-relaxed">
                    Nestled within the vibrant cityscape of Des Moines, Iowa, the North of Grand
                    neighborhood offers a harmonious blend of urban convenience and historic charm.
                    Characterized by tree-lined streets and an eclectic mix of architectural styles,
                    our cozy neighborhood boasts a distinct personality that captivates residents
                    and visitors alike. From quaint boutique shops and unique bars & eateries, to
                    lively community events like Ingersoll Live, North of Grand provides a dynamic
                    living experience. Its proximity to downtown Des Moines ensures easy access to
                    cultural attractions, dining options, and employment opportunities, while
                    maintaining a serene residential atmosphere.
                  </p>
                  <strong className="block text-gray-800 text-lg mb-2">Our Mission</strong>
                  <p className="mb-8 leading-relaxed">
                    Our Mission is to strengthen relationships and improve quality of life for all
                    residents and businesses in the North of Grand neighborhood. We commit to
                    enhancing livability and revitalizing our historic neighborhood through
                    opportunities of civic engagement. We advocate on behalf of North of Grand’s
                    diverse residents as a liaison with local governments to preserve and uphold our
                    community’s vibrant characteristics.
                  </p>
                  <h2 className="text-center font-serif text-2xl mt-12 mb-6">
                    Meet Our 2026 Board Members
                  </h2>
                </div>
                <RenderBlocks blocks={layout.slice(1)} />
              </div>
            )}

            {decodedSlug === "yearly-calendar" && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-center font-serif text-4xl mb-6 font-semibold">
                  Yearly Calendar
                </h1>
                <NogInteractive pageSlug="yearly-calendar" />
              </div>
            )}

            {decodedSlug === "archives-and-documents" && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-center font-serif text-4xl mb-6 font-semibold">
                  Archives and Documents
                </h1>
                <NogInteractive pageSlug="archives-and-documents" />
              </div>
            )}

            {decodedSlug === "contact" && (
              <div className="max-w-6xl mx-auto">
                <h1 className="text-center font-serif text-4xl mb-6 font-semibold">Contact Us</h1>
                <NogInteractive pageSlug="contact" />
              </div>
            )}
          </div>
        </article>
      )
    }
  }

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = "home", tenant } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
    tenant,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug, tenant }: { slug: string; tenant: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  // 1. Resolve tenant ID
  const tenantDoc = await payload.find({
    collection: "tenants",
    where: {
      or: [{ slug: { equals: tenant } }, { domain: { equals: tenant } }],
    },
    limit: 1,
  })

  const tenantId = tenantDoc.docs[0]?.id

  // 2. Query page matching slug and tenant ID
  const result = await payload.find({
    collection: "pages",
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      and: [{ slug: { equals: slug } }, ...(tenantId ? [{ tenant: { equals: tenantId } }] : [])],
    },
  })

  return result.docs?.[0] || null
})
