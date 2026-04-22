import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.level !== 'ADMIN') {
      return errorResponse('无权限', 403)
    }

    // Fetch direct messages
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, avatar: true, level: true } },
        receiver: { select: { id: true, username: true, avatar: true, level: true } },
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

    const messageConversations = Array.from(conversations.entries()).map(([otherId, lastMessage]) => ({
      type: 'message' as const,
      otherId,
      other: lastMessage.senderId === authUser.userId ? lastMessage.receiver : lastMessage.sender,
      lastMessage: {
        content: lastMessage.content,
        createdAt: lastMessage.createdAt,
        senderId: lastMessage.senderId,
      },
      unreadCount: messages.filter(
        (m) => m.senderId === otherId && m.receiverId === authUser.userId && !m.isRead
      ).length,
      ticketId: null as string | null,
      subject: null as string | null,
      status: null as string | null,
      isGuest: false,
      guestName: null as string | null,
    }))

    // Fetch support tickets
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, avatar: true, level: true } },
        replies: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    const ticketConversations = tickets.map((ticket) => {
      const isGuest = !ticket.user
      const lastReply = ticket.replies[0]
      return {
        type: 'ticket' as const,
        otherId: ticket.id,
        other: ticket.user || {
          id: ticket.id,
          username: ticket.guestName || '匿名用户',
          avatar: '',
          level: 'GUEST',
        },
        lastMessage: {
          content: lastReply?.content || ticket.subject,
          createdAt: lastReply?.createdAt || ticket.createdAt,
          senderId: lastReply?.senderId || (isGuest ? 'guest' : (ticket.user?.id || 'unknown')),
        },
        unreadCount: 0,
        ticketId: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        isGuest,
        guestName: ticket.guestName,
      }
    })

    // Merge and sort by last message time (newest first)
    const allConversations = [...messageConversations, ...ticketConversations].sort((a, b) => {
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    })

    return successResponse(allConversations)
  } catch (error) {
    console.error('Admin messages error:', error)
    return errorResponse('加载消息列表失败', 500)
  }
}
