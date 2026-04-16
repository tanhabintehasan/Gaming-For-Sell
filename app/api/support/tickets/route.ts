import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser()
  const isAdmin = authUser?.level === 'ADMIN'

  const { searchParams } = new URL(request.url)

  const where: Prisma.SupportTicketWhereInput = {}
  if (!isAdmin && authUser) {
    where.userId = authUser.userId
  } else if (!isAdmin) {
    // For anonymous users, we don't filter by userId here because they might not have a guestId cookie yet.
    // Admin sees all tickets.
    // Frontend for anonymous users will only show tickets they created via localStorage guestId.
  }

  if (isAdmin && searchParams.get('unassigned') === 'true') {
    where.adminId = null
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { id: true, username: true, avatar: true, level: true } },
      admin: { select: { id: true, username: true, avatar: true } },
      replies: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return successResponse(tickets)
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()

  try {
    const body = await request.json()
    const { subject, guestId, guestName } = body

    if (!subject) {
      return errorResponse('主题不能为空')
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: authUser?.userId || null,
        guestId: guestId || null,
        guestName: guestName || null,
        subject,
        status: 'OPEN',
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    })

    return successResponse(ticket, '工单创建成功')
  } catch (error) {
    console.error(error)
    return errorResponse('创建工单失败', 500)
  }
}
