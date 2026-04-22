'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Wallet,
  TrendingUp,
  Star,
  Headphones,
  Mic,
  Play,
  Pause,
  Upload,
  ChevronRight,
  LogOut,
  User,
  Package,
  Gamepad2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { fetchAuthMe } from '@/lib/auth-client'

interface User {
  id: string
  username: string
  level: string
  avatar: string
  sellerProfile?: {
    balance: number
    totalEarnings: number
    overallRating: number
    totalOrders: number
    completedOrders: number
    voiceIntroUrl?: string
    isVerified: boolean
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  game: { nameCn: string }
  customer: { username: string; avatar: string }
}

export default function SellerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [uploading, setUploading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (res.success) {
          if (res.data.level !== 'SELLER' && res.data.level !== 'ADMIN') {
            router.push('/seller/login')
            return
          }
          setUser(res.data)
        } else {
          router.push('/seller/login')
        }
      })

    fetch('/api/orders?role=seller')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setOrders(res.data.slice(0, 5))
        }
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('已退出登录')
    router.push('/')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      toast.error('请上传音频文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小不能超过10MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/seller/voice-intro', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        toast.success('语音介绍上传成功')
        setUser((prev) =>
          prev
            ? {
                ...prev,
                sellerProfile: {
                  ...prev.sellerProfile!,
                  voiceIntroUrl: data.data.url,
                },
              }
            : prev
        )
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const togglePlay = () => {
    if (!audioRef.current || !user?.sellerProfile?.voiceIntroUrl) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  const statusMap: Record<string, string> = {
    PENDING: '待付款',
    PAID: '待接单',
    ACCEPTED: '已接单',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  }

  return (
    <div className="relative min-h-screen lg:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
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
                打手
              </span>
              {user.sellerProfile?.isVerified && (
                <span className="px-4 py-1.5 rounded-full bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.25)] text-[#ffd700] text-xs font-semibold">
                  已认证
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Wallet, label: '余额', value: `¥${user.sellerProfile?.balance || 0}`, color: '#00f5ff' },
            { icon: TrendingUp, label: '累计收入', value: `¥${user.sellerProfile?.totalEarnings || 0}`, color: '#ff2f7d' },
            { icon: Star, label: '评分', value: `${user.sellerProfile?.overallRating || 5.0}`, color: '#ffd700' },
            { icon: Mic, label: '完成订单', value: `${user.sellerProfile?.completedOrders || 0}`, color: '#4ade80' },
          ].map((stat) => (
            <Card key={stat.label} className="p-5 text-center border-0">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.12)] flex items-center justify-center mx-auto mb-3" style={{ color: stat.color }}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold" style={{ color: stat.color, fontFamily: 'var(--font-orbitron)' }}>{stat.value}</div>
              <div className="text-xs text-[rgba(180,200,255,0.55)] mt-1">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Voice Intro */}
        <Card className="p-5 mb-6 border-0">
          <h2 className="font-bold text-base text-white mb-4">语音介绍</h2>
          <div className="flex items-center gap-4">
            {user.sellerProfile?.voiceIntroUrl ? (
              <>
                <audio ref={audioRef} src={user.sellerProfile.voiceIntroUrl} onEnded={() => setPlaying(false)} className="hidden" />
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] flex items-center justify-center text-[#050810] hover:brightness-110 transition-all"
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="text-sm text-white">已上传语音介绍</div>
                  <div className="text-xs text-[rgba(180,200,255,0.45)] mt-0.5">买家可以在您的个人页播放</div>
                </div>
              </>
            ) : (
              <div className="flex-1 text-sm text-[rgba(180,200,255,0.6)]">尚未上传语音介绍，上传后买家可以听到您的声音</div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 text-white rounded-xl font-bold border-0"
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploading ? '上传中...' : user.sellerProfile?.voiceIntroUrl ? '重新上传' : '上传语音'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-5 mb-6 border-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-white">最近订单</h2>
            <Link href="/orders" className="text-sm text-[rgba(180,200,255,0.5)] flex items-center hover:text-[#00f5ff] transition-colors">
              全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.08)] hover:border-[rgba(0,245,255,0.2)] transition-all">
                  <div>
                    <div className="text-sm text-white">{order.game.nameCn}</div>
                    <div className="text-xs text-[rgba(180,200,255,0.45)] mt-0.5">{order.customer.username}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[10px] border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] rounded">
                      {statusMap[order.status] || order.status}
                    </Badge>
                    <div className="text-sm text-[#00f5ff] font-bold mt-1 font-[family-name:var(--font-orbitron)]">¥{order.totalAmount}</div>
                  </div>
                </div>
              </Link>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-6 text-[rgba(180,200,255,0.45)]">暂无订单</div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Headphones, label: '联系客服', href: '/support' },
            { icon: TrendingUp, label: '订单管理', href: '/seller/orders' },
            { icon: Package, label: '我的商品', href: '/seller/products' },
            { icon: Gamepad2, label: '我的服务', href: '/seller/services' },
            { icon: Star, label: '我的评价', href: '/seller/reviews' },
            { icon: Wallet, label: '我的收益', href: '/seller/earnings' },
            { icon: User, label: '资料管理', href: '/seller/profile' },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-[rgba(0,245,255,0.1)] bg-[rgba(0,245,255,0.03)] hover:border-[rgba(0,245,255,0.25)] hover:bg-[rgba(0,245,255,0.06)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.12)] flex items-center justify-center text-[#00f5ff]">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-[rgba(232,238,255,0.85)]">{item.label}</span>
            </Link>
          ))}
        </div>

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
