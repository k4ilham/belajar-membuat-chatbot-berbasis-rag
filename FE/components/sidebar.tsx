"use client"

import { useState } from "react"
import { MessageSquare, ChevronLeft, ChevronRight, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChatSession } from "@/app/page"
import { cn } from "@/lib/utils"

type SidebarProps = {
  chatSessions: ChatSession[]
  currentChatId: string | null
  onChatSelect: (chatId: string) => void
  onDeleteAll: () => void
}

export function Sidebar({ chatSessions, currentChatId, onChatSelect, onDeleteAll }: SidebarProps) {
  // Pagination removed as per user request to show all items in a scroll view

  return (
    <div className="w-full md:w-[450px] h-full border-r bg-muted/30 flex flex-col overflow-hidden">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
            <MessageSquare className="w-4 h-4" />
            Document List
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {chatSessions.length}
            </span>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onDeleteAll}
                title="Delete All Documents"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3">
          <div className="space-y-1">
            {chatSessions.map((chat, index) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group flex items-start gap-3",
                  currentChatId === chat.id 
                    ? "bg-primary/10 text-primary hover:bg-primary/15" 
                    : "hover:bg-muted/80 text-foreground/80 hover:text-foreground"
                )}
              >
                <span className={cn(
                  "text-xs font-mono mt-0.5 w-5 text-right shrink-0",
                  currentChatId === chat.id ? "text-primary/70" : "text-muted-foreground/70"
                )}>
                  {index + 1}.
                </span>
                <FileText className={cn(
                  "w-4 h-4 mt-0.5 shrink-0 transition-colors",
                  currentChatId === chat.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium whitespace-normal break-words leading-tight" title={chat.title}>
                    {chat.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
