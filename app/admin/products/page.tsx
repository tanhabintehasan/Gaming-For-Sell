'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Edit2, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Image from 'next/image'
import { fetchAuthMe } from '@/lib/auth-client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  basePrice: number
  originalPrice: number | null
  serviceType: string
  durationHours: number
  isActive: boolean
  salesCount: number
  game: { id: string; nameCn: string }
  category: { id: string; name: string } | null
  sellerId?: string
}

interface Game {
  id: string
  nameCn: string
}

const emptyForm = {
  gameId: '',
  categoryId: '',
  sellerId: '',
  name: '',
  description: '',
  imageUrl: '',
  basePrice: '',
  originalPrice: '',
  serviceType: 'HOURLY',
  durationHours: '1',
  specifications: '',
  isActive: true,
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (!res.success || res.data.level !== 'ADMIN') {
          router.push('/backstage/admin/login')
        }
      })

    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProducts(res.data)
        setLoading(false)
      })

    fetch('/api/games')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setGames(res.data)
      })
  }, [router])

  useEffect(() => {
    if (!form.gameId) {
      setCategories([])
      return
    }
    fetch(`/api/games/${form.gameId}/categories`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data)
      })
  }, [form.gameId])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      gameId: product.game.id,
      categoryId: product.category?.id || '',
      sellerId: product.sellerId || '',
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      basePrice: String(product.basePrice),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      serviceType: product.serviceType,
      durationHours: String(product.durationHours),
      specifications: '',
      isActive: product.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.gameId || !form.name || !form.basePrice) {
      toast.error('请填写游戏、名称和基础价格')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      categoryId: form.categoryId || undefined,
      sellerId: form.sellerId || undefined,
      basePrice: parseFloat(form.basePrice),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      durationHours: parseInt(form.durationHours) || 1,
    }
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products'
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
        if (editing) {
          setProducts((prev) => prev.map((p) => (p.id === editing.id ? data.data : p)))
        } else {
          setProducts((prev) => [data.data, ...prev])
        }
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
    if (!confirm('确定删除该商品吗？')) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('删除成功')
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('删除失败')
    }
  }

  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? data.data : p)))
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
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
            </Link>
            <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>商品管理</h1>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0 rounded-full px-4" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" />
            添加商品
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 glass-card border-0 hover:border-[rgba(0,245,255,0.15)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-900 relative overflow-hidden shrink-0 border border-[rgba(0,245,255,0.1)]">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[rgba(180,200,255,0.3)]">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-white">{product.name}</h3>
                      <p className="text-sm text-[rgba(180,200,255,0.45)]">{product.game.nameCn} {product.category ? `· ${product.category.name}` : ''} {product.sellerId ? '· 已绑定打手' : ''}</p>
                      <p className="text-sm text-[#00f5ff] font-bold mt-1 font-[family-name:var(--font-orbitron)]">
                        ¥{product.basePrice}
                        {product.originalPrice && <span className="text-[rgba(180,200,255,0.4)] line-through text-xs ml-2 font-normal">¥{product.originalPrice}</span>}
                      </p>
                    </div>
                    <Badge className={product.isActive
                      ? 'bg-[rgba(40,200,64,0.12)] text-[#4ade80] border border-[rgba(40,200,64,0.25)]'
                      : 'bg-[rgba(120,120,120,0.12)] text-[#9ca3af] border border-[rgba(120,120,120,0.25)]'
                    }>
                      {product.isActive ? '已上架' : '已下架'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => openEdit(product)} className="rounded-lg border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.3)]">
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      编辑
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)} className="rounded-lg border-[rgba(255,34,68,0.15)] bg-[rgba(255,34,68,0.05)] text-[#ff5f7a] hover:bg-[rgba(255,34,68,0.1)] hover:border-[rgba(255,34,68,0.3)]">
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      删除
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toggleActive(product)}
                      className={product.isActive
                        ? 'bg-[rgba(255,34,68,0.12)] text-[#ff5f7a] border border-[rgba(255,34,68,0.25)] hover:bg-[rgba(255,34,68,0.2)]'
                        : 'bg-[rgba(40,200,64,0.12)] text-[#4ade80] border border-[rgba(40,200,64,0.25)] hover:bg-[rgba(40,200,64,0.2)]'
                      }
                    >
                      {product.isActive ? '下架' : '上架'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {products.length === 0 && (
            <div className="text-center py-10 text-[rgba(180,200,255,0.45)]">暂无商品</div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? '编辑商品' : '添加商品'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">游戏</Label>
              <select
                value={form.gameId}
                onChange={(e) => setForm((f) => ({ ...f, gameId: e.target.value, categoryId: '' }))}
                className="w-full h-11 rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] text-[#e8eeff] px-3"
              >
                <option value="">请选择游戏</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>{g.nameCn}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">分类</Label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="w-full h-11 rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] text-[#e8eeff] px-3"
              >
                <option value="">不选择分类</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">商品名称</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">描述</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">基础价格</Label>
                <Input type="number" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">原价</Label>
                <Input type="number" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))} className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">服务类型</Label>
                <select
                  value={form.serviceType}
                  onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
                  className="w-full h-11 rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] text-[#e8eeff] px-3"
                >
                  <option value="HOURLY">按小时</option>
                  <option value="PACKAGE">套餐</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">时长(小时)</Label>
                <Input type="number" value={form.durationHours} onChange={(e) => setForm((f) => ({ ...f, durationHours: e.target.value }))} className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">图片地址</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">卖家ID（可选）</Label>
              <Input value={form.sellerId} onChange={(e) => setForm((f) => ({ ...f, sellerId: e.target.value }))} placeholder="绑定到特定打手" className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff]"
              />
              <Label htmlFor="isActive" className="text-sm text-[rgba(180,200,255,0.75)] cursor-pointer">立即上架</Label>
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
