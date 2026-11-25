import Link from "next/link"
import { Plus, Trophy } from "lucide-react"
import { getTournaments } from "@/lib/actions/tournaments"
import { TournamentsTable } from "@/components/tournaments/TournamentsTable"

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  upcoming: "Próximo",
  active: "Activo",
  paused: "Pausado",
  finished: "Finalizado",
  archived: "Archivado",
}

export default async function TournamentsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = params.status || ""
  const tournaments = await getTournaments(status || undefined)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-cyan-400" />
            Torneos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {tournaments.length} competición{tournaments.length !== 1 ? "es" : ""}
          </p>
        </div>
        <Link href="/admin/tournaments/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Crear torneo
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/tournaments"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !status
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/10"
          }`}
        >
          Todos
        </Link>
        {Object.entries(statusLabels).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/tournaments?status=${key}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              status === key
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/10"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {tournaments.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-1">
            {status ? "No hay torneos con ese estado" : "Aún no hay torneos creados"}
          </p>
          {!status && (
            <Link
              href="/admin/tournaments/new"
              className="inline-flex items-center gap-1.5 text-cyan-400 text-sm mt-3 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear el primero
            </Link>
          )}
        </div>
      ) : (
        <TournamentsTable tournaments={tournaments} />
      )}
    </div>
  )
}
