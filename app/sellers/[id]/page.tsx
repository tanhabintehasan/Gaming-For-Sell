'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { ChevronLeft, MapPin, Star, Mic, Play, Pause, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SellerDetail {
  id: string
  username: string
  avatar: string
  gender: string
  age: number
  location: string
  bio?: string
  sellerProfile: {
    isOnline: boolean
    overallRating: number
    voiceIntroUrl?: string | null
    gameServices: {
      game: { nameCn: string }
      platformTypes: string
      hourlyRate: number
    }[]
  }
  reviewsReceived: {
    id: string
    rating: number
    content: string
    createdAt: string
    game: { nameCn: string }
    customer: { username: string; avatar: string }
  }[]
}

export default function SellerDetailPage() {
  const params = useParams()
  const id = params?.id as string | undefined
  const router = useRouter()
  const [seller, setSeller] = useState<SellerDetail | null>(null)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/sellers/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSeller(res.data)
      })
  }, [id])

  const togglePlay = () => {
    if (!audioRef.current || !seller?.sellerProfile?.voiceIntroUrl) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const onAudioEnded = () => setPlaying(false)

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  const mainGame = seller.sellerProfile?.gameServices?.[0]

  return (
    <div className="relative min-h-screen lg:py-8 pb-28">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 py-4 lg:py-0 lg:mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 lg:hidden text-white hover:text-[#00f5ff] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold lg:text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
            打手详情 <span className="text-[#00f5ff]">DETAIL</span>
          </h1>
        </div>

        <Card className="p-5 mb-4 glass-card border-0">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Avatar className="w-20 h-20 border-2 border-[rgba(0,245,255,0.2)]">
                <AvatarImage src={seller.avatar} />
                <AvatarFallback className="bg-[rgba(0,245,255,0.12)] text-[#00f5ff] font-bold text-xl">{seller.username[0]}</AvatarFallback>
              </Avatar>
              {seller.sellerProfile?.isOnline && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#28c840] rounded-full border-2 border-[#050810] shadow-[0_0_8px_#28c840]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white">{seller.username}</h2>
              <div className="flex items-center gap-2 text-sm text-[rgba(180,200,255,0.55)] mt-1">
                <span className="text-[#00f5ff] font-semibold">{seller.age}岁</span>
                <span className="text-[rgba(0,245,255,0.25)]">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {seller.location}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {mainGame && (
                  <Badge variant="outline" className="text-xs font-normal text-[#00f5ff] border-[rgba(0,245,255,0.25)] bg-[rgba(0,245,255,0.08)] rounded-md">
                    {mainGame.game.nameCn}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs font-normal text-[#ffd700] border-[rgba(255,215,0,0.25)] bg-[rgba(255,215,0,0.08)] rounded-md">
                  实名认证
                </Badge>
                <div className="flex items-center gap-0.5 text-[#ffd700] text-xs">
                  {'★'.repeat(Math.floor(seller.sellerProfile?.overallRating || 5))}
                  <span className="text-[rgba(180,200,255,0.45)] ml-1 font-[family-name:var(--font-orbitron)]">{seller.sellerProfile?.overallRating}</span>
                </div>
              </div>
            </div>
          </div>

          {seller.sellerProfile?.voiceIntroUrl && (
            <div className="mt-4 rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] p-3">
              <div className="flex items-center gap-3">
                <Button size="icon" variant="outline" className="rounded-full border-[rgba(0,245,255,0.3)] text-[#00f5ff]" onClick={togglePlay}>
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="text-sm text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#00f5ff]" />
                  语音介绍
                </div>
              </div>
              <audio ref={audioRef} src={seller.sellerProfile.voiceIntroUrl} onEnded={onAudioEnded} className="w-full mt-2" controls />
            </div>
          )}

          {seller.bio && (
            <p className="mt-4 text-sm text-[rgba(180,200,255,0.7)]">{seller.bio}</p>
          )}
        </Card>

        <Card className="p-5 mb-4 glass-card border-0">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-[#00f5ff]" />
            服务项目
          </h3>
          <div className="space-y-3">
            {seller.sellerProfile?.gameServices?.map((svc, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] p-3">
                <div>
                  <div className="text-sm text-white">{svc.game.nameCn}</div>
                  <div className="text-xs text-[rgba(180,200,255,0.5)]">{svc.platformTypes.includes('MOBILE') ? '手游' : '端游'}</div>
                </div>
                <div className="text-[#00f5ff] font-bold font-[family-name:var(--font-orbitron)]">¥{svc.hourlyRate}/时</div>
              </div>
            ))}
            {(!seller.sellerProfile?.gameServices || seller.sellerProfile.gameServices.length === 0) && (
              <div className="text-sm text-[rgba(180,200,255,0.5)]">暂无服务项目</div>
            )}
          </div>
        </Card>

        <Card className="p-5 mb-4 glass-card border-0">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-[#ffd700]" />
            用户评价
          </h3>
          <div className="space-y-4">
            {seller.reviewsReceived?.map((review) => (
              <div key={review.id} className="border-b border-[rgba(0,245,255,0.08)] pb-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="w-6 h-6 border border-[rgba(0,245,255,0.15)]">
                    <AvatarImage src={review.customer.avatar} />
                    <AvatarFallback className="bg-[rgba(0,245,255,0.1)] text-[#00f5ff] text-[10px]">{review.customer.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white">{review.customer.username}</span>
                  <div className="flex items-center gap-0.5 text-[#ffd700] text-xs ml-auto">
                    {'★'.repeat(review.rating)}
                  </div>
                </div>
                <p className="text-sm text-[rgba(180,200,255,0.7)]">{review.content}</p>
                <div className="text-xs text-[rgba(180,200,255,0.4)] mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
            {(!seller.reviewsReceived || seller.reviewsReceived.length === 0) && (
              <div className="text-sm text-[rgba(180,200,255,0.5)]">暂无评价</div>
            )}
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 lg:max-w-3xl lg:mx-auto lg:static lg:mt-2 lg:p-0 lg:bg-transparent">
        <div className="glass-card rounded-2xl p-3 flex items-center gap-3 lg:border-0 lg:bg-transparent lg:p-0">
          <Button
            className="flex-1 h-12 bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 text-white rounded-xl font-bold shadow-[0_12px_28px_rgba(255,47,125,0.3)] hover:shadow-[0_16px_36px_rgba(255,47,125,0.4)] transition-all border-0"
            onClick={() => router.push(`/orders/create?seller=${seller.id}`)}
          >
            立即下单
          </Button>
        </div>
      </div>
    </div>
  )
}
