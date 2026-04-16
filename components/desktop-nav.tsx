'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Shield, LogOut, Headphones, Mail, Gamepad2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AuthUser {
  id: string
  username: string
  level: string
  avatar: string
}

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/categories', label: '专区' },
  { href: '/sellers', label: '挑人' },
]

export function DesktopNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setUser(res.data)
      })
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/backstage') || pathname === '/login') {
    return (
      <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-[rgba(0,245,255,0.12)] bg-[rgba(5,8,16,0.85)] backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="text-xl font-black tracking-wider text-[#00f5ff] drop-shadow-[0_0_12px_rgba(0,245,255,0.35)]" style={{ fontFamily: 'var(--font-orbitron)' }}>
          速凌电竞
        </Link>
      </header>
    )
  }

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-[rgba(0,245,255,0.12)] bg-[rgba(5,8,16,0.75)] backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Link href="/" className="text-xl font-black tracking-wider text-[#00f5ff] drop-shadow-[0_0_12px_rgba(0,245,255,0.35)] transition-all hover:drop-shadow-[0_0_20px_rgba(0,245,255,0.55)]" style={{ fontFamily: 'var(--font-orbitron)' }}>
          速凌电竞
        </Link>
        <nav className="flex items-center gap-2">
          {navLinks.map((link) => (
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
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-[rgba(0,245,255,0.2)]">
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
              {(user.level === 'SELLER' || user.level === 'ADMIN') && (
                <DropdownMenuItem>
                  <Link href="/seller/dashboard" className="gap-2 flex items-center w-full text-[rgba(232,238,255,0.9)] hover:text-[#00f5ff]">
                    <Gamepad2 className="w-4 h-4" />
                    打手后台
                  </Link>
                </DropdownMenuItem>
              )}
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
