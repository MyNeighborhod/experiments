import type { CollectionConfig } from "payload"

import { isApproved, usersRead, usersCreate, usersUpdate, usersDelete } from "../../access/roles"
import { usersBeforeChangeHook } from "./beforeChange"

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: ({ req: { user } }) => isApproved(user),
    create: usersCreate,
    delete: usersDelete,
    read: usersRead,
    update: usersUpdate,
  },
  admin: {
    defaultColumns: ["name", "email", "role", "status"],
    useAsTitle: "name",
  },
  auth: true,
  hooks: {
    beforeChange: [usersBeforeChangeHook],
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      defaultValue: "contributor",
      options: [
        { label: "Super Admin", value: "superadmin" },
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Contributor", value: "contributor" },
      ],
      admin: {
        description: "Access level control for user permissions.",
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending Approval", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
      admin: {
        description: "Approval status for registration staging area.",
      },
    },
  ],
  timestamps: true,
}
