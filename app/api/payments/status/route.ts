import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderNumber = searchParams.get('orderNumber')
  const paymentId = searchParams.get('paymentId')

  if (!orderNumber && !paymentId) {
    return errorResponse('缺少订单号或支付ID')
  }

  // Check by order number
  if (orderNumber) {
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

  // Check by payment ID
  if (paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    })

    if (!payment) {
      return errorResponse('支付记录不存在', 404)
    }

    const paid = payment.status === 'SUCCESS'
    return successResponse({
      paid,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt,
      },
      order: payment.order
        ? {
            id: payment.order.id,
            orderNumber: payment.order.orderNumber,
            status: payment.order.status,
            totalAmount: payment.order.totalAmount,
            paidAt: payment.order.paidAt,
          }
        : null,
    })
  }

  return errorResponse('缺少参数')
}
