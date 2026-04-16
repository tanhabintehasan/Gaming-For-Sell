import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import { messageEmitter } from '@/lib/events'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: authUser.userId }, { receiverId: authUser.userId }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, username: true, avatar: true } },
      receiver: { select: { id: true, username: true, avatar: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  })

  const conversations = new Map<string, (typeof messages)[number]>()

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

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  try {
    const body = await request.json()
    const { receiverId, content, orderId, type = 'TEXT', fileUrl } = body

    if (!receiverId || !content) {
      return errorResponse('接收者和内容不能为空')
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
    if (!receiver) return errorResponse('接收者不存在', 404)

    const message = await prisma.message.create({
      data: {
        senderId: authUser.userId,
        receiverId,
        content,
        orderId: orderId || null,
        type,
        fileUrl: fileUrl || null,
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        receiver: { select: { id: true, username: true, avatar: true } },
        order: { select: { id: true, orderNumber: true } },
      },
    })

    messageEmitter.emit('new-message', { message })

    return successResponse(message, '发送成功')
  } catch (error) {
    console.error('Send message error:', error)
    return errorResponse('发送失败', 500)
  }
}
