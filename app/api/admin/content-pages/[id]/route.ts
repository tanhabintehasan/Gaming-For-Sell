import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user || user.level !== 'ADMIN') {
      return errorResponse('无权限', 403)
    }

    const { id } = await params
    const page = await prisma.contentPage.findUnique({ where: { id } })
    if (!page) return errorResponse('页面不存在', 404)

    return successResponse(page)
  } catch (error) {
    console.error('Admin content page GET error:', error)
    return errorResponse('加载页面失败', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user || user.level !== 'ADMIN') {
      return errorResponse('无权限', 403)
    }

    const { id } = await params
    const body = await request.json()
    const { slug, title, rawContent, isPublished } = body

    const updateData: Record<string, unknown> = {}
    if (slug !== undefined) updateData.slug = slug
    if (title !== undefined) updateData.title = title
    if (rawContent !== undefined) updateData.rawContent = rawContent
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished
      updateData.publishedAt = isPublished ? new Date() : null
    }

    const page = await prisma.contentPage.update({
      where: { id },
      data: updateData,
    })

    return successResponse(page, '更新成功')
  } catch (error) {
    console.error('Admin content page PATCH error:', error)
    return errorResponse('更新页面失败', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user || user.level !== 'ADMIN') {
      return errorResponse('无权限', 403)
    }

    const { id } = await params
    await prisma.contentPage.delete({ where: { id } })

    return successResponse(null, '删除成功')
  } catch (error) {
    console.error('Admin content page DELETE error:', error)
    return errorResponse('删除页面失败', 500)
  }
}
