'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Search, Shield, User, Gamepad2, Plus, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface UserItem {
  id: string
  username: string
  phone: string
  level: string
  avatar: string
  isActive: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ username: '', phone: '', password: '', level: 'USER' })
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          let data = res.data
          if (filter !== 'all') data = data.filter((u: UserItem) => u.level === filter)
          if (search.trim()) {
            const s = search.toLowerCase()
            data = data.filter(
              (u: UserItem) => u.username.toLowerCase().includes(s) || u.phone.includes(s)
            )
          }
          setUsers(data)
        }
      })
      .catch(() => {
        toast.error('加载失败')
      })
      .finally(() => setLoading(false))
  }, [filter, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('创建成功')
        setDialogOpen(false)
        setForm({ username: '', phone: '', password: '', level: 'USER' })
        fetchUsers()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/admin">
            <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
          </Link>
          <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>用户管理</h1>
          <div className="flex-1" />
          <button
            onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/backstage/admin/login')}
            className="text-sm text-[rgba(180,200,255,0.55)] hover:text-[#ff2244] transition-colors flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded-xl">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">全部</TabsTrigger>
              <TabsTrigger value="USER" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">
                <User className="w-3.5 h-3.5 mr-1" /> 用户
              </TabsTrigger>
              <TabsTrigger value="SELLER" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">
                <Gamepad2 className="w-3.5 h-3.5 mr-1" /> 打手
              </TabsTrigger>
              <TabsTrigger value="ADMIN" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">
                <Shield className="w-3.5 h-3.5 mr-1" /> 管理员
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button className="rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              添加用户
            </Button>
            <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.15)] text-[#e8eeff]">
              <DialogHeader>
                <DialogTitle className="text-white">添加用户 / 管理员</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label className="text-[rgba(180,200,255,0.75)]">用户名</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    required
                    className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[rgba(180,200,255,0.75)]">手机号</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    required
                    className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[rgba(180,200,255,0.75)]">密码</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[rgba(180,200,255,0.75)]">级别</Label>
                  <div className="flex gap-2">
                    {['USER', 'SELLER', 'ADMIN'].map((lvl) => (
                      <Button
                        key={lvl}
                        type="button"
                        size="sm"
                        variant={form.level === lvl ? 'default' : 'outline'}
                        onClick={() => setForm((f) => ({ ...f, level: lvl }))}
                        className={`rounded-lg flex-1 ${form.level === lvl ? 'bg-[rgba(0,245,255,0.2)] text-[#00f5ff] border-[rgba(0,245,255,0.3)]' : 'border-[rgba(0,245,255,0.15)] text-[rgba(180,200,255,0.7)]'}`}
                      >
                        {lvl === 'ADMIN' ? '管理员' : lvl === 'SELLER' ? '打手' : '用户'}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0"
                >
                  {loading ? '创建中...' : '创建'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(180,200,255,0.35)]" />
          <Input
            placeholder="搜索用户名 / 手机号"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <Card key={u.id} className="p-4 glass-card border-0 hover:border-[rgba(0,245,255,0.2)] transition-all">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-[rgba(0,245,255,0.15)]">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback className="bg-[rgba(0,245,255,0.1)] text-[#00f5ff]">{u.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{u.username}</span>
                    {u.level === 'ADMIN' ? (
                      <Badge className="bg-[rgba(244,34,68,0.12)] text-[#ff2244] border border-[rgba(244,34,68,0.25)] text-[10px] rounded">管理</Badge>
                    ) : u.level === 'SELLER' ? (
                      <Badge className="bg-[rgba(0,245,255,0.1)] text-[#00f5ff] border border-[rgba(0,245,255,0.2)] text-[10px] rounded">打手</Badge>
                    ) : (
                      <Badge className="bg-[rgba(74,222,128,0.1)] text-[#4ade80] border border-[rgba(74,222,128,0.2)] text-[10px] rounded">用户</Badge>
                    )}
                  </div>
                  <div className="text-xs text-[rgba(180,200,255,0.45)] mt-0.5">{u.phone}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
