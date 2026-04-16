import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const where: { status?: string } = {}
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
