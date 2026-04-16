'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'


interface Game {
  id: string
  nameCn: string
  slug: string
  nameEn: string
  bannerUrl: string
  description: string
  categories: {
    id: string
    name: string
    slug: string
    iconUrl: string | null
  }[]
}

interface Product {
  id: string
  name: string
  imageUrl: string
  basePrice: number
  originalPrice: number | null
  salesCount: number
}

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string | undefined
  const [game, setGame] = useState<Game | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/games')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const g = res.data.find((x: Game) => x.slug === slug)
          if (g) {
            fetch(`/api/games/${g.id}`)
              .then((r) => r.json())
              .then((detailRes) => {
                if (detailRes.success) setGame(detailRes.data)
              })
            fetch(`/api/products?gameId=${g.id}&limit=8`)
              .then((r) => r.json())
              .then((prodRes) => {
                if (prodRes.success) setProducts(prodRes.data.products)
              })
          }
        }
      })
  }, [slug])

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.45)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative pb-20 lg:pb-8">
      {/* Banner */}
      <div className="relative h-48 lg:h-72 border-b border-[rgba(0,245,255,0.1)]">
        {game.bannerUrl && (
          <Image src={game.bannerUrl} alt={game.nameCn} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810aa] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050810d9] via-[#05081080] to-transparent" />
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-black/40 text-white lg:hidden hover:text-[#00f5ff] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2 drop-shadow-[0_0_20px_rgba(0,245,255,0.25)]" style={{ fontFamily: 'var(--font-orbitron)' }}>{game.nameCn}</h1>
          <p className="text-[rgba(216,232,255,0.85)] text-sm lg:text-base max-w-2xl">{game.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>服务分类 <span className="text-[#00f5ff]">CATEGORIES</span></h2>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
            {game.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories?category=${cat.id}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.12)] flex items-center justify-center group-hover:border-[rgba(0,245,255,0.35)] group-hover:shadow-[0_0_16px_rgba(0,245,255,0.12)] transition-all">
                  {cat.iconUrl ? (
                    <Image src={cat.iconUrl} alt={cat.name} width={40} height={40} className="rounded-lg" />
                  ) : (
                    <span className="text-xl">🎮</span>
                  )}
                </div>
                <span className="text-xs text-center line-clamp-1 text-[rgba(216,232,255,0.85)] group-hover:text-[#00f5ff] transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Products */}
        {products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>热门服务 <span className="text-[#ff2f7d]">HOT</span></h2>
              <Link href={`/categories?game=${game.id}`} className="text-sm text-[rgba(180,200,255,0.5)] flex items-center hover:text-[#00f5ff] transition-colors">
                更多 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-[0_16px_40px_rgba(0,0,0,0.35),0_0_20px_rgba(0,245,255,0.1)] transition-all cursor-pointer glass-card border-0 group">
                    <div className="aspect-[4/5] bg-gray-900 relative overflow-hidden">
                      {product.imageUrl && (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050810f2] via-transparent to-transparent" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium line-clamp-2 mb-2 text-[rgba(232,238,255,0.95)]">{product.name}</h3>
                      <div className="flex items-end justify-between">
                        <span className="text-[#00f5ff] font-bold font-[family-name:var(--font-orbitron)]">¥{product.basePrice}</span>
                        <span className="text-xs text-[rgba(180,200,255,0.45)]">销量 {product.salesCount}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
