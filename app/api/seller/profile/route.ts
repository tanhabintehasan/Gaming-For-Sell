import { NextRequest } from 'next/server'
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
    include: {
      user: { select: { id: true, username: true, avatar: true, phone: true, gender: true, age: true, location: true, bio: true } },
      gameServices: { include: { game: { select: { id: true, nameCn: true } } } },
    },
  })

  if (!profile) return errorResponse('打手资料不存在', 404)
  return successResponse(profile)
}

export async function PUT(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser || (authUser.level !== 'SELLER' && authUser.level !== 'ADMIN')) {
    return errorResponse('无权限', 403)
  }

  try {
    const body = await request.json()
    const { username, avatar, gender, age, location, bio, voiceIntroUrl, badges } = body

    await prisma.user.update({
      where: { id: authUser.userId },
      data: { username, avatar, gender, age, location, bio },
    })

    const updated = await prisma.sellerProfile.update({
      where: { userId: authUser.userId },
      data: { voiceIntroUrl, badges },
      include: {
        user: { select: { id: true, username: true, avatar: true, phone: true, gender: true, age: true, location: true, bio: true } },
        gameServices: { include: { game: { select: { id: true, nameCn: true } } } },
      },
    })

    return successResponse(updated, '保存成功')
  } catch (error) {
    console.error('Update seller profile error:', error)
    return errorResponse('保存失败', 500)
  }
}
