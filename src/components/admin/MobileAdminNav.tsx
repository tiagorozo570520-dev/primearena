"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, Users, Shield, Flag, Trophy, History, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/players", label: "Jugadores", icon: Users },
  { href: "/admin/clubs", label: "Clubes", icon: Shield },
  { href: "/admin/national-teams", label: "Selecciones", icon: Flag },
  { href: "/admin/tournaments", label: "Torneos", icon: Trophy },
  { href: "/admin/history", label: "Historial", icon: History },
]

export function MobileAdminNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
        aria-label="Menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0c0818] border-r border-purple-500/20 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-white">PRIME ARENA</span>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                      isActive ? "bg-purple-500/20 text-cyan-400" : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="mt-6 flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  )
}
