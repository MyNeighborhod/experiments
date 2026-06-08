"use server"

import { headers } from "next/headers"
import configPromise from "@payload-config"
import { getPayload } from "payload"

import nodemailer from "nodemailer"

// 1. Resolve Tenant ID helper
async function getTenantIdBySlug(payload: any, slug: string) {
  const tenants = await payload.find({
    collection: "tenants",
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return tenants.docs[0]?.id || null
}

// 2. Admin Broadcast Email Action
export async function sendBroadcastAction(prevState: any, formData: FormData) {
  const subject = formData.get("subject") as string
  const body = formData.get("body") as string
  const categoryFilter = formData.get("category") as string // "all" or ID
  const duesFilter = formData.get("duesStatus") as string // "all", "paid", "unpaid"
  const tenantSlug = formData.get("tenant") as string

  if (!subject || !body) {
    return { error: "Please fill out both the subject and the message body." }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    // A. Resolve tenant
    const tenantId = await getTenantIdBySlug(payload, tenantSlug)
    if (!tenantId) {
      return { error: "Tenant not found." }
    }

    // B. Verify admin permissions
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) {
      return { error: "You must be logged in to send broadcasts." }
    }

    const isTenantAdmin =
      user.role === "admin" &&
      user.tenants?.some((t: any) => {
        const id = typeof t.tenant === "object" ? t.tenant.id : t.tenant
        return String(id) === String(tenantId)
      })
    const isGlobalAdmin = user.role === "superadmin"

    if (!isTenantAdmin && !isGlobalAdmin) {
      return { error: "Unauthorized. Admin status required for this tenant." }
    }

    // C. Query matching contacts
    const whereConstraints: any[] = [{ tenant: { equals: tenantId } }]

    if (categoryFilter !== "all") {
      whereConstraints.push({ category: { equals: categoryFilter } })
    }

    if (duesFilter !== "all") {
      whereConstraints.push({ duesPaidStatus: { equals: duesFilter } })
    }

    const contacts = await payload.find({
      collection: "contacts",
      where: {
        and: whereConstraints,
      },
      limit: 5000,
    })

    if (contacts.docs.length === 0) {
      return { error: "No matching contacts found for the selected criteria." }
    }

    // D. Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "127.0.0.1",
      port: Number(process.env.SMTP_PORT || 1025),
      secure: false,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    })

    // E. Send emails
    let successCount = 0
    let failCount = 0

    for (const contact of contacts.docs) {
      if (!contact.email) continue

      try {
        await transporter.sendMail({
          from: `"BlockVibe Alerts" <alerts@blockvibe.org>`,
          to: contact.email,
          subject: subject,
          html: `
            <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
              <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #0f172a;">${subject}</h2>
              <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px; color: #334155; white-space: pre-wrap;">${body}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 11px; text-align: center; color: #64748b; line-height: 1.5;">
                This announcement was broadcasted by your local community association.<br />
                You are receiving this at ${contact.email} because you are in the resident/business directory.
              </p>
            </div>
          `,
        })
        successCount++
      } catch (err) {
        console.error(`Failed to send broadcast to ${contact.email}:`, err)
        failCount++
      }
    }

    return {
      success: true,
      message: `Broadcast complete! Successfully sent to ${successCount} contact(s).${
        failCount > 0 ? ` Failed to send to ${failCount} contact(s).` : ""
      }`,
    }
  } catch (error: any) {
    console.error("Broadcast error:", error)
    return { error: "Failed to dispatch email broadcast. Please verify mailer settings." }
  }
}
