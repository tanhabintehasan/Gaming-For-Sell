import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import { supportEmitter } from '@/lib/events'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  const isAdmin = authUser?.level === 'ADMIN'

  const { id } = await params

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id,
      ...(isAdmin
        ? {}
        : authUser
          ? { userId: authUser.userId }
          : {}),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true, level: true } },
      admin: { select: { id: true, username: true, avatar: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          admin: { select: { id: true, username: true, avatar: true } },
        },
      },
    },
  })

  if (!ticket) return errorResponse('工单不存在', 404)
  return successResponse(ticket)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  const isAdmin = authUser?.level === 'ADMIN'

  const { id } = await params
  const body = await request.json()
  const { content, guestId, guestName } = body

  if (!content) return errorResponse('回复内容不能为空')

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id,
    },
  })

  if (!ticket) return errorResponse('工单不存在', 404)

  // If authenticated user, verify they own the ticket (unless admin)
  if (!isAdmin && authUser && ticket.userId && ticket.userId !== authUser.userId) {
    return errorResponse('无权访问', 403)
  }

  // If anonymous user, verify they created the ticket
  if (!isAdmin && !authUser && ticket.guestId && ticket.guestId !== guestId) {
    return errorResponse('无权访问', 403)
  }

  if (isAdmin && !ticket.adminId) {
    await prisma.supportTicket.update({
      where: { id },
      data: { adminId: authUser.userId },
    })
  }

  const reply = await prisma.supportReply.create({
    data: {
      ticketId: id,
      senderId: authUser?.userId || null,
      guestId: guestId || null,
      guestName: guestName || null,
      isAdmin,
      content,
    },
    include: {
      admin: { select: { id: true, username: true, avatar: true } },
    },
  })

  await prisma.supportTicket.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  supportEmitter.emit('new-reply', { ticketId: id, reply })

  return successResponse(reply, '回复成功')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  const isAdmin = authUser?.level === 'ADMIN'

  const { id } = await params
  const body = await request.json()
  const { status } = body

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id,
    },
  })

  if (!ticket) return errorResponse('工单不存在', 404)

  if (!isAdmin && authUser && ticket.userId && ticket.userId !== authUser.userId) {
    return errorResponse('无权访问', 403)
  }

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: { status },
  })

  supportEmitter.emit('ticket-updated', { ticketId: id, ticket: updated })

  return successResponse(updated, '工单状态更新成功')
}
