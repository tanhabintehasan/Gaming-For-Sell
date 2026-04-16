'use client'

import { MobileNav } from './mobile-nav'
import { DesktopNav } from './desktop-nav'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#050810] text-[#e8eeff] overflow-x-hidden">
      <DesktopNav />
      <main className="relative z-10 pb-20 lg:pb-0">{children}</main>
      <MobileNav />
    </div>
  )
}
