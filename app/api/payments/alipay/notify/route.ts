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

    const order = await prisma.order.findUnique({
      where: { orderNumber: outTradeNo },
    })

    if (!order) {
      console.error('Alipay notify: order not found', outTradeNo)
      return new Response('success', { status: 200 })
    }

    if (order.status === 'PAID') {
      return new Response('success', { status: 200 })
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() },
      }),
      prisma.payment.updateMany({
        where: { orderId: order.id, status: 'PENDING' },
        data: {
          status: 'SUCCESS',
          gatewayPaymentId: tradeNo,
          paidAt: new Date(),
          gatewayResponse: JSON.stringify(body),
        },
      }),
    ])

    console.log('Alipay notify processed for order', outTradeNo)
    return new Response('success', { status: 200 })
  } catch (error) {
    console.error('Alipay notify error:', error)
    return new Response('fail', { status: 500 })
  }
}
