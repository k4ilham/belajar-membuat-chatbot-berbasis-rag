"use client"

import { FileText } from "lucide-react"

type PdfViewerProps = {
  pdfUrl: string | null
  fileName: string
}

export function PdfViewer({ pdfUrl, fileName }: PdfViewerProps) {
  if (!pdfUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tidak ada PDF yang dipilih</h3>
          <p className="text-sm text-muted-foreground">Upload PDF untuk mulai mengobrol</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-muted/10">
      <div className="flex-1 relative">
        <iframe src={pdfUrl} className="w-full h-full border-0" title={fileName} />
      </div>
    </div>
  )
}
