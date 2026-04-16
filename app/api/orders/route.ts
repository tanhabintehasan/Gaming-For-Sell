import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const role = searchParams.get('role') || 'customer'

  const where: Prisma.OrderWhereInput = role === 'seller'
    ? { sellerId: authUser.userId }
    : { customerId: authUser.userId }

  if (status) where.status = status

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      game: true,
      product: true,
      seller: { select: { id: true, username: true, avatar: true } },
      customer: { select: { id: true, username: true, avatar: true } },
      review: true,
    },
  })

  return successResponse(orders)
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  try {
    const body = await request.json()
    const {
      gameId,
      productId,
      categoryId,
      sellerId,
      gamePlatform,
      gameIdUsername,
      gameServerRegion,
      requirements,
      durationHours = 1,
    } = body

    if (!gameId || !productId) {
      return errorResponse('游戏和商品不能为空')
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return errorResponse('商品不存在', 404)
    }

    const commissionRate = 10
    const subtotal = product.basePrice * durationHours
    const platformFee = Math.round(subtotal * (commissionRate / 100) * 100) / 100
    const totalAmount = subtotal + platformFee
    const sellerEarnings = subtotal - platformFee

    const orderNumber = `SL${Date.now()}${Math.floor(Math.random() * 1000)}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        gameId,
        customerId: authUser.userId,
        sellerId: sellerId || null,
        productId,
        categoryId: categoryId || null,
        status: 'PENDING',
        subtotal,
        platformFee,
        totalAmount,
        sellerEarnings,
        gamePlatform,
        gameIdUsername,
        gameServerRegion,
        requirements,
        durationHours,
      },
      include: {
        game: true,
        product: true,
        seller: { select: { id: true, username: true, avatar: true } },
      },
    })

    return successResponse(order, '订单创建成功')
  } catch (error) {
    console.error('Create order error:', error)
    return errorResponse('创建订单失败', 500)
  }
}
