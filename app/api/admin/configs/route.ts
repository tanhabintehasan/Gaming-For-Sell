import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

async function checkAdmin() {
  const user = await getAuthUser()
  if (!user || user.level !== 'ADMIN') {
    return errorResponse('无权限', 403)
  }
  return null
}

const defaultConfigs = [
  { configKey: 'site_name', configValue: '速凌电竞', category: 'general', description: '网站名称' },
  { configKey: 'site_logo', configValue: '/logo.png', category: 'general', description: '网站Logo' },
  { configKey: 'commission_rate', configValue: '10', category: 'finance', description: '平台服务费比例%' },
  { configKey: 'sms_enabled', configValue: 'false', category: 'sms', description: '是否启用短信' },
  { configKey: 'sms_provider', configValue: 'smsbao', category: 'sms', description: '短信服务商' },
  { configKey: 'smsbao_username', configValue: '', category: 'sms', description: '短信宝用户名' },
  { configKey: 'smsbao_password', configValue: '', category: 'sms', description: '短信宝密码' },
  { configKey: 'smsbao_template', configValue: '您的验证码是[code]，请勿泄露。', category: 'sms', description: '短信宝验证码模板' },
  { configKey: 'alipay_enabled', configValue: 'true', category: 'payment', description: '是否启用支付宝' },
  { configKey: 'alipay_app_id', configValue: '', category: 'payment', description: '支付宝 App ID' },
  { configKey: 'alipay_private_key', configValue: '', category: 'payment', description: '支付宝私钥' },
  { configKey: 'alipay_public_key', configValue: '', category: 'payment', description: '支付宝公钥' },
  { configKey: 'wechat_pay_enabled', configValue: 'true', category: 'payment', description: '是否启用微信支付' },
  { configKey: 'wechat_mch_id', configValue: '', category: 'payment', description: '微信商户号 MCH ID' },
  { configKey: 'wechat_api_key', configValue: '', category: 'payment', description: '微信 API 密钥' },
  { configKey: 'wechat_app_id', configValue: '', category: 'payment', description: '微信 App ID' },
  { configKey: 'customer_service_qr', configValue: '', category: 'general', description: '客服二维码' },
]

export async function GET() {
  try {
    const denied = await checkAdmin()
    if (denied) return denied

    const existing = await prisma.adminConfig.findMany({
      orderBy: { category: 'asc' },
    })

    const existingMap = new Map(existing.map((c) => [c.configKey, c]))

    const merged = defaultConfigs.map((def) => {
      const ex = existingMap.get(def.configKey)
      return ex || def
    })

    // Also include any existing configs not in defaults
    const mergedKeys = new Set(defaultConfigs.map((d) => d.configKey))
    existing.forEach((ex) => {
      if (!mergedKeys.has(ex.configKey)) {
        merged.push(ex)
      }
    })

    return successResponse(merged)
  } catch (error) {
    console.error('Admin configs GET error:', error)
    return errorResponse('加载配置失败', 500)
  }
}

export async function POST(request: NextRequest) {
  const denied = await checkAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { configKey, configValue, category, description } = body

    const config = await prisma.adminConfig.upsert({
      where: { configKey },
      update: {
        configValue,
        category,
        description,
        updatedAt: new Date(),
      },
      create: {
        configKey,
        configValue,
        category,
        description,
      },
    })

    return successResponse(config, '配置更新成功')
  } catch (error) {
    console.error(error)
    return errorResponse('更新配置失败', 500)
  }
}
