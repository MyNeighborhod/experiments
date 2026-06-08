import type { CollectionConfig } from "payload"
import { isSuperAdmin, isApproved, getUserTenantIds } from "../access/roles"

export const Suggestions: CollectionConfig = {
  slug: "suggestions",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "user", "status", "updatedAt"],
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

      // Members can only view their own suggestions
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
      // Any authenticated user can create suggestions
      return !!user
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true

      const tenantIds = getUserTenantIds(user)
      if (tenantIds.length === 0) return false

      // Only tenant admins can mark suggestions as read/archived
      if ((user as any).role === "admin") {
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
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      type: "textarea",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: {
        description: "The member who submitted this suggestion.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "unread",
      options: [
        { label: "Unread", value: "unread" },
        { label: "Read", value: "read" },
        { label: "Archived", value: "archived" },
      ],
    },
  ],
}
