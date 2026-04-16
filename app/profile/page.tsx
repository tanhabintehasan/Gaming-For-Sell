'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Wallet,
  CreditCard,
  FileText,
  MessageCircle,
  Info,
  AlertCircle,
  Lightbulb,
  Heart,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Gamepad2,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface User {
  id: string
  username: string
  level: string
  avatar: string
  phone: string
  gender?: string
  age?: number
  location?: string
  sellerProfile?: {
    balance: number
    totalEarnings: number
    isVerified: boolean
  }
}

interface Order {
  status: string
  review?: { id: string } | null
  paidAt?: string | null
}

const orderStatuses = [
  { key: 'PENDING', label: '待付款', icon: Wallet },
  { key: 'PAID', label: '待接单', icon: CreditCard },
  { key: 'ACCEPTED', label: '已接单', icon: FileText },
  { key: 'COMPLETED', label: '已完成', icon: Shield },
  { key: 'REVIEW_PENDING', label: '待评价', icon: MessageCircle },
]

const menuItems = [
  { icon: Mail, label: '消息中心', href: '/inbox' },
  { icon: CreditCard, label: '充值福利', href: '/pages/recharge-benefits' },
  { icon: FileText, label: '下单须知', href: '/pages/order-notice' },
  { icon: Shield, label: '用户协议', href: '/pages/user-agreement' },
  { icon: MessageCircle, label: '联系客服', href: '/support' },
  { icon: Info, label: '关于我们', href: '/pages/about-us' },
  { icon: AlertCircle, label: '未成年人告知', href: '/pages/minor-notice' },
  { icon: Lightbulb, label: '建议反馈', href: '/pages/feedback' },
  { icon: Gamepad2, label: '申请打手', href: '/apply/seller' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setUser(res.data)
        } else {
          router.push('/login')
        }
      })

    fetch('/api/orders')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setOrders(res.data)
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('已退出登录')
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  const getOrderCount = (status: string) => {
    if (status === 'REVIEW_PENDING') {
      return orders.filter((o) => o.status === 'COMPLETED' && !o.review).length
    }
    if (status === 'PAID') {
      return orders.filter((o) => o.status === 'PENDING' && o.paidAt).length
    }
    return orders.filter((o) => o.status === status).length
  }

  return (
    <div className="relative min-h-screen lg:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* User Header */}
        <div className="relative rounded-[2rem] overflow-hidden mb-6 lg:mb-8 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1226] via-[#070e1c] to-[#050810]" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=300&fit=crop')] bg-cover bg-center opacity-15" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
            backgroundSize: '26px 26px'
          }} />
          <div className="relative px-6 py-10 lg:py-14 flex flex-col items-center text-white">
            <Avatar className="w-20 h-20 lg:w-24 lg:h-24 border-4 border-[rgba(0,245,255,0.25)] shadow-[0_0_30px_rgba(0,245,255,0.2)]">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-[rgba(0,245,255,0.15)] text-[#00f5ff] text-2xl font-bold">{user.username[0]}</AvatarFallback>
            </Avatar>
            <h1 className="text-xl lg:text-2xl font-bold mt-5 text-[rgba(232,238,255,0.95)]">{user.username}</h1>
            <p className="text-[rgba(180,200,255,0.55)] text-sm mt-1 font-[family-name:var(--font-orbitron)]">ID: {user.id.slice(0, 8)}</p>
            <div className="flex items-center gap-3 mt-4">
              <span className="px-4 py-1.5 rounded-full bg-[rgba(0,245,255,0.1)] border border-[rgba(0,245,255,0.2)] text-[#00f5ff] text-xs font-semibold">
                {user.level === 'ADMIN' ? '管理员' : user.level === 'SELLER' ? '打手' : '用户'}
              </span>
              {user.sellerProfile?.isVerified && (
                <span className="px-4 py-1.5 rounded-full bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.25)] text-[#ffd700] text-xs font-semibold">
                  已认证
                </span>
              )}
            </div>
            {user.sellerProfile && (
              <div className="flex items-center gap-10 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00f5ff] font-[family-name:var(--font-orbitron)]">¥{user.sellerProfile.balance}</div>
                  <div className="text-xs text-[rgba(180,200,255,0.5)] mt-1">余额</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff2f7d] font-[family-name:var(--font-orbitron)]">¥{user.sellerProfile.totalEarnings}</div>
                  <div className="text-xs text-[rgba(180,200,255,0.5)] mt-1">累计收入</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Status */}
        <Card className="glass-card p-5 lg:p-6 mb-6 border-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base lg:text-lg text-white">陪玩订单</h2>
            <Link href="/orders" className="text-sm text-[rgba(180,200,255,0.5)] flex items-center hover:text-[#00f5ff] transition-colors">
              全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {orderStatuses.map((status) => (
              <Link key={status.key} href={`/orders?status=${status.key}`} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.12)] flex items-center justify-center text-[#00f5ff] relative hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.25)] transition-all">
                  <status.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  {getOrderCount(status.key) > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#ff2244] to-[#ff6b00] text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-[0_4px_10px_rgba(255,34,68,0.35)]">
                      {getOrderCount(status.key)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[rgba(180,200,255,0.65)]">{status.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card p-5 lg:p-6 mb-6 border-0">
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Heart, label: '收藏商品', href: '/favorites' },
              { icon: Bell, label: '通知设置', href: '/settings/notifications' },
              { icon: FileText, label: '用户协议', href: '/pages/user-agreement' },
              { icon: Shield, label: '隐私政策', href: '/pages/privacy-policy' },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.12)] flex items-center justify-center text-[#00f5ff] group-hover:bg-[rgba(0,245,255,0.1)] group-hover:border-[rgba(0,245,255,0.25)] transition-all">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-[rgba(180,200,255,0.65)] group-hover:text-[rgba(180,200,255,0.9)] transition-colors">{item.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Menu Grid */}
        <Card className="overflow-hidden mb-6 glass-card border-0">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {menuItems.map((item, idx) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-2 p-6 hover:bg-[rgba(0,245,255,0.04)] transition-colors ${
                  idx < menuItems.length - (menuItems.length % 2 || 2) ? 'border-b border-[rgba(0,245,255,0.08)]' : ''
                } ${idx % 2 === 0 ? 'border-r border-[rgba(0,245,255,0.08)]' : ''} lg:${idx % 4 !== 3 ? 'border-r border-[rgba(0,245,255,0.08)]' : ''} lg:${
                  idx < menuItems.length - (menuItems.length % 4 || 4) ? 'border-b border-[rgba(0,245,255,0.08)]' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,245,255,0.08)] flex items-center justify-center text-[#00f5ff]">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[rgba(232,238,255,0.85)]">{item.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full mb-8 text-[#ff5f7a] border-[rgba(255,34,68,0.3)] bg-[rgba(255,34,68,0.05)] hover:bg-[rgba(255,34,68,0.1)] hover:border-[rgba(255,34,68,0.45)] rounded-xl h-12"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  )
}
