import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  try {
    const body = await request.json()
    const { orderNumber } = body

    if (!orderNumber) {
      return errorResponse('缺少订单号')
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    })

    if (!order) {
      return errorResponse('订单不存在', 404)
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() },
      }),
      prisma.payment.updateMany({
        where: { orderId: order.id, status: 'PENDING' },
        data: {
          status: 'SUCCESS',
          gatewayPaymentId: `SIM_${Date.now()}`,
          paidAt: new Date(),
          gatewayResponse: JSON.stringify({ simulated: true }),
        },
      }),
    ])

    return successResponse(null, '模拟支付成功')
  } catch (error) {
    console.error('Simulate pay error:', error)
    return errorResponse('模拟支付失败', 500)
  }
}
