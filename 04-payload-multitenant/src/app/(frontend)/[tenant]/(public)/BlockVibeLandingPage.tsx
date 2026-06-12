"use client"

import React, { useState, useEffect } from "react"
import {
  Rocket,
  Globe,
  Users,
  Mail,
  Vote,
  Heart,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

export function BlockVibeLandingPage() {
  const [formData, setFormData] = useState({
    tenantName: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    captchaAnswer: "",
  })

  const [captcha, setCaptcha] = useState<{ text: string; token: string } | null>(null)
  const [loadingCaptcha, setLoadingCaptcha] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const [nogUrl, setNogUrl] = useState("http://nog.localhost:3000")

  // Resolve current host to build the correct NOG example link
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      const port = window.location.port
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        setNogUrl(`http://nog.localhost:${port || "3000"}`)
      } else {
        // If blockvibe.org or info.blockvibe.org
        const domain = hostname.endsWith("blockvibe.org") ? "blockvibe.org" : hostname
        setNogUrl(`http://nog.${domain}`)
      }
    }
  }, [])

  const fetchCaptcha = async () => {
    setLoadingCaptcha(true)
    try {
      const res = await fetch("/next/tenant-request")
      if (res.ok) {
        const data = await res.json()
        setCaptcha(data)
      } else {
        console.error("Failed to load captcha challenge")
      }
    } catch (err) {
      console.error("Error loading captcha:", err)
    } finally {
      setLoadingCaptcha(false)
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "captchaAnswer" ? value.trim() : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captcha) return

    setSubmitting(true)
    setStatus({ type: null, message: "" })

    try {
      const res = await fetch("/next/tenant-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          captchaToken: captcha.token,
        }),
      })

      const result = await res.json()

      if (res.ok && result.success) {
        setStatus({
          type: "success",
          message: "Thank you! Your neighborhood request has been submitted successfully.",
        })
        setFormData({
          tenantName: "",
          email: "",
          phone: "",
          address: "",
          website: "",
          captchaAnswer: "",
        })
        setCaptcha(null)
      } else {
        setStatus({
          type: "error",
          message: result.error || "Failed to submit request.",
        })
        // Refresh with new captcha if sent back by server
        if (result.newCaptcha) {
          setCaptcha(result.newCaptcha)
          setFormData((prev) => ({ ...prev, captchaAnswer: "" }))
        } else {
          fetchCaptcha()
        }
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "A network error occurred. Please try again.",
      })
      fetchCaptcha()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white text-gray-900 py-12 md:py-20">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-full text-gray-900 mb-6">
            <Rocket className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            One platform for your neighborhood
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            BlockVibe provides neighborhood associations with the digital tools they need to connect
            residents, build community trust, run democratic polls, and secure support.
          </p>
        </div>

        {/* Example Site Link Box */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 text-center mb-16 max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-2">See BlockVibe in Action</h2>
          <p className="text-sm text-gray-600 mb-4">
            Explore our showcase site modeled for the North of Grand neighborhood in Des Moines, Iowa.
          </p>
          <a
            href={nogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-900 text-sm font-semibold rounded text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Visit Example Site <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 bg-gray-100 rounded text-gray-900">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Modern Site Builder</h3>
              <p className="text-sm text-gray-600">
                Launch a clean public website for your association with custom themes, static pages,
                contact forms, and layouts.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 bg-gray-100 rounded text-gray-900">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Resident CRM & Directory</h3>
              <p className="text-sm text-gray-600">
                Maintain a secure registry of neighbors, track registered members vs mailing contacts,
                and manage roles in one workspace.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 bg-gray-100 rounded text-gray-900">
                <Mail className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Email Broadcaster</h3>
              <p className="text-sm text-gray-600">
                Compose and send announcements directly to your verified neighborhood contact list using
                AWS SES.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 bg-gray-100 rounded text-gray-900">
                <Vote className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Democratic Voting</h3>
              <p className="text-sm text-gray-600">
                Run secure board elections, budget approvals, and community opinion polls with one ballot
                per member rules.
              </p>
            </div>
          </div>

          <div className="flex gap-4 md:col-span-2 max-w-xl mx-auto md:mt-2">
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 bg-gray-100 rounded text-gray-900">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">Lightweight Support Drives</h3>
              <p className="text-sm text-gray-600">
                Accept annual or monthly contributions directly into your association's own PayPal
                account without platform fees.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action & Form Section */}
        <div id="try" className="border-t border-gray-200 pt-16 max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request a BlockVibe Space</h2>
            <p className="text-sm text-gray-600">
              Ready to bring BlockVibe to your neighborhood? Submit your info below and our team will
              reach out to set up your subdomain.
            </p>
          </div>

          {status.type === "success" ? (
            <div className="bg-green-50 border border-green-200 rounded p-6 text-center text-green-800">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="font-bold text-lg mb-1">Request Submitted!</p>
              <p className="text-sm">{status.message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status.type === "error" && (
                <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800 flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p>{status.message}</p>
                </div>
              )}

              <div>
                <label htmlFor="tenantName" className="block text-sm font-semibold text-gray-800 mb-1">
                  Neighborhood / Tenant Name *
                </label>
                <input
                  type="text"
                  id="tenantName"
                  name="tenantName"
                  value={formData.tenantName}
                  onChange={handleInputChange}
                  placeholder="e.g. Riverdale Neighborhood Association"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@domain.org"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 000-0000"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-1">
                  Full Mailing Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, City, State, ZIP"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-semibold text-gray-800 mb-1">
                  Existing Website <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                />
              </div>

              {/* Captcha Box */}
              <div className="border border-gray-200 rounded p-4 bg-gray-50 flex items-center justify-between gap-4">
                <div>
                  <label htmlFor="captchaAnswer" className="block text-sm font-semibold text-gray-800 mb-1">
                    Security Verification *
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Solve:</span>
                    {captcha ? (
                      <span className="font-bold text-gray-900 font-mono text-base border-b border-dashed border-gray-400">
                        {captcha.text}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Loading...</span>
                    )}
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      disabled={loadingCaptcha}
                      className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                      title="Refresh Captcha"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingCaptcha ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
                <div className="w-28">
                  <input
                    type="text"
                    id="captchaAnswer"
                    name="captchaAnswer"
                    value={formData.captchaAnswer}
                    onChange={handleInputChange}
                    required
                    placeholder="Result"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center font-mono focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !captcha}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded text-sm shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Space Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
