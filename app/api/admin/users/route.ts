import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hashPassword } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import type { Prisma } from '@prisma/client'

async function checkAdmin() {
  const user = await getAuthUser()
  if (!user || user.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const denied = await checkAdmin()
    if (denied) return denied

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')

    const where: Prisma.UserWhereInput = {}
    if (level) where.level = level

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        phone: true,
        level: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    })

    return successResponse(users)
  } catch (error) {
    console.error('Admin users GET error:', error)
    return errorResponse('加载用户列表失败', 500)
  }
}

export async function POST(request: NextRequest) {
  const denied = await checkAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { phone, password, username, level = 'USER' } = body

    if (!phone || !password || !username) {
      return errorResponse('手机号、密码和用户名不能为空')
    }

    if (!['USER', 'SELLER', 'ADMIN'].includes(level)) {
      return errorResponse('无效的用户级别')
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { username }],
      },
    })

    if (existingUser) {
      return errorResponse('手机号或用户名已存在')
    }

    const user = await prisma.user.create({
      data: {
        phone,
        username,
        passwordHash: hashPassword(password),
        level,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      },
    })

    if (level === 'SELLER') {
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
        },
      })
    }

    return successResponse({
      id: user.id,
      phone: user.phone,
      username: user.username,
      level: user.level,
      avatar: user.avatar,
    }, '创建成功')
  } catch (error) {
    console.error('Admin create user error:', error)
    return errorResponse('创建用户失败', 500)
  }
}
