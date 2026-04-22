import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  const { id } = await params
  const body = await request.json()

  try {
    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.iconUrl !== undefined) updateData.iconUrl = body.iconUrl
    if (body.defaultHourlyRate !== undefined) updateData.defaultHourlyRate = parseFloat(body.defaultHourlyRate)
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder)
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const updated = await prisma.gameCategory.update({
      where: { id },
      data: updateData,
    })
    return successResponse(updated, '更新成功')
  } catch (error) {
    console.error(error)
    return errorResponse('更新分类失败', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser || authUser.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }

  const { id } = await params

  try {
    await prisma.gameCategory.delete({ where: { id } })
    return successResponse(null, '删除成功')
  } catch (error) {
    console.error(error)
    return errorResponse('删除分类失败', 500)
  }
}
