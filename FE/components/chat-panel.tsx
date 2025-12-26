"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type ChatPanelProps = {
  currentChatId: string | null
  pdfFileName: string
}

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatPanel({ currentChatId, pdfFileName }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya asisten PDF Anda. Silakan tanyakan apa saja tentang dokumen ini.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initial check for remaining limit
  useEffect(() => {
    fetch('/api/chat-limit')
      .then(res => res.json())
      .then(data => {
        if (data.remaining !== undefined) setRemaining(data.remaining)
      })
      .catch(console.error)
  }, [])

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId: currentChatId || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      if (data.remaining !== undefined) setRemaining(data.remaining)
      
    } catch (err: any) {
      setError(err.message)
      // Optional: remove user message if failed? Or just show error.
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background border-l relative">
      {remaining !== null && (
         <div className="absolute top-0 right-0 left-0 bg-yellow-100/80 text-yellow-800 text-xs text-center py-1 z-10 pointer-events-none">
            Sisa chat hari ini: {remaining} pesan
         </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-8" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] rounded-lg p-3 text-sm",
              msg.role === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-foreground"
            )}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></span>
              </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center p-2">
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-full flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input 
            placeholder={remaining === 0 ? "Batas harian tercapai" : "Ketik pesan Anda..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || remaining === 0}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim() || remaining === 0} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-center text-muted-foreground mt-2">
            {pdfFileName ? `Chatting about: ${pdfFileName}` : 'Select a document to start'}
        </div>
      </div>
    </div>
  )
}
