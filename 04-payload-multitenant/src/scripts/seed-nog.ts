/**
 * How to run this script:
 * pnpm tsx src/scripts/seed-nog.ts
 */

import dotenv from "dotenv"
dotenv.config()

import { getPayload } from "payload"

// Helper to construct Lexical Rich Text JSON structure simply
function lexicalRichText(children: any[]): any {
  return {
    root: {
      type: "root",
      children: children,
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  }
}

function richParagraph(text: string): any {
  return {
    type: "paragraph",
    children: [
      {
        type: "text",
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
        text: text,
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

function richHeading(text: string, tag: "h1" | "h2" | "h3" = "h2"): any {
  return {
    type: "heading",
    children: [
      {
        type: "text",
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
        text: text,
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    tag: tag,
    version: 1,
  }
}

// Fetch file with transparent PNG fallback to make seeding bulletproof
async function fetchFile(url: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Status ${res.status}`)
    }
    const data = await res.arrayBuffer()
    const filename = url.split("/").pop()?.split("?")[0] || `file-${Date.now()}`
    const ext = filename.split(".").pop() || "png"
    return {
      name: filename,
      data: Buffer.from(data),
      mimetype: `image/${ext === "jpeg" || ext === "jpg" ? "jpeg" : ext === "webp" ? "webp" : "png"}`,
      size: data.byteLength,
    }
  } catch (error) {
    console.warn(`Error fetching ${url}, using transparent fallback:`, error)
    // 1x1 Transparent PNG
    const dummyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64",
    )
    return {
      name: "placeholder.png",
      data: dummyPng,
      mimetype: "image/png",
      size: dummyPng.byteLength,
    }
  }
}

async function run() {
  const configPromise = (await import("../payload.config")).default
  const config = await configPromise
  const payload = await getPayload({ config })

  payload.logger.info("Initializing Seeding for NOG (North Of Grand)...")

  // Clean up existing NOG admin user if they exist
  const nogAdminEmail = process.env.TENANT_NOG_USERNAME || "admin@nog.blockvibe.org"
  await payload.delete({
    collection: "users",
    where: {
      email: { equals: nogAdminEmail },
    },
  })

  // 1. Clean up existing NOG Tenant data
  const existingTenant = await payload.find({
    collection: "tenants",
    where: {
      slug: { equals: "nog" },
    },
    limit: 1,
  })

  if (existingTenant.docs.length > 0) {
    const tenant = existingTenant.docs[0]
    payload.logger.info(`Cleaning up existing data for NOG Tenant ID: ${tenant.id}...`)

    await payload.delete({
      collection: "pages",
      where: { tenant: { equals: tenant.id } },
      context: { disableRevalidate: true },
    })

    await payload.delete({
      collection: "posts",
      where: { tenant: { equals: tenant.id } },
      context: { disableRevalidate: true },
    })

    await payload.delete({
      collection: "media",
      where: { tenant: { equals: tenant.id } },
    })

    await payload.delete({
      collection: "header",
      where: { tenant: { equals: tenant.id } },
      context: { disableRevalidate: true },
    })

    await payload.delete({
      collection: "footer",
      where: { tenant: { equals: tenant.id } },
      context: { disableRevalidate: true },
    })

    // Find all users linked to this tenant and remove the association first
    const usersToUpdate = await payload.find({
      collection: "users",
      where: {
        "tenants.tenant": { equals: tenant.id },
      },
      limit: 1000,
    })

    for (const user of usersToUpdate.docs) {
      const updatedTenants = (user.tenants || [])
        .map((t: any) =>
          typeof t.tenant === "object" && t.tenant !== null ? t.tenant.id : t.tenant,
        )
        .filter((id) => id !== tenant.id)

      await payload.update({
        collection: "users",
        id: user.id,
        data: {
          tenants: updatedTenants.map((id) => ({ tenant: id })),
        },
      })
    }

    await payload.delete({
      collection: "tenants",
      id: tenant.id,
    })
    payload.logger.info("Old NOG Tenant data cleaned.")
  }

  // 2. Fetch media assets from the live site
  payload.logger.info("Fetching live media assets from northofgranddsm.org...")
  const [
    logoHeaderFile,
    logoFooterFile,
    homePhotoFile,
    boardPhotoFile,
    merch1File,
    merch2File,
    merch3File,
  ] = await Promise.all([
    fetchFile(
      "https://www.northofgranddsm.org/uploads/1/4/1/5/141517828/published/northofgrand-badge-color-blue.png?1723053124",
    ),
    fetchFile(
      "https://www.northofgranddsm.org/uploads/1/4/1/5/141517828/northofgrand-wordmark-color_orig.jpg",
    ),
    fetchFile(
      "https://www.northofgranddsm.org/uploads/1/4/1/5/141517828/editor/10690313-728536740515884-9046556421403047408-n.jpg?1723053527",
    ),
    fetchFile("https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/nog-board_orig.jpg"),
    fetchFile("https://www.northofgranddsm.org/uploads/1/4/1/5/141517828/img-7286_orig.jpg"),
    fetchFile(
      "https://www.northofgranddsm.org/uploads/1/4/1/5/141517828/northofgrand-badge-color-white-1-1_orig.png",
    ),
    fetchFile("https://www.northofgranddsm.org/uploads/1/4/1/5/141517828/img-7444_orig.jpg"),
  ])

  // 3. Create Tenant
  payload.logger.info("Creating NOG Tenant...")
  const tenant = await payload.create({
    collection: "tenants",
    data: {
      name: "North Of Grand Des Moines",
      slug: "nog",
      domain: "www.northofgranddsm.org",
      template: "light",
    },
  })

  // 4. Create tenant-specific admin user & link superadmin
  const nogAdminPassword = process.env.TENANT_NOG_PASSWORD || "password1234"

  payload.logger.info(`Creating NOG Admin User: ${nogAdminEmail}`)
  await payload.create({
    collection: "users",
    data: {
      name: "NOG Admin",
      email: nogAdminEmail,
      password: nogAdminPassword,
      role: "admin",
      status: "approved",
      tenants: [
        {
          tenant: tenant.id,
        },
      ],
    },
  })

  const superAdminEmail = process.env.LOCAL_SUPERADMIN_USERNAME || "eugen8@gmail.com"
  const superAdminUsers = await payload.find({
    collection: "users",
    where: {
      email: { equals: superAdminEmail },
    },
    limit: 1,
  })

  if (superAdminUsers.docs.length > 0) {
    const superAdmin = superAdminUsers.docs[0]
    const currentTenantIds = (superAdmin.tenants || [])
      .map((t: any) => (typeof t.tenant === "object" && t.tenant !== null ? t.tenant.id : t.tenant))
      .filter((id) => id !== tenant.id)

    payload.logger.info(`Mapping Superadmin to NOG Tenant`)
    await payload.update({
      collection: "users",
      id: superAdmin.id,
      data: {
        tenants: [...currentTenantIds.map((id) => ({ tenant: id })), { tenant: tenant.id }],
      },
    })
  }

  // 5. Create media items in Payload
  payload.logger.info("Uploading media items...")
  const [
    logoHeaderDoc,
    logoFooterDoc,
    homePhotoDoc,
    boardPhotoDoc,
    merch1Doc,
    merch2Doc,
    merch3Doc,
  ] = await Promise.all([
    payload.create({
      collection: "media",
      data: { alt: "North of Grand Blue Badge Logo", tenant: tenant.id },
      file: logoHeaderFile,
    }),
    payload.create({
      collection: "media",
      data: { alt: "North of Grand Green Wordmark Logo", tenant: tenant.id },
      file: logoFooterFile,
    }),
    payload.create({
      collection: "media",
      data: { alt: "North of Grand Historic House", tenant: tenant.id },
      file: homePhotoFile,
    }),
    payload.create({
      collection: "media",
      data: { alt: "North of Grand 2026 Board Members", tenant: tenant.id },
      file: boardPhotoFile,
    }),
    payload.create({
      collection: "media",
      data: { alt: "North of Grand Merch T-Shirt", tenant: tenant.id },
      file: merch1File,
    }),
    payload.create({
      collection: "media",
      data: { alt: "North of Grand Badge White Logo", tenant: tenant.id },
      file: merch2File,
    }),
    payload.create({
      collection: "media",
      data: { alt: "North of Grand Merch Mug", tenant: tenant.id },
      file: merch3File,
    }),
  ])

  // 6. Create Pages
  payload.logger.info("Creating pages...")

  // Home Page
  const homeDoc = await payload.create({
    collection: "pages",
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      _status: "published",
      title: "North Of Grand - Home",
      slug: "home",
      tenant: tenant.id,
      hero: {
        type: "none",
      },
      layout: [
        {
          blockName: "Home Intro Content",
          blockType: "content",
          columns: [
            {
              type: "media",
              size: "oneThird",
              media: homePhotoDoc.id,
            },
            {
              type: "text",
              size: "twoThirds",
              richText: lexicalRichText([
                richParagraph(
                  "Welcome to the Historic District of North of Grand. The neighborhood is nestled in the heart of Des Moines, Iowa between 31st & 42nd street from Hwy 235 to Grand Ave.",
                ),
                richHeading("North of Grand Neighborhood Association"),
                richHeading("Mission Statement", "h3"),
                richParagraph(
                  "Our Mission is to strengthen relationships and improve quality of life for all residents and businesses in the North of Grand neighborhood. We commit to enhancing livability and revitalizing our historic neighborhood through opportunities of civic engagement. We advocate on behalf of North of Grand’s diverse residents as a liaison with local governments to preserve and uphold our community’s vibrant characteristics.",
                ),
              ]),
            },
          ],
        },
        {
          blockName: "Upcoming Events Content",
          blockType: "content",
          columns: [
            {
              type: "text",
              size: "full",
              richText: lexicalRichText([
                richHeading("Upcoming Events:"),
                richHeading("NoG Quarterly Meeting: Sunday, May 17th, 4pm-5:30pm", "h3"),
                richParagraph("Tentative Agenda:"),
                richParagraph("1. Welcome and Introductions"),
                richParagraph("2. Summer activities preview with Des Moines Parks and Rec"),
                richParagraph("3. Presentation of NoG Association Board Strategic Plan"),
                richParagraph(
                  "We have a vision for how our neighborhood can improve over the coming years and want to hear from you!",
                ),
                richParagraph("4. Announcement of updated NoG Association structure"),
                richParagraph("5. Community Notes and Event Announcements"),
                richParagraph(
                  "We will also have a live feed of the meeting through the Facebook event.",
                ),
              ]),
            },
          ],
        },
      ],
      meta: {
        title: "North Of Grand - Home",
        description: "Welcome to the Historic District of North of Grand, Des Moines, Iowa.",
      },
    },
  })

  // About Page
  const aboutDoc = await payload.create({
    collection: "pages",
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      _status: "published",
      title: "About - North Of Grand",
      slug: "about",
      tenant: tenant.id,
      hero: {
        type: "none",
      },
      layout: [
        {
          blockName: "About Info Content",
          blockType: "content",
          columns: [
            {
              type: "text",
              size: "full",
              richText: lexicalRichText([
                richParagraph("[SLIDESHOW_PLACEHOLDER]"),
                richHeading("About North of Grand"),
                richParagraph(
                  "Nestled within the vibrant cityscape of Des Moines, Iowa, the North of Grand neighborhood offers a harmonious blend of urban convenience and historic charm. Characterized by tree-lined streets and an eclectic mix of architectural styles, our cozy neighborhood boasts a distinct personality that captivates residents and visitors alike. From quaint boutique shops and unique bars & eateries, to lively community events like Ingersoll Live, North of Grand provides a dynamic living experience. Its proximity to downtown Des Moines ensures easy access to cultural attractions, dining options, and employment opportunities, while maintaining a serene residential atmosphere.",
                ),
                richHeading("Our Mission"),
                richParagraph(
                  "Our Mission is to strengthen relationships and improve quality of life for all residents and businesses in the North of Grand neighborhood. We commit to enhancing livability and revitalizing our historic neighborhood through opportunities of civic engagement. We advocate on behalf of North of Grand’s diverse residents as a liaison with local governments to preserve and uphold our community’s vibrant characteristics.",
                ),
                richHeading("Meet Our 2026 Board Members"),
              ]),
            },
          ],
        },
        {
          blockName: "Board Members Image Block",
          blockType: "content",
          columns: [
            {
              type: "media",
              size: "full",
              media: boardPhotoDoc.id,
            },
          ],
        },
      ],
      meta: {
        title: "About - North Of Grand",
        description:
          "Meet the board members and learn about the mission of North of Grand Des Moines.",
      },
    },
  })

  // Yearly Calendar Page
  const calendarDoc = await payload.create({
    collection: "pages",
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      _status: "published",
      title: "Yearly Calendar - North Of Grand",
      slug: "yearly-calendar",
      tenant: tenant.id,
      hero: {
        type: "none",
      },
      layout: [
        {
          blockName: "Google Calendar Block",
          blockType: "content",
          columns: [
            {
              type: "text",
              size: "full",
              richText: lexicalRichText([
                richHeading("Calendar"),
                richParagraph("[CALENDAR_PLACEHOLDER]"),
                richParagraph("Check out Facebook for detailed descriptions of events."),
              ]),
            },
          ],
        },
      ],
      meta: {
        title: "Yearly Calendar - North Of Grand",
        description: "Check out the North of Grand yearly calendar and events.",
      },
    },
  })

  // Membership Page
  const membershipDoc = await payload.create({
    collection: "pages",
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      _status: "published",
      title: "Membership - North Of Grand",
      slug: "membership",
      tenant: tenant.id,
      hero: {
        type: "none",
      },
      layout: [
        {
          blockName: "Membership Copy Block",
          blockType: "content",
          columns: [
            {
              type: "text",
              size: "full",
              richText: lexicalRichText([
                richHeading("Membership"),
                richParagraph("Individual: $10"),
                richParagraph("Household: $20"),
                richParagraph("Payable though Venmo, Paypal or cash"),
                richHeading("Donations", "h3"),
                richParagraph(
                  "Donations & merchandise purchases help us put on community events such as our Annual Garage Sale and National Night Out. We are really hoping to grow our community engagement opportunities in the future and your participation directly impacts our community.",
                ),
                richHeading("How to Order:", "h3"),
                richParagraph(
                  "Please send an email to northofgrandpresident@gmail.com and request which size and item you'd like to purchase. You can either pay in cash upon pickup or we can send you a Paypal invoice through your email address.",
                ),
                richParagraph("Tshirts $25"),
                richParagraph("Mug $15"),
                richParagraph("Donation $____"),
              ]),
            },
          ],
        },
        {
          blockName: "Merchandise Images Block",
          blockType: "content",
          columns: [
            { type: "media", size: "oneThird", media: merch1Doc.id },
            { type: "media", size: "oneThird", media: merch2Doc.id },
            { type: "media", size: "oneThird", media: merch3Doc.id },
          ],
        },
      ],
      meta: {
        title: "Membership - North Of Grand",
        description: "Support North of Grand by becoming a member or buying merchandise.",
      },
    },
  })

  // Archives and Documents Page
  const archivesDoc = await payload.create({
    collection: "pages",
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      _status: "published",
      title: "Archives and Documents - North Of Grand",
      slug: "archives-and-documents",
      tenant: tenant.id,
      hero: {
        type: "none",
      },
      layout: [
        {
          blockName: "Meeting Minutes & Bylaws Block",
          blockType: "content",
          columns: [
            {
              type: "text",
              size: "full",
              richText: lexicalRichText([
                richHeading("Past Board Meeting Minutes"),
                richParagraph("[DOCUMENTS_PLACEHOLDER]"),
                richHeading("NoG Bylaws (updated 2026)"),
                richParagraph("[BYLAWS_PLACEHOLDER]"),
              ]),
            },
          ],
        },
      ],
      meta: {
        title: "Archives and Documents - North Of Grand",
        description: "Access past board meeting minutes and bylaws for North of Grand association.",
      },
    },
  })

  // Contact Page
  const contactDoc = await payload.create({
    collection: "pages",
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      _status: "published",
      title: "Contact - North Of Grand",
      slug: "contact",
      tenant: tenant.id,
      hero: {
        type: "none",
      },
      layout: [
        {
          blockName: "Contact Section Block",
          blockType: "content",
          columns: [
            {
              type: "text",
              size: "full",
              richText: lexicalRichText([
                richHeading("Contact Us"),
                richParagraph("We look forward to hearing from you!"),
                richParagraph("[CONTACT_PLACEHOLDER]"),
              ]),
            },
          ],
        },
      ],
      meta: {
        title: "Contact - North Of Grand",
        description: "Get in touch with the North of Grand neighborhood association.",
      },
    },
  })

  // 7. Create Header and Footer globals (linked to the newly created pages and logos)
  payload.logger.info("Seeding Header and Footer...")
  await Promise.all([
    payload.create({
      collection: "header",
      context: { disableRevalidate: true },
      data: {
        tenant: tenant.id,
        logoImage: logoHeaderDoc.id,
        navItems: [
          {
            link: {
              type: "reference",
              label: "HOME",
              reference: { relationTo: "pages", value: homeDoc.id },
            },
          },
          {
            link: {
              type: "reference",
              label: "ABOUT",
              reference: { relationTo: "pages", value: aboutDoc.id },
            },
          },
          {
            link: {
              type: "reference",
              label: "YEARLY CALENDAR",
              reference: { relationTo: "pages", value: calendarDoc.id },
            },
          },
          {
            link: {
              type: "reference",
              label: "MEMBERSHIP",
              reference: { relationTo: "pages", value: membershipDoc.id },
            },
          },
          {
            link: {
              type: "reference",
              label: "ARCHIVES AND DOCUMENTS",
              reference: { relationTo: "pages", value: archivesDoc.id },
            },
          },
          {
            link: {
              type: "reference",
              label: "CONTACT",
              reference: { relationTo: "pages", value: contactDoc.id },
            },
          },
        ],
      },
    }),
    payload.create({
      collection: "footer",
      context: { disableRevalidate: true },
      data: {
        tenant: tenant.id,
        logoImage: logoFooterDoc.id,
        navItems: [
          {
            link: {
              type: "custom",
              label: "Admin Portal",
              url: "/admin",
            },
          },
          {
            link: {
              type: "custom",
              label: "Real Website Reference",
              newTab: true,
              url: "https://www.northofgranddsm.org/",
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info("NOG Tenant Seeded Successfully with custom pages and live assets!")
  process.exit(0)
}

run().catch((err) => {
  console.error("Error during NOG seeding:", err)
  if (err && typeof err === "object" && "data" in err) {
    console.error("Validation details:", JSON.stringify((err as any).data, null, 2))
  }
  process.exit(1)
})
