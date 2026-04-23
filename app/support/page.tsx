'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, MessageCircle, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  user?: { username: string; avatar: string; level: string }
  guestId?: string | null
  guestName?: string | null
  admin?: { username: string; avatar: string }
  replies: { content: string; createdAt: string; isAdmin: boolean }[]
}

function getGuestId(): string {
  if (typeof window === 'undefined') return ''
  let gid = localStorage.getItem('support_guest_id')
  if (!gid) {
    gid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem('support_guest_id', gid)
  }
  return gid
}

function getGuestName(): string {
  if (typeof window === 'undefined') return ''
  let name = localStorage.getItem('support_guest_name')
  if (!name) {
    name = '访客'
    localStorage.setItem('support_guest_name', name)
  }
  return name
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [guestName, setGuestName] = useState(() => getGuestName())

  const fetchTickets = useCallback(() => {
    fetch('/api/support/tickets')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          let data = res.data as Ticket[]
          // For anonymous users, filter to only show tickets created with this guestId
          const gid = getGuestId()
          data = data.filter((t: Ticket) => t.user || t.guestId === gid)

          if (filter === 'open') data = data.filter((t) => t.status === 'OPEN')
          if (filter === 'closed') data = data.filter((t) => t.status === 'CLOSED')
          setTickets(data)
        }
      })
  }, [filter])

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 5000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  const createTicket = async () => {
    if (!subject.trim()) return
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: subject.trim(),
        guestId: getGuestId(),
        guestName: guestName.trim() || getGuestName(),
      }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('工单创建成功')
      setSubject('')
      setOpen(false)
      fetchTickets()
    } else {
      toast.error(data.message)
    }
  }

  return (
    <div className="min-h-screen relative pb-24">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>客服中心</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button size="sm" className="bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0 rounded-xl" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              新建工单
            </Button>
            <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.2)] text-[#e8eeff]">
              <DialogHeader>
                <DialogTitle className="text-white">新建客服工单</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="您的称呼（可选）"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value)
                    localStorage.setItem('support_guest_name', e.target.value)
                  }}
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                />
                <Input
                  placeholder="请输入问题主题"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                />
                <Button onClick={createTicket} className="w-full bg-gradient-to-r from-[#ff2244] to-[#ff6b00] hover:brightness-110 text-white font-bold border-0 rounded-xl">
                  提交工单
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded-xl">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">全部</TabsTrigger>
            <TabsTrigger value="open" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">处理中</TabsTrigger>
            <TabsTrigger value="closed" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">已关闭</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/support/${ticket.id}`}>
              <Card className="p-4 border-0 hover:border-[rgba(0,245,255,0.2)] transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{ticket.subject}</h3>
                    <div className="text-xs text-[rgba(180,200,255,0.45)] mt-1">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-[rgba(180,200,255,0.35)] mt-0.5">
                      发起人: {ticket.user?.username || ticket.guestName || '访客'}
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
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-[10px] h-5 border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] rounded">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {ticket.replies.length} 条消息
                  </Badge>
                  {ticket.admin && (
                    <span className="text-xs text-[rgba(180,200,255,0.45)]">
                      处理人: {ticket.admin.username}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
          {tickets.length === 0 && (
            <div className="text-center py-12 text-[rgba(180,200,255,0.45)]">
              暂无工单，点击下方按钮创建新工单
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
