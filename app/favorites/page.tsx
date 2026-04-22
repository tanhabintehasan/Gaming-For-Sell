'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SafeImage } from '@/components/safe-image'
import { ChevronLeft, Trash2 } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  imageUrl: string
  basePrice: number
  originalPrice: number | null
  game: { nameCn: string }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('favorites')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  })

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id)
    setFavorites(updated)
    localStorage.setItem('favorites', JSON.stringify(updated))
    toast.success('已取消收藏')
  }

  return (
    <div className="min-h-screen relative pb-24">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/profile">
            <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
          </Link>
          <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>我的收藏</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-4">
          {favorites.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="overflow-hidden group cursor-pointer glass-card hover:border-[rgba(0,245,255,0.4)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.35),0_0_20px_rgba(0,245,255,0.1)] transition-all duration-300 border-0">
                <div className="aspect-[4/5] bg-gray-900 relative overflow-hidden">
                  {product.imageUrl && (
                    <SafeImage
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050810f2] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black/60 text-white border-0 text-[10px] backdrop-blur-sm">{product.game.nameCn}</Badge>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      removeFavorite(product.id)
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-[rgba(255,34,68,0.2)] text-[#ff5f7a] hover:bg-[rgba(255,34,68,0.3)] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-semibold line-clamp-2 mb-3 min-h-[2.5rem] text-[rgba(232,238,255,0.95)]">{product.name}</h4>
                  <div className="flex items-end justify-between">
                    <div className="text-[#00f5ff] font-bold font-[family-name:var(--font-orbitron)]">¥{product.basePrice}</div>
                    {product.originalPrice && (
                      <div className="text-xs text-[rgba(180,200,255,0.4)] line-through">¥{product.originalPrice}</div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {favorites.length === 0 && (
          <div className="text-center py-20 text-[rgba(180,200,255,0.45)]">
            <p>暂无收藏商品</p>
            <Link href="/categories" className="inline-block mt-4 text-[#00f5ff] hover:underline">
              去逛逛
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
