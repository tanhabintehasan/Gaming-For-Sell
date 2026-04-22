import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/api'

const publicConfigKeys = [
  'site_name',
  'site_logo',
  'customer_service_qr',
]

export async function GET() {
  const configs = await prisma.adminConfig.findMany({
    where: { configKey: { in: publicConfigKeys } },
  })

  const result: Record<string, string> = {}
  for (const key of publicConfigKeys) {
    const found = configs.find((c) => c.configKey === key)
    result[key] = found?.configValue || ''
  }

  if (!result.site_name) result.site_name = '速凌电竞'
  if (!result.site_logo) result.site_logo = ''

  return successResponse(result)
}
