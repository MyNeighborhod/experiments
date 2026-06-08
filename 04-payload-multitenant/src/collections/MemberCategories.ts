import type { CollectionConfig } from "payload"
import { isSuperAdmin, isApproved, getUserTenantIds } from "../access/roles"

export const MemberCategories: CollectionConfig = {
  slug: "member-categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "duesAmount", "duesFrequency", "updatedAt"],
  },
  access: {
    read: ({ req: { user } }) => {
      // Anyone can read categories, but scoping restricts them to the active tenant.
      if (!user) return true
      if (isSuperAdmin(user)) return true
      
      const tenantIds = getUserTenantIds(user)
      if (tenantIds.length === 0) return true // Allow reading for anonymous signups
      return {
        tenant: {
          in: tenantIds,
        },
      } as any
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true
      return isApproved(user) && (user as any).role === "admin"
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true
      if (isApproved(user) && (user as any).role === "admin") {
        const tenantIds = getUserTenantIds(user)
        return {
          tenant: {
            in: tenantIds,
          },
        } as any
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true
      if (isApproved(user) && (user as any).role === "admin") {
        const tenantIds = getUserTenantIds(user)
        return {
          tenant: {
            in: tenantIds,
          },
        } as any
      }
      return false
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        placeholder: "e.g. Standard Resident, Business Sponsor, Volunteer",
      },
    },
    {
      name: "duesAmount",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "The amount of dues (in credits or local currency) associated with this category.",
      },
    },
    {
      name: "duesFrequency",
      type: "select",
      required: true,
      defaultValue: "none",
      options: [
        { label: "Monthly", value: "monthly" },
        { label: "Yearly", value: "yearly" },
        { label: "None (Free)", value: "none" },
      ],
    },
    {
      name: "isDefault",
      type: "checkbox",
      label: "Default Category for New Signups",
      defaultValue: false,
      admin: {
        description: "If checked, new members who register on the portal will automatically be assigned this category.",
      },
    },
  ],
}
