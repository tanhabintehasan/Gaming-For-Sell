import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  const { userId } = await params
  const { searchParams } = new URL(request.url)
  const before = searchParams.get('before')

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: authUser.userId, receiverId: userId },
        { senderId: userId, receiverId: authUser.userId },
      ],
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      sender: { select: { id: true, username: true, avatar: true } },
      receiver: { select: { id: true, username: true, avatar: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  })

  const other = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, avatar: true, level: true },
  })

  return successResponse({ messages: messages.reverse(), other })
}
