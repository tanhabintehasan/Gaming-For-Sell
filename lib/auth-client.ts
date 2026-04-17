export interface AuthUser {
  id: string
  username: string
  level: string
  avatar: string
  phone: string
  gender?: string
  age?: number
  location?: string
  bio?: string
  isVerified?: boolean
  sellerProfile?: {
    balance?: number
    totalEarnings?: number
    overallRating?: number
    totalOrders?: number
    completedOrders?: number
    voiceIntroUrl?: string
    isVerified?: boolean
    gameServices?: Array<{
      game?: { nameCn?: string }
    }>
  } | null
}

// Using `any` for data because consumers across the app use different local User
// interfaces and cast/assign to their own typed state. Runtime safety is handled
// by the fetch wrapper (res.ok checks, 401 handling, empty-body guards).
/* eslint-disable @typescript-eslint/no-explicit-any */
export type AuthMeResponse =
  | { success: true; data: any; message?: string }
  | { success: false; data?: any; message?: string }
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function fetchAuthMe(): Promise<AuthMeResponse> {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
    })

    if (!res.ok) {
      if (res.status === 401) {
        console.log('Not logged in')
        return { success: false, message: 'Unauthorized' }
      }
      throw new Error(`Request failed: ${res.status}`)
    }

    const text = await res.text()
    const data: AuthMeResponse = text ? (JSON.parse(text) as AuthMeResponse) : { success: false }
    return data || { success: false, message: 'Empty response' }
  } catch (error) {
    console.error('Failed to load auth state:', error)
    return { success: false, message: String(error) }
  }
}
