import { supabase } from './supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data: any = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options

  // 1. Get access token from Supabase session
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  // 2. Build headers
  const requestHeaders = new Headers(headers)
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }
  if (!(options.body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  // 3. Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // 4. Perform fetch
  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
  })

  // 5. Check response
  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: 'Unknown server error' }
    }

    if (response.status === 401) {
      // Session expired, sign out locally
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true'
      }
    }

    throw new ApiError(
      errorData.error || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    )
  }

  // 6. Return typed data
  if (response.status === 204) {
    return {} as T
  }
  return response.json() as Promise<T>
}
