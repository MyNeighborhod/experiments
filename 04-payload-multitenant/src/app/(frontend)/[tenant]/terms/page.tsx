import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Terms of Service | BlockVibe',
  description: 'Terms of Service for BlockVibe, operated by TIDIER, LLC.',
}

interface PageProps {
  params: Promise<{
    tenant: string
  }>
}

export default async function TermsOfServicePage({ params }: PageProps) {
  const { tenant } = await params
  
  // Enforce that the TOS is only accessible on the default/platform domain
  if (tenant !== 'default') {
    notFound()
  }

  return (
    <article className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header decoration bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        
        <div className="p-8 sm:p-12 md:p-16">
          <header className="mb-12 border-b border-gray-150 dark:border-zinc-800 pb-8 text-center sm:text-left">
            <span className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              Legal Documentation
            </span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
              Terms of Service
            </h1>
            <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">
              Last Updated: June 7, 2026 &bull; Effective Immediately
            </p>
          </header>

          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-zinc-300 space-y-8 leading-relaxed font-sans">
            <p className="text-lg text-gray-700 dark:text-zinc-200">
              Welcome to <strong>BlockVibe</strong>. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the website located at{' '}
              <Link href="https://blockvibe.org" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                blockvibe.org
              </Link>{' '}
              (the &ldquo;Site&rdquo;) and all associated subdomains, portals, tools, and services (collectively, the &ldquo;Platform&rdquo; or &ldquo;Services&rdquo;).
            </p>

            <section className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-6">
              <h2 className="text-lg font-serif font-semibold text-emerald-900 dark:text-emerald-300 mt-0 mb-3">
                1. Legal Entity &amp; Binding Agreement
              </h2>
              <p className="text-sm text-emerald-800 dark:text-emerald-400 mb-0">
                The Platform is owned and operated by <strong>TIDIER, LLC</strong>, an Iowa limited liability company, with its principal business address at:{' '}
                <span className="font-semibold block sm:inline">672 40th St, Des Moines, IA 50312</span>. By registering for, accessing, or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white">
                2. Platform Structure &amp; Multi-Tenancy
              </h2>
              <p>
                BlockVibe is a multi-tenant platform designed to enable local communities, neighborhoods, and associations (each a &ldquo;Tenant&rdquo; or &ldquo;Neighborhood Association&rdquo;) to host portals, share content, coordinate events, and interact with residents and businesses.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Tenant Portals:</strong> Each Tenant operates its own isolated site on a subdomain (e.g., <em>[tenant].blockvibe.org</em>) or a mapped custom domain.
                </li>
                <li>
                  <strong>Tenant Administrators:</strong> Designated administrators (&ldquo;Tenant Admins&rdquo;) are granted authority to manage their respective Tenant Portal, upload content, create posts, and access the built-in CRM (Customer Relationship Management) tools.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white">
                3. User Accounts and Responsibilities
              </h2>
              <p>
                To utilize certain Platform capabilities, you must register for an account. You represent and warrant that all information provided is accurate, current, and complete. You are entirely responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Maintaining the confidentiality of your credentials.</li>
                <li>All activities that occur under your account.</li>
                <li>Promptly notifying us of any unauthorized access or security breach.</li>
              </ul>
            </section>

            <section className="border-l-4 border-amber-500 bg-amber-50/30 dark:bg-amber-950/10 p-6 rounded-r-xl space-y-4">
              <h2 className="text-xl font-serif font-semibold text-amber-950 dark:text-amber-300 mt-0 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                4. Outbound Communications &amp; Anti-Spam Policy
              </h2>
              <p className="text-amber-900 dark:text-amber-400">
                The Platform provides CRM tools enabling Tenant Admins to maintain directories of neighborhood residents and local businesses (&ldquo;Contacts&rdquo;) and initiate outbound email or message communications. Any use of these tools is subject to strict compliance with the following:
              </p>
              <ol className="list-decimal pl-5 space-y-3 text-amber-950/90 dark:text-amber-400/90 text-sm">
                <li>
                  <strong>Consent Required:</strong> Tenant Admins represent, warrant, and covenant that they have obtained appropriate legal consent, or otherwise hold a valid, documented lawful basis, to send emails to each Resident or Business in their Contact list.
                </li>
                <li>
                  <strong>Prohibition of Spam:</strong> Under no circumstances may Tenant Admins use the Platform to send unsolicited bulk email (spam). All communications must strictly comply with the **U.S. CAN-SPAM Act**, the **Telephone Consumer Protection Act (TCPA)**, and all other applicable state, federal, or international privacy laws.
                </li>
                <li>
                  <strong>Mandatory Opt-Out / Unsubscribe:</strong> Every commercial or bulk email broadcast initiated through the Platform must feature a clear, conspicuous, and fully operational opt-out (unsubscribe) mechanism. If a Contact opts out, the Tenant Admin must immediately cease sending emails to that Contact.
                </li>
                <li>
                  <strong>Bounces and Spam Complaints:</strong> TIDIER, LLC monitors delivery logs, bounce rates, and spam complaints. We reserve the absolute right to suspend or terminate email privileges or Tenant Portal access immediately if a Tenant&apos;s email campaigns generate excessive complaints (&gt; 0.1% of recipients) or invalid email bounces (&gt; 5.0% of recipients).
                </li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white">
                5. Indemnification &amp; Liability Shield
              </h2>
              <p>
                <strong>As a Tenant Admin or user initiating communications, you agree to indemnify, defend, and hold harmless TIDIER, LLC</strong>, its officers, directors, employees, and agents, from and against any and all claims, demands, liabilities, damages, losses, costs, or expenses (including reasonable attorney fees) arising out of or in connection with:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your violation of any third-party right, including privacy, publicity, or intellectual property rights.</li>
                <li>Any claims that communications sent by you constitute unauthorized, unsolicited, or unlawful marketing (spam).</li>
                <li>Your violation of applicable communication or privacy laws (such as CAN-SPAM or TCPA).</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white">
                6. Content &amp; Intellectual Property
              </h2>
              <p>
                You retain ownership of any content, text, images, or media you publish to your Tenant Portal (&ldquo;User Content&rdquo;). However, by uploading User Content, you grant TIDIER, LLC a worldwide, royalty-free, non-exclusive license to host, store, cache, reproduce, distribute, and display such content solely as necessary to provide and perform the Services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white">
                7. Limitation of Liability &amp; Disclaimers
              </h2>
              <p className="italic">
                THE PLATFORM AND ALL INCLUDED SERVICES ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS. TIDIER, LLC DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL TIDIER, LLC BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, OR DATA, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES, REGARDLESS OF THE LEGAL THEORY.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white">
                8. Governing Law &amp; Jurisdiction
              </h2>
              <p>
                These Terms and any disputes arising from or relating to them shall be governed by, and construed in accordance with, the laws of the **State of Iowa**, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms shall be brought exclusively in the federal or state courts located in **Polk County, Iowa**.
              </p>
            </section>

            <section className="border-t border-gray-150 dark:border-zinc-800 pt-8 space-y-2">
              <h2 className="text-lg font-serif font-semibold text-gray-900 dark:text-white">
                9. Contact Information
              </h2>
              <p>
                If you have any questions or concerns regarding these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-lg p-4 text-sm space-y-1">
                <p className="font-semibold text-gray-800 dark:text-zinc-200">TIDIER, LLC</p>
                <p>672 40th St</p>
                <p>Des Moines, IA 50312</p>
                <p className="pt-2 text-emerald-600 dark:text-emerald-400">
                  Email:{' '}
                  <a href="mailto:legal@blockvibe.org" className="hover:underline font-medium">
                    legal@blockvibe.org
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  )
}
