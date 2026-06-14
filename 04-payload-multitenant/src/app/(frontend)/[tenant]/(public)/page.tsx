import React from "react"
import PageTemplate, { generateMetadata as originalGenerateMetadata } from "./[slug]/page"
import { BlockVibeLandingPage } from "./BlockVibeLandingPage"

type Args = {
  params: Promise<{
    tenant: string
  }>
}

export default async function Page(props: Args) {
  const params = await props.params
  const tenant = params.tenant

  if (tenant === "default") {
    return <BlockVibeLandingPage />
  }

  // Otherwise, fall back to the NOG / tenant CMS homepage
  return <PageTemplate params={Promise.resolve({ ...params, slug: "home" })} />
}

export async function generateMetadata(props: Args) {
  const params = await props.params
  const tenant = params.tenant

  if (tenant === "default") {
    return {
      title: "BlockVibe - Operating System for Neighborhood Associations",
      description:
        "One platform for your neighborhood: website, member directory, email, polls, and recurring support.",
    }
  }

  return originalGenerateMetadata({ params: Promise.resolve({ ...params, slug: "home" }) })
}
