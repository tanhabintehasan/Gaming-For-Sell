'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Gamepad2,
  Settings,
  MessageSquare,
  ShoppingCart,
  Package,
  Users,
  ChevronRight,
  ClipboardList,
  Wallet,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface Stats {
  totalUsers: number
  totalSellers: number
  totalOrders: number
  totalGames: number
  pendingTickets: number
}

const menuItems = [
  { icon: Gamepad2, label: '游戏管理', href: '/admin/games', desc: '管理游戏和分类', color: 'from-[#00f5ff] to-[#00c2cc]' },
  { icon: Package, label: '商品管理', href: '/admin/products', desc: '管理商品和服务', color: 'from-[#ff2244] to-[#ff6b00]' },
  { icon: ShoppingCart, label: '订单管理', href: '/admin/orders', desc: '查看和处理订单', color: 'from-[#ff6b00] to-[#f59e0b]' },
  { icon: Users, label: '用户管理', href: '/admin/users', desc: '管理用户和打手', color: 'from-[#8b5cf6] to-[#a78bfa]' },
  { icon: MessageSquare, label: '客服工单', href: '/admin/support', desc: '处理客户问题', color: 'from-[#28c840] to-[#4ade80]' },
  { icon: ClipboardList, label: '打手申请', href: '/admin/applications', desc: '审核打手入驻申请', color: 'from-[#ec4899] to-[#f472b6]' },
  { icon: MessageSquare, label: '消息中心', href: '/admin/messages', desc: '用户与客服私信', color: 'from-[#06b6d4] to-[#22d3ee]' },
  { icon: Wallet, label: '提现审核', href: '/admin/withdrawals', desc: '审核打手提现申请', color: 'from-[#f59e0b] to-[#fbbf24]' },
  { icon: Settings, label: '系统配置', href: '/admin/settings', desc: '支付、短信、Logo等', color: 'from-[#ffd700] to-[#ffaa00]' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStats(res.data)
      })
      .catch(() => {
        toast.error('加载数据失败')
      })
  }, [router])

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-[#00f5ff]" />
            <h1 className="font-bold text-lg text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>管理后台</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[rgba(180,200,255,0.55)] hover:text-[#00f5ff] transition-colors">
              返回前台
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: '总用户', value: stats?.totalUsers || 0, color: 'bg-blue-500', glow: 'shadow-[0_8px_24px_rgba(59,130,246,0.25)]' },
            { label: '打手', value: stats?.totalSellers || 0, color: 'bg-[#28c840]', glow: 'shadow-[0_8px_24px_rgba(40,200,64,0.25)]' },
            { label: '订单', value: stats?.totalOrders || 0, color: 'bg-[#ff6b00]', glow: 'shadow-[0_8px_24px_rgba(255,107,0,0.25)]' },
            { label: '游戏', value: stats?.totalGames || 0, color: 'bg-[#00f5ff]', glow: 'shadow-[0_8px_24px_rgba(0,245,255,0.25)]' },
            { label: '待处理工单', value: stats?.pendingTickets || 0, color: 'bg-[#ff2244]', glow: 'shadow-[0_8px_24px_rgba(255,34,68,0.25)]' },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card border-0 hover:border-[rgba(0,245,255,0.15)] transition-all">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${stat.color} ${stat.glow} text-[#050810] flex items-center justify-center mb-3 font-black text-lg font-[family-name:var(--font-orbitron)]`}>
                  {stat.value}
                </div>
                <p className="text-sm text-[rgba(180,200,255,0.55)]">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="glass-card border-0 hover:border-[rgba(0,245,255,0.25)] transition-all cursor-pointer group p-0 overflow-hidden">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-[#050810] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.label}</h3>
                      <p className="text-sm text-[rgba(180,200,255,0.5)]">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[rgba(180,200,255,0.35)] group-hover:text-[#00f5ff] transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
