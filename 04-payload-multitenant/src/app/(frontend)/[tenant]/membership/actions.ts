"use server"

import { cookies, headers } from "next/headers"
import configPromise from "@payload-config"
import { getPayload } from "payload"
import { getServerSideURL } from "@/utilities/getURL"

// 1. Resolve Tenant ID by slug helper
async function getTenantIdBySlug(payload: any, slug: string) {
  const tenants = await payload.find({
    collection: "tenants",
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return tenants.docs[0]?.id || null
}

// 2. Member Login Action
export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const tenantSlug = formData.get("tenant") as string

  if (!email || !password) {
    return { error: "Please enter your email and password." }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const tenantId = await getTenantIdBySlug(payload, tenantSlug)

    // Authenticate using Payload REST login endpoint to retrieve token
    const serverUrl = getServerSideURL()
    const loginResponse = await fetch(`${serverUrl}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const loginData = await loginResponse.json()

    if (!loginResponse.ok || !loginData.token) {
      return { error: loginData.errors?.[0]?.message || "Invalid email or password." }
    }

    // Verify user role & tenant permissions
    const user = loginData.user
    if (user.role === "member") {
      const belongsToTenant = user.tenants?.some((t: any) => {
        const id = typeof t.tenant === "object" ? t.tenant.id : t.tenant
        return String(id) === String(tenantId)
      })

      if (!belongsToTenant) {
        return { error: "This account is not registered to this neighborhood." }
      }
    }

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("payload-token", loginData.token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: loginData.exp || 7200,
    })

    return { success: true }
  } catch (error: any) {
    console.error("Login Error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

// 3. Member Sign Up Action
export async function signupAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const tenantSlug = formData.get("tenant") as string

  if (!name || !email || !password) {
    return { error: "Please fill in all fields." }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const tenantId = await getTenantIdBySlug(payload, tenantSlug)

    if (!tenantId) {
      return { error: "Tenant not found." }
    }

    // 1. Check if user already exists
    const existingUsers = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existingUsers.docs.length > 0) {
      return { error: "An account with this email already exists." }
    }

    // 2. Create the User record (approved frontend Member role)
    const newUser = await payload.create({
      collection: "users",
      data: {
        name,
        email,
        password,
        role: "member",
        status: "approved",
        tenants: [{ tenant: tenantId }],
      },
    })

    // 3. Check for existing contact
    const existingContacts = await payload.find({
      collection: "contacts",
      where: {
        and: [{ email: { equals: email } }, { tenant: { equals: tenantId } }],
      },
      limit: 1,
    })

    if (existingContacts.docs.length > 0) {
      // Link user to existing contact
      await payload.update({
        collection: "contacts",
        id: existingContacts.docs[0].id,
        data: {
          user: newUser.id,
        },
      })
    } else {
      // Find or create default category
      let defaultCategory: any = null
      
      // First try to find category marked as default
      const defaultCategories = await payload.find({
        collection: "member-categories",
        where: {
          and: [
            { tenant: { equals: tenantId } },
            { isDefault: { equals: true } },
          ],
        },
        limit: 1,
      })

      if (defaultCategories.docs.length > 0) {
        defaultCategory = defaultCategories.docs[0].id
      } else {
        // Fallback to any category
        const categories = await payload.find({
          collection: "member-categories",
          where: { tenant: { equals: tenantId } },
          limit: 1,
        })

        if (categories.docs.length > 0) {
          defaultCategory = categories.docs[0].id
        } else {
          // Create a default category if none exists
          const newCat = await payload.create({
            collection: "member-categories",
            data: {
              name: "Resident Member",
              duesAmount: 10,
              duesFrequency: "yearly",
              isDefault: true,
              tenant: tenantId,
            },
          })
          defaultCategory = newCat.id
        }
      }

      // Create new linked Contact
      await payload.create({
        collection: "contacts",
        data: {
          name,
          email,
          category: defaultCategory,
          user: newUser.id,
          tenant: tenantId,
          duesPaidStatus: "unpaid",
        },
      })
    }

    // 4. Log in immediately
    const serverUrl = getServerSideURL()
    const loginResponse = await fetch(`${serverUrl}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const loginData = await loginResponse.json()

    if (loginResponse.ok && loginData.token) {
      const cookieStore = await cookies()
      cookieStore.set("payload-token", loginData.token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: loginData.exp || 7200,
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Signup Error:", error)
    return { error: error.message || "Failed to register account." }
  }
}

// 4. Pay Dues Action (Simulated)
export async function payDuesAction(contactId: string | number) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      return { error: "You must be logged in to pay dues." }
    }

    // Verify contact belongs to user
    const contact = await payload.findByID({
      collection: "contacts",
      id: contactId,
    })

    if (!contact.user) {
      return { error: "Unauthorized." }
    }

    const contactUserId = typeof contact.user === "object" ? (contact.user as any).id : contact.user
    if (String(contactUserId) !== String(user.id)) {
      return { error: "Unauthorized." }
    }

    // Set dues status to paid and paidUntil to 1 year from now
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    await payload.update({
      collection: "contacts",
      id: contactId,
      data: {
        duesPaidStatus: "paid",
        duesPaidUntil: oneYearFromNow.toISOString(),
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("Dues payment error:", error)
    return { error: "Failed to update dues status." }
  }
}

// 5. Submit Suggestion Action
export async function submitSuggestionAction(prevState: any, formData: FormData) {
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const tenantSlug = formData.get("tenant") as string

  if (!title || !message) {
    return { error: "Please fill out both the subject and the message." }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      return { error: "You must be logged in to submit suggestions." }
    }

    const tenantId = await getTenantIdBySlug(payload, tenantSlug)
    if (!tenantId) {
      return { error: "Tenant not found." }
    }

    await payload.create({
      collection: "suggestions",
      data: {
        title,
        message,
        user: user.id,
        tenant: tenantId,
        status: "unread",
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("Suggestion submission error:", error)
    return { error: "Failed to submit suggestion." }
  }
}

// 6. Logout Action
export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("payload-token")
  return { success: true }
}
