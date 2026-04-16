import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      game: { select: { id: true, nameCn: true } },
      category: { select: { id: true, name: true } },
    },
  })

  return successResponse(products)
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  try {
    const body = await request.json()
    const {
      gameId,
      categoryId,
      sellerId,
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

    if (!gameId || !name || basePrice === undefined) {
      return errorResponse('游戏、名称和基础价格不能为空')
    }

    const product = await prisma.product.create({
      data: {
        gameId,
        categoryId: categoryId || null,
        sellerId: sellerId || null,
        name,
        description: description || '',
        imageUrl: imageUrl || '',
        basePrice: parseFloat(basePrice),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        serviceType: serviceType || 'HOURLY',
        durationHours: parseInt(durationHours) || 1,
        specifications: specifications || '{}',
        isActive: isActive ?? true,
      },
      include: {
        game: { select: { id: true, nameCn: true } },
        category: { select: { id: true, name: true } },
      },
    })

    return successResponse(product, '商品创建成功')
  } catch (error) {
    console.error('Admin create product error:', error)
    return errorResponse('创建商品失败', 500)
  }
}
