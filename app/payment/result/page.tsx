'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderNumber =
    searchParams?.get('orderNumber') || searchParams?.get('out_trade_no') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading')
  const [message, setMessage] = useState('正在查询支付结果...')

  useEffect(() => {
    if (!orderNumber) {
      setStatus('error')
      setMessage('缺少订单信息')
      return
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status?orderNumber=${orderNumber}`)
        const data = await res.json()
        if (data.success && data.data.paid) {
          setStatus('success')
          setMessage('支付成功！')
        } else {
          setStatus('pending')
          setMessage('支付结果处理中，请稍后刷新页面查看。')
        }
      } catch {
        setStatus('error')
        setMessage('查询支付结果失败')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [orderNumber])

  const icon = {
    loading: <Loader2 className="w-12 h-12 text-[#00f5ff] animate-spin" />,
    success: <CheckCircle className="w-12 h-12 text-green-400" />,
    pending: <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />,
    error: <XCircle className="w-12 h-12 text-red-400" />,
  }[status]

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 glass-card border-0 text-center space-y-6">
        <div className="flex justify-center">{icon}</div>
        <h1 className="text-xl font-bold text-white">
          {status === 'success' ? '支付成功' : status === 'error' ? '出错了' : '处理中'}
        </h1>
        <p className="text-[rgba(180,200,255,0.7)]">{message}</p>
        {orderNumber && (
          <p className="text-sm text-[rgba(180,200,255,0.5)] font-mono">
            订单号: {orderNumber}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-[rgba(0,245,255,0.2)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.08)] bg-transparent"
            onClick={() => router.push('/profile')}
          >
            我的订单
          </Button>
          {status === 'success' && (
            <Button
              className="flex-1 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110"
              onClick={() => router.push('/')}
            >
              返回首页
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050810]" />}>
      <PaymentResultContent />
    </Suspense>
  )
}
