import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  const { id } = await params
  const body = await request.json()
  const { gateway } = body

  if (!gateway || !['ALIPAY', 'WECHAT_PAY'].includes(gateway)) {
    return errorResponse('请选择支付方式')
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      customerId: authUser.userId,
      status: 'PENDING',
    },
  })

  if (!order) {
    return errorResponse('订单不存在或已支付', 404)
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      gateway,
      amount: order.totalAmount,
      status: 'PENDING',
    },
  })

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
    },
    include: {
      game: true,
      product: true,
      seller: { select: { id: true, username: true, avatar: true } },
      customer: { select: { id: true, username: true, avatar: true } },
    },
  })

  await prisma.payment.updateMany({
    where: { orderId: id },
    data: { status: 'SUCCESS', paidAt: new Date() },
  })

  return successResponse(updatedOrder, '支付成功')
}
