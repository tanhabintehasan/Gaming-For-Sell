'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Search, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  customer: { username: string; avatar: string }
  seller?: { username: string; avatar: string }
  game: { nameCn: string }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          let data = res.data
          if (filter !== 'all') data = data.filter((o: Order) => o.status === filter)
          if (search.trim()) {
            const s = search.toLowerCase()
            data = data.filter(
              (o: Order) =>
                o.orderNumber.toLowerCase().includes(s) ||
                o.customer.username.toLowerCase().includes(s) ||
                o.seller?.username.toLowerCase().includes(s)
            )
          }
          setOrders(data)
        }
      })
      .catch(() => {
        toast.error('加载失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [filter, search])

  const statusMap: Record<string, string> = {
    PENDING: '待支付',
    PAID: '待接单',
    ACCEPTED: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    REFUNDED: '已退款',
    DISPUTE: '纠纷中',
  }

  const statusColor: Record<string, string> = {
    PENDING: 'bg-[rgba(255,170,0,0.1)] text-[#ffaa00] border-[rgba(255,170,0,0.2)]',
    PAID: 'bg-[rgba(0,245,255,0.1)] text-[#00f5ff] border-[rgba(0,245,255,0.2)]',
    ACCEPTED: 'bg-[rgba(0,122,255,0.1)] text-[#4da3ff] border-[rgba(0,122,255,0.2)]',
    COMPLETED: 'bg-[rgba(74,222,128,0.1)] text-[#4ade80] border-[rgba(74,222,128,0.2)]',
    CANCELLED: 'bg-[rgba(100,116,139,0.15)] text-[#94a3b8] border-[rgba(100,116,139,0.25)]',
    REFUNDED: 'bg-[rgba(139,92,246,0.1)] text-[#a78bfa] border-[rgba(139,92,246,0.2)]',
    DISPUTE: 'bg-[rgba(244,34,68,0.1)] text-[#ff2244] border-[rgba(244,34,68,0.2)]',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
            </Link>
            <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>订单管理</h1>
          </div>
          <button
            onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/backstage/admin/login')}
            className="text-sm text-[rgba(180,200,255,0.55)] hover:text-[#ff2244] transition-colors flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded-xl">
            {['all', 'PENDING', 'PAID', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'DISPUTE'].map((k) => (
              <TabsTrigger key={k} value={k} className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-4">
                {statusMap[k] || '全部'}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(180,200,255,0.35)]" />
          <Input
            placeholder="搜索订单号 / 用户 / 打手"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="p-4 glass-card border-0 hover:border-[rgba(0,245,255,0.2)] transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-mono text-[#00f5ff]">#{order.orderNumber}</span>
                  <Badge variant="outline" className={`text-xs rounded border ${statusColor[order.status] || 'text-white'}`}>
                    {statusMap[order.status] || order.status}
                  </Badge>
                </div>
                <div className="text-sm text-[rgba(180,200,255,0.75)] mb-1">{order.game.nameCn}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[rgba(180,200,255,0.45)]">{order.customer.username}</span>
                  <span className="text-white font-medium">¥{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-[rgba(180,200,255,0.35)] mt-2">{new Date(order.createdAt).toLocaleString()}</div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
