'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { ChevronLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { fetchAuthMe } from '@/lib/auth-client'
import { playMessageSound } from '@/lib/sound'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  type: string
  orderId?: string | null
  sender: { id: string; username: string; avatar: string }
  receiver: { id: string; username: string; avatar: string }
}

interface UserInfo {
  id: string
  username: string
  avatar: string
  level: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.userId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [other, setOther] = useState<UserInfo | null>(null)
  const [me, setMe] = useState<{ id: string } | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (res.success) {
          setMe(res.data)
        } else {
          router.push('/login')
        }
      })
  }, [router])

  useEffect(() => {
    if (!userId || !me) return
    fetch(`/api/messages/${userId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setMessages(res.data.messages)
          setOther(res.data.other)
        }
        setLoading(false)
      })

    fetch('/api/messages/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: userId }),
    })
  }, [userId, me])

  useEffect(() => {
    if (!me) return
    const socket = io(undefined, { path: '/api/socket', addTrailingSlash: false })
    socketRef.current = socket
    socket.emit('join-conversation', me.id)
    socket.on('new-message', ({ message }: { message: Message }) => {
      if (message.senderId === userId || message.receiverId === userId) {
        // Only play sound if receiving a message from the other person
        if (message.senderId === userId && message.receiverId === me.id) {
          playMessageSound()
        }
        setMessages((prev) => [...prev, message])
        if (message.receiverId === me.id && message.senderId === userId) {
          fetch('/api/messages/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId: userId }),
          })
        }
      }
    })
    return () => {
      socket.emit('leave-conversation', me.id)
      socket.disconnect()
    }
  }, [me, userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !me || !other) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: other.id, content: input.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setInput('')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('发送失败')
    } finally {
      setSending(false)
    }
  }

  if (loading || !other || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[rgba(5,8,16,0.95)] backdrop-blur-xl border-b border-[rgba(0,245,255,0.1)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-white hover:text-[#00f5ff] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Avatar className="w-9 h-9 border border-[rgba(0,245,255,0.15)]">
            <AvatarImage src={other.avatar} />
            <AvatarFallback className="bg-[rgba(0,245,255,0.1)] text-[#00f5ff] text-sm">{other.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-white text-sm">{other.username}</div>
            <div className="text-[10px] text-[rgba(180,200,255,0.5)]">
              {other.level === 'ADMIN' ? '管理员' : other.level === 'SELLER' ? '打手' : '用户'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === me.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-gradient-to-r from-[#ff2244] to-[#ff6b00] text-white rounded-br-md' : 'bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] text-[#e8eeff] rounded-bl-md'}`}>
                  {msg.content}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-20 bg-[rgba(5,8,16,0.98)] border-t border-[rgba(0,245,255,0.1)] p-3 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="输入消息..."
            className="flex-1 bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-full h-11 px-4 focus:border-[rgba(0,245,255,0.4)]"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="h-11 w-11 rounded-full bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 text-[#050810] p-0 flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
