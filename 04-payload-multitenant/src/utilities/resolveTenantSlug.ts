const PLATFORM_DOMAIN = "blockvibe.org"

/** Hostname → tenant slug used in routes and database lookups. */
export function resolveTenantSlugFromHost(hostname: string): string {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "default"
  }

  if (hostname.endsWith(".localhost")) {
    return hostname.split(".")[0]
  }

  if (hostname === `info.${PLATFORM_DOMAIN}` || hostname === PLATFORM_DOMAIN) {
    return "default"
  }

  if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    return hostname.replace(`.${PLATFORM_DOMAIN}`, "")
  }

  return hostname
}

/** True for the default / North of Grand tenant (current slug or legacy `nog`). */
export function isDefaultNogTenant(slug: string | null | undefined): boolean {
  return slug === "default" || slug === "nog"
}

type TenantLike = { slug?: string | null; name?: string | null } | null | undefined

/** True when the tenant record is North of Grand (not a generic Payload template default). */
export function isNorthOfGrandTenant(tenant: TenantLike): boolean {
  if (!tenant?.slug) return false
  if (tenant.slug === "nog") return true
  if (tenant.slug === "default") {
    return (tenant.name?.toLowerCase() ?? "").includes("north of grand")
  }
  return false
}

/** Use NOG header/footer chrome and theme when the tenant is actually North of Grand. */
export function shouldUseNogChrome(tenant: TenantLike): boolean {
  return isNorthOfGrandTenant(tenant)
}
