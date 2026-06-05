import { HeaderClient } from './Component.client'
import { getCachedGlobal, getTenantId } from '@/utilities/getGlobals'
import React from 'react'

export async function Header() {
  const tenantId = await getTenantId()
  const headerData = await getCachedGlobal('header', tenantId, 1)()

  return <HeaderClient data={headerData} />
}
