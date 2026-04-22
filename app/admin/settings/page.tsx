'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save, Upload, X, ImageIcon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import Image from 'next/image'

interface Config {
  id?: string
  configKey: string
  configValue: string
  category: string
  description: string
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || '上传失败')
  return data.data.url
}

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/admin/configs')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setConfigs(res.data)
          const map: Record<string, string> = {}
          res.data.forEach((c: Config) => {
            map[c.configKey] = c.configValue
          })
          setValues(map)
        }
      })
      .catch(() => {
        toast.error('加载失败')
      })
  }, [])

  const handleSave = (key: string) => {
    fetch('/api/admin/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configKey: key,
        configValue: values[key],
        category: configs.find((c) => c.configKey === key)?.category,
        description: configs.find((c) => c.configKey === key)?.description,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          toast.success('保存成功')
        } else {
          toast.error(data.message)
        }
      })
      .catch(() => {
        toast.error('保存失败')
      })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading((prev) => ({ ...prev, [key]: true }))
    try {
      const url = await uploadImage(file)
      setValues((prev) => ({ ...prev, [key]: url }))
      toast.success('上传成功')
      await handleSave(key)
    } catch (err: any) {
      toast.error(err.message || '上传失败')
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }))
      e.target.value = ''
    }
  }

  const grouped = configs.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {} as Record<string, Config[]>)

  const categoryNames: Record<string, string> = {
    general: '通用设置',
    sms: '短信配置',
    payment: '支付配置',
    finance: '财务配置',
  }

  const isBooleanKey = (key: string) => key.endsWith('_enabled')
  const isLongTextKey = (key: string) => key.includes('private_key') || key.includes('public_key') || key.includes('api_key')
  const isImageKey = (key: string) => key === 'site_logo' || key === 'customer_service_qr'

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-[rgba(0,245,255,0.1)] bg-[rgba(5,8,16,0.8)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/admin">
            <ChevronLeft className="w-5 h-5 text-[rgba(180,200,255,0.7)] hover:text-[#00f5ff] transition-colors" />
          </Link>
          <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-orbitron)' }}>系统配置</h1>
          <div className="flex-1" />
          <button
            onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/backstage/admin/login')}
            className="text-sm text-[rgba(180,200,255,0.55)] hover:text-[#ff2244] transition-colors flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category} className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-base text-white">{categoryNames[category] || category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {items.map((config) => (
                <div key={config.configKey} className="space-y-2">
                  <Label className="text-[rgba(180,200,255,0.75)]">{config.description || config.configKey}</Label>
                  {config.configKey === 'smsbao_template' && (
                    <p className="text-xs text-[rgba(180,200,255,0.45)]">在模板中使用 <code className="text-[#00f5ff]">[code]</code> 作为验证码占位符，系统将自动替换为生成的验证码。</p>
                  )}
                  <div className="flex gap-2 items-center">
                    {isBooleanKey(config.configKey) ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          id={config.configKey}
                          checked={values[config.configKey] === 'true'}
                          onCheckedChange={(checked) =>
                            setValues((prev) => ({ ...prev, [config.configKey]: checked ? 'true' : 'false' }))
                          }
                          className="border-[rgba(0,245,255,0.3)] data-[state=checked]:bg-[#00f5ff] data-[state=checked]:text-[#050810]"
                        />
                        <Label htmlFor={config.configKey} className="text-[rgba(180,200,255,0.75)] cursor-pointer">
                          启用
                        </Label>
                      </div>
                    ) : isImageKey(config.configKey) ? (
                      <div className="flex-1 flex items-center gap-3">
                        {values[config.configKey] && (
                          <div className="relative shrink-0">
                            <Image
                              src={values[config.configKey]}
                              alt={config.description}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover border border-[rgba(0,245,255,0.15)]"
                            />
                            <button
                              onClick={() => setValues((prev) => ({ ...prev, [config.configKey]: '' }))}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff2244] text-white flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(0,245,255,0.2)] bg-[rgba(0,245,255,0.05)] text-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] transition-colors text-sm">
                          <Upload className="w-4 h-4" />
                          {uploading[config.configKey] ? '上传中...' : values[config.configKey] ? '更换图片' : '上传图片'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, config.configKey)}
                            disabled={uploading[config.configKey]}
                          />
                        </label>
                        {values[config.configKey] && (
                          <span className="text-xs text-[rgba(180,200,255,0.4)] truncate max-w-[200px]">{values[config.configKey]}</span>
                        )}
                      </div>
                    ) : isLongTextKey(config.configKey) ? (
                      <textarea
                        value={values[config.configKey] || ''}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [config.configKey]: e.target.value }))
                        }
                        rows={3}
                        className="flex-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.12)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl focus:border-[rgba(0,245,255,0.4)] p-3 text-sm"
                      />
                    ) : (
                      <Input
                        value={values[config.configKey] || ''}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [config.configKey]: e.target.value }))
                        }
                        className="bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.12)] text-[#e8eeff] placeholder:text-[rgba(180,200,255,0.35)] rounded-xl focus:border-[rgba(0,245,255,0.4)]"
                      />
                    )}
                    <Button size="sm" onClick={() => handleSave(config.configKey)} className="bg-gradient-to-r from-[#00f5ff] to-[#00c2cc] text-[#050810] font-bold hover:brightness-110 border-0 rounded-xl px-4 shrink-0">
                      <Save className="w-4 h-4 mr-1" />
                      保存
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  )
}
