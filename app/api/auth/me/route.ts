import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return errorResponse('未登录', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: {
        sellerProfile: {
          include: {
            gameServices: {
              include: { game: true },
            },
          },
        },
      },
    })

    if (!user) {
      return errorResponse('用户不存在', 404)
    }

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
      sellerProfile: user.sellerProfile,
    })
  } catch (error) {
    console.error('Get me error:', error)
    return errorResponse('获取用户信息失败', 500)
  }
}
