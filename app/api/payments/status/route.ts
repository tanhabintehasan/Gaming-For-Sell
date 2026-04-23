import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderNumber = searchParams.get('orderNumber')

  if (!orderNumber) {
    return errorResponse('缺少订单号')
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
  })

  if (!order) {
    return errorResponse('订单不存在', 404)
  }

  return successResponse({
    paid: order.status === 'PAID',
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      paidAt: order.paidAt,
    },
  })
}
