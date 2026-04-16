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
    const {
      gameId,
      categoryId,
      name,
      description,
      imageUrl,
      basePrice,
      originalPrice,
      serviceType,
      durationHours,
      specifications,
      isActive,
    } = body

    const existing = await prisma.product.findFirst({
      where: { id, sellerId: authUser.userId },
    })
    if (!existing) return errorResponse('商品不存在或无权限', 404)

    const updateData: Record<string, unknown> = {}
    if (gameId !== undefined) updateData.gameId = gameId
    if (categoryId !== undefined) updateData.categoryId = categoryId || null
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice)
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null
    if (serviceType !== undefined) updateData.serviceType = serviceType
    if (durationHours !== undefined) updateData.durationHours = parseInt(durationHours) || 1
    if (specifications !== undefined) updateData.specifications = specifications
    if (isActive !== undefined) updateData.isActive = isActive

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        game: { select: { id: true, nameCn: true } },
        category: { select: { id: true, name: true } },
      },
    })

    return successResponse(product, '商品更新成功')
  } catch (error) {
    console.error('Seller update product error:', error)
    return errorResponse('更新商品失败', 500)
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
    const existing = await prisma.product.findFirst({
      where: { id, sellerId: authUser.userId },
    })
    if (!existing) return errorResponse('商品不存在或无权限', 404)

    await prisma.product.delete({ where: { id } })
    return successResponse(null, '商品删除成功')
  } catch (error) {
    console.error('Seller delete product error:', error)
    return errorResponse('删除商品失败', 500)
  }
}
