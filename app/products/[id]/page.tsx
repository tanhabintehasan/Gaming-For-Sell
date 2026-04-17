'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Share2, Heart, ChevronLeft, Store, Play, Pause, Upload, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { fetchAuthMe } from '@/lib/auth-client'

interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  audioUrl?: string | null
  basePrice: number
  originalPrice: number | null
  salesCount: number
  viewCount: number
  game: { nameCn: string }
  category?: { name: string }
  specifications: string
}

interface AuthUser {
  id: string
  level: string
}

function getFavorites(): Product[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('favorites')
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function setFavorites(favs: Product[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('favorites', JSON.stringify(favs))
}

function isFollowed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('followed_shop') === 'true'
}

function setFollowed(val: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem('followed_shop', val ? 'true' : 'false')
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isFav, setIsFav] = useState(false)
  const [followed, setFollowedState] = useState(() => isFollowed())
  const [playing, setPlaying] = useState(false)
  const [uploading, setUploading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const productId = params?.id as string | undefined

  useEffect(() => {
    if (!productId) return
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setProduct(res.data)
          setIsFav(getFavorites().some((f) => f.id === res.data.id))
        }
      })
    fetchAuthMe()
      .then((res) => {
        if (res.success) setUser(res.data)
      })
  }, [productId])

  const togglePlay = () => {
    if (!audioRef.current || !product?.audioUrl) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const handleAudioEnded = () => setPlaying(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name || '商品分享', url })
      } catch {
        // ignore
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('链接已复制到剪贴板')
    }
  }

  const toggleFavorite = () => {
    if (!product) return
    const favs = getFavorites()
    let updated: Product[]
    if (isFav) {
      updated = favs.filter((f) => f.id !== product.id)
      toast.success('已取消收藏')
    } else {
      updated = [...favs, product]
      toast.success('已收藏')
    }
    setFavorites(updated)
    setIsFav(!isFav)
  }

  const toggleFollow = () => {
    const next = !followed
    setFollowed(next)
    setFollowedState(next)
    toast.success(next ? '已关注店铺' : '已取消关注')
  }

  const canUploadAudio = user && (user.level === 'ADMIN' || user.level === 'SELLER')

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !productId || !canUploadAudio) return
    if (!file.type.startsWith('audio/')) {
      toast.error('请上传音频文件')
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('audio', file)
    try {
      const res = await fetch(`/api/products/${productId}/audio`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        toast.success('音频上传成功')
        setProduct((prev) => (prev ? { ...prev, audioUrl: data.data.audioUrl } : prev))
      } else {
        toast.error(data.message || '上传失败')
      }
    } catch {
      toast.error('上传失败')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pb-28 lg:pb-8">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 glass-card border-0 border-b border-[rgba(0,245,255,0.1)] rounded-none flex items-center justify-between px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-white hover:text-[#00f5ff] transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-medium text-white">商品详情</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-4xl mx-auto lg:py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Image */}
          <div className="relative aspect-square lg:aspect-[4/5] lg:rounded-2xl lg:overflow-hidden bg-gray-900 border border-[rgba(0,245,255,0.1)] lg:border-[rgba(0,245,255,0.15)]">
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent opacity-60" />
            <div className="absolute top-4 left-4">
              <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm text-[10px]">{product.game.nameCn}</Badge>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 lg:p-0 space-y-5">
            <h1 className="text-xl lg:text-2xl font-bold text-white">{product.name}</h1>
            <p className="text-[rgba(180,200,255,0.6)] text-sm">{product.description || '专业打手为您服务'}</p>

            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#00f5ff] font-[family-name:var(--font-orbitron)]">¥{product.basePrice}</span>
                {product.originalPrice && (
                  <span className="text-[rgba(180,200,255,0.4)] line-through">¥{product.originalPrice}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="p-2 text-[rgba(180,200,255,0.5)] hover:text-[#00f5ff] transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 transition-colors ${isFav ? 'text-[#ff2f7d]' : 'text-[rgba(180,200,255,0.5)] hover:text-[#ff2f7d]'}`}
                >
                  <Heart className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-[rgba(180,200,255,0.5)]">
              <span>销量 {product.salesCount}</span>
              <span className="text-[rgba(0,245,255,0.25)]">|</span>
              <span>浏览 {product.viewCount}</span>
            </div>

            {/* Audio Player */}
            <Card className="p-4 glass-card border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] flex items-center justify-center text-[#00f5ff] overflow-hidden">
                    {playing && (
                      <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                        <span className="w-1 h-3 bg-[#00f5ff] animate-pulse" />
                        <span className="w-1 h-5 bg-[#00f5ff] animate-pulse delay-75" />
                        <span className="w-1 h-4 bg-[#00f5ff] animate-pulse delay-150" />
                      </div>
                    )}
                    <Mic className={`w-5 h-5 ${playing ? 'opacity-0' : 'opacity-100'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">商品语音介绍</div>
                    <div className="text-xs text-[rgba(180,200,255,0.45)]">
                      {product.audioUrl ? (playing ? '播放中...' : '点击播放') : '暂无音频'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {product.audioUrl ? (
                    <>
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] flex items-center justify-center hover:brightness-110 transition-all"
                      >
                        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <audio
                        ref={audioRef}
                        src={product.audioUrl}
                        onEnded={handleAudioEnded}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[rgba(120,120,120,0.12)] text-[#9ca3af] flex items-center justify-center">
                      <Play className="w-4 h-4" />
                    </div>
                  )}
                  {canUploadAudio && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="rounded-full border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)]"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {uploading ? '上传中' : '上传'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {product.audioUrl && (
                <div className="mt-3 h-1 bg-[rgba(0,245,255,0.08)] rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] ${playing ? 'animate-[audio-bar_2s_ease-in-out_infinite]' : 'w-0'}`} />
                </div>
              )}
            </Card>

            {/* Specs */}
            <Card className="p-4 glass-card border-0">
              <h3 className="font-semibold mb-3 text-white">商品规格</h3>
              <div className="text-sm text-[rgba(180,200,255,0.65)]">
                {product.specifications && product.specifications !== '{}' ? (
                  <div>{product.specifications}</div>
                ) : (
                  <div>标准套餐，包含基础服务时长</div>
                )}
              </div>
            </Card>

            {/* Shop */}
            <Card className="p-4 glass-card border-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] flex items-center justify-center">
                  <Store className="w-6 h-6 text-[#00f5ff]" />
                </div>
                <div>
                  <div className="font-semibold text-white">速凌电竞</div>
                  <div className="text-xs text-[rgba(180,200,255,0.5)]">2.7万粉丝</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFollow}
                className={`rounded-full transition-all ${
                  followed
                    ? 'text-[rgba(180,200,255,0.6)] border-[rgba(180,200,255,0.2)] bg-transparent'
                    : 'text-[#00f5ff] border-[rgba(0,245,255,0.3)] bg-[rgba(0,245,255,0.05)] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.5)]'
                }`}
              >
                {followed ? '已关注' : '+关注'}
              </Button>
            </Card>

            {/* Description */}
            <div className="pt-2">
              <h3 className="font-semibold mb-3 text-white">详情</h3>
              <div className="text-sm text-[rgba(180,200,255,0.65)] space-y-3 leading-relaxed">
                <p className="text-[#ff5f7a] font-medium">
                  陪玩不等同于护航，还望老板谨慎选购
                </p>
                <div className="space-y-2">
                  <p>1. 时长按照第一把游戏开始时间进行计算，前10分钟因陪玩服务人员问题可以联系客服提供录屏免费换人。</p>
                  <p>2. 计时规则：进队开局起算，超时15分钟按0.5小时计；因老板未说明导致陪玩等待超15分钟，同样开始计费。</p>
                  <p>3. 如出现陪玩服务人员态度恶劣请老板及时录屏取得证据联系售后客服进行处理。</p>
                  <p>4. 陪玩不包战损。售后处理时效为24小时以内，追缴时效为7天。</p>
                  <p>5. 本店未成年人禁止消费，如有需要请遵守国家相关法律法规并征得监护人同意。</p>
                  <p>6. 本店为服务性质类商品【如非质量问题一经出售不退不换】</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 lg:max-w-4xl lg:mx-auto lg:static lg:mt-8 lg:p-0 lg:bg-transparent">
        <div className="glass-card rounded-2xl p-3 flex items-center gap-3 lg:border-0 lg:bg-transparent lg:p-0">
          <Button variant="outline" className="flex-1 h-12 rounded-xl border-[rgba(0,245,255,0.2)] bg-[rgba(0,245,255,0.05)] text-[#e8eeff] hover:bg-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.35)]" onClick={() => router.push('/')}>
            <Store className="w-4 h-4 mr-2" />
            店铺
          </Button>
          <Button
            className="flex-[2] h-12 bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 text-white rounded-xl font-bold shadow-[0_12px_28px_rgba(255,47,125,0.3)] hover:shadow-[0_16px_36px_rgba(255,47,125,0.4)] transition-all border-0"
            onClick={() => router.push(`/orders/create?product=${product.id}`)}
          >
            立即购买
          </Button>
        </div>
      </div>
    </div>
  )
}
