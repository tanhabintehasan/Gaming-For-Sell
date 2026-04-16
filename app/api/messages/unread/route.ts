import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  const count = await prisma.message.count({
    where: {
      receiverId: authUser.userId,
      isRead: false,
    },
  })

  return successResponse({ count })
}
