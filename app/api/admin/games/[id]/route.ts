import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  const { id } = await params
  const body = await request.json()

  try {
    const updated = await prisma.game.update({
      where: { id },
      data: {
        isActive: body.isActive,
        nameCn: body.nameCn,
        nameEn: body.nameEn,
        slug: body.slug,
        logoUrl: body.logoUrl,
        bannerUrl: body.bannerUrl,
        supportedPlatforms: body.supportedPlatforms,
        description: body.description,
        sortOrder: body.sortOrder,
      },
    })
    return successResponse(updated, '更新成功')
  } catch (error) {
    console.error('Update game error:', error)
    return errorResponse('更新游戏失败', 500)
  }
}
