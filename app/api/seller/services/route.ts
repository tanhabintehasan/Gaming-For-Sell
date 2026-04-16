import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser || (authUser.level !== 'SELLER' && authUser.level !== 'ADMIN')) {
    return errorResponse('无权限', 403)
  }

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: authUser.userId },
    select: { id: true },
  })

  if (!profile) return errorResponse('打手资料不存在', 404)

  const services = await prisma.sellerGameService.findMany({
    where: { sellerId: profile.id },
    orderBy: { createdAt: 'desc' },
    include: {
      game: { select: { id: true, nameCn: true } },
    },
  })

  return successResponse(services)
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || (authUser.level !== 'SELLER' && authUser.level !== 'ADMIN')) {
    return errorResponse('无权限', 403)
  }

  try {
    const body = await request.json()
    const { gameId, platformTypes, hourlyRate, isAvailable, specialties } = body

    if (!gameId || hourlyRate === undefined) {
      return errorResponse('游戏和时薪不能为空')
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: authUser.userId },
      select: { id: true },
    })

    if (!profile) return errorResponse('打手资料不存在', 404)

    const existing = await prisma.sellerGameService.findUnique({
      where: { sellerId_gameId: { sellerId: profile.id, gameId } },
    })

    if (existing) {
      return errorResponse('该游戏服务已存在，请编辑现有服务')
    }

    const service = await prisma.sellerGameService.create({
      data: {
        sellerId: profile.id,
        gameId,
        platformTypes: platformTypes || 'MOBILE,PC',
        hourlyRate: parseFloat(hourlyRate),
        isAvailable: isAvailable ?? true,
        specialties: specialties || '',
      },
      include: {
        game: { select: { id: true, nameCn: true } },
      },
    })

    return successResponse(service, '服务创建成功')
  } catch (error) {
    console.error('Seller create service error:', error)
    return errorResponse('创建服务失败', 500)
  }
}
