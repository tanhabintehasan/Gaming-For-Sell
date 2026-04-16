import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)
  if (authUser.level !== 'SELLER' && authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return errorResponse('请选择文件')
    }

    if (!file.type.startsWith('image/')) {
      return errorResponse('只能上传图片文件')
    }

    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('文件大小不能超过5MB')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop() || 'png'
    const filename = `avatar_${authUser.userId}_${Date.now()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/avatars/${filename}`

    await prisma.user.update({
      where: { id: authUser.userId },
      data: { avatar: url },
    })

    return successResponse({ url }, '上传成功')
  } catch (error) {
    console.error(error)
    return errorResponse('上传失败', 500)
  }
}
