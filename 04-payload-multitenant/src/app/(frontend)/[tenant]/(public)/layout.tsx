import React from "react"
import { Header } from "@/Header/Component"
import { Footer } from "@/Footer/Component"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
