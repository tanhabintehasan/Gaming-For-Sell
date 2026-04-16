import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      sellerProfile: {
        include: {
          gameServices: {
            include: { game: true },
          },
        },
      },
      reviewsReceived: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          game: true,
          customer: {
            select: { username: true, avatar: true },
          },
        },
      },
    },
  })

  if (!user || !user.sellerProfile) {
    return errorResponse('打手不存在', 404)
  }

  return successResponse(user)
}
