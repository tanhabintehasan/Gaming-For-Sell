'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, Shield, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { getSocket } from '@/lib/socket'
import { playMessageSound } from '@/lib/sound'

interface TicketDetail {
  id: string
  subject: string
  status: string
  user?: { id: string; username: string; avatar: string; level: string }
  guestId?: string | null
  guestName?: string | null
  admin?: { id: string; username: string; avatar: string }
  replies: {
    id: string
    content: string
    createdAt: string
    isAdmin: boolean
    guestName?: string | null
    admin?: { username: string; avatar: string }
  }[]
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
  return localStorage.getItem('support_guest_name') || '访客'
}

export default function TicketDetailPage() {
  const params = useParams()
  const id = params?.id as string | undefined
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [reply, setReply] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)

  const fetchTicket = useCallback(() => {
    if (!id) return
    fetch(`/api/support/tickets/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setTicket(res.data)
      })
  }, [id])

  useEffect(() => {
    if (!id) return
    fetchTicket()

    // Initialize socket
    const socket = getSocket()
    socketRef.current = socket

    socket.emit('join-ticket', id)

    const handleNewReply = ({ ticketId }: { ticketId: string }) => {
      if (ticketId === id) {
        playMessageSound()
        fetchTicket()
      }
    }

    const handleTicketUpdated = ({ ticketId }: { ticketId: string }) => {
      if (ticketId === id) fetchTicket()
    }

    socket.on('new-reply', handleNewReply)
    socket.on('ticket-updated', handleTicketUpdated)

    return () => {
      socket.emit('leave-ticket', id)
      socket.off('new-reply', handleNewReply)
      socket.off('ticket-updated', handleTicketUpdated)
    }
  }, [id, fetchTicket])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.replies.length])

  const sendReply = async () => {
    if (!reply.trim()) return
    const res = await fetch(`/api/support/tickets/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: reply,
        guestId: getGuestId(),
        guestName: getGuestName(),
      }),
    })
    const data = await res.json()
    if (data.success) {
      setReply('')
      fetchTicket()
    } else {
      toast.error(data.message)
    }
  }

  const closeTicket = async () => {
    const res = await fetch(`/api/support/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CLOSED' }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('工单已关闭')
      fetchTicket()
    } else {
      toast.error(data.message)
    }
  }

  if (!ticket) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.45)]">加载中...</div>
      </div>
    )
  }

  const displayName = ticket.user?.username || ticket.guestName || '访客'
  const displayAvatar = ticket.user?.avatar || ''

  return (
    <div className="min-h-screen relative flex flex-col">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/support">
            <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-bold text-lg text-white truncate" style={{ fontFamily: 'var(--font-orbitron)' }}>
              {ticket.subject}
            </h1>
            {!ticket.user && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,170,0,0.15)] text-[#ffaa00] border border-[rgba(255,170,0,0.2)]">
                <UserX className="w-3 h-3" />
                匿名用户
              </span>
            )}
          </div>
          {ticket.status === 'OPEN' ? (
            <Button size="sm" variant="outline" onClick={closeTicket} className="ml-auto border-[rgba(244,34,68,0.3)] text-[#ff2244] hover:bg-[rgba(244,34,68,0.1)] rounded-xl">
              关闭工单
            </Button>
          ) : (
            <div className="ml-auto text-sm text-[#4ade80]">已关闭</div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-4 overflow-y-auto">
        {ticket.replies.map((item) => {
          const isAdmin = item.isAdmin
          const username = isAdmin ? (item.admin?.username || '客服') : displayName
          const avatar = isAdmin ? (item.admin?.avatar || '') : displayAvatar
          return (
            <div key={item.id} className={`flex gap-3 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
              <Avatar className={`w-9 h-9 border ${isAdmin ? 'border-[rgba(244,34,68,0.35)]' : 'border-[rgba(0,245,255,0.2)]'}`}>
                <AvatarImage src={avatar} />
                <AvatarFallback className={isAdmin ? 'bg-[rgba(244,34,68,0.12)] text-[#ff2244]' : 'bg-[rgba(0,245,255,0.1)] text-[#00f5ff]'}>
                  {username[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[80%] ${isAdmin ? '' : 'text-right'}`}>
                <div className={`text-xs text-[rgba(180,200,255,0.45)] mb-1 ${isAdmin ? '' : 'text-right'}`}>
                  {username} {isAdmin && <Shield className="inline w-3 h-3 text-[#ff2244]" />}
                </div>
                <Card className={`inline-block px-4 py-2 text-sm border-0 ${isAdmin ? 'bg-[rgba(244,34,68,0.08)] text-white' : 'bg-[rgba(0,245,255,0.08)] text-white'}`}>
                  {item.content}
                </Card>
                <div className={`text-[10px] text-[rgba(180,200,255,0.35)] mt-1 ${isAdmin ? '' : 'text-right'}`}>
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </main>

      {ticket.status === 'OPEN' && (
        <div className="border-t border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl p-4">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="输入消息内容..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendReply()
                }
              }}
              className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl focus:border-[rgba(0,245,255,0.4)]"
            />
            <Button onClick={sendReply} className="bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0 rounded-xl px-5">
              <Send className="w-4 h-4 mr-1" />
              发送
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
