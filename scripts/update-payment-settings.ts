import { prisma } from '../lib/prisma'

// ⚠️ SECURITY WARNING:
// The private key below was reconstructed from the chat message.
// It was exposed in plain text. You should rotate it in the Alipay Developer Console ASAP.

const ALIPAY_APP_ID = '2021006150663026'

// The user's private key got accidentally split by the phrase " and public key : "
// We reconstruct the full PKCS#8 private key here.
const PRIVATE_KEY_PART1 =
  'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCH+tfWxu8ZgDYr2+2Rh2g65FTshBJQB5nsbM231MRdNOOloYYSR3Z9YNoBcYvKUpjLcjeDXVgplY6/FkYhHNVS9MIhQC0nYpQliHBGjxUUONXUv73vN5Y5+gXRLOefG3qmnmGLsmewcmsGoOefT8gavR3jvDXIoADg5FBWglMl4tkyUzBQo+iuwACr1C4UBxeABEgESmQHVEJ2NkwZF6eOsR8lT99EcT1Dq+WLO5yLvz3FYY/6Gm1Dy83Mofzs+BLu9Cw1SCiSE1zozfQaMNijvcNhUbbuVaKzCN80ve2PV+HpwiXbfY0EZ6M2AD0YXzTRwmEDX5e+vCfpkGkFctm5AgMBAAECggEAEjis35z8wUALAkmQRiYM84dRUfhIs+yw1Zum3XFnds31i2Zfnudwm1B1JihfARecXfbKNZI2lCv0WurTLvC8LUebE/WTl2mATJ9B3FKkEnejP8UJ4JpkSRSV3vfTeeCmyNkEXUHk3yIV8WdyYkjAmcSp0rCPzHiUZY5yrYT9O2A+kxgJ+BPzTVGoWQP40QckVAm8rQgA3UGfv7bh9ilsOAEKhypuOyAIxIz6KBGqGzX9YchsCA9kdiO/M++PmJDTC6S2NvWIlS5hg54eypdJLJBSBQ82KKX6y2K7xsqI9wo7gZOSjKG6DM71kUK2Xx1lj0BVn6bh3bS/'

const PRIVATE_KEY_PART2 =
  '+NLuULNyWQKBgQC+YwSs/KT3H35MCZFi7snCWZ7kx+r4hxlb2471XIplXXTU0vVK4ezgD4HrIOK46QjyqEiEhxeKJD+Z/cg13xLpUt/En8IMWKfpSTYUoGV/IxHG1fobpHMgTDfcOyazNeA//VEyZ5gxFdExeXBtyPoCRH4z63ONziV4h3W8O4sT7wKBgQC2174R/MeiSpu7b3irKtZzMu3KlMuwJJEKXKlFrqLCtGBODAPJc6ZbUjJLbGSaRG+7WY/PNc/bynr25IQ0ij01X3QjnVfy/A8VHg8WMyGVcMU2vzG70x8Zth6igCP5TEGhOsQzhQdFPL1vzmTLWceXC0INQu73yoAD7qRKYyCk1wKBgB5l8Pkt3akXfjLl1DDXr584cAZXZU0JRSNFiy3h+Lb2lRDmHgQ2znt3/mZsecbMboFQHUQLzdZgs0cDHlR7qalXciMS3wjZnvXAmsHwWkRSdSQqRiTjvP4LLWAckbFLiOKur6g8ojA0K5KasTjWPhTemsfvcCPUJmd4OXQ0jaBBAoGAYzZTm10HUiebsyv8VRyMervSzc7Ja42b6fx3mSj2hiHr882PLHuFdB34znZFbHPgEM+7OdtgK0oGSPucRQoRxmlCEqUo+N8OrA3Ab/JUscscJ+W87cbUJFZu7wwK+RYIspy5o572X/pibE2Y4cKYi3v/XkTIeEo4BmoyWW7KYscCgYEAu0yBDJoxvarXc7Eh1faNCv8dL3zbhVDJzvI/ZlM0xRV90ahpGjLR9mGqwD1xriX/98qi4NC5kgwAxUlDhm+/9e3EZ/PvNdWWwcswQ5ld30vwfyypDAtdG7Wmy64nsIlfPOuuGDX9hUerTra/0o3hazua/HbbOx5zuF9nfBuLKVo='

const ALIPAY_PRIVATE_KEY = PRIVATE_KEY_PART1 + PRIVATE_KEY_PART2

// IMPORTANT: This is Alipay's public key (not your app's public key).
const ALIPAY_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh/rX1sbvGYA2K9vtkYdoOuRU7IQSUAeZ7GzNt9TEXTTjpaGGEkd2fWDaAXGLylKYy3I3g11YKZWOvxZGIRzVUvTCIUAtJ2KUJYhwRo8VFDjV1L+97zeWOfoF0Sznnxt6pp5hi7JnsHJrBqDnn0/IGr0d47w1yKAA4ORQVoJTJeLZMlMwUKPorsAAq9QuFAcXgARIBEpkB1RCdjZMGRenjrEfJU/fRHE9Q6vlizuci789xWGP+hptQ8vNzKH87PgS7vQsNUgokhNc6M30GjDYo73DYVG27lWiswjfNL3tj1fh6cIl232NBGejNgA9GF800cJhA1+Xvrwn6ZBpBXLZuQIDAQAB'

async function main() {
  const settings = [
    {
      configKey: 'alipay_enabled',
      configValue: 'true',
      category: 'payment',
      description: '是否启用支付宝',
    },
    {
      configKey: 'alipay_app_id',
      configValue: ALIPAY_APP_ID,
      category: 'payment',
      description: '支付宝 App ID',
    },
    {
      configKey: 'alipay_private_key',
      configValue: ALIPAY_PRIVATE_KEY,
      category: 'payment',
      description: '支付宝私钥',
    },
    {
      configKey: 'alipay_public_key',
      configValue: ALIPAY_PUBLIC_KEY,
      category: 'payment',
      description: '支付宝公钥（从支付宝开放平台获取）',
    },
  ]

  for (const s of settings) {
    await prisma.adminConfig.upsert({
      where: { configKey: s.configKey },
      update: { configValue: s.configValue },
      create: s,
    })
    console.log(`✅ Updated ${s.configKey}`)
  }

  console.log('\n🎉 Payment settings updated.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
