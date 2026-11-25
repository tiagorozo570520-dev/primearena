"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface AdminHeaderProps {
  email: string
}

export function AdminHeader({ email }: AdminHeaderProps) {
  return (
    <header className="h-14 sm:h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-slate-300">
          Panel de Administración
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
        >
          Ver sitio público
          <ExternalLink className="w-3 h-3" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
            {email.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-xs text-slate-400 max-w-[160px] truncate">
            {email}
          </span>
        </div>
      </div>
    </header>
  )
}
