import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

async function checkAdmin() {
  const user = await getAuthUser()
  if (!user || user.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }
  return null
}

export async function GET() {
  const denied = await checkAdmin()
  if (denied) return denied

  const games = await prisma.game.findMany({
    orderBy: { sortOrder: 'desc' },
    include: {
      _count: {
        select: { sellerServices: true, orders: true, categories: true },
      },
    },
  })

  return successResponse(games)
}

export async function POST(request: NextRequest) {
  const denied = await checkAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const game = await prisma.game.create({
      data: {
        nameCn: body.nameCn,
        nameEn: body.nameEn,
        slug: body.slug,
        logoUrl: body.logoUrl,
        bannerUrl: body.bannerUrl,
        supportedPlatforms: body.supportedPlatforms,
        description: body.description,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive ?? true,
      },
    })
    return successResponse(game, '游戏创建成功')
  } catch (error) {
    console.error(error)
    return errorResponse('创建游戏失败', 500)
  }
}
