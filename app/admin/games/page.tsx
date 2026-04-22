'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Edit2, Layers, ImageIcon, Upload, X, Gamepad2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Image from 'next/image'

interface Game {
  id: string
  nameCn: string
  nameEn: string
  slug: string
  logoUrl: string | null
  bannerUrl: string | null
  supportedPlatforms: string
  description: string
  isActive: boolean
  sortOrder: number
  _count: {
    sellerServices: number
    orders: number
    categories: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
  iconUrl: string | null
  defaultHourlyRate: number
  sortOrder: number
  isActive: boolean
}

const PLATFORMS = ['MOBILE', 'PC', 'CONSOLE']

const emptyGameForm = {
  nameCn: '',
  nameEn: '',
  slug: '',
  logoUrl: '',
  bannerUrl: '',
  supportedPlatforms: [] as string[],
  description: '',
  sortOrder: '0',
  isActive: true,
}

const emptyCategoryForm = {
  name: '',
  slug: '',
  iconUrl: '',
  defaultHourlyRate: '0',
  sortOrder: '0',
  isActive: true,
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || '上传失败')
  return data.data.url
}

function ImagePreview({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false)
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] text-[rgba(180,200,255,0.3)] ${className}`}>
        <ImageIcon className="w-6 h-6" />
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" onError={() => setError(true)} />
    </div>
  )
}

function FileUploadButton({
  label,
  onUpload,
  currentUrl,
}: {
  label: string
  onUpload: (url: string) => void
  currentUrl?: string
}) {
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onUpload(url)
      toast.success('上传成功')
    } catch (err: any) {
      toast.error(err.message || '上传失败')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-[rgba(180,200,255,0.75)]">{label}</Label>
      <div className="flex items-center gap-3">
        {currentUrl && (
          <div className="relative">
            <ImagePreview src={currentUrl} alt="preview" className="w-16 h-16 rounded-lg" />
            <button
              onClick={() => onUpload('')}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff2244] text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(0,245,255,0.2)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] transition-colors text-sm">
          <Upload className="w-4 h-4" />
          {uploading ? '上传中...' : currentUrl ? '更换图片' : '上传图片'}
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={uploading} />
        </label>
      </div>
    </div>
  )
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [categoryGame, setCategoryGame] = useState<Game | null>(null)

  // Form states
  const [gameForm, setGameForm] = useState(emptyGameForm)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchGames = useCallback(() => {
    fetch('/api/admin/games')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setGames(res.data)
      })
      .catch(() => {
        toast.error('加载失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  const fetchCategories = useCallback((gameId: string) => {
    fetch(`/api/admin/categories?gameId=${gameId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data)
      })
      .catch(() => {
        toast.error('加载分类失败')
      })
  }, [])

  const openAdd = () => {
    setGameForm(emptyGameForm)
    setAddOpen(true)
  }

  const openEdit = (game: Game) => {
    setEditingGame(game)
    setGameForm({
      nameCn: game.nameCn,
      nameEn: game.nameEn,
      slug: game.slug,
      logoUrl: game.logoUrl || '',
      bannerUrl: game.bannerUrl || '',
      supportedPlatforms: game.supportedPlatforms.split(',').filter(Boolean),
      description: game.description || '',
      sortOrder: String(game.sortOrder),
      isActive: game.isActive,
    })
    setEditOpen(true)
  }

  const openCategories = (game: Game) => {
    setCategoryGame(game)
    setCategories([])
    setCategoryForm(emptyCategoryForm)
    setEditingCategory(null)
    setCategoryOpen(true)
    fetchCategories(game.id)
  }

  const togglePlatform = (platform: string) => {
    setGameForm((f) => ({
      ...f,
      supportedPlatforms: f.supportedPlatforms.includes(platform)
        ? f.supportedPlatforms.filter((p) => p !== platform)
        : [...f.supportedPlatforms, platform],
    }))
  }

  const validateGameForm = () => {
    if (!gameForm.nameCn || !gameForm.nameEn || !gameForm.slug) {
      toast.error('请填写游戏名称和标识')
      return false
    }
    if (gameForm.supportedPlatforms.length === 0) {
      toast.error('请至少选择一个平台')
      return false
    }
    return true
  }

  const saveGame = async () => {
    if (!validateGameForm()) return
    setSaving(true)
    const payload = {
      ...gameForm,
      supportedPlatforms: gameForm.supportedPlatforms.join(','),
      sortOrder: parseInt(gameForm.sortOrder) || 0,
    }
    try {
      const url = editingGame ? `/api/admin/games/${editingGame.id}` : '/api/admin/games'
      const method = editingGame ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingGame ? '更新成功' : '创建成功')
        setAddOpen(false)
        setEditOpen(false)
        fetchGames()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const toggleGame = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/games/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    const data = await res.json()
    if (data.success) {
      setGames((prev) => prev.map((g) => (g.id === id ? { ...g, isActive } : g)))
      toast.success('状态更新成功')
    } else {
      toast.error(data.message || '更新失败')
    }
  }

  const saveCategory = async () => {
    if (!categoryForm.name) {
      toast.error('分类名称不能为空')
      return
    }
    if (!categoryGame) return
    setSaving(true)
    const payload = {
      ...categoryForm,
      gameId: categoryGame.id,
      defaultHourlyRate: parseFloat(categoryForm.defaultHourlyRate) || 0,
      sortOrder: parseInt(categoryForm.sortOrder) || 0,
    }
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories'
      const method = editingCategory ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingCategory ? '更新成功' : '创建成功')
        setCategoryForm(emptyCategoryForm)
        setEditingCategory(null)
        fetchCategories(categoryGame.id)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('确定删除该分类吗？')) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('删除成功')
        if (categoryGame) fetchCategories(categoryGame.id)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('删除失败')
    }
  }

  const startEditCategory = (cat: Category) => {
    setEditingCategory(cat)
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      iconUrl: cat.iconUrl || '',
      defaultHourlyRate: String(cat.defaultHourlyRate),
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
    })
  }

  const GameModal = ({ open, onClose, title }: { open: boolean; onClose: () => void; title: string }) => {
    if (!open) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[rgba(10,15,30,0.98)] border border-[rgba(0,245,255,0.15)] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-[rgba(180,200,255,0.5)] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">中文名称</Label>
              <Input
                value={gameForm.nameCn}
                onChange={(e) => setGameForm((f) => ({ ...f, nameCn: e.target.value }))}
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">英文名称</Label>
              <Input
                value={gameForm.nameEn}
                onChange={(e) => setGameForm((f) => ({ ...f, nameEn: e.target.value }))}
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">标识 (slug)</Label>
              <Input
                value={gameForm.slug}
                onChange={(e) => setGameForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="例如: honor-of-kings"
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11"
              />
            </div>
            <FileUploadButton
              label="Logo 图片"
              currentUrl={gameForm.logoUrl}
              onUpload={(url) => setGameForm((f) => ({ ...f, logoUrl: url }))}
            />
            <FileUploadButton
              label="Banner 图片"
              currentUrl={gameForm.bannerUrl}
              onUpload={(url) => setGameForm((f) => ({ ...f, bannerUrl: url }))}
            />
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">支持平台</Label>
              <div className="flex gap-3">
                {PLATFORMS.map((p) => (
                  <label
                    key={p}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      gameForm.supportedPlatforms.includes(p)
                        ? 'border-[#00f5ff] bg-[rgba(0,245,255,0.12)] text-[#00f5ff]'
                        : 'border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.03)] text-[rgba(180,200,255,0.5)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={gameForm.supportedPlatforms.includes(p)}
                      onChange={() => togglePlatform(p)}
                    />
                    {p === 'MOBILE' ? '手机' : p === 'PC' ? '电脑' : '主机'}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">描述</Label>
              <Input
                value={gameForm.description}
                onChange={(e) => setGameForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[rgba(180,200,255,0.75)]">排序</Label>
                <Input
                  type="number"
                  value={gameForm.sortOrder}
                  onChange={(e) => setGameForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11"
                />
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameForm.isActive}
                    onChange={(e) => setGameForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff]"
                  />
                  <span className="text-sm text-[rgba(180,200,255,0.75)]">立即上线</span>
                </label>
              </div>
            </div>
            <Button
              onClick={saveGame}
              disabled={saving}
              className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0 text-[#050810]"
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const CategoryModal = () => {
    if (!categoryOpen || !categoryGame) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[rgba(10,15,30,0.98)] border border-[rgba(0,245,255,0.15)] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">{categoryGame.nameCn} - 分类管理</h2>
            <button onClick={() => setCategoryOpen(false)} className="text-[rgba(180,200,255,0.5)] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category form */}
          <div className="space-y-3 mb-6 p-4 rounded-xl bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.08)]">
            <h3 className="text-sm font-medium text-[#00f5ff]">{editingCategory ? '编辑分类' : '添加分类'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[rgba(180,200,255,0.6)]">名称</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[rgba(180,200,255,0.6)]">标识</Label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))}
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[rgba(180,200,255,0.6)]">默认时薪</Label>
                <Input
                  type="number"
                  value={categoryForm.defaultHourlyRate}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, defaultHourlyRate: e.target.value }))}
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[rgba(180,200,255,0.6)]">排序</Label>
                <Input
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff]"
                />
                <span className="text-sm text-[rgba(180,200,255,0.75)]">启用</span>
              </label>
              <div className="flex-1" />
              {editingCategory && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setEditingCategory(null); setCategoryForm(emptyCategoryForm) }}
                  className="rounded-lg border-[rgba(0,245,255,0.15)] text-[rgba(180,200,255,0.6)]"
                >
                  取消编辑
                </Button>
              )}
              <Button
                size="sm"
                onClick={saveCategory}
                disabled={saving}
                className="rounded-lg font-bold bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] hover:brightness-110 border-0"
              >
                {saving ? '保存中...' : editingCategory ? '更新' : '添加'}
              </Button>
            </div>
          </div>

          {/* Category list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[rgba(180,200,255,0.6)]">现有分类 ({categories.length})</h3>
            {categories.length === 0 && (
              <p className="text-sm text-[rgba(180,200,255,0.35)] py-4 text-center">暂无分类</p>
            )}
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[rgba(0,245,255,0.03)] border border-[rgba(0,245,255,0.08)]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white text-sm">{cat.name}</span>
                  <Badge
                    className={
                      cat.isActive
                        ? 'bg-[rgba(40,200,64,0.12)] text-[#4ade80] border border-[rgba(40,200,64,0.25)] text-[10px]'
                        : 'bg-[rgba(120,120,120,0.12)] text-[#9ca3af] border border-[rgba(120,120,120,0.25)] text-[10px]'
                    }
                  >
                    {cat.isActive ? '启用' : '禁用'}
                  </Badge>
                  <span className="text-xs text-[rgba(180,200,255,0.35)]">¥{cat.defaultHourlyRate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEditCategory(cat)} className="h-7 w-7 p-0 text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)]">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteCategory(cat.id)} className="h-7 w-7 p-0 text-[#ff5f7a] hover:bg-[rgba(255,34,68,0.1)]">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
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
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
            </Link>
            <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>游戏管理</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/backstage/admin/login')}
              className="text-sm text-[rgba(180,200,255,0.55)] hover:text-[#ff2244] transition-colors flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0 rounded-full px-4"
              onClick={openAdd}
            >
              <Plus className="w-4 h-4 mr-1" />
              添加游戏
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {games.map((game) => (
            <Card key={game.id} className="p-4 glass-card border-0 hover:border-[rgba(0,245,255,0.15)] transition-all">
              <div className="flex items-start gap-4">
                <ImagePreview src={game.logoUrl || ''} alt={game.nameCn} className="w-16 h-16 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{game.nameCn}</h3>
                      <p className="text-sm text-[rgba(180,200,255,0.45)]">{game.nameEn}</p>
                      <p className="text-sm text-[rgba(180,200,255,0.45)] mt-1">
                        平台: {game.supportedPlatforms} | 排序: {game.sortOrder}
                      </p>
                    </div>
                    <Badge
                      className={
                        game.isActive
                          ? 'bg-[rgba(40,200,64,0.12)] text-[#4ade80] border border-[rgba(40,200,64,0.25)]'
                          : 'bg-[rgba(120,120,120,0.12)] text-[#9ca3af] border border-[rgba(120,120,120,0.25)]'
                      }
                    >
                      {game.isActive ? '已上线' : '已禁用'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-[rgba(180,200,255,0.45)]">
                    <span>打手: {game._count.sellerServices}</span>
                    <span>订单: {game._count.orders}</span>
                    <span>分类: {game._count.categories}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(game)}
                      className="rounded-lg border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.3)]"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCategories(game)}
                      className="rounded-lg border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.3)]"
                    >
                      <Layers className="w-3.5 h-3.5 mr-1" />
                      分类管理
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toggleGame(game.id, !game.isActive)}
                      className={
                        game.isActive
                          ? 'bg-[rgba(255,34,68,0.12)] text-[#ff5f7a] border border-[rgba(255,34,68,0.25)] hover:bg-[rgba(255,34,68,0.2)]'
                          : 'bg-[rgba(40,200,64,0.12)] text-[#4ade80] border border-[rgba(40,200,64,0.25)] hover:bg-[rgba(40,200,64,0.2)]'
                      }
                    >
                      {game.isActive ? '禁用' : '启用'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <GameModal open={addOpen} onClose={() => setAddOpen(false)} title="添加游戏" />
      <GameModal open={editOpen} onClose={() => setEditOpen(false)} title="编辑游戏" />
      <CategoryModal />
    </div>
  )
}
