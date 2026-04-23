'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SafeImage } from '@/components/safe-image'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  subtotal: number
  platformFee: number
  gamePlatform?: string
  gameIdUsername?: string
  requirements?: string
  durationHours: number
  createdAt: string
  game: { nameCn: string }
  product: { name: string; imageUrl: string; basePrice: number }
  seller?: { id: string; username: string; avatar: string }
  customer: { id: string; username: string; avatar: string }
  review?: { id: string }
}

const statusMap: Record<string, string> = {
  PENDING: '待付款',
  PAID: '待接单',
  ACCEPTED: '已接单',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
  DISPUTE: '纠纷中',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [gateway, setGateway] = useState('ALIPAY')
  const [payLoading, setPayLoading] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const orderId = params?.id as string | undefined

  useEffect(() => {
    if (!orderId) return
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setOrder(res.data)
        else router.push('/login')
      })
  }, [orderId, router])

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.success) {
      setOrder(data.data)
      toast.success('状态更新成功')
    }
  }

  const handlePay = async () => {
    setPayLoading(true)
    const res = await fetch(`/api/orders/${orderId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gateway }),
    })
    const data = await res.json()
    if (data.success) {
      setOrder(data.data)
      setPayOpen(false)
      toast.success(`支付成功`)
    } else {
      toast.error(data.message)
    }
    setPayLoading(false)
  }

  const handleReview = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('请选择评分')
      return
    }
    setReviewLoading(true)
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, rating, content: reviewContent }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('评价成功')
      setReviewOpen(false)
      // Refresh order to show review exists
      const orderRes = await fetch(`/api/orders/${orderId}`)
      const orderData = await orderRes.json()
      if (orderData.success) setOrder(orderData.data)
    } else {
      toast.error(data.message)
    }
    setReviewLoading(false)
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen lg:py-8 pb-28">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 py-4 lg:py-0 lg:mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 lg:hidden text-white hover:text-[#00f5ff] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold lg:text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
            订单详情 <span className="text-[#00f5ff]">DETAIL</span>
          </h1>
        </div>

        <Card className="p-5 mb-4 glass-card border-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[rgba(180,200,255,0.45)] font-[family-name:var(--font-orbitron)]">{order.orderNumber}</span>
            <Badge className="bg-[rgba(0,245,255,0.12)] text-[#00f5ff] border border-[rgba(0,245,255,0.2)] border-0">
              {statusMap[order.status]}
            </Badge>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="w-20 h-20 rounded-xl bg-gray-900 relative overflow-hidden shrink-0 border border-[rgba(0,245,255,0.08)]">
              {order.product?.imageUrl && (
                <SafeImage src={order.product.imageUrl} alt={order.product.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium line-clamp-2 text-[rgba(232,238,255,0.9)]">{order.product?.name}</h3>
              <p className="text-xs text-[rgba(180,200,255,0.45)] mt-1">{order.game?.nameCn}</p>
              <p className="text-xs text-[rgba(180,200,255,0.45)] mt-1">时长: {order.durationHours}小时</p>
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-[rgba(0,245,255,0.08)] pt-4">
            <div className="flex justify-between">
              <span className="text-[rgba(180,200,255,0.55)]">商品金额</span>
              <span className="text-[rgba(232,238,255,0.85)]">¥{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(180,200,255,0.55)]">平台服务费</span>
              <span className="text-[rgba(232,238,255,0.85)]">¥{order.platformFee}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-[rgba(0,245,255,0.08)]">
              <span className="text-white">实付金额</span>
              <span className="text-[#00f5ff] font-[family-name:var(--font-orbitron)]">¥{order.totalAmount}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 mb-4 space-y-3 text-sm glass-card border-0">
          <h3 className="font-semibold text-white">订单信息</h3>
          <div className="flex justify-between">
            <span className="text-[rgba(180,200,255,0.55)]">平台</span>
            <span className="text-[rgba(232,238,255,0.85)]">{order.gamePlatform === 'MOBILE' ? '手游' : order.gamePlatform === 'PC' ? '端游' : '未选择'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[rgba(180,200,255,0.55)]">游戏ID</span>
            <span className="text-[rgba(232,238,255,0.85)]">{order.gameIdUsername || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[rgba(180,200,255,0.55)]">备注</span>
            <span className="max-w-[60%] text-right text-[rgba(232,238,255,0.85)]">{order.requirements || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[rgba(180,200,255,0.55)]">创建时间</span>
            <span className="text-[rgba(232,238,255,0.85)]">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </Card>

        {order.seller && (
          <Card className="p-4 mb-4 flex items-center justify-between glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] flex items-center justify-center text-[#00f5ff] font-bold">
                {order.seller.username[0]}
              </div>
              <div>
                <div className="text-sm text-white">{order.seller.username}</div>
                <div className="text-xs text-[rgba(180,200,255,0.5)]">打手</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-[rgba(0,245,255,0.2)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.08)] bg-transparent"
              onClick={() => router.push(`/chat/${order.seller!.id}`)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              联系TA
            </Button>
          </Card>
        )}

        {order.customer && (
          <Card className="p-4 mb-4 flex items-center justify-between glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(255,107,0,0.08)] border border-[rgba(255,107,0,0.15)] flex items-center justify-center text-[#ff6b00] font-bold">
                {order.customer.username[0]}
              </div>
              <div>
                <div className="text-sm text-white">{order.customer.username}</div>
                <div className="text-xs text-[rgba(180,200,255,0.5)]">客户</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-[rgba(255,107,0,0.2)] text-[#ff6b00] hover:bg-[rgba(255,107,0,0.08)] bg-transparent"
              onClick={() => router.push(`/chat/${order.customer.id}`)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              联系TA
            </Button>
          </Card>
        )}

        <div className="flex gap-3">
          {order.status === 'PENDING' && (
            <>
              <Button variant="outline" className="flex-1 rounded-xl h-12 border-[rgba(255,34,68,0.3)] bg-[rgba(255,34,68,0.05)] text-[#ff5f7a] hover:bg-[rgba(255,34,68,0.1)] hover:border-[rgba(255,34,68,0.45)]" onClick={() => updateStatus('CANCELLED')}>
                取消订单
              </Button>
              <Button className="flex-1 h-12 rounded-xl font-bold text-white bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 shadow-[0_12px_28px_rgba(0,245,255,0.25)] hover:shadow-[0_16px_36px_rgba(0,245,255,0.35)] transition-all border-0 text-[#050810]" onClick={() => setPayOpen(true)}>
                立即支付
              </Button>
            </>
          )}
          {order.status === 'PAID' && (
            <Button variant="outline" className="w-full rounded-xl h-12 border-[rgba(255,34,68,0.3)] bg-[rgba(255,34,68,0.05)] text-[#ff5f7a] hover:bg-[rgba(255,34,68,0.1)] hover:border-[rgba(255,34,68,0.45)]" onClick={() => updateStatus('CANCELLED')}>
              取消订单
            </Button>
          )}
          {order.status === 'ACCEPTED' && (
            <Button className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 shadow-[0_12px_28px_rgba(0,245,255,0.25)] hover:shadow-[0_16px_36px_rgba(0,245,255,0.35)] transition-all border-0 text-[#050810]" onClick={() => updateStatus('IN_PROGRESS')}>
              开始服务
            </Button>
          )}
          {order.status === 'IN_PROGRESS' && (
            <Button className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 shadow-[0_12px_28px_rgba(0,245,255,0.25)] hover:shadow-[0_16px_36px_rgba(0,245,255,0.35)] transition-all border-0 text-[#050810]" onClick={() => updateStatus('COMPLETED')}>
              完成订单
            </Button>
          )}
          {order.status === 'COMPLETED' && !order.review && (
            <Button className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 shadow-[0_12px_28px_rgba(255,47,125,0.28)] hover:shadow-[0_16px_36px_rgba(255,47,125,0.38)] transition-all border-0" onClick={() => setReviewOpen(true)}>
              去评价
            </Button>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.15)] text-[#e8eeff]">
          <DialogHeader>
            <DialogTitle className="text-white">选择支付方式</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <RadioGroup value={gateway} onValueChange={setGateway} className="space-y-3">
              <div className="flex items-center space-x-3 rounded-xl border border-[rgba(0,245,255,0.15)] p-3 hover:border-[rgba(0,245,255,0.3)] cursor-pointer">
                <RadioGroupItem value="ALIPAY" id="alipay" className="text-[#00f5ff] border-[rgba(0,245,255,0.3)]" />
                <Label htmlFor="alipay" className="flex-1 cursor-pointer text-white">
                  支付宝
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-xl border border-[rgba(0,245,255,0.15)] p-3 hover:border-[rgba(0,245,255,0.3)] cursor-pointer">
                <RadioGroupItem value="WECHAT_PAY" id="wechat" className="text-[#00f5ff] border-[rgba(0,245,255,0.3)]" />
                <Label htmlFor="wechat" className="flex-1 cursor-pointer text-white">
                  微信支付
                </Label>
              </div>
            </RadioGroup>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[rgba(180,200,255,0.6)]">实付金额</span>
              <span className="text-[#00f5ff] font-bold text-lg font-[family-name:var(--font-orbitron)]">¥{order.totalAmount}</span>
            </div>
            <Button
              onClick={handlePay}
              disabled={payLoading}
              className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0 text-[#050810]"
            >
              {payLoading ? '支付中...' : '确认支付'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.15)] text-[#e8eeff]">
          <DialogHeader>
            <DialogTitle className="text-white">评价订单</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">评分</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${star <= rating ? 'text-[#ffd700]' : 'text-[rgba(180,200,255,0.25)]'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">评价内容</Label>
              <Textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="分享您的体验..."
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl focus:border-[rgba(0,245,255,0.4)] min-h-[100px]"
              />
            </div>
            <Button
              onClick={handleReview}
              disabled={reviewLoading}
              className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 border-0"
            >
              {reviewLoading ? '提交中...' : '提交评价'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
