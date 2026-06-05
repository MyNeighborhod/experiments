import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'

export async function getTenantId(): Promise<string | number | null> {
  try {
    const host = (await headers()).get('host') || ''
    const hostname = host.split(':')[0] // remove port if present

    const payload = await getPayload({ config: configPromise })

    const tenants = await payload.find({
      collection: 'tenants',
      where: {
        or: [
          { domain: { equals: hostname } },
          { slug: { equals: hostname.split('.')[0] } },
        ],
      },
      limit: 1,
    })

    if (tenants.docs.length > 0) {
      return tenants.docs[0].id
    }
  } catch (error) {
    // headers() can throw during build/static page generation
  }

  return null
}

async function getGlobal(slug: 'header' | 'footer', tenantId: string | number | null, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: slug,
    where: tenantId ? { tenant: { equals: tenantId } } : undefined,
    depth,
    limit: 1,
  })

  return result.docs[0] || null
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug and tenant
 */
export const getCachedGlobal = (slug: 'header' | 'footer', tenantId: string | number | null, depth = 0) =>
  unstable_cache(
    async () => getGlobal(slug, tenantId, depth),
    [slug, String(tenantId || 'default')],
    {
      tags: [`global_${slug}`, `tenant_${tenantId || 'default'}`],
    }
  )
