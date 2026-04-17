'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Mic, Upload, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { fetchAuthMe } from '@/lib/auth-client'

export default function SellerVoicePage() {
  const [profile, setProfile] = useState<{ voiceIntroUrl?: string | null } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAuthMe()
      .then((res) => {
        if (res.success) setProfile(res.data.sellerProfile || {})
      })
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      toast.error('请选择音频文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小不能超过10MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/seller/voice-intro', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        toast.success('上传成功')
        setProfile((prev) => ({ ...prev, voiceIntroUrl: data.data.voiceIntroUrl }))
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('上传失败')
    } finally {
      setUploading(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current || !profile?.voiceIntroUrl) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const onAudioEnded = () => setPlaying(false)

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/seller/dashboard">
            <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
          </Link>
          <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>语音介绍</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#00f5ff]" />
              上传语音介绍
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className="border-2 border-dashed border-[rgba(0,245,255,0.2)] rounded-xl p-8 text-center hover:border-[rgba(0,245,255,0.4)] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-[rgba(0,245,255,0.6)] mb-3" />
              <p className="text-sm text-[rgba(180,200,255,0.7)]">点击上传音频文件</p>
              <p className="text-xs text-[rgba(180,200,255,0.4)] mt-1">支持 MP3 / WAV / M4A，最大 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {uploading && (
              <div className="text-sm text-[#00f5ff] text-center">上传中...</div>
            )}

            {profile?.voiceIntroUrl && !uploading && (
              <div className="rounded-xl bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.15)] p-4">
                <div className="flex items-center gap-3">
                  <Button size="icon" variant="outline" className="rounded-full border-[rgba(0,245,255,0.3)] text-[#00f5ff]" onClick={togglePlay}>
                    {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <div className="flex-1">
                    <div className="text-sm text-white">当前语音介绍</div>
                    <div className="text-xs text-[rgba(180,200,255,0.45)] truncate">{profile.voiceIntroUrl.split('/').pop()}</div>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={profile.voiceIntroUrl}
                  onEnded={onAudioEnded}
                  className="w-full mt-3"
                  controls
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
