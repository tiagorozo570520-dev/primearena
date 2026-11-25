import Link from "next/link"
import { Plus, Search, Flag } from "lucide-react"
import { getNationalTeams } from "@/lib/actions/national-teams"
import { NationalTeamsTable } from "@/components/national-teams/NationalTeamsTable"

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function NationalTeamsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.q || ""

  const teams = await getNationalTeams(search)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flag className="w-6 h-6 text-amber-400" />
            Selecciones
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Biblioteca permanente · {teams.length} selección{teams.length !== 1 ? "es" : ""} registrada{teams.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/national-teams/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Agregar selección
        </Link>
      </div>

      <form className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 text-sm"
          />
        </div>
        <button type="submit" className="btn-ghost px-5 py-2.5 text-sm">
          Buscar
        </button>
      </form>

      {teams.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Flag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-1">
            {search ? "No se encontraron selecciones" : "Aún no hay selecciones registradas"}
          </p>
          {!search && (
            <Link href="/admin/national-teams/new" className="inline-flex items-center gap-1.5 text-cyan-400 text-sm mt-3 hover:underline">
              <Plus className="w-3.5 h-3.5" />
              Agregar la primera
            </Link>
          )}
        </div>
      ) : (
        <NationalTeamsTable teams={teams} />
      )}
    </div>
  )
}
