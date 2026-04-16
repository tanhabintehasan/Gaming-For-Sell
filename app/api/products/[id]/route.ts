import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      game: true,
      category: true,
    },
  })

  if (!product) {
    return errorResponse('商品不存在', 404)
  }

  await prisma.product.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })

  return successResponse(product)
}
