'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, XCircle, Clock, Phone, User, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Application {
  id: string
  phone: string
  username: string
  age: number | null
  gender: string | null
  location: string | null
  bio: string | null
  reason: string | null
  experience: string | null
  gameIds: string
  status: string
  reviewNote: string | null
  submittedAt: string
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState('all')
  const [reviewNote, setReviewNote] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchApplications = useCallback(() => {
    const url = filter === 'all' ? '/api/applications' : `/api/applications?status=${filter}`
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setApplications(res.data)
      })
  }, [filter])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNote }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(data.message)
      setReviewNote('')
      setSelectedId(null)
      fetchApplications()
    } else {
      toast.error(data.message)
    }
  }

  const statusBadge = (status: string) => {
    if (status === 'PENDING') return <Badge className="bg-[rgba(255,170,0,0.12)] text-[#ffaa00] border border-[rgba(255,170,0,0.25)]">待审核</Badge>
    if (status === 'APPROVED') return <Badge className="bg-[rgba(74,222,128,0.12)] text-[#4ade80] border border-[rgba(74,222,128,0.25)]">已通过</Badge>
    return <Badge className="bg-[rgba(244,34,68,0.12)] text-[#ff2244] border border-[rgba(244,34,68,0.25)]">已拒绝</Badge>
  }

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/admin">
            <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
          </Link>
          <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>打手申请审核</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded-xl">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">全部</TabsTrigger>
            <TabsTrigger value="PENDING" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">
              <Clock className="w-3.5 h-3.5 mr-1" /> 待审核
            </TabsTrigger>
            <TabsTrigger value="APPROVED" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 已通过
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="rounded-lg data-[state=active]:bg-[rgba(0,245,255,0.15)] data-[state=active]:text-[#00f5ff] text-[rgba(180,200,255,0.6)] px-5">
              <XCircle className="w-3.5 h-3.5 mr-1" /> 已拒绝
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="p-4 glass-card border-0 hover:border-[rgba(0,245,255,0.2)] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(0,245,255,0.08)] border border-[rgba(0,245,255,0.15)] flex items-center justify-center text-[#00f5ff]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{app.username}</div>
                    <div className="text-xs text-[rgba(180,200,255,0.45)] flex items-center gap-2 mt-0.5">
                      <Phone className="w-3 h-3" /> {app.phone}
                    </div>
                  </div>
                </div>
                {statusBadge(app.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-[rgba(180,200,255,0.65)] mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {app.age || '-'} 岁
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {app.gender === 'FEMALE' ? '女' : '男'}
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {app.location || '-'}
                </div>
              </div>

              {app.bio && (
                <div className="text-sm text-[rgba(180,200,255,0.65)] mb-2">
                  <span className="text-[rgba(180,200,255,0.4)]">介绍:</span> {app.bio}
                </div>
              )}
              {app.reason && (
                <div className="text-sm text-[rgba(180,200,255,0.65)] mb-2">
                  <span className="text-[rgba(180,200,255,0.4)]">理由:</span> {app.reason}
                </div>
              )}
              {app.experience && (
                <div className="text-sm text-[rgba(180,200,255,0.65)] mb-2">
                  <span className="text-[rgba(180,200,255,0.4)]">经验:</span> {app.experience}
                </div>
              )}

              {app.status === 'PENDING' ? (
                <div className="flex items-center gap-2 mt-4">
                  <Dialog open={selectedId === app.id} onOpenChange={(open) => !open && setSelectedId(null)}>
                    <DialogTrigger render={<Button
                      size="sm"
                      onClick={() => setSelectedId(app.id)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0"
                    />}>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      通过
                    </DialogTrigger>
                    <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.15)] text-[#e8eeff]">
                      <DialogHeader>
                        <DialogTitle className="text-white">审核申请 - 通过</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div className="text-sm text-[rgba(180,200,255,0.65)]">
                          通过后将自动创建 seller 账号，默认密码为 <span className="text-[#00f5ff] font-mono">123456</span>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[rgba(180,200,255,0.75)]">审核备注（可选）</Label>
                          <Input
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            placeholder="例如：恭喜通过审核"
                            className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setSelectedId(null)} className="flex-1 rounded-xl border-[rgba(0,245,255,0.2)] text-white">
                            取消
                          </Button>
                          <Button onClick={() => handleReview(app.id, 'APPROVED')} className="flex-1 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0">
                            确认通过
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={selectedId === `reject-${app.id}`} onOpenChange={(open) => !open && setSelectedId(null)}>
                    <DialogTrigger render={<Button
                      size="sm"
                      onClick={() => setSelectedId(`reject-${app.id}`)}
                      variant="outline"
                      className="flex-1 rounded-xl border-[rgba(255,34,68,0.3)] text-[#ff5f7a] hover:bg-[rgba(255,34,68,0.1)]"
                    />}>
                      <XCircle className="w-4 h-4 mr-1" />
                      拒绝
                    </DialogTrigger>
                    <DialogContent className="bg-[rgba(10,15,30,0.98)] border-[rgba(0,245,255,0.15)] text-[#e8eeff]">
                      <DialogHeader>
                        <DialogTitle className="text-white">审核申请 - 拒绝</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-[rgba(180,200,255,0.75)]">拒绝原因（可选）</Label>
                          <Input
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            placeholder="例如：资料不完整"
                            className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-white rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setSelectedId(null)} className="flex-1 rounded-xl border-[rgba(0,245,255,0.2)] text-white">
                            取消
                          </Button>
                          <Button onClick={() => handleReview(app.id, 'REJECTED')} className="flex-1 rounded-xl bg-[rgba(255,34,68,0.12)] text-[#ff5f7a] border border-[rgba(255,34,68,0.25)] hover:bg-[rgba(255,34,68,0.2)]">
                            确认拒绝
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="mt-3 text-xs text-[rgba(180,200,255,0.45)]">
                  {app.reviewNote ? `审核备注: ${app.reviewNote}` : '无审核备注'}
                </div>
              )}
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-20 text-[rgba(180,200,255,0.45)]">
            暂无申请记录
          </div>
        )}
      </main>
    </div>
  )
}
