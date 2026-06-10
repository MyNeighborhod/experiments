import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const cookieStore = await cookies()
  cookieStore.delete("payload-token")
  return NextResponse.json({ success: true })
}

export async function GET(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const cookieStore = await cookies()
  cookieStore.delete("payload-token")
  return NextResponse.redirect(new URL(`/${tenant}/login`, request.url))
}
