import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const game = await prisma.game.findUnique({ where: { id } })
  if (!game) return errorResponse('游戏不存在', 404)

  const categories = await prisma.gameCategory.findMany({
    where: { gameId: id, isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  return successResponse(categories)
}
