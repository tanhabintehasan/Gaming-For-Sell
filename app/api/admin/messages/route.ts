import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, username: true, avatar: true, level: true } },
      receiver: { select: { id: true, username: true, avatar: true, level: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  })

  const conversations = new Map<string, typeof messages[number]>()

  for (const msg of messages) {
    const otherId = msg.senderId === authUser.userId ? msg.receiverId : msg.senderId
    if (!conversations.has(otherId)) {
      conversations.set(otherId, msg)
    }
  }

  const result = Array.from(conversations.entries()).map(([otherId, lastMessage]) => ({
    otherId,
    other: lastMessage.senderId === authUser.userId ? lastMessage.receiver : lastMessage.sender,
    lastMessage,
    unreadCount: messages.filter(
      (m) => m.senderId === otherId && m.receiverId === authUser.userId && !m.isRead
    ).length,
  }))

  return successResponse(result)
}
