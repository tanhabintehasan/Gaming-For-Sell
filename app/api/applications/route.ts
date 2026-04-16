import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import type { Prisma } from '@prisma/client'

// Submit application (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, username, age, gender, location, bio, reason, experience, gameIds } = body

    if (!phone || !username) {
      return errorResponse('手机号和用户名不能为空')
    }

    // Check if phone already exists as a user
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return errorResponse('该手机号已注册账号，请直接登录', 400)
    }

    // Check for pending application
    const pending = await prisma.sellerApplication.findFirst({
      where: {
        phone,
        status: 'PENDING',
      },
    })

    if (pending) {
      return errorResponse('您已提交申请，请耐心等待审核', 400)
    }

    const authUser = await getAuthUser()

    const application = await prisma.sellerApplication.create({
      data: {
        userId: authUser?.userId || null,
        phone,
        username,
        age: age ? parseInt(age) : null,
        gender,
        location,
        bio,
        reason,
        experience,
        gameIds: JSON.stringify(gameIds || []),
        status: 'PENDING',
      },
    })

    return successResponse(application, '申请提交成功，请等待审核')
  } catch (error) {
    console.error('Submit application error:', error)
    return errorResponse('提交申请失败', 500)
  }
}

// List applications (admin only)
export async function GET(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const where: Prisma.SellerApplicationWhereInput = {}
  if (status) where.status = status

  const applications = await prisma.sellerApplication.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
  })

  return successResponse(applications)
}
