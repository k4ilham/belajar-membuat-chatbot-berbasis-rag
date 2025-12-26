import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getRateLimitStatus } from '@/lib/rate-limit'

export async function GET() {
  const headersList = await headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'
  
  // Just return status without incrementing
  const status = getRateLimitStatus(ip, 100)
  
  return NextResponse.json({ 
    allowed: status.remaining > 0, 
    remaining: status.remaining 
  })
}
