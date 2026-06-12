import { headers } from "next/headers"
import React from "react"
import PageTemplate, { generateMetadata as originalGenerateMetadata } from "./[slug]/page"
import { BlockVibeLandingPage } from "./BlockVibeLandingPage"

type Args = {
  params: Promise<{
    tenant: string
  }>
}

export default async function Page(props: Args) {
  const headerList = await headers()
  const host = headerList.get("host") || ""
  const hostname = host.split(":")[0]

  const isPlatformLanding =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "blockvibe.org" ||
    hostname === "info.blockvibe.org"

  if (isPlatformLanding) {
    return <BlockVibeLandingPage />
  }

  // Otherwise, fall back to the NOG / tenant CMS homepage
  const params = await props.params
  return <PageTemplate params={Promise.resolve({ ...params, slug: "home" })} />
}

export async function generateMetadata(props: Args) {
  const headerList = await headers()
  const host = headerList.get("host") || ""
  const hostname = host.split(":")[0]

  const isPlatformLanding =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "blockvibe.org" ||
    hostname === "info.blockvibe.org"

  if (isPlatformLanding) {
    return {
      title: "BlockVibe - Operating System for Neighborhood Associations",
      description:
        "One platform for your neighborhood: website, member directory, email, polls, and recurring support.",
    }
  }

  const params = await props.params
  return originalGenerateMetadata({ params: Promise.resolve({ ...params, slug: "home" }) })
}

