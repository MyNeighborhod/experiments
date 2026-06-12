import crypto from "crypto"

const CAPTCHA_SECRET = process.env.PAYLOAD_SECRET || "fallback-secret-for-captcha-signing"

// Generate 32-byte key for AES-256 from the secret
const key = crypto.createHash("sha256").update(CAPTCHA_SECRET).digest()
const iv = Buffer.alloc(16, 0) // Constant IV is fine since the encrypted text contains a dynamic timestamp and is only short-lived.

export function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 1
  const num2 = Math.floor(Math.random() * 9) + 1
  const operations = ["+", "-"]
  const op = operations[Math.floor(Math.random() * operations.length)]

  let text = ""
  let result = 0

  if (op === "+") {
    result = num1 + num2
    text = `${num1} + ${num2}`
  } else {
    const max = Math.max(num1, num2)
    const min = Math.min(num1, num2)
    result = max - min
    text = `${max} - ${min}`
  }

  // Encrypt payload: "result:timestamp"
  const payload = `${result}:${Date.now()}`
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
  let encrypted = cipher.update(payload, "utf8", "hex")
  encrypted += cipher.final("hex")

  return {
    text,
    token: encrypted,
  }
}

export function verifyCaptcha(token: string, answer: string): boolean {
  if (!token || !answer) return false
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
    let decrypted = decipher.update(token, "hex", "utf8")
    decrypted += decipher.final("utf8")

    const [expectedAnswer, timestampStr] = decrypted.split(":")
    const timestamp = parseInt(timestampStr, 10)

    // Check if captcha is expired (older than 10 minutes)
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      return false
    }

    return expectedAnswer === answer.trim()
  } catch (error) {
    return false
  }
}
