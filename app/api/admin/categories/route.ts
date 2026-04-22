import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('gameId')

  const categories = await prisma.gameCategory.findMany({
    where: gameId ? { gameId } : {},
    orderBy: { sortOrder: 'asc' },
  })

  return successResponse(categories)
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  try {
    const body = await request.json()

    if (!body.gameId || !body.name) {
      return errorResponse('游戏和分类名称不能为空')
    }

    const category = await prisma.gameCategory.create({
      data: {
        gameId: body.gameId,
        name: body.name,
        slug: body.slug || body.name,
        iconUrl: body.iconUrl || '',
        defaultHourlyRate: parseFloat(body.defaultHourlyRate) || 0,
        sortOrder: parseInt(body.sortOrder) || 0,
        isActive: body.isActive ?? true,
      },
    })
    return successResponse(category, '分类创建成功')
  } catch (error) {
    console.error(error)
    return errorResponse('创建分类失败', 500)
  }
}
