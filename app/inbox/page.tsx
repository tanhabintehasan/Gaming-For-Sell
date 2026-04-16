'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Conversation {
  otherId: string
  other: {
    id: string
    username: string
    avatar: string
  }
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
}

export default function InboxPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) {
          router.push('/login')
        }
      })

    fetch('/api/messages')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setConversations(res.data)
        }
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen lg:py-8 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 py-4 lg:py-0 lg:mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 lg:hidden text-white hover:text-[#00f5ff] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold lg:text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
            消息中心 <span className="text-[#00f5ff]">INBOX</span>
          </h1>
        </div>

        {conversations.length === 0 ? (
          <Card className="p-10 text-center glass-card border-0">
            <div className="w-16 h-16 rounded-full bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.12)] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-[#00f5ff]" />
            </div>
            <p className="text-[rgba(180,200,255,0.6)]">暂无消息</p>
            <p className="text-xs text-[rgba(180,200,255,0.4)] mt-1">与卖家或客服的聊天记录将显示在这里</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link key={conv.otherId} href={`/chat/${conv.otherId}`}>
                <Card className="p-4 flex items-center gap-4 hover:bg-[rgba(0,245,255,0.03)] transition-colors border-0 glass-card">
                  <Avatar className="w-12 h-12 border border-[rgba(0,245,255,0.15)]">
                    <AvatarImage src={conv.other.avatar} />
                    <AvatarFallback className="bg-[rgba(0,245,255,0.1)] text-[#00f5ff]">{conv.other.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white truncate">{conv.other.username}</span>
                      <span className="text-xs text-[rgba(180,200,255,0.45)]">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-[rgba(180,200,255,0.6)] truncate">
                        {conv.lastMessage.senderId === conv.otherId ? '' : '我: '}
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
