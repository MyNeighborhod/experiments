import type { Metadata } from "next"
import React from "react"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getPayload } from "payload"
import configPromise from "@payload-config"

import { MembershipAuthForm } from "./MembershipAuthForm.client"
import { MembershipDashboard } from "./MembershipDashboard.client"

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

  // 3. Verify user belongs to this tenant if logged in
  let loggedInAndAuthorized = false
  let memberContact: any = null

  if (user) {
    const belongsToTenant =
      user.role === "superadmin" ||
      user.tenants?.some((t: any) => {
        const id = typeof t.tenant === "object" ? t.tenant.id : t.tenant
        return String(id) === String(tenant?.id)
      })

    if (belongsToTenant) {
      loggedInAndAuthorized = true

      // Find contact record linked to this user
      const contacts = await payload.find({
        collection: "contacts",
        where: {
          and: [
            { user: { equals: user.id } },
            ...(tenant ? [{ tenant: { equals: tenant.id } }] : []),
          ],
        },
        limit: 1,
      })

      if (contacts.docs.length > 0) {
        memberContact = contacts.docs[0]
      } else {
        // Fallback: If no contact exists (e.g. an admin logging in), create one dynamically on the fly
        // Find default category
        const categories = await payload.find({
          collection: "member-categories",
          where: tenant ? { tenant: { equals: tenant.id } } : undefined,
          limit: 1,
        })
        const categoryId = categories.docs[0]?.id

        if (categoryId) {
          memberContact = await payload.create({
            collection: "contacts",
            data: {
              name: user.name || "Anonymous Member",
              email: user.email,
              category: categoryId,
              user: user.id,
              tenant: tenant?.id,
              duesPaidStatus: "unpaid",
            },
          })
        }
      }
    }
  }

  return (
    <article className="pt-16 pb-24 min-h-[70vh]">
      <div className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-wide uppercase mb-3 text-foreground">
            MEMBERSHIP PORTAL
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {loggedInAndAuthorized
              ? `Welcome back to the ${tenant?.name || "BlockVibe"} member portal.`
              : `Access your local neighborhood portal to pay dues, suggest improvements, and get updates.`}
          </p>
        </div>

        {loggedInAndAuthorized && memberContact ? (
          <MembershipDashboard contact={memberContact} user={user} tenantSlug={tenantSlug} />
        ) : (
          <MembershipAuthForm tenantSlug={tenantSlug} />
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant: tenantSlug } = await params
  return {
    title: `Membership - ${tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}`,
    description: "Pay dues and submit feedback to the neighborhood association.",
  }
}
