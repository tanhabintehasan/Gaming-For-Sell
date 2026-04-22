'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ContentPage {
  id: string
  slug: string
  title: string
  rawContent: string
  isPublished: boolean
  updatedAt: string
}

const emptyForm = {
  slug: '',
  title: '',
  rawContent: '',
  isPublished: false,
}

export default function AdminContentPage() {
  const router = useRouter()
  const [pages, setPages] = useState<ContentPage[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ContentPage | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchPages = () => {
    setLoading(true)
    fetch('/api/admin/content-pages')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setPages(res.data)
      })
      .catch(() => toast.error('加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (page: ContentPage) => {
    setEditing(page)
    setForm({
      slug: page.slug,
      title: page.title,
      rawContent: page.rawContent,
      isPublished: page.isPublished,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.slug || !form.title || !form.rawContent) {
      toast.error('Slug、标题和内容不能为空')
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/content-pages/${editing.id}` : '/api/admin/content-pages'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editing ? '更新成功' : '创建成功')
        setDialogOpen(false)
        fetchPages()
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
    if (!confirm('确定删除该页面吗？')) return
    try {
      const res = await fetch(`/api/admin/content-pages/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('删除成功')
        fetchPages()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-[#00f5ff]" />
            <h1 className="font-bold text-lg text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>页面内容管理</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-[rgba(180,200,255,0.55)] hover:text-[#00f5ff] transition-colors">
              返回后台
            </Link>
            <button
              onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/backstage/admin/login'))}
              className="text-sm text-[rgba(180,200,255,0.55)] hover:text-[#ff2244] transition-colors flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">页面列表</h2>
            <p className="text-sm text-[rgba(180,200,255,0.5)] mt-1">管理隐私政策、用户协议、关于我们等页面内容</p>
          </div>
          <Button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0">
            <Plus className="w-4 h-4 mr-1" />
            新建页面
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[rgba(180,200,255,0.4)]">加载中...</div>
        ) : pages.length === 0 ? (
          <Card className="glass-card border-0 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-[rgba(180,200,255,0.2)] mb-4" />
            <p className="text-[rgba(180,200,255,0.5)]">暂无页面内容</p>
            <Button onClick={openCreate} variant="outline" className="mt-4 rounded-xl border-[rgba(0,245,255,0.2)] text-[#00f5ff]">
              创建第一个页面
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pages.map((page) => (
              <Card key={page.id} className="glass-card border-0 p-4 hover:border-[rgba(0,245,255,0.15)] transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${page.isPublished ? 'bg-[rgba(0,245,255,0.1)] text-[#00f5ff]' : 'bg-[rgba(255,34,68,0.1)] text-[#ff2244]'}`}>
                      {page.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{page.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-[rgba(0,245,255,0.08)] text-[#00f5ff]">/{page.slug}</span>
                        <span className="text-xs text-[rgba(180,200,255,0.4)]">
                          {page.isPublished ? '已发布' : '未发布'}
                        </span>
                        <span className="text-xs text-[rgba(180,200,255,0.3)]">
                          更新于 {new Date(page.updatedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/pages/${page.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg hover:bg-[rgba(0,245,255,0.08)] text-[rgba(180,200,255,0.5)] hover:text-[#00f5ff] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => openEdit(page)}
                      className="p-2 rounded-lg hover:bg-[rgba(0,245,255,0.08)] text-[rgba(180,200,255,0.5)] hover:text-[#00f5ff] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="p-2 rounded-lg hover:bg-[rgba(255,34,68,0.08)] text-[rgba(180,200,255,0.5)] hover:text-[#ff2244] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border border-[rgba(0,245,255,0.15)] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? '编辑页面' : '新建页面'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">页面标题</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="例如：隐私政策"
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">URL Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="例如：privacy-policy"
                disabled={!!editing}
                className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] rounded-xl h-11 disabled:opacity-50"
              />
              <p className="text-xs text-[rgba(180,200,255,0.35)]">访问地址：/pages/{form.slug || 'your-slug'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.75)]">页面内容</Label>
              <textarea
                value={form.rawContent}
                onChange={(e) => setForm((f) => ({ ...f, rawContent: e.target.value }))}
                placeholder="支持简单格式：&#10;# 标题&#10;**粗体**&#10;*斜体*&#10;换行直接回车"
                rows={12}
                className="w-full rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.12)] text-[#e8eeff] p-3 text-sm resize-none focus:outline-none focus:border-[rgba(0,245,255,0.3)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isPublished"
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="h-4 w-4 rounded border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff]"
              />
              <Label htmlFor="isPublished" className="text-sm text-[rgba(180,200,255,0.75)] cursor-pointer">立即发布</Label>
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
