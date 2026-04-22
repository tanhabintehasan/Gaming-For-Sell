'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SafeImage } from '@/components/safe-image'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Game {
  id: string
  nameCn: string
  slug: string
}

interface Category {
  id: string
  gameId: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  imageUrl: string
  basePrice: number
  originalPrice: number | null
  salesCount: number
  game: { nameCn: string }
}

function CategoriesContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams?.get('category')

  const [games, setGames] = useState<Game[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null)

  // Fetch games once on mount
  useEffect(() => {
    fetch('/api/games').then((r) => r.json()).then((res) => {
      if (res.success) {
        setGames(res.data)
        if (res.data[0] && !selectedGame) {
          setSelectedGame(res.data[0].id)
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch categories when selectedGame changes
  useEffect(() => {
    if (selectedGame) {
      fetch(`/api/games/${selectedGame}/categories`).then((r) => r.json()).then((res) => {
        if (res.success) {
          setCategories(res.data)
          if (!selectedCategory && res.data[0]) {
            setSelectedCategory(res.data[0].id)
          }
        }
      })
    }
  }, [selectedGame])

  // Fetch products when filters change
  useEffect(() => {
    const url = selectedCategory
      ? `/api/products?categoryId=${selectedCategory}&limit=50`
      : selectedGame
      ? `/api/products?gameId=${selectedGame}&limit=50`
      : '/api/products?limit=50'
    fetch(url).then((r) => r.json()).then((res) => {
      if (res.success) setProducts(res.data.products)
    })
  }, [selectedCategory, selectedGame])

  return (
    <div className="relative min-h-screen lg:py-8 pb-24">
      {/* ========== MOBILE TOP NAVIGATION ========== */}
      <div className="lg:hidden">
        {/* Game Tabs */}
        <div className="glass-card border-b-0 border-x-0 border-t-0 sticky top-0 z-40 rounded-none">
          <ScrollArea className="whitespace-nowrap">
            <div className="flex px-4 py-3 gap-5">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    setSelectedGame(game.id)
                    setSelectedCategory(null)
                  }}
                  className={cn(
                    'text-sm font-semibold transition-all pb-1 border-b-2 shrink-0',
                    selectedGame === game.id
                      ? 'text-[#00f5ff] border-[#00f5ff]'
                      : 'text-[rgba(180,200,255,0.55)] border-transparent hover:text-[rgba(180,200,255,0.85)]'
                  )}
                >
                  {game.nameCn}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Category Chips */}
        <div className="bg-[rgba(5,8,16,0.6)] border-b border-[rgba(0,245,255,0.08)]">
          <ScrollArea className="whitespace-nowrap">
            <div className="flex px-4 py-2.5 gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0',
                  selectedCategory === null
                    ? 'bg-[rgba(0,245,255,0.15)] text-[#00f5ff] border-[rgba(0,245,255,0.3)]'
                    : 'bg-[rgba(0,245,255,0.05)] text-[rgba(180,200,255,0.7)] border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.2)]'
                )}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0',
                    selectedCategory === cat.id
                      ? 'bg-[rgba(0,245,255,0.15)] text-[#00f5ff] border-[rgba(0,245,255,0.3)]'
                      : 'bg-[rgba(0,245,255,0.05)] text-[rgba(180,200,255,0.7)] border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.2)]'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* ========== DESKTOP SIDEBAR (unchanged) ========== */}
        <aside className="hidden lg:block w-60 shrink-0 glass-card rounded-2xl mr-6 min-h-[calc(100vh-8rem)] border-[rgba(0,245,255,0.12)]">
          <div className="p-5 border-b border-[rgba(0,245,255,0.1)]">
            <h2 className="font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>游戏专区</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-13rem)]">
            <div className="p-3">
              {games.map((game) => (
                <div key={game.id} className="mb-2">
                  <button
                    onClick={() => {
                      setSelectedGame(game.id)
                      setSelectedCategory(null)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold mb-1 transition-all',
                      selectedGame === game.id
                        ? 'bg-[rgba(0,245,255,0.12)] text-[#00f5ff] shadow-[0_0_12px_rgba(0,245,255,0.1)]'
                        : 'text-[rgba(216,232,255,0.75)] hover:bg-[rgba(0,245,255,0.05)] hover:text-white'
                    )}
                  >
                    {game.nameCn}
                  </button>
                  {selectedGame === game.id && categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'w-full text-left pl-8 pr-4 py-2 text-sm rounded-lg transition-all',
                        selectedCategory === cat.id
                          ? 'text-[#00f5ff] font-medium'
                          : 'text-[rgba(180,200,255,0.55)] hover:text-[rgba(180,200,255,0.85)] hover:bg-[rgba(0,245,255,0.03)]'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* ========== PRODUCT LIST ========== */}
        <main className="flex-1 p-3 lg:p-0">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name || '商品列表'
                : '全部商品'}
            </h2>
            <Link href="/categories" className="text-sm text-[rgba(180,200,255,0.5)] flex items-center hover:text-[#00f5ff] transition-colors">
              更多 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Desktop: 3 columns | Mobile: full width stacked cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="flex gap-3 lg:gap-4 p-3 lg:p-4 glass-card hover:border-[rgba(0,245,255,0.35)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.35),0_0_20px_rgba(0,245,255,0.08)] transition-all cursor-pointer border-0">
                  <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-xl bg-gray-900 shrink-0 overflow-hidden relative border border-[rgba(0,245,255,0.1)]">
                    {product.imageUrl && (
                      <SafeImage
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 lg:py-1">
                    <div>
                      <h3 className="font-semibold line-clamp-2 text-sm lg:text-base text-[rgba(232,238,255,0.95)]">{product.name}</h3>
                      <span className="inline-block mt-1.5 lg:mt-2 text-[10px] px-2 py-0.5 rounded-md bg-[rgba(0,245,255,0.08)] text-[#00f5ff] border border-[rgba(0,245,255,0.15)]">{product.game.nameCn}</span>
                    </div>
                    <div className="flex items-end justify-between mt-1">
                      <div>
                        <span className="text-[#00f5ff] font-bold text-base lg:text-lg font-[family-name:var(--font-orbitron)]">¥{product.basePrice}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-[rgba(180,200,255,0.35)] line-through ml-2">¥{product.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-[10px] lg:text-xs text-[rgba(180,200,255,0.45)]">销量 {product.salesCount}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050810]" />}>
      <CategoriesContent />
    </Suspense>
  )
}
