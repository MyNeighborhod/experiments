import dotenv from "dotenv"
dotenv.config()

import { getPayload } from "payload"

async function run() {
  const configPromise = (await import("../payload.config")).default
  const payload = await getPayload({ config: configPromise })

  console.log("Starting seeding of membership categories and contacts...")

  // 1. Fetch Tenants
  const tenantsResult = await payload.find({
    collection: "tenants",
    limit: 100,
  })

  for (const tenant of tenantsResult.docs) {
    console.log(`Processing Tenant: ${tenant.name} (${tenant.slug})`)

    // A. Clean up existing categories for this tenant to prevent duplicates
    const existingCats = await payload.find({
      collection: "member-categories",
      where: { tenant: { equals: tenant.id } },
      limit: 100,
    })

    // Delete existing categories
    for (const cat of existingCats.docs) {
      await payload.delete({
        collection: "member-categories",
        id: cat.id,
      })
    }

    // B. Create Categories
    const resCategory = await payload.create({
      collection: "member-categories",
      data: {
        name: "Resident Member",
        duesAmount: 10,
        duesFrequency: "yearly",
        tenant: tenant.id,
      },
    })

    const busCategory = await payload.create({
      collection: "member-categories",
      data: {
        name: "Business Patron",
        duesAmount: 50,
        duesFrequency: "monthly",
        tenant: tenant.id,
      },
    })

    const volCategory = await payload.create({
      collection: "member-categories",
      data: {
        name: "Volunteer",
        duesAmount: 0,
        duesFrequency: "none",
        tenant: tenant.id,
      },
    })

    console.log(`Created categories for ${tenant.slug}`)

    // C. Clean up existing contacts for this tenant
    const existingContacts = await payload.find({
      collection: "contacts",
      where: { tenant: { equals: tenant.id } },
      limit: 100,
    })

    for (const con of existingContacts.docs) {
      await payload.delete({
        collection: "contacts",
        id: con.id,
      })
    }

    // D. Create Dummy Contacts
    await payload.create({
      collection: "contacts",
      data: {
        name: "John Doe (Resident)",
        email: `john.doe@${tenant.slug}.test`,
        phone: "555-0192",
        category: resCategory.id,
        duesPaidStatus: "paid",
        duesPaidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        tenant: tenant.id,
      },
    })

    await payload.create({
      collection: "contacts",
      data: {
        name: "Jane Smith (Business)",
        email: `jane.smith@${tenant.slug}.test`,
        phone: "555-0183",
        category: busCategory.id,
        duesPaidStatus: "unpaid",
        tenant: tenant.id,
      },
    })

    await payload.create({
      collection: "contacts",
      data: {
        name: "Bob Builder (Volunteer)",
        email: `bob.builder@${tenant.slug}.test`,
        phone: "555-0142",
        category: volCategory.id,
        duesPaidStatus: "paid",
        tenant: tenant.id,
      },
    })

    console.log(`Created contacts for ${tenant.slug}`)
  }

  console.log("Seeding of CRM data complete!")
  process.exit(0)
}

run().catch((err) => {
  console.error("Error during seeding:", err)
  process.exit(1)
})
