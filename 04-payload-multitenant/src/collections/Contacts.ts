import type { CollectionConfig } from "payload"
import { isSuperAdmin, isApproved, getUserTenantIds } from "../access/roles"

export const Contacts: CollectionConfig = {
  slug: "contacts",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "category", "duesPaidStatus", "updatedAt"],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true

      const tenantIds = getUserTenantIds(user)
      if (tenantIds.length === 0) return false

      const tenantConstraint = {
        tenant: {
          in: tenantIds,
        },
      }

      const role = (user as any).role
      if (role === "admin" || role === "editor" || role === "superadmin") {
        return tenantConstraint as any
      }

      // Registered members can only read their own contact record
      return {
        and: [
          tenantConstraint,
          {
            user: {
              equals: user.id,
            },
          },
        ],
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

      const tenantIds = getUserTenantIds(user)
      if (tenantIds.length === 0) return false

      const tenantConstraint = {
        tenant: {
          in: tenantIds,
        },
      }

      const role = (user as any).role
      if (role === "admin") {
        return tenantConstraint as any
      }

      // Members can update their own contact information
      return {
        and: [
          tenantConstraint,
          {
            user: {
              equals: user.id,
            },
          },
        ],
      } as any
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
    },
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "member-categories",
      required: true,
      hasMany: false,
    },
    {
      name: "duesPaidStatus",
      type: "select",
      required: true,
      defaultValue: "unpaid",
      options: [
        { label: "Unpaid", value: "unpaid" },
        { label: "Paid", value: "paid" },
      ],
    },
    {
      name: "duesPaidUntil",
      type: "date",
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      hasMany: false,
      admin: {
        description: "Linked user account for logging in online.",
      },
    },
  ],
}
