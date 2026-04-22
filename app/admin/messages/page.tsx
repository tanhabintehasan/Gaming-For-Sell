'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { io } from 'socket.io-client'
import { ChevronLeft, MessageSquare, Ticket, Clock, CheckCircle2, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { fetchAuthMe } from '@/lib/auth-client'
import { toast } from 'sonner'
import { playMessageSound } from '@/lib/sound'

interface Conversation {
  type: 'message' | 'ticket'
  otherId: string
  other: {
    id: string
    username: string
    avatar: string
    level: string
  }
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
  ticketId: string | null
  subject: string | null
  status: string | null
  isGuest: boolean
  guestName: string | null
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = () => {
    fetch('/api/admin/messages')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setConversations(res.data)
        }
      })
      .catch(() => {
        toast.error('加载失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (!res.success || res.data.level !== 'ADMIN') {
          router.push('/backstage/admin/login')
        }
      })
      .catch(() => {})

    fetchConversations()

    // Real-time socket listener
    const socket = io(undefined, { path: '/api/socket', addTrailingSlash: false })
    socket.on('new-message', () => {
      playMessageSound()
      fetchConversations()
    })
    socket.on('new-reply', () => {
      playMessageSound()
      fetchConversations()
    })
    socket.on('ticket-updated', () => {
      playMessageSound()
      fetchConversations()
    })

    return () => {
      socket.disconnect()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white hover:text-[#00f5ff]">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-lg text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>消息中心</h1>
          </div>
          <button
            onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/backstage/admin/login')}
            className="text-sm text-[rgba(180,200,255,0.55)] hover:text-[#ff2244] transition-colors flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {conversations.length === 0 ? (
          <Card className="p-10 text-center glass-card border-0">
            <div className="w-16 h-16 rounded-full bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.12)] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-[#00f5ff]" />
            </div>
            <p className="text-[rgba(180,200,255,0.6)]">暂无消息</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const href = conv.type === 'ticket' ? `/support/${conv.ticketId}` : `/chat/${conv.otherId}`
              const isMe = conv.lastMessage.senderId !== 'guest' && conv.lastMessage.senderId !== conv.otherId
              return (
                <Link key={`${conv.type}-${conv.otherId}`} href={href}>
                  <Card className="p-4 flex items-center gap-4 hover:bg-[rgba(0,245,255,0.03)] transition-colors border-0 glass-card">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border border-[rgba(0,245,255,0.15)]">
                        <AvatarImage src={conv.other.avatar} />
                        <AvatarFallback className={conv.type === 'ticket' ? 'bg-[rgba(255,170,0,0.15)] text-[#ffaa00]' : 'bg-[rgba(0,245,255,0.1)] text-[#00f5ff]'}>
                          {conv.type === 'ticket' ? <Ticket className="w-5 h-5" /> : conv.other.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      {conv.type === 'ticket' && conv.status === 'OPEN' && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#ffaa00] rounded-full border-2 border-[#050810]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate">
                            {conv.type === 'ticket' ? (conv.subject || '客服工单') : conv.other.username}
                          </span>
                          {conv.type === 'ticket' && (
                            <>
                              {conv.isGuest ? (
                                <Badge className="text-[10px] border-0 bg-[rgba(255,170,0,0.15)] text-[#ffaa00]">
                                  匿名用户
                                </Badge>
                              ) : (
                                <Badge className="text-[10px] border-0 bg-[rgba(0,245,255,0.1)] text-[#00f5ff]">
                                  用户
                                </Badge>
                              )}
                              {conv.status === 'OPEN' ? (
                                <Badge className="text-[10px] border-0 bg-[rgba(255,170,0,0.1)] text-[#ffaa00] flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" />
                                  处理中
                                </Badge>
                              ) : (
                                <Badge className="text-[10px] border-0 bg-[rgba(74,222,128,0.1)] text-[#4ade80] flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  已关闭
                                </Badge>
                              )}
                            </>
                          )}
                          {conv.type === 'message' && (
                            <Badge className="text-[10px] border-0 bg-[rgba(0,245,255,0.1)] text-[#00f5ff]">
                              {conv.other.level === 'SELLER' ? '打手' : '用户'}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-[rgba(180,200,255,0.45)]">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-[rgba(180,200,255,0.6)] truncate">
                          {isMe ? '我: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="ml-2 bg-[#ff2244] text-white text-[10px] border-0 px-1.5 min-w-[1.25rem]">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
