'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SafeImage } from '@/components/safe-image'
import { Search, Headphones, ChevronRight, Flame, Star, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Game {
  id: string
  nameCn: string
  slug: string
  logoUrl: string
  _count: { sellerServices: number; orders: number }
}

interface Product {
  id: string
  name: string
  imageUrl: string
  basePrice: number
  originalPrice: number | null
  salesCount: number
  viewCount: number
  game: { nameCn: string }
}

interface Category {
  id: string
  name: string
  iconUrl: string
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const safeJson = (r: Response) => {
      if (!r.ok) return Promise.resolve({ success: false })
      return r.json().catch(() => ({ success: false }))
    }

    fetch('/api/games')
      .then(safeJson)
      .then((res) => {
        if (res.success) {
          setGames(res.data)
          if (res.data[0]) {
            fetch(`/api/games/${res.data[0].id}/categories`)
              .then(safeJson)
              .then((catRes) => {
                if (catRes.success) setCategories(catRes.data.slice(0, 14))
              })
              .catch(() => {})
          }
        }
      })
      .catch(() => {})

    fetch('/api/products?limit=8')
      .then(safeJson)
      .then((res) => {
        if (res.success) setProducts(res.data.products)
      })
      .catch(() => {})
  }, [])

  const dailyDeals = products.slice(0, 4)
  const hotProducts = products.slice(4, 8)

  return (
    <div className="relative min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden glass-card border-b-0 border-x-0 border-t-0 px-4 py-3 flex items-center justify-between sticky top-0 z-40 rounded-none">
        <h1 className="text-lg font-black tracking-wider text-[#00f5ff] drop-shadow-[0_0_12px_rgba(0,245,255,0.35)]" style={{ fontFamily: 'var(--font-orbitron)' }}>速凌电竞</h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[rgba(216,232,255,0.7)] hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.08)] rounded-full">
            <Headphones className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10 space-y-8 lg:space-y-10">
        {/* Search Bar */}
        <div className="relative lg:hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,245,255,0.5)]" />
          <Input placeholder="请输入商品名称" className="pl-11 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.2)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.45)] rounded-full focus:border-[#00f5ff] focus:shadow-[0_0_18px_rgba(0,245,255,0.15)]" />
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-[2rem] overflow-hidden aspect-[16/7] lg:aspect-[21/6] shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a2e] via-[#061220] to-[#040810]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040816eb] via-[#040816b8] to-[#04081647]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,234,255,0.05)] to-[rgba(255,0,128,0.06)]" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
            maskImage: 'linear-gradient(90deg, #000, transparent 90%)'
          }} />
          <div className="absolute top-1/2 left-6 lg:left-12 -translate-y-1/2 max-w-[650px]">
            <Badge className="w-fit mb-4 bg-[rgba(0,245,255,0.12)] text-[#88f8ff] border border-[rgba(0,245,255,0.28)] rounded-full px-4 py-1.5 text-xs font-bold tracking-wider shadow-[0_0_18px_rgba(0,234,255,0.12)] backdrop-blur-sm">
              热门推荐
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-3 tracking-wide drop-shadow-[0_0_24px_rgba(0,245,255,0.25)]" style={{ fontFamily: 'var(--font-orbitron)' }}>
              专业电竞陪玩平台
            </h2>
            <p className="text-[rgba(216,232,255,0.85)] text-sm lg:text-base max-w-md leading-relaxed">
              汇聚顶尖打手，提供优质游戏陪玩、代打、教学服务
            </p>
          </div>
        </div>

        {/* Order Notice */}
        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[rgba(180,200,255,0.7)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5ff] shadow-[0_0_8px_#00f5ff]" />
            下单前请仔细阅读下单须知，未成年人禁止消费
          </div>
          <Link href="/pages/order-notice" className="text-xs text-[#00f5ff] flex items-center hover:text-[#7df9ff]">
            查看详情 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Game Selection */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold tracking-wide text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>
              选择游戏 <span className="text-[#00f5ff]">GAMES</span>
            </h3>
            <Link href="/categories" className="text-sm text-[rgba(180,200,255,0.55)] flex items-center hover:text-[#00f5ff] transition-colors">
              更多 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {games.slice(0, 7).map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-2xl overflow-hidden bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.12)] shadow-[0_8px_30px_rgba(0,0,0,0.18)] group-hover:border-[rgba(0,245,255,0.4)] group-hover:shadow-[0_0_24px_rgba(0,245,255,0.18)] transition-all duration-300">
                  {game.logoUrl && (
                    <SafeImage src={game.logoUrl} alt={game.nameCn} width={72} height={72} className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="text-xs text-center line-clamp-1 text-[rgba(216,232,255,0.85)] group-hover:text-[#00f5ff] transition-colors">{game.nameCn}</span>
              </Link>
            ))}
            <Link href="/categories" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-2xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] flex items-center justify-center text-[rgba(180,200,255,0.5)] text-xs group-hover:border-[rgba(0,245,255,0.35)] group-hover:text-[#00f5ff] transition-all">
                更多
              </div>
              <span className="text-xs text-center text-[rgba(216,232,255,0.85)] group-hover:text-[#00f5ff] transition-colors">更多游戏</span>
            </Link>
          </div>
        </section>

        {/* Leaderboards */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, label: '消费榜', color: 'from-[#ff2244] to-[#ff6b00]', shadow: 'shadow-[0_8px_24px_rgba(255,34,68,0.25)]' },
            { icon: Star, label: '选手榜', color: 'from-[#00f5ff] to-[#00c2cc]', shadow: 'shadow-[0_8px_24px_rgba(0,245,255,0.22)]' },
            { icon: Flame, label: '充值榜', color: 'from-[#ffd700] to-[#ffaa00]', shadow: 'shadow-[0_8px_24px_rgba(255,215,0,0.22)]' },
          ].map((item) => (
            <Card key={item.label} className="glass-card p-5 flex flex-col items-center gap-3 cursor-pointer hover:border-[rgba(0,245,255,0.35)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.35),0_0_20px_rgba(0,245,255,0.1)] transition-all group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} ${item.shadow} flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-[rgba(232,238,255,0.95)]">{item.label}</span>
            </Card>
          ))}
        </section>

        {/* Categories Grid */}
        {categories.length > 0 && (
          <section>
            <h3 className="text-lg font-bold tracking-wide text-white mb-5" style={{ fontFamily: 'var(--font-orbitron)' }}>
              热门专区 <span className="text-[#00f5ff]">ZONES</span>
            </h3>
            <div className="grid grid-cols-5 lg:grid-cols-7 gap-3 lg:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories?category=${cat.id}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.12)] group-hover:border-[rgba(0,245,255,0.4)] group-hover:shadow-[0_0_16px_rgba(0,245,255,0.15)] transition-all">
                    {cat.iconUrl && (
                      <SafeImage src={cat.iconUrl} alt={cat.name} width={56} height={56} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-xs text-center line-clamp-1 text-[rgba(216,232,255,0.8)] group-hover:text-[#00f5ff] transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Daily Deals */}
        {dailyDeals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold tracking-wide text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>
                每日体验 <span className="text-[#00f5ff]">DAILY</span>
              </h3>
              <Link href="/categories" className="text-sm text-[rgba(180,200,255,0.55)] flex items-center hover:text-[#00f5ff] transition-colors">
                更多 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {dailyDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Hot Products */}
        {hotProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold tracking-wide text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>
                热门推荐 <span className="text-[#ff2f7d]">HOT</span>
              </h3>
              <Link href="/categories" className="text-sm text-[rgba(180,200,255,0.55)] flex items-center hover:text-[#00f5ff] transition-colors">
                更多 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {hotProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
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
        </div>
        <div className="p-4">
          <h4 className="text-sm font-semibold line-clamp-2 mb-3 min-h-[2.5rem] text-[rgba(232,238,255,0.95)]">{product.name}</h4>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[#00f5ff] font-bold font-[family-name:var(--font-orbitron)]">¥{product.basePrice}</div>
              {product.originalPrice && (
                <div className="text-xs text-[rgba(180,200,255,0.4)] line-through">¥{product.originalPrice}</div>
              )}
            </div>
            <div className="text-xs text-[rgba(180,200,255,0.5)]">销量 {product.salesCount}</div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
