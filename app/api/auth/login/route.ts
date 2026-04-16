import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, code, type = 'password' } = body

    if (!phone) {
      return errorResponse('手机号不能为空')
    }

    let user = await prisma.user.findUnique({
      where: { phone },
    })

    if (type === 'sms') {
      if (!code) {
        return errorResponse('验证码不能为空')
      }

      const record = await prisma.verificationCode.findFirst({
        where: {
          phone,
          code,
          purpose: 'LOGIN',
          used: false,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      })

      if (!record) {
        return errorResponse('验证码错误或已过期')
      }

      await prisma.verificationCode.update({
        where: { id: record.id },
        data: { used: true },
      })

      // Auto-register if user not exists
      if (!user) {
        user = await prisma.user.create({
          data: {
            phone,
            username: `用户${phone.slice(-4)}`,
            passwordHash: '',
            level: 'USER',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
          },
        })
      }
    } else {
      if (!password) {
        return errorResponse('密码不能为空')
      }
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return errorResponse('手机号或密码错误', 401)
      }
    }

    if (!user) {
      return errorResponse('用户不存在', 404)
    }

    if (!user.isActive) {
      return errorResponse('账号已被禁用', 403)
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      level: user.level,
    })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return successResponse({
      id: user.id,
      phone: user.phone,
      username: user.username,
      level: user.level,
      avatar: user.avatar,
      gender: user.gender,
      age: user.age,
      location: user.location,
      bio: user.bio,
      isVerified: user.isVerified,
    }, '登录成功')
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('登录失败，请稍后重试', 500)
  }
}
