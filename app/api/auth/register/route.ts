import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, username, level = 'USER' } = body

    if (!phone || !password || !username) {
      return errorResponse('手机号、密码和用户名不能为空')
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

    const token = signToken({
      userId: user.id,
      username: user.username,
      level: user.level,
    })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return successResponse({
      id: user.id,
      phone: user.phone,
      username: user.username,
      level: user.level,
      avatar: user.avatar,
    }, '注册成功')
  } catch (error) {
    console.error('Register error:', error)
    return errorResponse('注册失败，请稍后重试', 500)
  }
}
