import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  try {
    const body = await request.json()
    const { senderId } = body

    if (!senderId) {
      return errorResponse('发送者ID不能为空')
    }

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: authUser.userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return successResponse(null, '已标记为已读')
  } catch (error) {
    console.error('Mark read error:', error)
    return errorResponse('操作失败', 500)
  }
}
