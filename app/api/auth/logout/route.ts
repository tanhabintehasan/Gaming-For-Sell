import { cookies } from 'next/headers'
import { successResponse } from '@/lib/api'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  return successResponse(null, '退出登录成功')
}
