import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import type { Prisma } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  const { id } = await params
  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: authUser.level === 'ADMIN'
        ? [{}]
        : [
            { customerId: authUser.userId },
            { sellerId: authUser.userId },
          ],
    },
    include: {
      game: true,
      product: true,
      category: true,
      seller: { select: { id: true, username: true, avatar: true } },
      customer: { select: { id: true, username: true, avatar: true } },
      review: true,
      payments: true,
    },
  })

  if (!order) return errorResponse('订单不存在', 404)
  return successResponse(order)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  const { id } = await params
  const body = await request.json()
  const { status, cancelReason } = body

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: authUser.level === 'ADMIN'
        ? [{}]
        : [
            { customerId: authUser.userId },
            { sellerId: authUser.userId },
          ],
    },
  })

  if (!order) return errorResponse('订单不存在', 404)

  const updateData: Prisma.OrderUpdateInput = { status }
  if (status === 'CANCELLED') {
    updateData.cancelledAt = new Date()
    updateData.cancelReason = cancelReason
  } else if (status === 'ACCEPTED') {
    updateData.acceptedAt = new Date()
  } else if (status === 'IN_PROGRESS') {
    updateData.startedAt = new Date()
  } else if (status === 'COMPLETED') {
    updateData.completedAt = new Date()
  }

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      game: true,
      product: true,
      seller: { select: { id: true, username: true, avatar: true } },
      customer: { select: { id: true, username: true, avatar: true } },
    },
  })

  return successResponse(updated, '订单更新成功')
}
