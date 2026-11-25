"use client"

import { useState } from "react"
import { uploadImage } from "@/lib/actions/upload"

interface Props {
  name: string
  label: string
  currentUrl?: string | null
  onUploaded?: (url: string) => void
}

export function ImageUpload({ name, label, currentUrl, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(currentUrl || "")

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const result = await uploadImage(fd)
    setUploading(false)

    if (result.error) {
      alert(result.error)
      return
    }

    if (result.url) {
      setUrl(result.url)
      onUploaded?.(result.url)
    }
  }

  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3">
        {url && (
          <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden border border-white/10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-contain" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
          className="text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-cyan-500/10 file:text-cyan-400 file:text-xs"
        />
        {uploading && <span className="text-xs text-slate-500">Subiendo...</span>}
      </div>
      <input type="hidden" name={name} value={url} />
    </div>
  )
}
