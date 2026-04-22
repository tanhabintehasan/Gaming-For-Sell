import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data in dependency-safe order
  await prisma.supportReply.deleteMany()
  await prisma.supportTicket.deleteMany()
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.message.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.sellerGameService.deleteMany()
  await prisma.gameCategory.deleteMany()
  await prisma.sellerProfile.deleteMany()
  await prisma.withdrawal.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.smsLog.deleteMany()
  await prisma.adminConfig.deleteMany()
  await prisma.contentPage.deleteMany()
  await prisma.user.deleteMany()
  await prisma.game.deleteMany()

  const hashedPassword = await bcrypt.hash('123456', 10)

  // Admin user
  await prisma.user.create({
    data: {
      phone: '13800138000',
      username: 'admin',
      passwordHash: hashedPassword,
      level: 'ADMIN',
      isVerified: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  })

  // Regular users
  const userData = [
    { username: '小明', phone: '13900139001', gender: 'MALE', age: 20, location: '北京市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' },
    { username: '小红', phone: '13900139002', gender: 'FEMALE', age: 22, location: '上海市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2' },
    { username: '阿强', phone: '13900139003', gender: 'MALE', age: 24, location: '广州市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3' },
    { username: '丽丽', phone: '13900139004', gender: 'FEMALE', age: 21, location: '深圳市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4' },
    { username: '大壮', phone: '13900139005', gender: 'MALE', age: 26, location: '成都市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5' },
    // Former sellers 1-5 now regular users
    { username: '凌速-陈尾鱼', phone: '13800138001', gender: 'MALE', age: 22, location: '广州市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller1' },
    { username: '凌速-小浩', phone: '13800138002', gender: 'MALE', age: 22, location: '重庆市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller2' },
    { username: '凌速-子溪', phone: '13800138003', gender: 'FEMALE', age: 22, location: '成都市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller3' },
    { username: '凌速-玫瑰', phone: '13800138004', gender: 'FEMALE', age: 20, location: '徐州市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller4' },
    { username: '凌速-阿文', phone: '13800138005', gender: 'MALE', age: 24, location: '北京市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller5' },
  ]

  for (const u of userData) {
    await prisma.user.create({
      data: {
        phone: u.phone,
        username: u.username,
        passwordHash: hashedPassword,
        level: 'USER',
        gender: u.gender as any,
        age: u.age,
        location: u.location,
        avatar: u.avatar,
        isVerified: true,
      },
    })
  }

  // Games - sequential instead of Promise.all
  const games = []

  games.push(
    await prisma.game.create({
      data: {
        nameCn: '三角洲行动',
        nameEn: 'Delta Force',
        slug: 'delta-force',
        logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=1080&fit=crop',
        supportedPlatforms: 'MOBILE,PC',
        description: '战术射击游戏，提供护航、清图、任务等多种服务',
        sortOrder: 10,
        isActive: true,
      },
    })
  )

  games.push(
    await prisma.game.create({
      data: {
        nameCn: '王者荣耀',
        nameEn: 'Honor of Kings',
        slug: 'honor-of-kings',
        logoUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&h=1080&fit=crop',
        supportedPlatforms: 'MOBILE',
        description: '腾讯5V5英雄公平对战手游',
        sortOrder: 9,
        isActive: true,
      },
    })
  )

  games.push(
    await prisma.game.create({
      data: {
        nameCn: '和平精英',
        nameEn: 'Game for Peace',
        slug: 'game-for-peace',
        logoUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1920&h=1080&fit=crop',
        supportedPlatforms: 'MOBILE',
        description: '腾讯战术竞技手游',
        sortOrder: 8,
        isActive: true,
      },
    })
  )

  games.push(
    await prisma.game.create({
      data: {
        nameCn: '英雄联盟',
        nameEn: 'League of Legends',
        slug: 'league-of-legends',
        logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=1920&h=1080&fit=crop',
        supportedPlatforms: 'PC',
        description: 'Riot Games开发的MOBA游戏',
        sortOrder: 7,
        isActive: true,
      },
    })
  )

  games.push(
    await prisma.game.create({
      data: {
        nameCn: '无畏契约',
        nameEn: 'Valorant',
        slug: 'valorant',
        logoUrl: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop',
        supportedPlatforms: 'PC',
        description: '5v5战术射击游戏',
        sortOrder: 6,
        isActive: true,
      },
    })
  )

  games.push(
    await prisma.game.create({
      data: {
        nameCn: '原神',
        nameEn: 'Genshin Impact',
        slug: 'genshin-impact',
        logoUrl: 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&h=1080&fit=crop',
        supportedPlatforms: 'MOBILE,PC,CONSOLE',
        description: '开放世界冒险游戏',
        sortOrder: 5,
        isActive: true,
      },
    })
  )

  games.push(
    await prisma.game.create({
      data: {
        nameCn: 'CS:GO',
        nameEn: 'Counter-Strike 2',
        slug: 'csgo',
        logoUrl: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop',
        supportedPlatforms: 'PC',
        description: '经典FPS竞技游戏',
        sortOrder: 4,
        isActive: true,
      },
    })
  )

  games.push(
    await prisma.game.create({
      data: {
        nameCn: '永劫无间',
        nameEn: 'Naraka: Bladepoint',
        slug: 'naraka-bladepoint',
        logoUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&h=200&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&h=1080&fit=crop',
        supportedPlatforms: 'PC',
        description: '武侠吃鸡竞技游戏',
        sortOrder: 3,
        isActive: true,
      },
    })
  )

  const deltaForce = games[0]
  const hok = games[1]

  // Delta Force categories - sequential
  const dfCategories = []
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '新品专区', slug: 'new-arrivals', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 1, defaultHourlyRate: 100 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '体验专区', slug: 'experience', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 2, defaultHourlyRate: 50 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '任务专区', slug: 'missions', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 3, defaultHourlyRate: 120 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '航天专区', slug: 'aerospace', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 4, defaultHourlyRate: 150 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '女陪专区', slug: 'female-companions', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 5, defaultHourlyRate: 200 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '趣味专区', slug: 'fun', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 6, defaultHourlyRate: 80 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '监狱专区', slug: 'prison', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 7, defaultHourlyRate: 100 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '陪玩专区', slug: 'companion-play', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 8, defaultHourlyRate: 150 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '大红专区', slug: 'big-red', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 9, defaultHourlyRate: 180 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '清图专区', slug: 'map-clear', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 10, defaultHourlyRate: 288 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '手游专区', slug: 'mobile', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 11, defaultHourlyRate: 100 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '小金专区', slug: 'small-gold', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 12, defaultHourlyRate: 120 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '包出专区', slug: 'guaranteed', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 13, defaultHourlyRate: 300 } }))
  dfCategories.push(await prisma.gameCategory.create({ data: { gameId: deltaForce.id, name: '休闲娱乐', slug: 'leisure', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 14, defaultHourlyRate: 80 } }))

  // Honor of Kings categories - sequential
  const hokCategories = []
  hokCategories.push(await prisma.gameCategory.create({ data: { gameId: hok.id, name: '排位上分', slug: 'rank-boosting', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 1, defaultHourlyRate: 80 } }))
  hokCategories.push(await prisma.gameCategory.create({ data: { gameId: hok.id, name: '英雄教学', slug: 'hero-coaching', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 2, defaultHourlyRate: 60 } }))
  hokCategories.push(await prisma.gameCategory.create({ data: { gameId: hok.id, name: '开黑陪玩', slug: 'team-companion', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 3, defaultHourlyRate: 50 } }))
  hokCategories.push(await prisma.gameCategory.create({ data: { gameId: hok.id, name: '巅峰赛', slug: 'peak-match', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 4, defaultHourlyRate: 120 } }))
  hokCategories.push(await prisma.gameCategory.create({ data: { gameId: hok.id, name: '国标代打', slug: 'national-badge', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 5, defaultHourlyRate: 200 } }))
  hokCategories.push(await prisma.gameCategory.create({ data: { gameId: hok.id, name: '娱乐模式', slug: 'casual-mode', iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop', sortOrder: 6, defaultHourlyRate: 40 } }))

  // Seller users + profiles (only 3 sellers now)
  const sellerData = [
    { username: '凌速-小雨', phone: '13800138006', gender: 'FEMALE', age: 21, location: '上海市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller6' },
    { username: '凌速-战神', phone: '13800138007', gender: 'MALE', age: 25, location: '深圳市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller7' },
    { username: '凌速-萌萌', phone: '13800138008', gender: 'FEMALE', age: 19, location: '杭州市', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller8' },
  ]

  const sellers: Array<{ user: { id: string }, profile: { id: string } }> = []

  for (const s of sellerData) {
    const user = await prisma.user.create({
      data: {
        phone: s.phone,
        username: s.username,
        passwordHash: hashedPassword,
        level: 'SELLER',
        gender: s.gender as any,
        age: s.age,
        location: s.location,
        avatar: s.avatar,
        isVerified: true,
        bio: '专业电竞陪玩，技术过硬，服务态度好',
      },
    })

    const profile = await prisma.sellerProfile.create({
      data: {
        userId: user.id,
        isOnline: Math.random() > 0.3,
        lastOnlineAt: new Date(),
        overallRating: 4.5 + Math.random() * 0.5,
        totalOrders: Math.floor(Math.random() * 500) + 50,
        completedOrders: Math.floor(Math.random() * 400) + 40,
        acceptanceRate: 90 + Math.floor(Math.random() * 10),
        balance: Math.floor(Math.random() * 5000),
        totalEarnings: Math.floor(Math.random() * 50000),
        isVerified: true,
        badges: '金牌打手,认证主播',
      },
    })

    const gameServices = []
    for (const game of games.slice(0, 4)) {
      if (Math.random() > 0.2) {
        gameServices.push({
          sellerId: profile.id,
          gameId: game.id,
          platformTypes: game.supportedPlatforms,
          hourlyRate: Math.floor(Math.random() * 200) + 50,
          isAvailable: true,
          rating: 4.5 + Math.random() * 0.5,
          totalOrders: Math.floor(Math.random() * 200),
          completedOrders: Math.floor(Math.random() * 180),
          specialties: '突击,狙击,医疗',
        })
      }
    }

    if (gameServices.length > 0) {
      await prisma.sellerGameService.createMany({ data: gameServices })
    }

    sellers.push({ user, profile })
  }

  // Delta Force products
  const dfProducts = [
    { name: '绝密基础护航单288保底1288w', category: dfCategories[0], price: 288, original: 338, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=500&fit=crop', sales: 1478, views: 32060 },
    { name: '速凌电竞-十分钟清图单-1888R保3888W', category: dfCategories[9], price: 1888, original: 2088, image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=500&fit=crop', sales: 76, views: 49310 },
    { name: '速凌电竞-Galgame恋爱攻略-趣味陪玩单', category: dfCategories[5], price: 188, original: 288, image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400&h=500&fit=crop', sales: 246, views: 95441 },
    { name: '速凌电竞-欢乐斗地主-趣味陪玩小时单', category: dfCategories[5], price: 1288, original: 1388, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=500&fit=crop', sales: 25, views: 29918 },
    { name: '速凌电竞-婚礼彩礼-趣味单', category: dfCategories[5], price: 2888, original: 3088, image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=500&fit=crop', sales: 12, views: 15000 },
    { name: '速凌电竞-跨栏玩法-趣味单', category: dfCategories[5], price: 888, original: 988, image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=500&fit=crop', sales: 89, views: 45000 },
    { name: '速凌电竞-凡尔赛选妃记沉浸涮火锅', category: dfCategories[13], price: 688, original: 788, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=500&fit=crop', sales: 34, views: 22000 },
    { name: '司令力推！速凌电竞-我要验牌', category: dfCategories[0], price: 888, original: 988, image: 'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=400&h=500&fit=crop', sales: 156, views: 67000 },
  ]

  for (const p of dfProducts) {
    await prisma.product.create({
      data: {
        gameId: deltaForce.id,
        categoryId: p.category.id,
        name: p.name,
        description: '专业打手为您服务，保证质量',
        imageUrl: p.image,
        basePrice: p.price,
        originalPrice: p.original,
        serviceType: 'PACKAGE',
        salesCount: p.sales,
        viewCount: p.views,
        isActive: true,
      },
    })
  }

  // Honor of Kings products
  const hokProducts = [
    { name: '王者段位代打-钻石到星耀', category: hokCategories[0], price: 88, original: 128, image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400&h=500&fit=crop', sales: 2341, views: 89000 },
    { name: '李白英雄教学-1对1辅导', category: hokCategories[1], price: 58, original: 88, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=500&fit=crop', sales: 567, views: 34000 },
    { name: '甜美小姐姐开黑陪玩', category: hokCategories[2], price: 48, original: 68, image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=500&fit=crop', sales: 1890, views: 120000 },
    { name: '巅峰赛2000分代打', category: hokCategories[3], price: 388, original: 488, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=500&fit=crop', sales: 234, views: 56000 },
  ]

  for (const p of hokProducts) {
    await prisma.product.create({
      data: {
        gameId: hok.id,
        categoryId: p.category.id,
        name: p.name,
        description: '专业王者打手，快速上分',
        imageUrl: p.image,
        basePrice: p.price,
        originalPrice: p.original,
        serviceType: 'PER_GAME',
        salesCount: p.sales,
        viewCount: p.views,
        isActive: true,
      },
    })
  }

  await prisma.adminConfig.createMany({
    data: [
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
      { configKey: 'customer_service_qr', configValue: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?w=400&h=400&fit=crop', category: 'general', description: '客服二维码' },
    ],
  })

  await prisma.contentPage.createMany({
    data: [
      { slug: 'order-notice', title: '下单须知', rawContent: '1. 下单前请确认游戏账号信息正确\n2. 服务开始后不支持退款\n3. 如有问题请联系客服处理', isPublished: true, publishedAt: new Date() },
      { slug: 'recharge-benefits', title: '充值福利', rawContent: '充值100送10\n充值500送80\n充值1000送200', isPublished: true, publishedAt: new Date() },
      { slug: 'user-agreement', title: '用户协议', rawContent: '欢迎使用速凌电竞平台服务...', isPublished: true, publishedAt: new Date() },
      { slug: 'privacy-policy', title: '隐私政策', rawContent: '我们重视您的隐私保护...', isPublished: true, publishedAt: new Date() },
      { slug: 'about-us', title: '关于我们', rawContent: '速凌电竞是专业的游戏陪玩服务平台...', isPublished: true, publishedAt: new Date() },
      { slug: 'minor-notice', title: '未成年人告知', rawContent: '本店未成年人禁止消费...', isPublished: true, publishedAt: new Date() },
      { slug: 'feedback', title: '建议反馈', rawContent: '欢迎提出您的宝贵意见...', isPublished: true, publishedAt: new Date() },
    ],
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })