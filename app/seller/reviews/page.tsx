'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { fetchAuthMe } from '@/lib/auth-client'

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: string
  customer: { username: string }
  game: { nameCn: string }
}

export default function SellerReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (!res.success || (res.data.level !== 'SELLER' && res.data.level !== 'ADMIN')) {
          router.push('/seller/login')
        }
      })

    fetch('/api/seller/reviews')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setReviews(res.data)
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen lg:py-8 pb-24">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 py-4 lg:py-0 lg:mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 lg:hidden text-white hover:text-[#00f5ff] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold lg:text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
            我的评价 <span className="text-[#00f5ff]">REVIEWS</span>
          </h1>
        </div>

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-4 glass-card border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white">{review.customer.username}</div>
                <div className="flex items-center gap-0.5 text-[#ffd700] text-sm">
                  {'★'.repeat(review.rating)}
                  <span className="text-[rgba(180,200,255,0.45)] text-xs ml-1">{review.rating}.0</span>
                </div>
              </div>
              <p className="text-sm text-[rgba(180,200,255,0.7)]">{review.content || '暂无评价内容'}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-[rgba(180,200,255,0.45)]">{review.game.nameCn}</span>
                <span className="text-xs text-[rgba(180,200,255,0.35)]">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
          {reviews.length === 0 && (
            <div className="text-center py-12 text-[rgba(180,200,255,0.45)]">
              <Star className="w-10 h-10 mx-auto mb-3 text-[rgba(180,200,255,0.15)]" />
              <p>暂无评价</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
