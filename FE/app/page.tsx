"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, MessageCircleQuestion, Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { PdfViewer } from "@/components/pdf-viewer"
import { ChatPanel } from "@/components/chat-panel"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export type ChatSession = {
  id: string
  title: string
  createdAt: Date
}

export default function ChatPDFPage() {
  const [currentPdf, setCurrentPdf] = useState<string | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string>("")
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])

  const fetchDocuments = async () => {
    try {
      const response = await fetch("https://n8n.inercorp.com/webhook/55aa27ea-b3c1-4b24-92a4-d375fdcb6f72", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module: "document",
          method: "list",
        }),
      })
      const data = await response.json()
      
      if (Array.isArray(data)) {
        const sessions: ChatSession[] = data.map((item: any) => ({
          id: item.id,
          title: item.content || "Untitled Document",
          createdAt: new Date(), // Default date as API doesn't provide one
        }))
        setChatSessions(sessions)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setIsUploading(true)
      const url = URL.createObjectURL(file)
      setCurrentPdf(url)
      setPdfFileName(file.name)

      try {
        const formData = new FormData()
        formData.append("File", file)

        await fetch("https://n8n.inercorp.com/webhook/a827d85d-b958-465d-942f-71025a63b319", {
          method: "POST",
          body: formData,
        })
        
        // Wait for 3 seconds before refreshing list
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Refresh document list after successful upload
        await fetchDocuments()
      } catch (error) {
        console.error("Error uploading file:", error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all documents?")) {
      try {
        await fetch("https://n8n.inercorp.com/webhook/55aa27ea-b3c1-4b24-92a4-d375fdcb6f72", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            module: "document",
            method: "deleteAll",
          }),
        })
        await fetchDocuments()
      } catch (error) {
        console.error("Error deleting documents:", error)
      }
    }
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
    // In a real app, you would load the PDF associated with this chat
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-background relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-purple-600 to-pink-500">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/20">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <Sidebar
                chatSessions={chatSessions}
                currentChatId={currentChatId}
                onChatSelect={(id) => {
                  handleChatSelect(id)
                  setIsMobileMenuOpen(false)
                }}
                onDeleteAll={handleDeleteAll}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <MessageCircleQuestion className="w-5 h-5 text-purple-600" />
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">Tanya PDF</h1>
          </div>

          <label htmlFor="pdf-upload">
            <Button variant="secondary" size="sm" className="cursor-pointer" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload PDF</span>
                <span className="sm:hidden">Upload</span>
              </span>
            </Button>
          </label>
          <input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-white/90 truncate max-w-[100px] sm:max-w-xs">{pdfFileName}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row relative">
        {/* Left Sidebar - Chat History & Folders (Desktop) */}
        <div className="hidden md:block h-full">
          <Sidebar
            chatSessions={chatSessions}
            currentChatId={currentChatId}
            onChatSelect={handleChatSelect}
            onDeleteAll={handleDeleteAll}
          />
        </div>

        {/* Center - PDF Viewer */}
        <div className="flex-1 h-full md:h-auto border-b md:border-b-0 md:border-r relative flex flex-col">
          <PdfViewer pdfUrl={currentPdf} fileName={pdfFileName} />
        </div>

        {/* Right Panel - Chat Interface (Desktop) */}
        <div className="hidden md:block md:w-96">
          <ChatPanel currentChatId={currentChatId} pdfFileName={pdfFileName} />
        </div>

        {/* Floating Chat Button (Mobile) */}
        <div className="absolute bottom-6 right-6 md:hidden z-10">
          <Sheet open={isMobileChatOpen} onOpenChange={setIsMobileChatOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 transition-all">
                <MessageCircleQuestion className="h-7 w-7" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageCircleQuestion className="w-5 h-5 text-purple-600" />
                    Chat Assistant
                  </h3>
                </div>
                <div className="flex-1 overflow-hidden">
                   <ChatPanel currentChatId={currentChatId} pdfFileName={pdfFileName} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-2 px-4 border-t bg-background text-center text-xs text-muted-foreground">
        Created by{" "}
        <a 
          href="https://www.ilhammaulana.id/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          Ilham Maulana
        </a>
      </footer>
    </div>
  )
}
