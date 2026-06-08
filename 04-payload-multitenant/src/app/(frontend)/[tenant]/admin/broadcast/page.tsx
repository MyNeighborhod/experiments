import type { Metadata } from "next"
import React from "react"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { getPayload } from "payload"
import configPromise from "@payload-config"

import { BroadcastForm } from "./BroadcastForm.client"

type PageProps = {
  params: Promise<{
    tenant: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { tenant: tenantSlug } = await params
  const payload = await getPayload({ config: configPromise })

  // 1. Resolve tenant ID
  const tenantDoc = await payload.find({
    collection: "tenants",
    where: {
      or: [{ slug: { equals: tenantSlug } }, { domain: { equals: tenantSlug } }],
    },
    limit: 1,
  })

  const tenant = tenantDoc.docs[0] || null

  // Trigger 404 if the requested tenant does not exist in the database (ignoring default fallback)
  if (tenantSlug !== "default" && !tenant) {
    return notFound()
  }

  // 2. Fetch authenticated user
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    // Redirect unauthenticated users to the membership login portal
    redirect(`/${tenantSlug}/membership`)
  }

  // 3. Verify admin permissions
  const isTenantAdmin =
    user.role === "admin" &&
    user.tenants?.some((t: any) => {
      const id = typeof t.tenant === "object" ? t.tenant.id : t.tenant
      return String(id) === String(tenant?.id)
    })
  const isGlobalAdmin = user.role === "superadmin"

  if (!isTenantAdmin && !isGlobalAdmin) {
    return (
      <article className="pt-24 pb-32 min-h-[60vh]">
        <div className="container max-w-md text-center py-12 bg-card border border-border rounded-lg shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-wide uppercase text-error mb-4">
            ACCESS DENIED
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            You do not have administrative privileges to access the email broadcast dashboard for this neighborhood.
          </p>
          <a
            href={`/${tenantSlug}/membership`}
            className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded transition-all text-sm tracking-wide"
          >
            GO TO PORTAL
          </a>
        </div>
      </article>
    )
  }

  // 4. Query categories scoped to this tenant
  const categoriesDoc = await payload.find({
    collection: "member-categories",
    where: tenant ? { tenant: { equals: tenant.id } } : undefined,
    limit: 100,
  })

  const categories = categoriesDoc.docs.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
  }))

  return (
    <article className="pt-16 pb-24 min-h-[70vh]">
      <div className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-wide uppercase mb-3 text-foreground">
            EMAIL BROADCASTS
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Compose and dispatch email announcements to the residents and businesses of {tenant?.name || "BlockVibe"}.
          </p>
        </div>

        <BroadcastForm categories={categories} tenantSlug={tenantSlug} />
      </div>
    </article>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant: tenantSlug } = await params
  return {
    title: `Admin Broadcast - ${tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}`,
    description: "Send email broadcasts to your neighborhood members.",
  }
}
