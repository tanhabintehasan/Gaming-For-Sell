import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser || (authUser.level !== 'SELLER' && authUser.level !== 'ADMIN')) {
    return errorResponse('无权限', 403)
  }

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: authUser.userId },
    select: { balance: true, totalEarnings: true },
  })

  const orders = await prisma.order.findMany({
    where: { sellerId: authUser.userId, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      sellerEarnings: true,
      completedAt: true,
      game: { select: { nameCn: true } },
      customer: { select: { username: true } },
    },
  })

  const withdrawals = await prisma.withdrawal.findMany({
    where: { sellerId: authUser.userId },
    orderBy: { requestedAt: 'desc' },
    select: {
      id: true,
      amount: true,
      fee: true,
      netAmount: true,
      status: true,
      requestedAt: true,
      reviewedAt: true,
    },
  })

  return successResponse({
    balance: profile?.balance || 0,
    totalEarnings: profile?.totalEarnings || 0,
    orders,
    withdrawals,
  })
}
