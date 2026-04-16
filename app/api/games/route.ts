import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/api'

export async function GET() {
  const games = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'desc' },
    include: {
      _count: {
        select: {
          sellerServices: true,
          orders: true,
        },
      },
    },
  })

  return successResponse(games)
}
