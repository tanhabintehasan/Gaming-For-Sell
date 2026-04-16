import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/api'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('gameId')
  const categoryId = searchParams.get('categoryId')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const where: Prisma.ProductWhereInput = { isActive: true }
  if (gameId) where.gameId = gameId
  if (categoryId) where.categoryId = categoryId

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        game: true,
        category: true,
      },
    }),
    prisma.product.count({ where }),
  ])

  return successResponse({ products, total, limit, offset })
}
