'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { fetchAuthMe } from '@/lib/auth-client'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  sellerEarnings: number
  createdAt: string
  game: { nameCn: string }
  customer: { username: string; avatar: string }
}

const statusMap: Record<string, string> = {
  PENDING: '待付款',
  PAID: '待接单',
  ACCEPTED: '已接单',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

const statusFilters = ['ALL', 'PAID', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function SellerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (!res.success || (res.data.level !== 'SELLER' && res.data.level !== 'ADMIN')) {
          router.push('/login')
        }
      })

    fetch('/api/orders?role=seller')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setOrders(res.data)
        }
        setLoading(false)
      })
  }, [router])

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('状态更新成功')
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: data.data.status } : o)))
    } else {
      toast.error(data.message)
    }
  }

  const filteredOrders = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen lg:py-8 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 py-4 lg:py-0 lg:mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 lg:hidden text-white hover:text-[#00f5ff] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold lg:text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
            订单管理 <span className="text-[#00f5ff]">ORDERS</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {statusFilters.map((s) => (
            <Button
              key={s}
              size="sm"
              onClick={() => setFilter(s)}
              className={`rounded-full text-xs px-3 py-1 h-8 border ${
                filter === s
                  ? 'bg-[rgba(0,245,255,0.15)] border-[rgba(0,245,255,0.3)] text-[#00f5ff]'
                  : 'bg-transparent border-[rgba(0,245,255,0.12)] text-[rgba(180,200,255,0.7)] hover:text-white'
              }`}
            >
              {s === 'ALL' ? '全部' : statusMap[s]}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4 glass-card border-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[rgba(180,200,255,0.45)] font-[family-name:var(--font-orbitron)]">{order.orderNumber}</span>
                <Badge className="text-[10px] border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] rounded">
                  {statusMap[order.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.1)] flex items-center justify-center text-[#00f5ff] text-xs font-bold">
                  {order.game.nameCn.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{order.game.nameCn}</div>
                  <div className="text-xs text-[rgba(180,200,255,0.45)]">{order.customer.username}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#00f5ff] font-bold font-[family-name:var(--font-orbitron)]">¥{order.totalAmount}</div>
                  <div className="text-[10px] text-[rgba(180,200,255,0.5)]">收入 ¥{order.sellerEarnings}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/orders/${order.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full rounded-lg border-[rgba(0,245,255,0.15)] text-[rgba(180,200,255,0.8)] hover:text-white hover:border-[rgba(0,245,255,0.3)] bg-transparent">
                    查看详情
                  </Button>
                </Link>
                {order.status === 'PAID' && (
                  <Button size="sm" className="flex-1 rounded-lg bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110" onClick={() => updateStatus(order.id, 'ACCEPTED')}>
                    接单
                  </Button>
                )}
                {order.status === 'ACCEPTED' && (
                  <Button size="sm" className="flex-1 rounded-lg bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110" onClick={() => updateStatus(order.id, 'IN_PROGRESS')}>
                    开始服务
                  </Button>
                )}
                {order.status === 'IN_PROGRESS' && (
                  <Button size="sm" className="flex-1 rounded-lg bg-gradient-to-r from-[#ff2244] to-[#ff6b00] text-white font-bold hover:brightness-110" onClick={() => updateStatus(order.id, 'COMPLETED')}>
                    完成
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {filteredOrders.length === 0 && (
            <div className="text-center py-10 text-[rgba(180,200,255,0.45)]">暂无订单</div>
          )}
        </div>
      </div>
    </div>
  )
}
