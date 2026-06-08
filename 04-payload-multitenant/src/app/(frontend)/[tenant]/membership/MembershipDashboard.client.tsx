"use client"

import React, { useState, useTransition } from "react"
import { payDuesAction, submitSuggestionAction, logoutAction } from "./actions"
import { useRouter } from "next/navigation"

interface Category {
  id: string | number
  name: string
  duesAmount: number
  duesFrequency: string
}

interface Contact {
  id: string | number
  name: string
  email: string
  phone?: string
  duesPaidStatus: "paid" | "unpaid"
  duesPaidUntil?: string
  category: string | number | Category
}

export function MembershipDashboard({
  contact,
  user,
  tenantSlug,
}: {
  contact: Contact
  user: any
  tenantSlug: string
}) {
  const router = useRouter()
  const [suggestionError, setSuggestionError] = useState<string | null>(null)
  const [suggestionSuccess, setSuggestionSuccess] = useState<boolean>(false)
  const [suggestionPending, startSuggestionTransition] = useTransition()
  const [duesPending, startDuesTransition] = useTransition()

  // Extract category details
  const category = contact.category as any
  const categoryName = typeof category === "object" ? category.name : "Resident Member"
  const duesAmount = typeof category === "object" ? category.duesAmount : 10
  const duesFrequency = typeof category === "object" ? category.duesFrequency : "yearly"

  const handlePayDues = async () => {
    if (confirm(`Confirm dues checkout simulation of ${duesAmount} credits?`)) {
      startDuesTransition(async () => {
        const result = await payDuesAction(contact.id)
        if (result?.error) {
          alert(result.error)
        } else if (result?.success) {
          alert("Mock transaction successful! Dues updated.")
          router.refresh()
        }
      })
    }
  }

  const handleSuggestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuggestionError(null)
    setSuggestionSuccess(false)

    const formData = new FormData(e.currentTarget)
    formData.append("tenant", tenantSlug)

    const formEl = e.currentTarget

    startSuggestionTransition(async () => {
      const result = await submitSuggestionAction(null, formData)
      if (result?.error) {
        setSuggestionError(result.error)
      } else if (result?.success) {
        setSuggestionSuccess(true)
        formEl.reset()
      }
    })
  }

  const handleLogout = async () => {
    await logoutAction()
    router.refresh()
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Member Card & Dues Status */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm flex flex-col justify-between h-fit">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-wide text-foreground">MEMBER PROFILE</h2>
              <span className="text-[10px] tracking-wider font-semibold uppercase bg-primary/20 text-primary-foreground px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>
            
            <div className="space-y-4 text-sm mb-6">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name</span>
                <span className="font-semibold text-foreground">{contact.name}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{contact.email}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tier Category</span>
                <span className="font-semibold text-foreground">{categoryName}</span>
              </div>
              {duesFrequency !== "none" && (
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dues Rate</span>
                  <span className="font-medium text-foreground">{duesAmount} credits / {duesFrequency}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full border border-border hover:bg-muted font-semibold py-2 rounded transition-all text-xs tracking-wider uppercase text-foreground"
          >
            LOG OUT
          </button>
        </div>

        {/* Dues Status Block */}
        {duesFrequency !== "none" && (
          <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold tracking-wider uppercase mb-4 text-muted-foreground">Dues Status</h3>
            
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-4 h-4 rounded-full ${
                  contact.duesPaidStatus === "paid" ? "bg-success" : "bg-error"
                }`}
              />
              <span className="font-semibold tracking-wide uppercase text-sm text-foreground">
                {contact.duesPaidStatus === "paid" ? "PAID" : "UNPAID"}
              </span>
            </div>

            {contact.duesPaidStatus === "paid" && contact.duesPaidUntil && (
              <p className="text-xs text-muted-foreground mb-4">
                Dues covered until:{" "}
                <span className="font-medium text-foreground">
                  {new Date(contact.duesPaidUntil).toLocaleDateString()}
                </span>
              </p>
            )}

            {contact.duesPaidStatus === "unpaid" && (
              <button
                type="button"
                onClick={handlePayDues}
                disabled={duesPending}
                className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-2 rounded transition-all text-sm tracking-wide disabled:opacity-50"
              >
                {duesPending ? "Processing..." : `PAY DUES (${duesAmount} CREDITS)`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Suggestion Box & Features */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-card border border-border p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold tracking-wide text-foreground mb-2">SUGGESTIONS BOX</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Submit your feedback, issues, or suggestions to the neighborhood council. Your input helps us make the community better!
          </p>

          {/* Form Actions Alerts */}
          {suggestionSuccess && (
            <div className="mb-6 p-4 bg-success/15 border border-success/30 text-success rounded-md text-sm">
              Suggestion submitted successfully! Thank you for your feedback.
            </div>
          )}

          {suggestionError && (
            <div className="mb-6 p-4 bg-error/15 border border-error/30 text-error rounded-md text-sm">
              {suggestionError}
            </div>
          )}

          <form onSubmit={handleSuggestionSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Subject
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Broken moisture condenser at Sector 4"
                className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Detailed Message
              </label>
              <textarea
                name="message"
                required
                rows={6}
                placeholder="Describe the issue or suggestion in detail..."
                className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={suggestionPending}
              className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded transition-all text-sm tracking-wide disabled:opacity-50"
            >
              {suggestionPending ? "Submitting..." : "SUBMIT FEEDBACK"}
            </button>
          </form>
        </div>

        {/* Future Social Platform Placeholder */}
        <div className="bg-card border border-border p-8 rounded-lg shadow-sm opacity-60 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary/20 text-primary-foreground px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-bl">
            Coming Soon
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">COMMUNITY CHAT & SOCIAL</h3>
          <p className="text-sm text-muted-foreground">
            A future update will introduce localized community feeds, coordinate sharing, trade listings, and direct messaging for approved residents. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
}
