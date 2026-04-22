import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.level !== 'ADMIN') {
      return errorResponse('无权限', 403)
    }

    const withdrawals = await prisma.withdrawal.findMany({
      orderBy: { requestedAt: 'desc' },
      include: {
        seller: { select: { id: true, username: true, phone: true, sellerProfile: { select: { balance: true } } } },
      },
    })

    return successResponse(withdrawals)
  } catch (error) {
    console.error('Admin withdrawals GET error:', error)
    return errorResponse('加载提现列表失败', 500)
  }
}

export async function PATCH(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  try {
    const body = await request.json()
    const { id, status, reviewNote } = body

    if (!id || !status) {
      return errorResponse('参数不完整')
    }

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } })
    if (!withdrawal) return errorResponse('提现记录不存在', 404)

    if (status === 'REJECTED' && withdrawal.status === 'PENDING') {
      await prisma.$transaction([
        prisma.sellerProfile.update({
          where: { userId: withdrawal.sellerId },
          data: { balance: { increment: withdrawal.amount } },
        }),
        prisma.withdrawal.update({
          where: { id },
          data: {
            status,
            reviewedBy: authUser.userId,
            reviewNote,
            reviewedAt: new Date(),
          },
        }),
      ])
    } else {
      await prisma.withdrawal.update({
        where: { id },
        data: {
          status,
          reviewedBy: authUser.userId,
          reviewNote,
          reviewedAt: new Date(),
          ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
        },
      })
    }

    return successResponse(null, '操作成功')
  } catch (error) {
    console.error('Admin withdrawal patch error:', error)
    return errorResponse('操作失败', 500)
  }
}
