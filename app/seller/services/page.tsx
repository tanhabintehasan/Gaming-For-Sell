'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Edit2, Trash2, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { fetchAuthMe } from '@/lib/auth-client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Service {
  id: string
  platformTypes: string
  hourlyRate: number
  isAvailable: boolean
  specialties: string
  game: { id: string; nameCn: string }
}

interface Game {
  id: string
  nameCn: string
}

const emptyForm = {
  gameId: '',
  platformTypes: 'MOBILE,PC',
  hourlyRate: '',
  specialties: '',
  isAvailable: true,
}

export default function SellerServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (!res.success || (res.data.level !== 'SELLER' && res.data.level !== 'ADMIN')) {
          router.push('/login')
        }
      })

    loadServices()

    fetch('/api/games')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setGames(res.data)
      })
  }, [router])

  const loadServices = () => {
    fetch('/api/seller/services')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setServices(res.data)
        setLoading(false)
      })
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (service: Service) => {
    setEditing(service)
    setForm({
      gameId: service.game.id,
      platformTypes: service.platformTypes,
      hourlyRate: String(service.hourlyRate),
      specialties: service.specialties,
      isAvailable: service.isAvailable,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.gameId || !form.hourlyRate) {
      toast.error('请选择游戏并填写时薪')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      hourlyRate: parseFloat(form.hourlyRate),
    }
    try {
      const url = editing ? `/api/seller/services/${editing.id}` : '/api/seller/services'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editing ? '更新成功' : '创建成功')
        setDialogOpen(false)
        loadServices()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该服务吗？')) return
    try {
      const res = await fetch(`/api/seller/services/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('删除成功')
        loadServices()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('删除失败')
    }
  }

  const toggleAvailable = async (service: Service) => {
    try {
      const res = await fetch(`/api/seller/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !service.isAvailable }),
      })
      const data = await res.json()
      if (data.success) {
        setServices((prev) => prev.map((s) => (s.id === service.id ? data.data : s)))
        toast.success('状态更新成功')
      }
    } catch {
      toast.error('更新失败')
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
    <div className="relative min-h-screen lg:py-8 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between py-4 lg:py-0 lg:mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 lg:hidden text-white hover:text-[#00f5ff] transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold lg:text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
              我的服务 <span className="text-[#00f5ff]">SERVICES</span>
            </h1>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0 rounded-full px-4" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" />
            添加服务
          </Button>
        </div>

        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id} className="p-4 glass-card border-0 hover:border-[rgba(0,245,255,0.15)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] flex items-center justify-center text-[#00f5ff] shrink-0">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-white">{service.game.nameCn}</h3>
                      <p className="text-sm text-[rgba(180,200,255,0.5)]">
                        {service.platformTypes.includes('MOBILE') ? '手游' : ''}
                        {service.platformTypes.includes('MOBILE') && service.platformTypes.includes('PC') ? ' / ' : ''}
                        {service.platformTypes.includes('PC') ? '端游' : ''}
                      </p>
                      <p className="text-sm text-[#00f5ff] font-bold mt-1 font-[family-name:var(--font-orbitron)]">
                        ¥{service.hourlyRate}/时
                      </p>
                      {service.specialties && (
                        <p className="text-xs text-[rgba(180,200,255,0.45)] mt-1">擅长: {service.specialties}</p>
                      )}
                    </div>
                    <Badge className={service.isAvailable
                      ? 'bg-[rgba(40,200,64,0.12)] text-[#4ade80] border border-[rgba(40,200,64,0.25)]'
                      : 'bg-[rgba(120,120,120,0.12)] text-[#9ca3af] border border-[rgba(120,120,120,0.25)]'
                    }>
                      {service.isAvailable ? '接单中' : '已暂停'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => openEdit(service)} className="rounded-lg border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.3)]">
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      编辑
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)} className="rounded-lg border-[rgba(255,34,68,0.15)] bg-[rgba(255,34,68,0.05)] text-[#ff5f7a] hover:bg-[rgba(255,34,68,0.1)] hover:border-[rgba(255,34,68,0.3)]">
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      删除
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toggleAvailable(service)}
                      className={service.isAvailable
                        ? 'bg-[rgba(255,34,68,0.12)] text-[#ff5f7a] border border-[rgba(255,34,68,0.25)] hover:bg-[rgba(255,34,68,0.2)]'
                        : 'bg-[rgba(40,200,64,0.12)] text-[#4ade80] border border-[rgba(40,200,64,0.25)] hover:bg-[rgba(40,200,64,0.2)]'
                      }
                    >
                      {service.isAvailable ? '暂停接单' : '恢复接单'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {services.length === 0 && (
            <div className="text-center py-10 text-[rgba(180,200,255,0.45)]">暂无服务，点击右上角添加擅长的游戏</div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? '编辑服务' : '添加服务'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">游戏</Label>
              <select
                value={form.gameId}
                onChange={(e) => setForm((f) => ({ ...f, gameId: e.target.value }))}
                disabled={!!editing}
                className="w-full h-11 rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] text-[#e8eeff] px-3 disabled:opacity-50"
              >
                <option value="">请选择游戏</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>{g.nameCn}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">支持平台</Label>
              <div className="flex gap-3">
                {['MOBILE', 'PC'].map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm text-[rgba(180,200,255,0.8)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.platformTypes.includes(p)}
                      onChange={(e) => {
                        const types = form.platformTypes.split(',').filter(Boolean)
                        const next = e.target.checked ? [...types, p] : types.filter((t) => t !== p)
                        setForm((f) => ({ ...f, platformTypes: next.join(',') || 'MOBILE' }))
                      }}
                      className="h-4 w-4 rounded border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff]"
                    />
                    {p === 'MOBILE' ? '手游' : '端游'}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">时薪 (¥)</Label>
              <Input type="number" value={form.hourlyRate} onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))} className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">擅长位置/特长</Label>
              <Input value={form.specialties} onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))} placeholder="例如：打野、ADC、战术指挥" className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="isAvailable"
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
                className="h-4 w-4 rounded border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff]"
              />
              <Label htmlFor="isAvailable" className="text-sm text-[rgba(180,200,255,0.75)] cursor-pointer">立即开启接单</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl font-bold text-white bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0 text-[#050810]">
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
