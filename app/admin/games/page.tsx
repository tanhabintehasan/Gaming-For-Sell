'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Edit2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Image from 'next/image'

interface Game {
  id: string
  nameCn: string
  nameEn: string
  slug: string
  logoUrl: string | null
  supportedPlatforms: string
  isActive: boolean
  sortOrder: number
  _count: {
    sellerServices: number
    orders: number
    categories: number
  }
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    fetch('/api/admin/games')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setGames(res.data)
      })
  }, [])

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

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
            </Link>
            <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>游戏管理</h1>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0 rounded-full px-4" onClick={() => toast.info('功能开发中')}>
            <Plus className="w-4 h-4 mr-1" />
            添加游戏
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {games.map((game) => (
            <Card key={game.id} className="p-4 glass-card border-0 hover:border-[rgba(0,245,255,0.15)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-900 relative overflow-hidden shrink-0 border border-[rgba(0,245,255,0.1)]">
                  {game.logoUrl && (
                    <Image src={game.logoUrl} alt={game.nameCn} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{game.nameCn}</h3>
                      <p className="text-sm text-[rgba(180,200,255,0.45)]">{game.nameEn}</p>
                      <p className="text-sm text-[rgba(180,200,255,0.45)] mt-1">
                        平台: {game.supportedPlatforms} | 排序: {game.sortOrder}
                      </p>
                    </div>
                    <Badge className={game.isActive 
                      ? 'bg-[rgba(40,200,64,0.12)] text-[#4ade80] border border-[rgba(40,200,64,0.25)]' 
                      : 'bg-[rgba(120,120,120,0.12)] text-[#9ca3af] border border-[rgba(120,120,120,0.25)]'
                    }>
                      {game.isActive ? '已上线' : '已禁用'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-[rgba(180,200,255,0.45)]">
                    <span>打手: {game._count.sellerServices}</span>
                    <span>订单: {game._count.orders}</span>
                    <span>分类: {game._count.categories}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => toast.info('功能开发中')} className="rounded-lg border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.3)]">
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      编辑
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.info('功能开发中')} className="rounded-lg border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.3)]">
                      <Layers className="w-3.5 h-3.5 mr-1" />
                      分类管理
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toggleGame(game.id, !game.isActive)}
                      className={game.isActive 
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
    </div>
  )
}
