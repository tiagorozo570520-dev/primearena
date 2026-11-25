import Link from "next/link"
import { Plus, Search, Shield } from "lucide-react"
import { getClubs } from "@/lib/actions/clubs"
import { ClubsTable } from "@/components/clubs/ClubsTable"
import { COUNTRIES } from "@/lib/countries"

interface PageProps {
  searchParams: Promise<{ q?: string; country?: string }>
}

export default async function ClubsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.q || ""
  const country = params.country || ""

  const clubs = await getClubs(search, country)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            Clubes
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Biblioteca permanente · {clubs.length} club{clubs.length !== 1 ? "es" : ""} registrado{clubs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/clubs/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Agregar club
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
        <select
          name="country"
          defaultValue={country}
          className="px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 text-sm"
        >
          <option value="">Todos los países</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-ghost px-5 py-2.5 text-sm">
          Filtrar
        </button>
      </form>

      {clubs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-1">
            {search || country ? "No se encontraron clubes con esos filtros" : "Aún no hay clubes registrados"}
          </p>
          {!search && !country && (
            <Link href="/admin/clubs/new" className="inline-flex items-center gap-1.5 text-cyan-400 text-sm mt-3 hover:underline">
              <Plus className="w-3.5 h-3.5" />
              Agregar el primero
            </Link>
          )}
        </div>
      ) : (
        <ClubsTable clubs={clubs} />
      )}
    </div>
  )
}
