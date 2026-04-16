'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Gamepad2, Users, User, Headphones, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/categories', label: '专区', icon: Gamepad2 },
  { href: '/sellers', label: '挑人', icon: Users },
  { href: '/support', label: '客服', icon: Headphones },
  { href: '/profile', label: '我的', icon: User },
  { href: '/register', label: '注册', icon: UserPlus },
]

export function MobileNav() {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/backstage') || pathname === '/login') {
    return null
  }

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
          </div>
        </div>
      </div>
    </nav>
  )
}
