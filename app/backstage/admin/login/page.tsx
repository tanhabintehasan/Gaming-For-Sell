'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, type: 'password' }),
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        if (data.data.level !== 'ADMIN') {
          toast.error('您没有管理员权限')
          setLoading(false)
          return
        }
        toast.success('登录成功')
        window.location.href = '/admin'
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(0,234,255,0.08),transparent_35%),radial-gradient(circle_at_100%_0,rgba(255,45,117,0.06),transparent_35%)]" />
      <Card className="w-full max-w-md glass-card border-[rgba(0,245,255,0.15)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(0,234,255,0.08),transparent_40%),radial-gradient(circle_at_100%_0,rgba(255,45,117,0.05),transparent_35%)] pointer-events-none" />
        <CardHeader className="text-center relative z-10 pt-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.2)] flex items-center justify-center text-[#00f5ff] shadow-[0_0_24px_rgba(0,245,255,0.15)]">
            <Shield className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl text-white font-black tracking-wider" style={{ fontFamily: 'var(--font-orbitron)' }}>
            管理后台登录
          </CardTitle>
          <CardDescription className="text-[rgba(180,200,255,0.6)]">管理员专用入口</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[rgba(180,200,255,0.8)] text-sm">手机号</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入管理员手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl h-12 focus:border-[rgba(0,245,255,0.45)] focus:shadow-[0_0_18px_rgba(0,245,255,0.1)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[rgba(180,200,255,0.8)] text-sm">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl h-12 focus:border-[rgba(0,245,255,0.45)] focus:shadow-[0_0_18px_rgba(0,245,255,0.1)]"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 border-0 shadow-[0_12px_28px_rgba(255,47,125,0.28)] hover:shadow-[0_16px_36px_rgba(255,47,125,0.38)] transition-all"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/" className="text-sm text-[rgba(180,200,255,0.55)] hover:text-[#00f5ff] transition-colors">
              返回前台首页
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
