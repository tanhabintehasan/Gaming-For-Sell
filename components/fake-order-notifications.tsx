'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { Gamepad2, Zap } from 'lucide-react'

const games = [
  { name: '三角洲行动', color: '#00f5ff' },
  { name: '王者荣耀', color: '#ffd700' },
  { name: '和平精英', color: '#ff6b00' },
  { name: '英雄联盟', color: '#28c840' },
  { name: '无畏契约', color: '#ff2244' },
  { name: '原神', color: '#8b5cf6' },
  { name: 'CS:GO', color: '#f59e0b' },
  { name: '永劫无间', color: '#ec4899' },
]

const userPrefixes = ['电竞少年', '萌萌小仙女', '冷酷大神', '职业选手', '路人王', '开黑达人', '野王', '法师姐姐']
const userSuffixes = ['', '丶', '·', '_', 'Pro', 'King', 'Queen', '666']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateUsername() {
  const prefix = userPrefixes[randomInt(0, userPrefixes.length - 1)]
  const suffix = userSuffixes[randomInt(0, userSuffixes.length - 1)]
  const number = Math.random() > 0.5 ? randomInt(1, 9999) : ''
  return `${prefix}${suffix}${number}`
}

function generateOrder() {
  const game = games[randomInt(0, games.length - 1)]
  const username = generateUsername()
  const hours = randomInt(1, 5)
  const rate = randomInt(30, 120)
  const amount = hours * rate
  return { game, username, hours, amount }
}

function showFakeOrderToast() {
  const { game, username, hours, amount } = generateOrder()
  toast.custom(
    (t) => (
      <div
        onClick={() => toast.dismiss(t)}
        className="w-[320px] rounded-xl border border-[rgba(0,245,255,0.2)] bg-[rgba(5,8,16,0.95)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md cursor-pointer hover:border-[rgba(0,245,255,0.35)] transition-colors"
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
            style={{
              backgroundColor: `${game.color}15`,
              borderColor: `${game.color}30`,
              color: game.color,
            }}
          >
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <Zap className="h-3.5 w-3.5 text-[#ffd700]" />
              新订单提醒
            </div>
            <div className="mt-1 text-sm text-[rgba(180,200,255,0.85)]">
              <span className="font-medium text-white truncate inline-block max-w-[120px] align-bottom">{username}</span>
              <span className="text-[rgba(180,200,255,0.6)]"> 刚刚下单了 </span>
              <span className="font-medium" style={{ color: game.color }}>{game.name}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-[rgba(180,200,255,0.55)]">
              <span>{hours}小时陪玩</span>
              <span>·</span>
              <span className="font-bold" style={{ color: game.color, fontFamily: 'var(--font-orbitron)' }}>¥{amount}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: 6000, position: 'bottom-right' }
  )
}

export function FakeOrderNotifications() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const scheduleNext = () => {
      const delay = randomInt(120000, 180000) // 2-3 minutes
      timeoutId = setTimeout(() => {
        showFakeOrderToast()
        scheduleNext()
      }, delay)
    }

    scheduleNext()
    return () => clearTimeout(timeoutId)
  }, [])

  return null
}
