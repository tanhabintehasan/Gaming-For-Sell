import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hashPassword } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  const { id } = await params
  const body = await request.json()
  const { status, reviewNote } = body

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return errorResponse('无效的状态')
  }

  const application = await prisma.sellerApplication.findUnique({
    where: { id },
  })

  if (!application) {
    return errorResponse('申请不存在', 404)
  }

  if (application.status !== 'PENDING') {
    return errorResponse('该申请已处理', 400)
  }

  // If approved, create user and seller profile
  if (status === 'APPROVED') {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: application.phone },
    })

    if (!existingUser) {
      const defaultPassword = '123456'
      const user = await prisma.user.create({
        data: {
          phone: application.phone,
          username: application.username,
          passwordHash: hashPassword(defaultPassword),
          level: 'SELLER',
          gender: application.gender || 'MALE',
          age: application.age || 22,
          location: application.location || '',
          bio: application.bio || '专业电竞陪玩',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${application.username}`,
          isVerified: true,
        },
      })

      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          isVerified: true,
        },
      })
    }
  }

  const updated = await prisma.sellerApplication.update({
    where: { id },
    data: {
      status,
      reviewedBy: authUser.userId,
      reviewNote: reviewNote || null,
      reviewedAt: new Date(),
    },
  })

  return successResponse(updated, status === 'APPROVED' ? '已通过申请' : '已拒绝申请')
}
