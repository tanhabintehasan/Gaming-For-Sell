'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Upload, Play, Pause, Save, Mic, Square, Trash2, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { fetchAuthMe } from '@/lib/auth-client'

interface ProfileData {
  user: {
    id: string
    username: string
    avatar: string
    phone: string
    gender?: string
    age?: number
    location?: string
    bio?: string
  }
  voiceIntroUrl?: string
}

export default function SellerProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const avatarFileInputRef = useRef<HTMLInputElement>(null)

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordTime, setRecordTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordedUrl = recordedBlob ? URL.createObjectURL(recordedBlob) : null

  const [form, setForm] = useState({
    username: '',
    avatar: '',
    gender: '',
    age: '',
    location: '',
    bio: '',
  })

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (!res.success || (res.data.level !== 'SELLER' && res.data.level !== 'ADMIN')) {
          router.push('/seller/login')
        }
      })

    fetch('/api/seller/profile')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setProfile(res.data)
          setForm({
            username: res.data.user.username || '',
            avatar: res.data.user.avatar || '',
            gender: res.data.user.gender || '',
            age: res.data.user.age ? String(res.data.user.age) : '',
            location: res.data.user.location || '',
            bio: res.data.user.bio || '',
          })
        }
        setLoading(false)
      })
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: form.age ? parseInt(form.age) : null,
          voiceIntroUrl: profile?.voiceIntroUrl,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('保存成功')
        setProfile(data.data)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB')
      return
    }
    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/seller/avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        toast.success('头像上传成功')
        setForm((f) => ({ ...f, avatar: data.data.url }))
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('上传失败')
    } finally {
      setUploadingAvatar(false)
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = ''
    }
  }

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadAudioFile(file)
    if (audioFileInputRef.current) audioFileInputRef.current.value = ''
  }

  const uploadAudioFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast.error('请上传音频文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小不能超过10MB')
      return
    }
    setUploadingAudio(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/seller/voice-intro', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        toast.success('语音上传成功')
        setProfile((prev) => (prev ? { ...prev, voiceIntroUrl: data.data.url } : prev))
        setRecordedBlob(null)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('上传失败')
    } finally {
      setUploadingAudio(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorder.start()
      setIsRecording(true)
      setRecordTime(0)
      recordTimerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1)
      }, 1000)
    } catch {
      toast.error('无法访问麦克风，请检查权限设置')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  }

  const uploadRecordedAudio = async () => {
    if (!recordedBlob) return
    const file = new File([recordedBlob], `recorded_${Date.now()}.webm`, { type: 'audio/webm' })
    await uploadAudioFile(file)
  }

  const togglePlay = (url?: string) => {
    if (!audioRef.current || !url) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.src = url
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const handleAudioEnded = () => setPlaying(false)

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[rgba(180,200,255,0.5)]">加载中...</div>
      </div>
    )
  }

  const currentVoiceUrl = recordedUrl || profile.voiceIntroUrl

  return (
    <div className="relative min-h-screen lg:py-8 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 py-4 lg:py-0 lg:mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 lg:hidden text-white hover:text-[#00f5ff] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold lg:text-xl text-white tracking-wide" style={{ fontFamily: 'var(--font-orbitron)' }}>
            资料管理 <span className="text-[#00f5ff]">PROFILE</span>
          </h1>
        </div>

        <Card className="p-5 mb-4 border-0 glass-card space-y-5">
          <div className="space-y-2">
            <Label className="text-[rgba(180,200,255,0.8)]">用户名</Label>
            <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] rounded-xl h-11" />
          </div>

          <div className="space-y-2">
            <Label className="text-[rgba(180,200,255,0.8)]">头像</Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => avatarFileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[rgba(0,245,255,0.2)] cursor-pointer hover:border-[rgba(0,245,255,0.4)] transition-colors bg-[rgba(0,245,255,0.05)] flex items-center justify-center"
              >
                {form.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[rgba(180,200,255,0.4)]" />
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs text-white">上传中</div>
                )}
              </div>
              <div className="flex-1">
                <input ref={avatarFileInputRef} type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                <Button size="sm" onClick={() => avatarFileInputRef.current?.click()} disabled={uploadingAvatar} className="bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 rounded-xl border-0">
                  <Upload className="w-4 h-4 mr-1" />
                  {uploadingAvatar ? '上传中...' : '更换头像'}
                </Button>
                <p className="text-xs text-[rgba(180,200,255,0.45)] mt-1">支持 JPG、PNG，最大 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.8)]">性别</Label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="w-full h-11 rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] text-[#e8eeff] px-3"
              >
                <option value="">保密</option>
                <option value="MALE">男</option>
                <option value="FEMALE">女</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[rgba(180,200,255,0.8)]">年龄</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] rounded-xl h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[rgba(180,200,255,0.8)]">所在地</Label>
            <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.15)] text-[#e8eeff] rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-[rgba(180,200,255,0.8)]">个人简介</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={4}
              className="w-full rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] text-[#e8eeff] px-3 py-2 focus:outline-none focus:border-[rgba(0,245,255,0.4)]"
            />
          </div>
        </Card>

        <Card className="p-5 mb-6 border-0 glass-card">
          <h2 className="font-bold text-white mb-4">语音介绍</h2>

          {/* Playback preview */}
          {currentVoiceUrl && (
            <div className="flex items-center gap-4 mb-4">
              <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
              <button
                onClick={() => togglePlay(currentVoiceUrl)}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] flex items-center justify-center text-[#050810] hover:brightness-110 transition-all"
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div className="flex-1">
                <div className="text-sm text-white">
                  {recordedBlob ? '录制完成，可点击播放预览' : '已上传语音介绍'}
                </div>
                {recordedBlob && (
                  <div className="text-xs text-[rgba(180,200,255,0.5)]">时长: {Math.floor(recordTime / 60)}:{String(recordTime % 60).padStart(2, '0')}</div>
                )}
              </div>
              {recordedBlob && (
                <Button size="sm" variant="outline" onClick={() => setRecordedBlob(null)} className="rounded-lg border-[rgba(255,34,68,0.3)] text-[#ff5f7a] hover:bg-[rgba(255,34,68,0.1)] bg-transparent">
                  <Trash2 className="w-4 h-4 mr-1" />
                  丢弃
                </Button>
              )}
            </div>
          )}

          {/* Recording UI */}
          {isRecording ? (
            <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-[rgba(255,34,68,0.08)] border border-[rgba(255,34,68,0.2)]">
              <div className="w-10 h-10 rounded-full bg-[#ff2244] animate-pulse flex items-center justify-center text-white">
                <Mic className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">正在录音...</div>
                <div className="text-xs text-[rgba(180,200,255,0.6)]">{Math.floor(recordTime / 60)}:{String(recordTime % 60).padStart(2, '0')}</div>
              </div>
              <Button size="sm" onClick={stopRecording} className="rounded-lg bg-[rgba(255,34,68,0.2)] text-white border border-[rgba(255,34,68,0.4)] hover:bg-[rgba(255,34,68,0.3)]">
                <Square className="w-4 h-4 mr-1" />
                停止录音
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Button size="sm" onClick={startRecording} className="rounded-lg bg-gradient-to-r from-[#ff2244] to-[#ff6b00] text-white font-bold hover:brightness-110 border-0">
                <Mic className="w-4 h-4 mr-1" />
                录制语音
              </Button>

              <input ref={audioFileInputRef} type="file" accept="audio/*" onChange={handleAudioFileChange} className="hidden" />
              <Button size="sm" variant="outline" onClick={() => audioFileInputRef.current?.click()} disabled={uploadingAudio} className="rounded-lg border-[rgba(0,245,255,0.2)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.08)] bg-transparent">
                <Upload className="w-4 h-4 mr-1" />
                {uploadingAudio ? '上传中...' : '上传音频'}
              </Button>

              {recordedBlob && (
                <Button size="sm" onClick={uploadRecordedAudio} disabled={uploadingAudio} className="rounded-lg bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0">
                  <Upload className="w-4 h-4 mr-1" />
                  保存录音
                </Button>
              )}
            </div>
          )}

          {!profile.voiceIntroUrl && !recordedBlob && !isRecording && (
            <div className="text-sm text-[rgba(180,200,255,0.6)]">尚未上传语音介绍，录制或上传后买家可以听到您的声音</div>
          )}
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] hover:brightness-110 border-0 text-[#050810]"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存资料'}
        </Button>
      </div>
    </div>
  )
}
