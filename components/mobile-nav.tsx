'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Home, Gamepad2, Users, User, Headphones, UserPlus, Package, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchAuthMe } from '@/lib/auth-client'

interface AuthUser {
  id: string
  username: string
  level: string
}

interface SiteConfig {
  site_name: string
  site_logo: string
}

const customerNavItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/categories', label: '专区', icon: Gamepad2 },
  { href: '/sellers', label: '挑人', icon: Users },
  { href: '/support', label: '客服', icon: Headphones },
  { href: '/profile', label: '我的', icon: User },
]

const sellerNavItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/seller/dashboard', label: '后台', icon: Gamepad2 },
  { href: '/seller/orders', label: '订单', icon: Package },
  { href: '/seller/earnings', label: '收益', icon: TrendingUp },
  { href: '/seller/profile', label: '我的', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [config, setConfig] = useState<SiteConfig>({ site_name: '速凌电竞', site_logo: '' })

  useEffect(() => {
    fetchAuthMe().then((res) => {
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

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/backstage') || pathname === '/login' || pathname === '/seller/login') {
    return null
  }

  const isSeller = user && (user.level === 'SELLER' || user.level === 'ADMIN')
  const navItems = isSeller ? sellerNavItems : customerNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="mx-3 mb-3">
        <div className="glass-card rounded-2xl px-2 pb-safe">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 w-full h-full rounded-xl transition-all duration-300',
                    isActive
                      ? 'text-[#00f5ff]'
                      : 'text-[rgba(180,200,255,0.5)] hover:text-[rgba(180,200,255,0.8)]'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 transition-all', isActive && 'drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]')} />
                  <span className="text-[11px] font-medium tracking-wide">{item.label}</span>
                </Link>
              )
            })}
            {!user && !isSeller && (
              <Link
                href="/register"
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-full h-full rounded-xl transition-all duration-300',
                  pathname === '/register'
                    ? 'text-[#00f5ff]'
                    : 'text-[rgba(180,200,255,0.5)] hover:text-[rgba(180,200,255,0.8)]'
                )}
              >
                <UserPlus className={cn('w-5 h-5 transition-all', pathname === '/register' && 'drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]')} />
                <span className="text-[11px] font-medium tracking-wide">注册</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
