import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/api'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('gameId')
  const gender = searchParams.get('gender')
  const platform = searchParams.get('platform')
  const minRating = searchParams.get('minRating')
  const isOnline = searchParams.get('isOnline')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const where: Prisma.UserWhereInput = {}

  if (gender) {
    where.gender = gender
  }

  if (gameId || platform || minRating || isOnline) {
    where.sellerProfile = {
      isVerified: true,
    }

    if (isOnline === 'true') {
      where.sellerProfile.isOnline = true
    }

    if (gameId || platform || minRating) {
      const gameServiceConditions: Prisma.SellerGameServiceWhereInput = {
        isAvailable: true,
      }

      if (gameId) {
        gameServiceConditions.gameId = gameId
      }

      if (platform) {
        gameServiceConditions.platformTypes = {
          contains: platform,
        }
      }

      if (minRating) {
        gameServiceConditions.rating = {
          gte: parseFloat(minRating),
        }
      }

      where.sellerProfile = {
        ...where.sellerProfile,
        gameServices: {
          some: gameServiceConditions,
        },
      }
    }
  } else {
    where.sellerProfile = { isVerified: true }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        sellerProfile: {
          include: {
            gameServices: {
              include: { game: true },
            },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return successResponse({ sellers: users, total, limit, offset })
}
