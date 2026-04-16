import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code, purpose = 'LOGIN' } = body

    if (!phone || !code) {
      return errorResponse('手机号和验证码不能为空')
    }

    const record = await prisma.verificationCode.findFirst({
      where: {
        phone,
        code,
        purpose,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!record) {
      return errorResponse('验证码错误或已过期')
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    })

    return successResponse({ phone, purpose }, '验证成功')
  } catch (error) {
    console.error('Verify SMS error:', error)
    return errorResponse('验证失败', 500)
  }
}
