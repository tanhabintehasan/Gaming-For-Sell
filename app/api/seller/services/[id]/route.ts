import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser || (authUser.level !== 'SELLER' && authUser.level !== 'ADMIN')) {
    return errorResponse('无权限', 403)
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { platformTypes, hourlyRate, isAvailable, specialties } = body

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: authUser.userId },
      select: { id: true },
    })

    if (!profile) return errorResponse('打手资料不存在', 404)

    const existing = await prisma.sellerGameService.findFirst({
      where: { id, sellerId: profile.id },
    })
    if (!existing) return errorResponse('服务不存在或无权限', 404)

    const updateData: Record<string, unknown> = {}
    if (platformTypes !== undefined) updateData.platformTypes = platformTypes
    if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate)
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable
    if (specialties !== undefined) updateData.specialties = specialties

    const service = await prisma.sellerGameService.update({
      where: { id },
      data: updateData,
      include: {
        game: { select: { id: true, nameCn: true } },
      },
    })

    return successResponse(service, '服务更新成功')
  } catch (error) {
    console.error('Seller update service error:', error)
    return errorResponse('更新服务失败', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser || (authUser.level !== 'SELLER' && authUser.level !== 'ADMIN')) {
    return errorResponse('无权限', 403)
  }

  try {
    const { id } = await params
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: authUser.userId },
      select: { id: true },
    })

    if (!profile) return errorResponse('打手资料不存在', 404)

    const existing = await prisma.sellerGameService.findFirst({
      where: { id, sellerId: profile.id },
    })
    if (!existing) return errorResponse('服务不存在或无权限', 404)

    await prisma.sellerGameService.delete({ where: { id } })
    return successResponse(null, '服务删除成功')
  } catch (error) {
    console.error('Seller delete service error:', error)
    return errorResponse('删除服务失败', 500)
  }
}
