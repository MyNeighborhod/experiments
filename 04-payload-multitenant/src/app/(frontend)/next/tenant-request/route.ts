import { NextResponse } from "next/server"
import { getPayload } from "payload"
import configPromise from "@payload-config"
import { generateCaptcha, verifyCaptcha } from "@/utilities/captcha"

export async function GET() {
  try {
    const captcha = generateCaptcha()
    return NextResponse.json(captcha)
  } catch (error) {
    console.error("Failed to generate captcha:", error)
    return NextResponse.json({ error: "Failed to generate captcha" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, tenantName, address, website, captchaAnswer, captchaToken } = body

    // Validate required fields
    if (!email || !phone || !tenantName || !address || !captchaAnswer || !captchaToken) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields except website are required.",
          newCaptcha: generateCaptcha(),
        },
        { status: 400 },
      )
    }

    // Verify Captcha
    const isValidCaptcha = verifyCaptcha(captchaToken, captchaAnswer)
    if (!isValidCaptcha) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect or expired captcha answer. Please try again.",
          newCaptcha: generateCaptcha(),
        },
        { status: 400 },
      )
    }

    // Initialize Payload
    const payload = await getPayload({ config: configPromise })

    // Save to Database
    const tenantRequest = await payload.create({
      collection: "tenant-requests",
      data: {
        tenantName,
        email,
        phone,
        address,
        website: website || "",
        status: "pending",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Your tenant request has been submitted successfully!",
      data: tenantRequest,
    })
  } catch (error: any) {
    console.error("Error submitting tenant request:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
        newCaptcha: generateCaptcha(),
      },
      { status: 500 },
    )
  }
}
