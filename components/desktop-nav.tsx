'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { User, Shield, LogOut, Headphones, Mail, Gamepad2, UserPlus, Package, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { fetchAuthMe } from '@/lib/auth-client'

interface AuthUser {
  id: string
  username: string
  level: string
  avatar: string
}

interface SiteConfig {
  site_name: string
  site_logo: string
}

const publicNavLinks = [
  { href: '/', label: '首页' },
  { href: '/categories', label: '专区' },
  { href: '/sellers', label: '挑人' },
  { href: '/apply', label: '入驻' },
]

const sellerNavLinks = [
  { href: '/seller/dashboard', label: '打手后台', icon: Gamepad2 },
  { href: '/seller/orders', label: '订单管理', icon: Package },
  { href: '/seller/products', label: '我的商品', icon: Package },
  { href: '/seller/services', label: '我的服务', icon: Gamepad2 },
  { href: '/seller/earnings', label: '我的收益', icon: TrendingUp },
]

export function DesktopNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [config, setConfig] = useState<SiteConfig>({ site_name: '速凌电竞', site_logo: '' })

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (res.success) setUser(res.data)
      })

    fetch('/api/configs')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setConfig({
            site_name: res.data.site_name || '速凌电竞',
            site_logo: res.data.site_logo || '',
          })
        }
      })
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  const isSeller = user && (user.level === 'SELLER' || user.level === 'ADMIN')

  const Logo = () => (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      {config.site_logo ? (
        <Image
          src={config.site_logo}
          alt={config.site_name}
          width={36}
          height={36}
          className="rounded-lg object-contain"
        />
      ) : null}
      <span
        className="text-xl font-black tracking-wider text-[#00f5ff] drop-shadow-[0_0_12px_rgba(0,245,255,0.35)] transition-all hover:drop-shadow-[0_0_20px_rgba(0,245,255,0.55)]"
        style={{ fontFamily: 'var(--font-orbitron)' }}
      >
        {config.site_name}
      </span>
    </Link>
  )

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/backstage') || pathname === '/login' || pathname === '/seller/login') {
    return (
      <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-[rgba(0,245,255,0.12)] bg-[rgba(5,8,16,0.85)] backdrop-blur-xl sticky top-0 z-50">
        <Logo />
      </header>
    )
  }

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-[rgba(0,245,255,0.12)] bg-[rgba(5,8,16,0.75)] backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Logo />
        <nav className="flex items-center gap-2">
          {publicNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300',
                pathname === link.href || pathname?.startsWith(`${link.href}/`)
                  ? 'text-[#00f5ff] bg-[rgba(0,245,255,0.1)] shadow-[0_0_18px_rgba(0,245,255,0.12)]'
                  : 'text-[rgba(216,232,255,0.85)] hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.06)]'
              )}
            >
              {link.label}
            </Link>
          ))}
          {isSeller && sellerNavLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300',
                pathname === link.href || pathname?.startsWith(`${link.href}/`)
                  ? 'text-[#00f5ff] bg-[rgba(0,245,255,0.1)] shadow-[0_0_18px_rgba(0,245,255,0.12)]'
                  : 'text-[rgba(216,232,255,0.85)] hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.06)]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/support">
          <Button variant="ghost" size="sm" className="gap-2 text-[rgba(216,232,255,0.7)] hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.08)] rounded-full">
            <Headphones className="w-4 h-4" />
            客服
          </Button>
        </Link>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] hover:border-[rgba(0,245,255,0.35)] hover:bg-[rgba(0,245,255,0.1)] transition-all cursor-pointer">
                <Avatar className="w-7 h-7 border border-[rgba(0,245,255,0.3)]">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-[rgba(0,245,255,0.15)] text-[#00f5ff] text-xs">{user.username[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[rgba(232,238,255,0.95)]">{user.username}</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                  isSeller
                    ? 'bg-[rgba(0,245,255,0.15)] text-[#00f5ff] border border-[rgba(0,245,255,0.25)]'
                    : 'bg-[rgba(255,255,255,0.08)] text-[rgba(180,200,255,0.7)] border border-[rgba(255,255,255,0.12)]'
                )}>
                  {isSeller ? '打手' : '用户'}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-[rgba(0,245,255,0.2)]">
              {isSeller ? (
                <>
                  <DropdownMenuItem>
                    <Link href="/seller/dashboard" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <Gamepad2 className="w-4 h-4" />
                      打手后台
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/seller/orders" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <Package className="w-4 h-4" />
                      订单管理
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/seller/products" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <Package className="w-4 h-4" />
                      我的商品
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/seller/services" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <Gamepad2 className="w-4 h-4" />
                      我的服务
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/seller/earnings" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <TrendingUp className="w-4 h-4" />
                      我的收益
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/seller/profile" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <User className="w-4 h-4" />
                      资料管理
                    </Link>
                  </DropdownMenuItem>
                  {user.level === 'ADMIN' && (
                    <DropdownMenuItem>
                      <Link href="/admin" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                        <Shield className="w-4 h-4" />
                        管理后台
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 flex items-center text-[#ff5f7a] hover:text-[#ff2244]">
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Link href="/profile" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <User className="w-4 h-4" />
                      个人中心
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/inbox" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <Mail className="w-4 h-4" />
                      消息中心
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/orders" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <Package className="w-4 h-4" />
                      我的订单
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/apply" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                      <UserPlus className="w-4 h-4" />
                      申请入驻
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 flex items-center text-[#ff5f7a] hover:text-[#ff2244]">
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/register">
              <Button variant="ghost" size="sm" className="rounded-full px-4 font-medium text-[rgba(216,232,255,0.85)] hover:text-[#00f5ff] hover:bg-[rgba(0,245,255,0.08)]">
                <UserPlus className="w-4 h-4 mr-1.5" />
                注册
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="rounded-full px-5 font-bold text-[#050810] bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,245,255,0.35)] transition-all border-0">
                登录
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
