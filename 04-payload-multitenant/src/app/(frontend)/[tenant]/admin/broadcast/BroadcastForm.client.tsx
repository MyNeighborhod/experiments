"use client"

import React, { useState, useTransition } from "react"
import { sendBroadcastAction } from "./actions"

interface Category {
  id: string | number
  name: string
}

export function BroadcastForm({
  categories,
  tenantSlug,
}: {
  categories: Category[]
  tenantSlug: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleBroadcastSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const formData = new FormData(e.currentTarget)
    formData.append("tenant", tenantSlug)

    const formEl = e.currentTarget

    if (confirm("Are you sure you want to dispatch this email broadcast to all selected contacts?")) {
      startTransition(async () => {
        const result = await sendBroadcastAction(null, formData)
        if (result?.error) {
          setError(result.error)
        } else if (result?.success) {
          setSuccessMessage(result.message || "Broadcast successfully sent!")
          formEl.reset()
        }
      })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-card border border-border p-8 rounded-lg shadow-md">
      {/* Dynamic Alerts */}
      {successMessage && (
        <div className="mb-6 p-4 bg-success/15 border border-success/30 text-success rounded-md text-sm">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-error/15 border border-error/30 text-error rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleBroadcastSubmit} className="space-y-6">
        {/* Recipient Targeting Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Target Member Category
            </label>
            <select
              name="category"
              className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="all" className="bg-background text-foreground">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Dues Payment Status
            </label>
            <select
              name="duesStatus"
              className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="all" className="bg-background text-foreground">All Statuses</option>
              <option value="paid" className="bg-background text-foreground">Dues Paid Only</option>
              <option value="unpaid" className="bg-background text-foreground">Dues Unpaid Only</option>
            </select>
          </div>
        </div>

        {/* Composer Fields */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            required
            placeholder="e.g. Neighborhood Clean Up Day - Next Saturday"
            className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Message Body (Plain Text / White-space Preserved)
          </label>
          <textarea
            name="body"
            required
            rows={12}
            placeholder="Type your announcement content here..."
            className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none text-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded transition-all text-sm tracking-wide disabled:opacity-50"
        >
          {isPending ? "DISPATCHING BROADCAST..." : "SEND BROADCAST EMAIL"}
        </button>
      </form>
    </div>
  )
}
