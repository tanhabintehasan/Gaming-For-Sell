import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
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

    if (!file.type.startsWith('audio/')) {
      return errorResponse('只能上传音频文件')
    }

    if (file.size > 10 * 1024 * 1024) {
      return errorResponse('文件大小不能超过10MB')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop() || 'mp3'
    const filename = `${authUser.userId}_${Date.now()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`

    await prisma.sellerProfile.update({
      where: { userId: authUser.userId },
      data: { voiceIntroUrl: url },
    })

    return successResponse({ url }, '上传成功')
  } catch (error) {
    console.error(error)
    return errorResponse('上传失败', 500)
  }
}
