import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAlipaySdk } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    let valid = false
    try {
      const alipaySdk = await getAlipaySdk()
      valid = alipaySdk.checkNotifySignV2(body)
    } catch {
      console.error('Alipay SDK initialization failed – public key may be missing')
      return new Response('fail', { status: 400 })
    }

    if (!valid) {
      console.error('Alipay notify sign invalid', body)
      return new Response('fail', { status: 400 })
    }

    const outTradeNo = body.out_trade_no
    const tradeNo = body.trade_no
    const tradeStatus = body.trade_status

    if (!outTradeNo) {
      return new Response('fail', { status: 400 })
    }

    // Only process successful payments
    if (tradeStatus !== 'TRADE_SUCCESS' && tradeStatus !== 'TRADE_FINISHED') {
      return new Response('success', { status: 200 })
    }

    // Find the payment record by its ID (used as out_trade_no)
    const payment = await prisma.payment.findUnique({
      where: { id: outTradeNo },
    })

    if (!payment) {
      console.error('Alipay notify: payment not found', outTradeNo)
      return new Response('success', { status: 200 })
    }

    if (payment.status === 'SUCCESS') {
      return new Response('success', { status: 200 })
    }

    // Parse metadata to create the order
    let metadata: any = {}
    try {
      metadata = JSON.parse(payment.metadata || '{}')
    } catch {
      console.error('Alipay notify: failed to parse payment metadata', outTradeNo)
      return new Response('fail', { status: 500 })
    }

    if (!metadata.gameId || !metadata.productId) {
      console.error('Alipay notify: missing metadata fields', outTradeNo)
      return new Response('fail', { status: 500 })
    }

    const orderNumber = `SL${Date.now()}${Math.floor(Math.random() * 1000)}`

    await prisma.$transaction([
      prisma.order.create({
        data: {
          orderNumber,
          gameId: metadata.gameId,
          customerId: metadata.customerId,
          sellerId: metadata.sellerId || null,
          productId: metadata.productId,
          categoryId: metadata.categoryId || null,
          status: 'PAID',
          subtotal: metadata.subtotal,
          platformFee: metadata.platformFee,
          totalAmount: metadata.totalAmount,
          sellerEarnings: metadata.sellerEarnings,
          gamePlatform: metadata.gamePlatform || null,
          gameIdUsername: metadata.gameIdUsername || null,
          gameServerRegion: metadata.gameServerRegion || null,
          requirements: metadata.requirements || null,
          durationHours: metadata.durationHours || 1,
          paidAt: new Date(),
        },
      }),
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          gatewayPaymentId: tradeNo,
          paidAt: new Date(),
          gatewayResponse: JSON.stringify(body),
        },
      }),
    ])

    console.log('Alipay notify processed for payment', outTradeNo, 'order created', orderNumber)
    return new Response('success', { status: 200 })
  } catch (error) {
    console.error('Alipay notify error:', error)
    return new Response('fail', { status: 500 })
  }
}
