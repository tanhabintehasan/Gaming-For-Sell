import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import { getAlipayConfig, getAlipaySdk, getBaseUrl } from '@/lib/payment'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser()
  if (!authUser) return errorResponse('未登录', 401)

  const { id } = await params
  const body = await request.json()
  const { gateway } = body

  if (!gateway || !['ALIPAY', 'WECHAT_PAY'].includes(gateway)) {
    return errorResponse('请选择支付方式')
  }

  if (gateway === 'WECHAT_PAY') {
    return errorResponse('微信支付暂未接入，请选择支付宝')
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      customerId: authUser.userId,
      status: 'PENDING',
    },
  })

  if (!order) {
    return errorResponse('订单不存在或已支付', 404)
  }

  try {
    const config = await getAlipayConfig()
    if (!config.enabled) {
      return errorResponse('支付宝支付未启用')
    }
    if (!config.appId || !config.privateKey) {
      return errorResponse('支付宝支付配置不完整，请联系管理员配置')
    }
    if (!config.alipayPublicKey) {
      return errorResponse('支付宝公钥未配置，请联系管理员')
    }

    const alipaySdk = await getAlipaySdk()

    // Create or reuse pending payment record
    let payment = await prisma.payment.findFirst({
      where: { orderId: order.id, status: 'PENDING', gateway: 'ALIPAY' },
    })

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          gateway: 'ALIPAY',
          amount: order.totalAmount,
          status: 'PENDING',
        },
      })
    }

    const baseUrl = getBaseUrl()
    const notifyUrl = `${baseUrl}/api/payments/alipay/notify`
    const returnUrl = `${baseUrl}/payment/result?orderNumber=${order.orderNumber}`

    const userAgent = request.headers.get('user-agent') || ''
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent)
    const method = isMobile ? 'alipay.trade.wap.pay' : 'alipay.trade.page.pay'
    const productCode = isMobile ? 'QUICK_WAP_WAY' : 'FAST_INSTANT_TRADE_PAY'

    const formHtml = alipaySdk.pageExec(method, 'POST', {
      notifyUrl,
      returnUrl,
      bizContent: {
        outTradeNo: order.orderNumber,
        totalAmount: order.totalAmount.toFixed(2),
        subject: `订单${order.orderNumber}`,
        productCode,
      },
    })

    return successResponse({ form: formHtml }, '请前往支付宝完成支付')
  } catch (error) {
    console.error('Alipay pay error:', error)
    return errorResponse(
      error instanceof Error ? error.message : '支付发起失败',
      500
    )
  }
}
