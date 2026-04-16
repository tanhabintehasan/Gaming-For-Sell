import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import { writeFile } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser || (authUser.level !== 'ADMIN' && authUser.level !== 'SELLER')) {
    return errorResponse('无权限', 403)
  }

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) {
    return errorResponse('商品不存在', 404)
  }

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return errorResponse('音频文件不能为空')
    }

    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const ext = path.extname(audioFile.name) || '.mp3'
    const filename = `${id}_${Date.now()}${ext}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const audioUrl = `/uploads/audio/${filename}`

    const updated = await prisma.product.update({
      where: { id },
      data: { audioUrl },
    })

    return successResponse({ audioUrl: updated.audioUrl }, '音频上传成功')
  } catch (error) {
    console.error('Audio upload error:', error)
    return errorResponse('上传失败', 500)
  }
}
