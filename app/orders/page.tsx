'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  game: { nameCn: string }
  product: { name: string; imageUrl: string }
  seller?: { username: string; avatar: string }
  review?: { id: string }
  paidAt?: string
  createdAt: string
}

const statusMap: Record<string, string> = {
  PENDING: '待付款',
  PAID: '待接单',
  ACCEPTED: '已接单',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-[rgba(255,170,0,0.15)] text-[#ffaa00] border-[rgba(255,170,0,0.3)]',
  PAID: 'bg-[rgba(0,245,255,0.12)] text-[#00f5ff] border-[rgba(0,245,255,0.25)]',
  ACCEPTED: 'bg-[rgba(138,85,255,0.15)] text-[#a78bfa] border-[rgba(138,85,255,0.3)]',
  IN_PROGRESS: 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border-[rgba(59,130,246,0.3)]',
  COMPLETED: 'bg-[rgba(40,200,64,0.12)] text-[#4ade80] border-[rgba(40,200,64,0.25)]',
  CANCELLED: 'bg-[rgba(120,120,120,0.12)] text-[#9ca3af] border-[rgba(120,120,120,0.25)]',
}

function OrdersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialStatus = searchParams?.get('status') || 'all'
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          let data = res.data
          if (status !== 'all') {
            if (status === 'REVIEW_PENDING') {
              data = data.filter((o: Order) => o.status === 'COMPLETED' && !o.review)
            } else if (status === 'PAID') {
              data = data.filter((o: Order) => o.status === 'PENDING' && o.paidAt)
            } else {
              data = data.filter((o: Order) => o.status === status)
            }
          }
          setOrders(data)
        } else {
          router.push('/login')
        }
      })
  }, [status, router])

  return (
    <div className="relative min-h-screen lg:py-8 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-lg font-bold py-4 lg:py-0 lg:mb-6 text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
          我的订单 <span className="text-[#00f5ff]">ORDERS</span>
        </h1>

        <Tabs value={status} onValueChange={setStatus} className="mb-5 lg:mb-6">
          <TabsList className="w-full overflow-x-auto flex bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] h-auto p-1 rounded-xl">
            {['all', 'PENDING', 'PAID', 'ACCEPTED', 'COMPLETED', 'REVIEW_PENDING'].map((s) => (
              <TabsTrigger key={s} value={s} className="flex-1 text-xs whitespace-nowrap px-3 py-2.5 rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] data-[state=active]:shadow-[0_0_12px_rgba(0,245,255,0.1)] text-[rgba(180,200,255,0.6)] transition-all">
                {s === 'all' ? '全部' : statusMap[s] || s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4 glass-card border-0 hover:border-[rgba(0,245,255,0.2)] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-[rgba(180,200,255,0.45)]">
                  <span className="font-[family-name:var(--font-orbitron)]">{order.orderNumber}</span>
                  <span className="text-[rgba(0,245,255,0.2)]">|</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <Badge className={`${statusColors[order.status]} border text-[10px] font-bold px-2.5 py-1 rounded-md`}>
                  {statusMap[order.status]}
                </Badge>
              </div>

              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl bg-gray-900 relative overflow-hidden shrink-0 border border-[rgba(0,245,255,0.08)]">
                  {order.product?.imageUrl && (
                    <Image src={order.product.imageUrl} alt={order.product.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2 text-sm text-[rgba(232,238,255,0.9)]">{order.product?.name}</h3>
                  <p className="text-xs text-[rgba(180,200,255,0.45)] mt-1">{order.game?.nameCn}</p>
                  {order.seller && (
                    <p className="text-xs text-[rgba(180,200,255,0.45)] mt-1">打手: {order.seller.username}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#00f5ff] font-bold font-[family-name:var(--font-orbitron)]">¥{order.totalAmount}</span>
                    <Link href={`/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg border-[rgba(0,245,255,0.2)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.35)]">
                        查看详情 <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050810]" />}>
      <OrdersContent />
    </Suspense>
  )
}
