import { cookies } from 'next/headers'
import { successResponse } from '@/lib/api'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete({ name: 'token', path: '/' })
    return successResponse(null, '退出登录成功')
  } catch (error) {
    console.error('Logout error:', error)
    return successResponse(null, '退出登录成功')
  }
}
