import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import { getAlipayConfig, getAlipaySdk, getBaseUrl } from '@/lib/payment'

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  try {
    const body = await request.json()
    const {
      gameId,
      productId,
      categoryId,
      sellerId,
      gamePlatform,
      gameIdUsername,
      gameServerRegion,
      requirements,
      durationHours = 1,
    } = body

    if (!gameId || !productId) {
      return errorResponse('游戏和商品不能为空')
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    })

    if (!product) {
      return errorResponse('商品不存在', 404)
    }

    const commissionRate = 10
    const subtotal = product.basePrice * durationHours
    const platformFee = Math.round(subtotal * (commissionRate / 100) * 100) / 100
    const totalAmount = subtotal + platformFee
    const sellerEarnings = subtotal - platformFee

    // Create payment record first (order will be created after Alipay confirms)
    const payment = await prisma.payment.create({
      data: {
        gateway: 'ALIPAY',
        amount: totalAmount,
        status: 'PENDING',
        metadata: JSON.stringify({
          gameId,
          customerId: authUser.userId,
          sellerId: sellerId || null,
          productId,
          categoryId: categoryId || product.categoryId || null,
          gamePlatform,
          gameIdUsername,
          gameServerRegion,
          requirements,
          durationHours,
          subtotal,
          platformFee,
          totalAmount,
          sellerEarnings,
        }),
      },
    })

    // Initiate Alipay payment
    const config = await getAlipayConfig()
    if (!config.enabled) {
      return errorResponse('支付宝支付未启用')
    }
    if (!config.appId || !config.privateKey || !config.alipayPublicKey) {
      return errorResponse('支付宝配置不完整，请联系管理员配置')
    }

    const alipaySdk = await getAlipaySdk()

    const baseUrl = getBaseUrl()
    const notifyUrl = `${baseUrl}/api/payments/alipay/notify`
    const returnUrl = `${baseUrl}/payment/result?paymentId=${payment.id}`

    const userAgent = request.headers.get('user-agent') || ''
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent)
    const method = isMobile ? 'alipay.trade.wap.pay' : 'alipay.trade.page.pay'
    const productCode = isMobile ? 'QUICK_WAP_WAY' : 'FAST_INSTANT_TRADE_PAY'

    const formHtml = alipaySdk.pageExec(method, 'POST', {
      notifyUrl,
      returnUrl,
      bizContent: {
        outTradeNo: payment.id,
        totalAmount: totalAmount.toFixed(2),
        subject: `订单${payment.id.slice(0, 8)}`,
        productCode,
      },
    })

    return successResponse({ form: formHtml, paymentId: payment.id }, '请前往支付宝完成支付')
  } catch (error) {
    console.error('Checkout pay error:', error)
    return errorResponse(
      error instanceof Error ? error.message : '支付发起失败',
      500
    )
  }
}
