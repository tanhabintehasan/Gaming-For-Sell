'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { fetchAuthMe } from '@/lib/auth-client'

interface Withdrawal {
  id: string
  amount: number
  fee: number
  netAmount: number
  method: string
  accountInfo: string
  status: string
  requestedAt: string
  reviewedAt?: string
  reviewNote?: string
  seller: {
    id: string
    username: string
    phone: string
    sellerProfile?: { balance: number } | null
  }
}

const statusMap: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
  COMPLETED: '已完成',
}

const methodMap: Record<string, string> = {
  ALIPAY: '支付宝',
  WECHAT_PAY: '微信支付',
  BANK: '银行卡',
}

export default function AdminWithdrawalsPage() {
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Withdrawal | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (!res.success || res.data.level !== 'ADMIN') {
          router.push('/backstage/admin/login')
        }
      })

    loadWithdrawals()
  }, [router])

  const loadWithdrawals = () => {
    fetch('/api/admin/withdrawals')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setWithdrawals(res.data)
        }
        setLoading(false)
      })
  }

  const handleAction = async (status: string) => {
    if (!selected) return
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status, reviewNote }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('操作成功')
        setSelected(null)
        setReviewNote('')
        loadWithdrawals()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('操作失败')
    } finally {
      setProcessing(false)
    }
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
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/admin" className="text-white hover:text-[#00f5ff]">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>提现审核</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <Card key={w.id} className="p-4 border-0 glass-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{w.seller.username}</span>
                    <span className="text-xs text-[rgba(180,200,255,0.5)]">{w.seller.phone}</span>
                  </div>
                  <div className="text-xs text-[rgba(180,200,255,0.45)] mt-1">
                    {methodMap[w.method] || w.method} · {w.accountInfo.slice(0, 8)}*** · 余额 ¥{w.seller.sellerProfile?.balance || 0}
                  </div>
                  <div className="text-xs text-[rgba(180,200,255,0.35)] mt-1">
                    申请时间: {new Date(w.requestedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white font-[family-name:var(--font-orbitron)]">¥{w.amount}</div>
                    <div className="text-[10px] text-[rgba(180,200,255,0.5)]">到账 ¥{w.netAmount} · 手续费 ¥{w.fee}</div>
                  </div>
                  <Badge className={`text-[10px] border-0 ${
                    w.status === 'PENDING' ? 'bg-[#ffd700] text-[#050810]' :
                    w.status === 'COMPLETED' ? 'bg-[#28c840] text-white' :
                    w.status === 'REJECTED' ? 'bg-[#ff2244] text-white' :
                    'bg-[rgba(0,245,255,0.15)] text-[#00f5ff]'
                  }`}>
                    {statusMap[w.status]}
                  </Badge>
                  {w.status === 'PENDING' && (
                    <Button size="sm" onClick={() => setSelected(w)} className="rounded-lg bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110">
                      审核
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {withdrawals.length === 0 && (
            <div className="text-center py-10 text-[rgba(180,200,255,0.45)]">暂无提现记录</div>
          )}
        </div>
      </main>

      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null) }}>
        <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.15)] text-[#e8eeff]">
          <DialogHeader>
            <DialogTitle className="text-white">提现审核</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(180,200,255,0.6)]">申请人</span>
                <span className="text-white">{selected.seller.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(180,200,255,0.6)]">提现金额</span>
                <span className="text-white font-bold">¥{selected.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(180,200,255,0.6)]">到账金额</span>
                <span className="text-white">¥{selected.netAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(180,200,255,0.6)]">收款方式</span>
                <span className="text-white">{methodMap[selected.method] || selected.method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(180,200,255,0.6)]">收款账号</span>
                <span className="text-white">{selected.accountInfo}</span>
              </div>
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">审核备注</Label>
                <Input
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="可选填"
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleAction('REJECTED')}
                  disabled={processing}
                  className="flex-1 h-11 rounded-xl font-bold text-white bg-[rgba(255,34,68,0.15)] border border-[rgba(255,34,68,0.4)] hover:bg-[rgba(255,34,68,0.25)]"
                >
                  拒绝
                </Button>
                <Button
                  onClick={() => handleAction('COMPLETED')}
                  disabled={processing}
                  className="flex-1 h-11 rounded-xl font-bold text-[#050810] bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110"
                >
                  通过并打款
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
