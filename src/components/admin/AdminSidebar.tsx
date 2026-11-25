"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Shield,
  Flag,
  Trophy,
  History,
  Settings,
  LogOut,
} from "lucide-react"
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
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-purple-500/10 bg-black/40 backdrop-blur-xl">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-purple-500/10">
        <Image
          src="/logo-prime-arena.png"
          alt="Prime Arena"
          width={36}
          height={36}
          className="rounded"
        />
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-wider text-white">PRIME</span>
          <span className="text-[9px] uppercase tracking-widest text-cyan-400/80">Arena Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-purple-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-purple-500/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
