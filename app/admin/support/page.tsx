'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Clock, CheckCircle2, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  user?: { username: string; avatar: string; level: string }
  guestId?: string | null
  guestName?: string | null
  admin?: { username: string; avatar: string }
  replies: { content: string; createdAt: string }[]
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const url = filter === 'unassigned' ? '/api/support/tickets?unassigned=true' : '/api/support/tickets'
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const data = filter === 'open'
            ? res.data.filter((t: Ticket) => t.status === 'OPEN')
            : filter === 'closed'
            ? res.data.filter((t: Ticket) => t.status === 'CLOSED')
            : res.data
          setTickets(data)
        }
      })
  }, [filter])

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/admin">
            <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
          </Link>
          <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>客服工单</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded-xl">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">全部</TabsTrigger>
            <TabsTrigger value="open" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">待处理</TabsTrigger>
            <TabsTrigger value="unassigned" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">未分配</TabsTrigger>
            <TabsTrigger value="closed" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">已关闭</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tickets.map((ticket) => {
            const isGuest = !ticket.user
            const username = ticket.user?.username || ticket.guestName || '访客'
            const avatar = ticket.user?.avatar || ''
            return (
              <Link key={ticket.id} href={`/support/${ticket.id}`}>
                <Card className="p-4 glass-card border-0 hover:border-[rgba(0,245,255,0.2)] transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-[rgba(0,245,255,0.15)]">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="bg-[rgba(0,245,255,0.1)] text-[#00f5ff]">{username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium line-clamp-1 text-white">{ticket.subject}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[rgba(180,200,255,0.45)]">{username}</span>
                          <Badge variant="outline" className={`text-[10px] h-4 px-1 rounded ${isGuest ? 'border-[rgba(255,170,0,0.2)] bg-[rgba(255,170,0,0.08)] text-[#ffaa00]' : 'border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff]'}`}>
                            {isGuest ? '匿名用户' : ticket.user?.level === 'SELLER' ? '打手' : '用户'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {ticket.status === 'OPEN' ? (
                        <>
                          <Clock className="w-4 h-4 text-[#ffaa00]" />
                          <span className="text-[#ffaa00]">处理中</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                          <span className="text-[#4ade80]">已解决</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm text-[rgba(180,200,255,0.45)]">
                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                    <span>{ticket.replies.length} 条回复</span>
                  </div>

                  {ticket.admin && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-[rgba(180,200,255,0.45)]">
                      <User className="w-3 h-3" />
                      处理人: {ticket.admin.username}
                    </div>
                  )}
                </Card>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
