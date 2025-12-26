import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'

    // 1. Check Rate Limit (100 messages per day)
    const limitResult = checkRateLimit(ip, 100)
    
    if (!limitResult.allowed) {
      return NextResponse.json({ 
        error: limitResult.error || 'Rate limit exceeded' 
      }, { status: 429 })
    }

    const { messages, sessionId } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const chatInput = lastMessage.content

    // 2. Call n8n Webhook
    const n8nResponse = await fetch('https://n8n.inercorp.com/webhook/a79b8372-e5c7-406e-a523-2a10c181082f/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput,
        sessionId: sessionId || `session-${Date.now()}`
      }),
    })

    if (!n8nResponse.ok) {
      console.error('n8n error:', n8nResponse.status, await n8nResponse.text())
      return NextResponse.json({ error: 'Failed to connect to AI service' }, { status: 502 })
    }

    const data = await n8nResponse.json()
    
    // 3. Return response
    // n8n returns { "output": "..." }
    return NextResponse.json({ 
      role: 'assistant', 
      content: data.output,
      remaining: limitResult.remaining
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
