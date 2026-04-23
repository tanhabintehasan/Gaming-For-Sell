import { prisma } from './prisma'
import { AlipaySdk } from 'alipay-sdk'

export interface AlipayConfig {
  enabled: boolean
  appId: string
  privateKey: string
  alipayPublicKey: string
  gateway: string
}

export async function getAlipayConfig(): Promise<AlipayConfig> {
  const configs = await prisma.adminConfig.findMany({
    where: {
      configKey: {
        in: [
          'alipay_enabled',
          'alipay_app_id',
          'alipay_private_key',
          'alipay_public_key',
        ],
      },
    },
  })

  const map = new Map(configs.map((c) => [c.configKey, c.configValue]))

  return {
    enabled: map.get('alipay_enabled') === 'true',
    appId: map.get('alipay_app_id') || '',
    privateKey: map.get('alipay_private_key') || '',
    alipayPublicKey: map.get('alipay_public_key') || '',
    gateway:
      process.env.ALIPAY_GATEWAY ||
      (process.env.NODE_ENV === 'production'
        ? 'https://openapi.alipay.com/gateway.do'
        : 'https://openapi.alipaydev.com/gateway.do'),
  }
}

export async function getAlipaySdk() {
  const config = await getAlipayConfig()
  if (!config.enabled) {
    throw new Error('支付宝支付未启用')
  }
  if (!config.appId || !config.privateKey || !config.alipayPublicKey) {
    throw new Error('支付宝配置不完整')
  }

  return new AlipaySdk({
    appId: config.appId,
    privateKey: config.privateKey,
    alipayPublicKey: config.alipayPublicKey,
    gateway: config.gateway,
    signType: 'RSA2',
    charset: 'utf-8',
  })
}

export function getBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
  if (url) {
    url = url.trim()
    // Fix accidental double protocol like https://http://example.com
    url = url.replace(/^(https?:\/\/)(https?:\/\/)/, '$2')
    // Ensure protocol exists
    if (!/^https?:\/\//.test(url)) url = `https://${url}`
    // Remove trailing slash
    url = url.replace(/\/$/, '')
    return url
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
