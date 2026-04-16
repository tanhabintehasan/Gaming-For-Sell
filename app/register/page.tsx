'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const sendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入有效的手机号')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'REGISTER' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('验证码已发送')
        startCountdown()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('发送失败')
    } finally {
      setSending(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    if (!code) {
      toast.error('请输入验证码')
      return
    }
    setLoading(true)
    try {
      const verifyRes = await fetch('/api/sms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, purpose: 'REGISTER' }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        toast.error(verifyData.message || '验证码错误')
        setLoading(false)
        return
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, username }),
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('注册成功')
        window.location.href = '/profile'
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('注册失败')
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
          <CardTitle className="text-2xl text-white font-black tracking-wider" style={{ fontFamily: 'var(--font-orbitron)' }}>
            注册账号
          </CardTitle>
          <CardDescription className="text-[rgba(180,200,255,0.6)]">加入速凌电竞平台</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[rgba(180,200,255,0.8)] text-sm">手机号</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl h-12 focus:border-[rgba(0,245,255,0.45)] focus:shadow-[0_0_18px_rgba(0,245,255,0.1)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[rgba(180,200,255,0.8)] text-sm">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[rgba(180,200,255,0.8)] text-sm">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl h-12 focus:border-[rgba(0,245,255,0.45)] focus:shadow-[0_0_18px_rgba(0,245,255,0.1)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-[rgba(180,200,255,0.8)] text-sm">验证码</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  type="text"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="flex-1 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl h-12 focus:border-[rgba(0,245,255,0.45)] focus:shadow-[0_0_18px_rgba(0,245,255,0.1)]"
                />
                <Button
                  type="button"
                  onClick={sendCode}
                  disabled={sending || countdown > 0}
                  className="h-12 px-4 rounded-xl bg-[rgba(0,245,255,0.1)] border border-[rgba(0,245,255,0.2)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.15)] disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}s` : sending ? '发送中...' : '获取验证码'}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 border-0 shadow-[0_12px_28px_rgba(255,47,125,0.28)] hover:shadow-[0_16px_36px_rgba(255,47,125,0.38)] transition-all"
              disabled={loading}
            >
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/login" className="text-sm text-[#00f5ff] hover:text-[#7df9ff] transition-colors">
              已有账号？去登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
