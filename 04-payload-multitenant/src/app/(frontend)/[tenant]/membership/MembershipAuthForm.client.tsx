"use client"

import React, { useState, useTransition } from "react"
import { loginAction, signupAction } from "./actions"
import { useRouter } from "next/navigation"

export function MembershipAuthForm({ tenantSlug }: { tenantSlug: string }) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.append("tenant", tenantSlug)

    startTransition(async () => {
      let result
      if (activeTab === "login") {
        result = await loginAction(null, formData)
      } else {
        result = await signupAction(null, formData)
      }

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.refresh()
      }
    })
  }

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border p-8 rounded-lg shadow-md">
      {/* Tabs Header */}
      <div className="flex border-b border-border mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("login")
            setError(null)
          }}
          className={`flex-1 pb-3 text-center text-sm font-semibold tracking-wide border-b-2 transition-all outline-none ${
            activeTab === "login"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          LOG IN
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("signup")
            setError(null)
          }}
          className={`flex-1 pb-3 text-center text-sm font-semibold tracking-wide border-b-2 transition-all outline-none ${
            activeTab === "signup"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          SIGN UP
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-error/15 border border-error/30 text-error rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleAuthSubmit} className="space-y-4">
        {activeTab === "signup" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Luke Skywalker"
              className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="e.g. luke@tatooine.com"
            className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 bg-primary text-primary-foreground font-semibold py-2.5 rounded transition-all text-sm tracking-wide disabled:opacity-50"
        >
          {isPending
            ? activeTab === "login"
              ? "Logging in..."
              : "Creating account..."
            : activeTab === "login"
              ? "LOG IN"
              : "SIGN UP"}
        </button>
      </form>
    </div>
  )
}
