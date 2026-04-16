import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || (authUser.level !== 'SELLER' && authUser.level !== 'ADMIN')) {
    return errorResponse('无权限', 403)
  }

  try {
    const body = await request.json()
    const { amount, method, accountInfo } = body

    if (!amount || amount <= 0 || !method || !accountInfo) {
      return errorResponse('参数不完整')
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: authUser.userId },
      select: { balance: true },
    })

    if (!profile || profile.balance < amount) {
      return errorResponse('余额不足')
    }

    const fee = 0
    const netAmount = amount - fee

    await prisma.$transaction([
      prisma.sellerProfile.update({
        where: { userId: authUser.userId },
        data: { balance: { decrement: amount } },
      }),
      prisma.withdrawal.create({
        data: {
          sellerId: authUser.userId,
          amount,
          fee,
          netAmount,
          method,
          accountInfo,
          status: 'PENDING',
        },
      }),
    ])

    return successResponse(null, '提现申请已提交')
  } catch (error) {
    console.error('Withdrawal error:', error)
    return errorResponse('提现申请失败', 500)
  }
}
