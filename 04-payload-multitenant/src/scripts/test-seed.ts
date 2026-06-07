/**
 * How to run this script:
 * pnpm tsx src/scripts/test-seed.ts
 */

import dotenv from "dotenv"
dotenv.config()

import { getPayload, createLocalReq } from "payload"
import { seed } from "../endpoints/seed"

async function run() {
  const configPromise = (await import("../payload.config")).default
  const config = await configPromise
  const payload = await getPayload({ config })

  const req = await createLocalReq({}, payload)
  await seed({ payload, req })

  process.exit(0)
}

run().catch((err) => {
  console.error("Test Seed Error:", err)
  process.exit(1)
})
