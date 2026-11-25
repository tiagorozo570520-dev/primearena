import Link from "next/link"
import {
  Users,
  Shield,
  Flag,
  Trophy,
  Plus,
  Activity,
} from "lucide-react"
import { getDashboardStats, getRecentTournaments } from "@/lib/actions/history"

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  upcoming: "Próximo",
  active: "Activo",
  paused: "Pausado",
  finished: "Finalizado",
  archived: "Archivado",
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  const recent = await getRecentTournaments(5)

  const quickActions = [
    {
      href: "/admin/tournaments/new",
      label: "Crear Torneo",
      description: "Configura una nueva competición",
      icon: Trophy,
      color: "from-cyan-500 to-blue-600",
    },
    {
      href: "/admin/players",
      label: "Jugadores",
      description: `${stats.players} registrados`,
      icon: Users,
      color: "from-violet-500 to-purple-600",
    },
    {
      href: "/admin/clubs",
      label: "Clubes",
      description: `${stats.clubs} en biblioteca`,
      icon: Shield,
      color: "from-emerald-500 to-teal-600",
    },
    {
      href: "/admin/national-teams",
      label: "Selecciones",
      description: `${stats.nationalTeams} disponibles`,
      icon: Flag,
      color: "from-amber-500 to-orange-600",
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Centro de Control
        </h1>
        <p className="text-slate-400 mt-1">
          Bienvenido al panel de administración de Titans eFootball
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Jugadores", value: stats.players, icon: Users },
          { label: "Clubes", value: stats.clubs, icon: Shield },
          { label: "Selecciones", value: stats.nationalTeams, icon: Flag },
          { label: "Torneos", value: stats.tournaments, icon: Trophy },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-cyan-400/70" />
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                Total
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Torneos activos</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.activeTournaments}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Torneos finalizados</div>
          <div className="text-2xl font-bold text-violet-400">{stats.finishedTournaments}</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Accesos rápidos
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group glass rounded-xl p-5 glass-hover"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {action.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Torneos recientes</h2>
            <Link href="/admin/tournaments" className="text-xs text-cyan-400 hover:underline">
              Ver todos
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-sm text-slate-500 py-8 text-center">
              Aún no hay torneos.
              <br />
              <Link
                href="/admin/tournaments/new"
                className="inline-flex items-center gap-1 mt-3 text-cyan-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Crear el primero
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/admin/tournaments/${t.id}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm text-white truncate">{t.name}</span>
                    <span className="text-[11px] text-slate-500 shrink-0 ml-2">
                      {statusLabels[t.status] || t.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Historial</h2>
            <Link href="/admin/history" className="text-xs text-cyan-400 hover:underline">
              Ver palmarés
            </Link>
          </div>
          <p className="text-sm text-slate-500 py-6 text-center">
            Los campeones de torneos finalizados aparecerán en el historial.
          </p>
        </div>
      </div>
    </div>
  )
}
