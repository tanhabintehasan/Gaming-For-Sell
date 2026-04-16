import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { createHash } from 'crypto'

function md5(str: string): string {
  return createHash('md5').update(str).digest('hex')
}

function generateCode(length = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, purpose = 'LOGIN' } = body

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return errorResponse('请输入有效的手机号')
    }

    // Fetch SMS configs
    const configs = await prisma.adminConfig.findMany({
      where: {
        configKey: {
          in: ['sms_enabled', 'smsbao_username', 'smsbao_password', 'smsbao_template'],
        },
      },
    })

    const configMap = new Map(configs.map((c) => [c.configKey, c.configValue]))

    if (configMap.get('sms_enabled') !== 'true') {
      return errorResponse('短信服务未启用')
    }

    const username = configMap.get('smsbao_username') || ''
    const password = configMap.get('smsbao_password') || ''
    const template = configMap.get('smsbao_template') || '您的验证码是[code]，请勿泄露。'

    if (!username || !password) {
      return errorResponse('短信账号未配置')
    }

    // Generate code
    const code = generateCode()
    const content = template.replace(/\[code\]/g, code)

    // Send via SMS Bao
    const passwordHash = md5(password)
    const url = `https://api.smsbao.com/sms?u=${encodeURIComponent(username)}&p=${passwordHash}&m=${encodeURIComponent(phone)}&c=${encodeURIComponent(content)}`

    const smsRes = await fetch(url)
    const smsText = await smsRes.text()

    // Log SMS
    await prisma.smsLog.create({
      data: {
        phone,
        templateCode: 'smsbao_template',
        content,
        variables: JSON.stringify({ code }),
        status: smsText === '0' ? 'SUCCESS' : `FAILED:${smsText}`,
        gatewayResponse: smsText,
        sentAt: new Date(),
      },
    })

    if (smsText !== '0') {
      return errorResponse('短信发送失败，请稍后重试', 500)
    }

    // Save verification code (expires in 10 minutes)
    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    return successResponse({ phone }, '验证码已发送')
  } catch (error) {
    console.error('Send SMS error:', error)
    return errorResponse('发送验证码失败', 500)
  }
}
