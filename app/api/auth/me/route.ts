import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return Response.json(
        { success: false, message: '未登录', data: null, user: null, error: 'Unauthorized' },
        { status: 401 }
      )
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
      return Response.json(
        { success: false, message: '用户不存在', data: null, user: null, error: 'Not found' },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      message: 'Success',
      data: {
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
      },
    })
  } catch (error) {
    console.error('Get me error:', error)
    return Response.json(
      { success: false, message: '获取用户信息失败', data: null, user: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
