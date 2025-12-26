import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'rate-limit.json')

type RateLimitRecord = {
  count: number
  date: string
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  error?: string
}

function readDb(): Record<string, RateLimitRecord> {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return {}
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading rate limit DB:', error)
    return {}
  }
}

function writeDb(data: Record<string, RateLimitRecord>) {
  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing rate limit DB:', error)
  }
}

export function checkRateLimit(ip: string, limit: number = 100): RateLimitResult {
  const today = new Date().toISOString().split('T')[0]
  const db = readDb()
  const record = db[ip]

  if (record) {
    if (record.date !== today) {
      // Reset for new day
      db[ip] = { count: 1, date: today }
      writeDb(db)
      return { allowed: true, remaining: limit - 1 }
    } else {
      if (record.count >= limit) {
        return { 
          allowed: false, 
          remaining: 0,
          error: `Daily limit reached (${limit}/${limit}). Please try again tomorrow.` 
        }
      }
      
      const newCount = record.count + 1
      db[ip] = { count: newCount, date: today }
      writeDb(db)
      return { allowed: true, remaining: limit - newCount }
    }
  } else {
    // New record
    db[ip] = { count: 1, date: today }
    writeDb(db)
    return { allowed: true, remaining: limit - 1 }
  }
}

export function getRateLimitStatus(ip: string, limit: number = 100): { remaining: number } {
  const today = new Date().toISOString().split('T')[0]
  const db = readDb()
  const record = db[ip]

  if (record && record.date === today) {
    return { remaining: Math.max(0, limit - record.count) }
  }
  
  return { remaining: limit }
}
