'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Mic } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Seller {
  id: string
  username: string
  avatar: string
  gender: string
  age: number
  location: string
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
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [gender, setGender] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (gender !== 'all') params.set('gender', gender.toUpperCase())
    fetch(`/api/sellers?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          let data = res.data.sellers
          if (search) {
            data = data.filter((s: Seller) =>
              s.username.toLowerCase().includes(search.toLowerCase())
            )
          }
          setSellers(data)
        }
      })
  }, [gender, search])

  return (
    <div className="relative min-h-screen lg:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="lg:hidden sticky top-0 z-30 py-4">
          <h1 className="text-lg font-bold text-center mb-4 text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
            打手列表 <span className="text-[#00f5ff]">SELLERS</span>
          </h1>
          <Tabs value={gender} onValueChange={setGender} className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.12)]">
              <TabsTrigger value="all" className="data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.7)] rounded-md">全部</TabsTrigger>
              <TabsTrigger value="male" className="data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.7)] rounded-md">男神</TabsTrigger>
              <TabsTrigger value="female" className="data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.7)] rounded-md">女神</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block mb-6">
          <h1 className="text-2xl font-bold mb-5 text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
            打手列表 <span className="text-[#00f5ff]">SELLERS</span>
          </h1>
          <div className="flex items-center gap-4">
            <Tabs value={gender} onValueChange={setGender}>
              <TabsList className="glass-card bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.12)]">
                <TabsTrigger value="all" className="data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.7)] rounded-md px-5">全部</TabsTrigger>
                <TabsTrigger value="male" className="data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.7)] rounded-md px-5">男神</TabsTrigger>
                <TabsTrigger value="female" className="data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.7)] rounded-md px-5">女神</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5 lg:mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,245,255,0.45)]" />
          <Input
            placeholder="请输入打手昵称"
            className="pl-11 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.4)] rounded-full focus:border-[rgba(0,245,255,0.5)] focus:shadow-[0_0_18px_rgba(0,245,255,0.12)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Seller List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sellers.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SellerCard({ seller }: { seller: Seller }) {
  const mainGame = seller.sellerProfile?.gameServices?.[0]

  return (
    <Link href={`/sellers/${seller.id}`} className="block">
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3),0_0_20px_rgba(0,245,255,0.08)] transition-all cursor-pointer">
        <div className="relative shrink-0">
          <Avatar className="w-16 h-16 lg:w-20 lg:h-20 border-2 border-[rgba(0,245,255,0.2)]">
            <AvatarImage src={seller.avatar} />
            <AvatarFallback className="bg-[rgba(0,245,255,0.12)] text-[#00f5ff] font-bold">{seller.username[0]}</AvatarFallback>
          </Avatar>
          {seller.sellerProfile?.isOnline && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#28c840] rounded-full border-2 border-[#050810] shadow-[0_0_8px_#28c840]" />
          )}
          {seller.sellerProfile?.voiceIntroUrl && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[rgba(0,245,255,0.12)] text-[#00f5ff] text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[rgba(0,245,255,0.2)] backdrop-blur-sm">
              <Mic className="w-2.5 h-2.5" />
              语音
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base lg:text-lg text-[rgba(232,238,255,0.95)]">{seller.username} {mainGame && <span className="text-[rgba(180,200,255,0.55)] text-sm font-normal">({mainGame.platformTypes.includes('MOBILE') ? '手游' : '端游'})</span>}</h3>
              <div className="flex items-center gap-2 text-sm text-[rgba(180,200,255,0.55)] mt-1">
                <span className="text-[#00f5ff] font-semibold">{seller.age}</span>
                <span className="text-[rgba(0,245,255,0.25)]">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {seller.location}
                </span>
              </div>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 text-white rounded-full px-5 font-bold shadow-[0_8px_24px_rgba(255,34,68,0.28)] hover:shadow-[0_10px_28px_rgba(255,34,68,0.38)] transition-all border-0" onClick={(e) => { e.preventDefault(); window.location.href = `/orders/create?seller=${seller.id}` }}>
              立即下单
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
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
    </Link>
  )
}
