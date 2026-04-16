'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, Gamepad2, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Game {
  id: string
  nameCn: string
}

interface AuthUser {
  id: string
  username: string
  level: string
}

export default function SellerApplyPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    phone: '',
    username: '',
    age: '',
    gender: 'MALE',
    location: '',
    bio: '',
    reason: '',
    experience: '',
  })
  const [selectedGames, setSelectedGames] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setUser(res.data)
      })

    fetch('/api/games')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setGames(res.data)
      })
  }, [])

  const toggleGame = (id: string) => {
    setSelectedGames((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone || !form.username) {
      toast.error('请填写手机号和用户名')
      return
    }
    setLoading(true)
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, age: parseInt(form.age) || 0, gameIds: selectedGames }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(data.message)
      router.push('/')
    } else {
      toast.error(data.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/">
            <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
          </Link>
          <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>申请成为打手</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {user && (user.level === 'SELLER' || user.level === 'ADMIN') ? (
          <Card className="p-10 text-center glass-card border-0">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.2)] flex items-center justify-center text-[#00f5ff] text-2xl font-black shadow-[0_0_24px_rgba(0,245,255,0.15)]" style={{ fontFamily: 'var(--font-orbitron)' }}>
              SL
            </div>
            <h2 className="text-xl font-bold text-white mb-2">您已经是打手 / 陪玩师</h2>
            <p className="text-[rgba(180,200,255,0.6)] mb-6">无需重复申请，直接前往打手后台开始工作吧</p>
            <Button
              onClick={() => router.push('/seller/dashboard')}
              className="h-12 px-8 rounded-xl font-bold text-[#050810] bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0"
            >
              进入打手后台
            </Button>
          </Card>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-5 glass-card border-0 space-y-4">
            <div className="flex items-center gap-2 text-white font-medium">
              <User className="w-4 h-4 text-[#00f5ff]" />
              基本信息
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">手机号</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="请输入手机号"
                  required
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">用户名 / 昵称</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="请输入用户名"
                  required
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">年龄</Label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  placeholder="例如 22"
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">性别</Label>
                <div className="flex gap-2">
                  {['MALE', 'FEMALE'].map((g) => (
                    <Button
                      key={g}
                      type="button"
                      variant={form.gender === g ? 'default' : 'outline'}
                      onClick={() => setForm((f) => ({ ...f, gender: g }))}
                      className={`flex-1 rounded-xl ${form.gender === g ? 'bg-[rgba(0,245,255,0.2)] text-[#00f5ff] border-[rgba(0,245,255,0.3)]' : 'border-[rgba(0,245,255,0.15)] text-[rgba(180,200,255,0.7)]'}`}
                    >
                      {g === 'MALE' ? '男' : '女'}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[rgba(180,200,255,0.75)]">所在城市</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="例如 上海市"
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                />
              </div>
            </div>
          </Card>

          <Card className="p-5 glass-card border-0 space-y-4">
            <div className="flex items-center gap-2 text-white font-medium">
              <Gamepad2 className="w-4 h-4 text-[#00f5ff]" />
              擅长游戏
            </div>
            <div className="flex flex-wrap gap-2">
              {games.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => toggleGame(game.id)}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                    selectedGames.includes(game.id)
                      ? 'bg-[rgba(0,245,255,0.15)] text-[#00f5ff] border-[rgba(0,245,255,0.3)]'
                      : 'bg-transparent text-[rgba(180,200,255,0.7)] border-[rgba(0,245,255,0.12)] hover:border-[rgba(0,245,255,0.25)]'
                  }`}
                >
                  {game.nameCn}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 glass-card border-0 space-y-4">
            <div className="flex items-center gap-2 text-white font-medium">
              <FileText className="w-4 h-4 text-[#00f5ff]" />
              个人介绍
            </div>
            <div className="space-y-3">
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="简单介绍一下自己..."
                rows={3}
                className="w-full bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)] p-3 text-sm"
              />
              <textarea
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="为什么想要加入速凌电竞？"
                rows={3}
                className="w-full bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)] p-3 text-sm"
              />
              <textarea
                value={form.experience}
                onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                placeholder="相关陪玩/代打经验..."
                rows={3}
                className="w-full bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)] p-3 text-sm"
              />
            </div>
          </Card>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0 rounded-xl"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? '提交中...' : '提交申请'}
          </Button>
        </form>
        )}
      </main>
    </div>
  )
}
