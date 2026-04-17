'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { fetchAuthMe } from '@/lib/auth-client'

interface Product {
  id: string
  name: string
  imageUrl: string
  basePrice: number
  game: { id: string; nameCn: string }
}

interface User {
  id: string
  username: string
}

function CreateOrderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams?.get('product')
  const initialSellerId = searchParams?.get('seller')

  const [product, setProduct] = useState<Product | null>(null)
  const [, setUser] = useState<User | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [platform, setPlatform] = useState('MOBILE')
  const [gameId, setGameId] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [sellerId] = useState<string | null>(initialSellerId || null)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wechat')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (res.success) {
          setUser(res.data)
          setPhone(res.data.phone)
          setName(res.data.username)
        } else {
          router.push('/login')
        }
      })

    if (productId) {
      fetch(`/api/products/${productId}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) setProduct(res.data)
        })
    }
  }, [productId, router])

  const total = product ? product.basePrice * quantity : 0

  const handleSubmit = async () => {
    if (!product) return
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: product.game.id,
          productId: product.id,
          sellerId,
          gamePlatform: platform,
          gameIdUsername: gameId,
          requirements: notes,
          durationHours: quantity,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('订单创建成功')
        router.push('/profile')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('创建订单失败')
    } finally {
      setLoading(false)
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen lg:py-8 pb-28">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-lg font-bold py-4 lg:py-0 lg:mb-6 text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
          创建订单 <span className="text-[#00f5ff]">ORDER</span>
        </h1>

        {/* Product Summary */}
        <Card className="p-4 mb-4 glass-card border-0">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-900 relative overflow-hidden shrink-0 border border-[rgba(0,245,255,0.1)]">
              {product.imageUrl && (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-2 text-[rgba(232,238,255,0.95)]">{product.name}</h3>
              <p className="text-sm text-[rgba(180,200,255,0.5)] mt-1">已选：{product.game.nameCn}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[#00f5ff] font-bold font-[family-name:var(--font-orbitron)]">¥{product.basePrice}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] flex items-center justify-center text-[#00f5ff] hover:bg-[rgba(0,245,255,0.12)]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] flex items-center justify-center text-[#00f5ff] hover:bg-[rgba(0,245,255,0.12)]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-5 space-y-5 glass-card border-0">
          <div>
            <Label className="mb-3 block text-[rgba(180,200,255,0.8)] text-sm">区服</Label>
            <RadioGroup value={platform} onValueChange={setPlatform} className="flex gap-4">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)]">
                <RadioGroupItem value="MOBILE" id="mobile" className="border-[rgba(0,245,255,0.4)] text-[#00f5ff]" />
                <Label htmlFor="mobile" className="font-normal text-[rgba(232,238,255,0.85)]">手游</Label>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)]">
                <RadioGroupItem value="PC" id="pc" className="border-[rgba(0,245,255,0.4)] text-[#00f5ff]" />
                <Label htmlFor="pc" className="font-normal text-[rgba(232,238,255,0.85)]">端游</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="gameId" className="text-[rgba(180,200,255,0.8)] text-sm">游戏ID</Label>
            <Input id="gameId" value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder="请输入游戏ID" className="mt-1.5 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl focus:border-[rgba(0,245,255,0.4)]" />
          </div>

          <div>
            <Label htmlFor="phone" className="text-[rgba(180,200,255,0.8)] text-sm">电话</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入联系电话" className="mt-1.5 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl focus:border-[rgba(0,245,255,0.4)]" />
          </div>

          <div>
            <Label htmlFor="name" className="text-[rgba(180,200,255,0.8)] text-sm">名称</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入名称" className="mt-1.5 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl focus:border-[rgba(0,245,255,0.4)]" />
          </div>

          <div>
            <Label className="mb-3 block text-[rgba(180,200,255,0.8)] text-sm">选择选手</Label>
            <div className="text-sm text-[rgba(180,200,255,0.55)] bg-[rgba(0,245,255,0.04)] p-3 rounded-xl border border-[rgba(0,245,255,0.08)]">
              {sellerId ? '已指定打手' : '1. 系统自动匹配'}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-[rgba(180,200,255,0.8)] text-sm">备注</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="请输入特殊要求或备注" className="mt-1.5 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl focus:border-[rgba(0,245,255,0.4)]" />
          </div>

          <div>
            <Label className="mb-3 block text-[rgba(180,200,255,0.8)] text-sm">支付方式</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-[rgba(0,245,255,0.04)] border border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.2)] transition-colors">
                <RadioGroupItem value="wechat" id="wechat" className="border-[rgba(0,245,255,0.4)] text-[#00f5ff]" />
                <Label htmlFor="wechat" className="font-normal flex-1 text-[rgba(232,238,255,0.85)]">微信支付</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-[rgba(0,245,255,0.04)] border border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.2)] transition-colors">
                <RadioGroupItem value="alipay" id="alipay" className="border-[rgba(0,245,255,0.4)] text-[#00f5ff]" />
                <Label htmlFor="alipay" className="font-normal flex-1 text-[rgba(232,238,255,0.85)]">支付宝</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-[rgba(0,245,255,0.04)] border border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.2)] transition-colors">
                <RadioGroupItem value="balance" id="balance" className="border-[rgba(0,245,255,0.4)] text-[#00f5ff]" />
                <Label htmlFor="balance" className="font-normal flex-1 text-[rgba(232,238,255,0.85)]">余额支付（可用：¥0.00）</Label>
              </div>
            </RadioGroup>
          </div>
        </Card>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 lg:max-w-2xl lg:mx-auto lg:static lg:mt-8 lg:bg-transparent">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between lg:border-0 lg:bg-transparent lg:p-0">
          <div className="lg:hidden">
            <span className="text-[rgba(180,200,255,0.55)] text-sm">实付金额</span>
            <div className="text-2xl font-bold text-[#00f5ff] font-[family-name:var(--font-orbitron)]">¥{total}</div>
          </div>
          <div className="hidden lg:block">
            <span className="text-[rgba(180,200,255,0.55)]">实付金额：</span>
            <span className="text-3xl font-bold text-[#00f5ff] font-[family-name:var(--font-orbitron)]">¥{total}</span>
          </div>
          <Button
            className="h-12 px-8 bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 text-white rounded-xl font-bold shadow-[0_12px_28px_rgba(255,47,125,0.28)] hover:shadow-[0_16px_36px_rgba(255,47,125,0.38)] transition-all border-0"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '提交中...' : '提交订单'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050810]" />}>
      <CreateOrderContent />
    </Suspense>
  )
}
