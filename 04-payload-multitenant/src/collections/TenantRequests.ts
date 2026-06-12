import type { CollectionConfig } from "payload"
import { isSuperAdmin } from "../access/roles"

export const TenantRequests: CollectionConfig = {
  slug: "tenant-requests",
  access: {
    create: () => true,
    read: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  admin: {
    useAsTitle: "tenantName",
    defaultColumns: ["tenantName", "email", "phone", "status", "createdAt"],
  },
  fields: [
    {
      name: "tenantName",
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
      required: true,
    },
    {
      name: "address",
      type: "text",
      required: true,
    },
    {
      name: "website",
      type: "text",
      required: false,
    },
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
      required: true,
    },
  ],
  timestamps: true,
}
