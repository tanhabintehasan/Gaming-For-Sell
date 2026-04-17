'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { fetchAuthMe } from '@/lib/auth-client'

interface EarningsData {
  balance: number
  totalEarnings: number
  orders: {
    id: string
    orderNumber: string
    sellerEarnings: number
    completedAt: string
    game: { nameCn: string }
    customer: { username: string }
  }[]
  withdrawals: {
    id: string
    amount: number
    fee: number
    netAmount: number
    method: string
    status: string
    requestedAt: string
    reviewedAt?: string
  }[]
}

const statusMap: Record<string, string> = {
  PENDING: '审核中',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
  COMPLETED: '已完成',
}

export default function SellerEarningsPage() {
  const router = useRouter()
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('ALIPAY')
  const [accountInfo, setAccountInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (!res.success || (res.data.level !== 'SELLER' && res.data.level !== 'ADMIN')) {
          router.push('/login')
        }
      })

    fetch('/api/seller/earnings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res.data)
        }
        setLoading(false)
      })
  }, [router])

  const handleWithdraw = async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) {
      toast.error('请输入有效金额')
      return
    }
    if (!accountInfo.trim()) {
      toast.error('请输入收款账号')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num, method, accountInfo: accountInfo.trim() }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success('提现申请已提交')
        setWithdrawOpen(false)
        setAmount('')
        setAccountInfo('')
        // refresh
        const refresh = await fetch('/api/seller/earnings')
        const refreshData = await refresh.json()
        if (refreshData.success) setData(refreshData.data)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !data) {
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
            我的收益 <span className="text-[#00f5ff]">EARNINGS</span>
          </h1>
        </div>

        <Card className="p-6 mb-6 border-0 glass-card text-center">
          <div className="text-sm text-[rgba(180,200,255,0.6)] mb-1">当前余额</div>
          <div className="text-4xl font-bold text-[#00f5ff] font-[family-name:var(--font-orbitron)] mb-4">¥{data.balance}</div>
          <div className="text-xs text-[rgba(180,200,255,0.45)] mb-6">累计收入 ¥{data.totalEarnings}</div>
          <Button
            onClick={() => setWithdrawOpen(true)}
            className="rounded-xl h-11 px-6 bg-gradient-to-r from-[#ff2244] to-[#ff6b00] text-white font-bold hover:brightness-110"
          >
            <Wallet className="w-4 h-4 mr-2" />
            申请提现
          </Button>
        </Card>

        <div className="mb-4 font-bold text-white">收入明细</div>
        <div className="space-y-3 mb-8">
          {data.orders.map((order) => (
            <Card key={order.id} className="p-4 flex items-center justify-between border-0 glass-card">
              <div>
                <div className="text-sm text-white">{order.game.nameCn}</div>
                <div className="text-xs text-[rgba(180,200,255,0.45)] mt-0.5">{order.customer.username} · {new Date(order.completedAt).toLocaleDateString()}</div>
              </div>
              <div className="text-[#00f5ff] font-bold font-[family-name:var(--font-orbitron)]">+¥{order.sellerEarnings}</div>
            </Card>
          ))}
          {data.orders.length === 0 && <div className="text-center py-6 text-[rgba(180,200,255,0.45)]">暂无收入记录</div>}
        </div>

        <div className="mb-4 font-bold text-white">提现记录</div>
        <div className="space-y-3">
          {data.withdrawals.map((w) => (
            <Card key={w.id} className="p-4 flex items-center justify-between border-0 glass-card">
              <div>
                <div className="text-sm text-white">提现 {w.method === 'ALIPAY' ? '支付宝' : w.method === 'WECHAT_PAY' ? '微信' : w.method}</div>
                <div className="text-xs text-[rgba(180,200,255,0.45)] mt-0.5">{new Date(w.requestedAt).toLocaleDateString()} · 手续费 ¥{w.fee}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold font-[family-name:var(--font-orbitron)]">-¥{w.amount}</div>
                <div className={`text-xs mt-0.5 ${w.status === 'REJECTED' ? 'text-[#ff5f7a]' : w.status === 'COMPLETED' ? 'text-[#4ade80]' : 'text-[#00f5ff]'}`}>
                  {statusMap[w.status] || w.status}
                </div>
              </div>
            </Card>
          ))}
          {data.withdrawals.length === 0 && <div className="text-center py-6 text-[rgba(180,200,255,0.45)]">暂无提现记录</div>}
        </div>
      </div>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.15)] text-[#e8eeff]">
          <DialogHeader>
            <DialogTitle className="text-white">申请提现</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">提现金额</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="请输入提现金额"
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11 focus:border-[rgba(0,245,255,0.4)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">提现方式</Label>
              <RadioGroup value={method} onValueChange={setMethod} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="ALIPAY" id="alipay" className="text-[#00f5ff] border-[rgba(0,245,255,0.3)]" />
                  <Label htmlFor="alipay" className="cursor-pointer text-white text-sm">支付宝</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="WECHAT_PAY" id="wechat" className="text-[#00f5ff] border-[rgba(0,245,255,0.3)]" />
                  <Label htmlFor="wechat" className="cursor-pointer text-white text-sm">微信</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">收款账号</Label>
              <Input
                value={accountInfo}
                onChange={(e) => setAccountInfo(e.target.value)}
                placeholder={`请输入${method === 'ALIPAY' ? '支付宝' : '微信'}账号`}
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11 focus:border-[rgba(0,245,255,0.4)]"
              />
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={submitting}
              className="w-full h-11 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 border-0"
            >
              {submitting ? '提交中...' : '确认提现'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
