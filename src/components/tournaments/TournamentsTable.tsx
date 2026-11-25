"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Trophy, Users } from "lucide-react"
import type { Tournament } from "@/types/database"
import { deleteTournament } from "@/lib/actions/tournaments"
import { useState } from "react"

interface TournamentsTableProps {
  tournaments: Tournament[]
}

const statusColors: Record<string, string> = {
  draft: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  upcoming: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  paused: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  finished: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  archived: "text-slate-500 bg-slate-500/10 border-slate-500/20",
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  upcoming: "Próximo",
  active: "Activo",
  paused: "Pausado",
  finished: "Finalizado",
  archived: "Archivado",
}

const formatLabels: Record<string, string> = {
  prime_league_d1: "PRIME LEAGUE D1",
  prime_league_d2: "PRIME LEAGUE D2",
  prime_champions: "CHAMPIONS ARENA",
  prime_qualifiers: "QUALIFIERS",
  champions_league_36: "Champions 36",
  knockout_cup: "Copa",
  round_robin: "Liga",
  league_to_quarters: "Liga + Cuartos",
  custom: "Personalizado",
}

export function TournamentsTable({ tournaments }: TournamentsTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `¿Eliminar el torneo "${name}"?\n\nSe eliminarán también participantes, partidos y clasificaciones asociados.\nEsta acción no se puede deshacer.`
      )
    ) {
      return
    }

    setDeletingId(id)
    const result = await deleteTournament(id)
    setDeletingId(null)

    if (result.error) {
      alert(result.error)
      return
    }

    router.refresh()
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Torneo
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                Formato
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                Estado
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tournaments.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/tournaments/${t.id}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {t.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.logo_url} alt={t.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Trophy className="w-5 h-5 text-cyan-400/70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                        {t.name}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {t.participant_type === "clubs"
                          ? "Clubes"
                          : t.participant_type === "national_teams"
                          ? "Selecciones"
                          : "Jugadores"}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-400 text-xs">
                  {formatLabels[t.competition_type] || t.competition_type}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                      statusColors[t.status] || statusColors.draft
                    }`}
                  >
                    {statusLabels[t.status] || t.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/tournaments/${t.id}/participants`}
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Participantes"
                    >
                      <Users className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/tournaments/${t.id}/edit`}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      disabled={deletingId === t.id}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
