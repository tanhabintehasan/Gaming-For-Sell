import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user || user.level !== 'ADMIN') {
      return errorResponse('无权限', 403)
    }

    const pages = await prisma.contentPage.findMany({
      orderBy: { updatedAt: 'desc' },
    })

    return successResponse(pages)
  } catch (error) {
    console.error('Admin content pages GET error:', error)
    return errorResponse('加载页面列表失败', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || user.level !== 'ADMIN') {
      return errorResponse('无权限', 403)
    }

    const body = await request.json()
    const { slug, title, rawContent, isPublished } = body

    if (!slug || !title || !rawContent) {
      return errorResponse('Slug、标题和内容不能为空')
    }

    const existing = await prisma.contentPage.findUnique({ where: { slug } })
    if (existing) {
      return errorResponse('该Slug已存在', 409)
    }

    const page = await prisma.contentPage.create({
      data: {
        slug,
        title,
        rawContent,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
      },
    })

    return successResponse(page, '创建成功')
  } catch (error) {
    console.error('Admin content pages POST error:', error)
    return errorResponse('创建页面失败', 500)
  }
}
