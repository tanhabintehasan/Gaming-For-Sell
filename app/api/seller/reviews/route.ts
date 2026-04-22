import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  const reviews = await prisma.review.findMany({
    where: { sellerId: authUser.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { id: true, username: true, avatar: true } },
      game: { select: { id: true, nameCn: true } },
    },
  })

  return successResponse(reviews)
}
