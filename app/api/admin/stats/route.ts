import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user || user.level !== 'ADMIN') {
      return errorResponse('无权限', 403)
    }

    const [totalUsers, totalSellers, totalOrders, totalGames, pendingTickets] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { level: 'SELLER' } }),
      prisma.order.count(),
      prisma.game.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    ])

    return successResponse({
      totalUsers,
      totalSellers,
      totalOrders,
      totalGames,
      pendingTickets,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return errorResponse('加载统计数据失败', 500)
  }
}
