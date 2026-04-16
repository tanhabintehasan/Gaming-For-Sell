import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  try {
    const body = await request.json()
    const { orderId, rating, content } = body

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return errorResponse('评分不能为空且须在1-5之间')
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: authUser.userId,
        status: 'COMPLETED',
      },
      include: { review: true },
    })

    if (!order) {
      return errorResponse('订单不存在或未完成', 404)
    }

    if (order.review) {
      return errorResponse('该订单已评价', 400)
    }

    if (!order.sellerId || !order.gameId) {
      return errorResponse('订单缺少卖家或游戏信息', 400)
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        customerId: authUser.userId,
        sellerId: order.sellerId,
        gameId: order.gameId,
        rating,
        content: content || '',
      },
    })

    const sellerReviews = await prisma.review.findMany({
      where: { sellerId: order.sellerId },
      select: { rating: true },
    })

    const avgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length

    await prisma.sellerProfile.update({
      where: { userId: order.sellerId },
      data: { overallRating: parseFloat(avgRating.toFixed(1)) },
    })

    return successResponse(review, '评价成功')
  } catch (error) {
    console.error('Create review error:', error)
    return errorResponse('评价失败', 500)
  }
}
