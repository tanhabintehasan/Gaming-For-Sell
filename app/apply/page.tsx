'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  Gamepad2,
  Wallet,
  Star,
  Clock,
  Shield,
  CheckCircle2,
  UserPlus,
  FileText,
  UserCheck,
  Headphones,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchAuthMe } from '@/lib/auth-client'

interface AuthUser {
  id: string
  username: string
  level: string
}

const steps = [
  {
    icon: FileText,
    title: '提交申请',
    desc: '填写基本信息、擅长游戏、个人介绍和陪玩经验，提交审核。',
    time: '2 分钟',
  },
  {
    icon: Clock,
    title: '等待审核',
    desc: '运营团队会在 1-3 个工作日内审核您的资料，请保持手机畅通。',
    time: '1-3 工作日',
  },
  {
    icon: UserCheck,
    title: '审核通过',
    desc: '通过后系统自动创建打手账号，默认密码为 123456，请登录后及时修改。',
    time: '即时',
  },
  {
    icon: Gamepad2,
    title: '开启服务',
    desc: '进入打手后台完善资料、上传语音介绍、设置服务价格，开始接单赚钱。',
    time: '随时',
  },
]

const benefits = [
  {
    icon: Wallet,
    title: '高收益分成',
    desc: '平台提供行业领先的分成比例，收入实时到账，提现快速。',
    color: '#00f5ff',
  },
  {
    icon: TrendingUp,
    title: '海量订单',
    desc: '平台用户活跃，覆盖多款热门游戏，订单源源不断。',
    color: '#ff2f7d',
  },
  {
    icon: Shield,
    title: '交易保障',
    desc: '平台担保交易，杜绝跑单，保护每一位服务者的劳动成果。',
    color: '#4ade80',
  },
  {
    icon: Award,
    title: '成长体系',
    desc: '完善的等级与徽章体系，优秀打手获得更多曝光与推荐。',
    color: '#ffd700',
  },
  {
    icon: Zap,
    title: '自由接单',
    desc: '自主设置在线状态、服务价格与可接单时间，工作自由灵活。',
    color: '#ff6b00',
  },
  {
    icon: Star,
    title: '评价体系',
    desc: '真实用户评价，口碑积累带来长期稳定的高价值客户。',
    color: '#a855f7',
  },
]

const requirements = [
  '年满 18 周岁，具备完全民事行为能力',
  '至少精通 1 款平台支持的热门游戏',
  '拥有稳定的网络环境与可用的游戏设备',
  '具备良好的沟通能力与服务意识',
  '遵纪守法，无不良游戏行为记录',
  '需提供真实有效的手机号码',
]

const faqs = [
  {
    q: '申请打手需要缴纳费用吗？',
    a: '完全免费。速凌电竞不收取任何入驻费用或押金，审核通过即可开始接单。',
  },
  {
    q: '可以同时在其他平台接单吗？',
    a: '可以。我们不限制您在多个平台提供服务，但建议您在本平台保持活跃以获得更好推荐。',
  },
  {
    q: '收入如何结算与提现？',
    a: '订单完成后收入实时计入余额，您可随时申请提现，平台会在 1-3 个工作日内处理。',
  },
  {
    q: '审核被拒后可以再次申请吗？',
    a: '可以。完善资料后您可以重新提交申请，建议根据拒绝原因进行针对性改进。',
  },
]

export default function ApplyLandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    fetchAuthMe().then((res) => {
      if (res.success) setUser(res.data)
    })
  }, [])

  const isSeller = user && (user.level === 'SELLER' || user.level === 'ADMIN')

  return (
    <div className="relative min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1226] via-[#070e1c] to-[#050810]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=500&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
          backgroundSize: '26px 26px'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 text-center">
          <Badge className="mb-6 bg-[rgba(0,245,255,0.12)] text-[#88f8ff] border border-[rgba(0,245,255,0.28)] rounded-full px-4 py-1.5 text-xs font-bold tracking-wider shadow-[0_0_18px_rgba(0,234,255,0.12)] backdrop-blur-sm">
            速凌电竞招募计划
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black text-white mb-5 tracking-wide drop-shadow-[0_0_24px_rgba(0,245,255,0.25)]" style={{ fontFamily: 'var(--font-orbitron)' }}>
            成为游戏陪玩 / 代打打手
          </h1>
          <p className="text-[rgba(216,232,255,0.85)] text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            将你的游戏技能变现，在速凌电竞平台接单陪玩、代打、教学，
            <br className="hidden lg:block" />
            自由安排时间，赚取丰厚收入。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSeller ? (
              <Button
                onClick={() => router.push('/seller/dashboard')}
                className="h-12 px-8 rounded-xl font-bold text-[#050810] bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                进入打手后台
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/apply/seller')}
                className="h-12 px-8 rounded-xl font-bold text-[#050810] bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                立即申请入驻
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/support')}
              className="h-12 px-8 rounded-xl border-[rgba(0,245,255,0.25)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.08)]"
            >
              <Headphones className="w-4 h-4 mr-2" />
              咨询客服
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16 space-y-16 lg:space-y-20">
        {/* Process */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-orbitron)' }}>
              入驻流程 <span className="text-[#00f5ff]">PROCESS</span>
            </h2>
            <p className="text-[rgba(180,200,255,0.6)]">简单四步，开启您的陪玩赚钱之旅</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {steps.map((step, idx) => (
              <Card key={step.title} className="p-6 glass-card border-0 relative group hover:border-[rgba(0,245,255,0.2)] transition-all">
                <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#00f5ff] to-[#00c2cc] flex items-center justify-center text-[#050810] font-bold text-sm shadow-[0_0_16px_rgba(0,245,255,0.3)]">
                  {idx + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] flex items-center justify-center text-[#00f5ff] mb-4 mt-2">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[rgba(180,200,255,0.65)] leading-relaxed mb-3">{step.desc}</p>
                <div className="inline-flex items-center gap-1 text-xs text-[#00f5ff] bg-[rgba(0,245,255,0.08)] px-2.5 py-1 rounded-full border border-[rgba(0,245,255,0.15)]">
                  <Clock className="w-3 h-3" />
                  {step.time}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-orbitron)' }}>
              平台优势 <span className="text-[#ff2f7d]">BENEFITS</span>
            </h2>
            <p className="text-[rgba(180,200,255,0.6)]">选择速凌电竞，选择更专业的陪玩平台</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {benefits.map((b) => (
              <Card key={b.title} className="p-6 glass-card border-0 hover:border-[rgba(0,245,255,0.15)] transition-all">
                <div className="w-12 h-12 rounded-xl bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.12)] flex items-center justify-center mb-4" style={{ color: b.color }}>
                  <b.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                <p className="text-sm text-[rgba(180,200,255,0.6)] leading-relaxed">{b.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-orbitron)' }}>
              入驻要求 <span className="text-[#ffd700]">REQUIREMENTS</span>
            </h2>
            <p className="text-[rgba(180,200,255,0.6)] mb-8">符合以下条件即可申请成为平台服务者</p>
            <div className="space-y-4">
              {requirements.map((req) => (
                <div key={req} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.25)] flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
                  </div>
                  <span className="text-[rgba(216,232,255,0.85)] text-sm leading-relaxed">{req}</span>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-8 glass-card border-0 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.2)] flex items-center justify-center text-[#00f5ff] text-3xl font-black shadow-[0_0_30px_rgba(0,245,255,0.15)]" style={{ fontFamily: 'var(--font-orbitron)' }}>
              SL
            </div>
            <h3 className="text-xl font-bold text-white mb-2">准备好开始了吗？</h3>
            <p className="text-[rgba(180,200,255,0.6)] text-sm mb-6">
              已经有 <span className="text-[#00f5ff] font-bold">1,200</span>+ 位打手在平台成功接单
            </p>
            {isSeller ? (
              <Button
                onClick={() => router.push('/seller/dashboard')}
                className="h-12 px-8 rounded-xl font-bold text-[#050810] bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                进入打手后台
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/apply/seller')}
                className="h-12 px-8 rounded-xl font-bold text-[#050810] bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0"
              >
                立即申请入驻
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-orbitron)' }}>
              常见问题 <span className="text-[#00f5ff]">FAQ</span>
            </h2>
            <p className="text-[rgba(180,200,255,0.6)]">关于入驻的疑问，这里都有答案</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {faqs.map((faq) => (
              <Card key={faq.q} className="p-5 glass-card border-0 hover:border-[rgba(0,245,255,0.15)] transition-all">
                <h3 className="text-sm font-bold text-white mb-2 flex items-start gap-2">
                  <span className="text-[#00f5ff] shrink-0">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-[rgba(180,200,255,0.6)] leading-relaxed pl-5">
                  {faq.a}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative rounded-[2rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00f5ff]/10 to-[#ff2f7d]/10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=300&fit=crop')] bg-cover bg-center opacity-5" />
          <div className="relative px-6 py-12 lg:py-16 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-orbitron)' }}>
              加入我们，一起玩转电竞
            </h2>
            <p className="text-[rgba(180,200,255,0.7)] mb-8 max-w-xl mx-auto">
              无论你是技术大神还是娱乐陪玩，速凌电竞都为你提供展示自我的舞台。
            </p>
            {isSeller ? (
              <Button
                onClick={() => router.push('/seller/dashboard')}
                className="h-12 px-10 rounded-xl font-bold text-[#050810] bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                进入打手后台
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/apply/seller')}
                className="h-12 px-10 rounded-xl font-bold text-[#050810] bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                立即申请成为打手
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
