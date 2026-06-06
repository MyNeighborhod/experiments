'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Download, Mail, Facebook, Send, CheckCircle2 } from 'lucide-react'

type Props = {
  pageSlug: string
}

// About slides
const ABOUT_SLIDES = [
  'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/nog-architech.jpg',
  'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/nog-art-walk.jpg',
  'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/nog-breakdancing.jpg',
  'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/nog-bridge.jpg',
  'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/nog-couple.jpeg',
  'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/nog-music-art-walk.jpg',
  'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/nog-night-out.jpg',
]

// Meeting Minutes files list
const MINUTES_FILES = [
  {
    name: '05_may_2026_nog_general_meeting_minutes.docx',
    size: '24 KB',
    url: 'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/05_may_2026_nog_general_meeting_minutes.docx',
  },
  {
    name: '03_mar_2026_nog_board_of_directors_meeting_minutes__1_.docx',
    size: '2.0 MB',
    url: 'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/03_mar_2026_nog_board_of_directors_meeting_minutes__1_.docx',
  },
  {
    name: '02_2026_nog_board_of_directors_meeting_minutes__1_.docx',
    size: '55 KB',
    url: 'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/02_2026_nog_board_of_directors_meeting_minutes__1_.docx',
  },
  {
    name: '01_2026_nog_board_of_directors_meeting_minutes__1_.docx',
    size: '54 KB',
    url: 'https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/01_2026_nog_board_of_directors_meeting_minutes__1_.docx',
  },
]

export const NogInteractive: React.FC<Props> = ({ pageSlug }) => {
  // 1. About slideshow state
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    if (pageSlug !== 'about') return
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % ABOUT_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [pageSlug])

  // 2. Form states
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterAgreed, setNewsletterAgreed] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)

  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    comment: '',
  })
  const [contactSuccess, setContactSuccess] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail || !newsletterAgreed) return
    setNewsletterSuccess(true)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.firstName || !contactForm.email || !contactForm.comment) return
    setContactSuccess(true)
  }

  // --- Render by page slug ---

  if (pageSlug === 'about') {
    return (
      <div className="w-full my-8">
        <div className="relative w-full h-[320px] md:h-[480px] bg-gray-100 rounded-lg overflow-hidden shadow-md">
          {ABOUT_SLIDES.map((url, index) => (
            <div
              key={url}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === slideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`North of Grand Neighborhood Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {ABOUT_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setSlideIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === slideIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (pageSlug === 'yearly-calendar') {
    return (
      <div className="w-full flex flex-col items-center my-8">
        <div className="w-full overflow-hidden border border-border rounded-lg shadow-md bg-white mb-6">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=northofgrandpresident%40gmail.com&ctz=America%2FChicago"
            className="w-full h-[500px] md:h-[600px] border-0"
            scrolling="no"
          />
        </div>
        <div className="text-center p-4 bg-teal-50 border border-teal-100 rounded-lg max-w-lg w-full">
          <p className="text-teal-900 font-semibold mb-2 flex items-center justify-center gap-2">
            <Facebook className="w-5 h-5 text-blue-600" />
            Prefer Social Updates?
          </p>
          <p className="text-sm text-teal-800 mb-3">
            Check out our Facebook page for detailed descriptions of meetings and local events.
          </p>
          <a
            href="https://www.facebook.com/North.of.Grand.DSM/?viewas=100000686899395"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs uppercase tracking-wider transition-colors no-underline"
          >
            View Facebook Page
          </a>
        </div>
      </div>
    )
  }

  if (pageSlug === 'archives-and-documents') {
    return (
      <div className="w-full my-8 flex flex-col gap-8">
        {/* Minutes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MINUTES_FILES.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-8 h-8 text-teal-700 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-gray-800" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">{file.size}</p>
                </div>
              </div>
              <a
                href={file.url}
                className="p-2 bg-teal-50 hover:bg-teal-100 rounded text-teal-800 transition-colors"
                title="Download Document"
                download
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Bylaws PDF */}
        <div className="border border-border rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-700" />
            Association Bylaws (updated 2026)
          </h3>
          <div className="bg-teal-50 p-4 border border-teal-100 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-teal-900 font-semibold">nog_bylaws_-_proposed_march_2026.pdf</p>
              <p className="text-xs text-teal-800">Proposed and updated amendments for 2026.</p>
            </div>
            <a
              href="https://www.northofgranddsm.org/uploads/1/5/5/3/155377114/nog_bylaws_-_proposed_march_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-medium text-sm rounded transition-colors inline-flex items-center gap-2 no-underline"
            >
              <Download className="w-4 h-4" />
              Download Bylaws PDF
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (pageSlug === 'contact') {
    return (
      <div className="w-full my-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Forms Section */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Newsletter Sign Up */}
            <div className="p-6 border border-border rounded-lg bg-white shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-2">Join our mailing list!</h3>
              <p className="text-xs text-gray-400 mb-4">*we do not sell or share your info</p>

              {newsletterSuccess ? (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-sm font-semibold">Thank you for subscribing!</p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full p-2 border border-border rounded text-sm outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="newsletterOptIn"
                      required
                      checked={newsletterAgreed}
                      onChange={(e) => setNewsletterAgreed(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="newsletterOptIn" className="text-xs text-gray-500 leading-tight">
                      I agree to receive quarterly newsletters and neighborhood updates. <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white rounded text-sm font-semibold transition-colors"
                  >
                    Subscribe to Newsletter
                  </button>
                </form>
              )}
            </div>

            {/* Questions Form */}
            <div className="p-6 border border-border rounded-lg bg-white shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Have a question?</h3>

              {contactSuccess ? (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-sm font-semibold">Your message was sent! We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jane"
                        value={contactForm.firstName}
                        onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                        className="w-full p-2 border border-border rounded text-sm outline-none focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={contactForm.lastName}
                        onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                        className="w-full p-2 border border-border rounded text-sm outline-none focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane.doe@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full p-2 border border-border rounded text-sm outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Message / Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write your message here..."
                      value={contactForm.comment}
                      onChange={(e) => setContactForm({ ...contactForm, comment: e.target.value })}
                      className="w-full p-2 border border-border rounded text-sm outline-none focus:ring-1 focus:ring-teal-700 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Message
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Map & Socials Section */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="w-full h-[350px] border border-border rounded-lg overflow-hidden shadow-sm bg-white">
              <iframe
                title="North Of Grand Des Moines Area Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000.0!2d-93.66485899999999!3d41.5903345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87ee99b7b7a1dfa1%3A0xe10839e55ad0ba78!2sNorth%20of%20Grand%2C%20Des%20Moines%2C%20IA!5e0!3m2!1sen!2sus!4v1717650000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Social & Contact info */}
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/North.of.Grand.DSM/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-900 rounded-lg transition-colors font-semibold text-sm no-underline"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                Facebook
              </a>
              <a
                href="mailto:northofgrandpresident@gmail.com"
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-teal-50 border border-teal-100 hover:bg-teal-100 text-teal-950 rounded-lg transition-colors font-semibold text-sm no-underline"
              >
                <Mail className="w-5 h-5 text-teal-700" />
                Email President
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
