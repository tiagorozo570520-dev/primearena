"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Flag } from "lucide-react"
import type { NationalTeam } from "@/types/database"
import { deleteNationalTeam } from "@/lib/actions/national-teams"
import { useState } from "react"

interface NationalTeamsTableProps {
  teams: NationalTeam[]
}

export function NationalTeamsTable({ teams }: NationalTeamsTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la selección "${name}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    setDeletingId(id)
    const result = await deleteNationalTeam(id)
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
                Selección
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                Nombre corto
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                País
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {team.crest_url || team.flag_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={team.crest_url || team.flag_url || ""}
                          alt={team.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Flag className="w-5 h-5 text-amber-400/70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{team.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-300">
                  {team.short_name}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-slate-300">{team.country_name}</span>
                  <span className="text-slate-600 ml-1.5 text-xs">({team.country_code})</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/national-teams/${team.id}/edit`}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(team.id, team.name)}
                      disabled={deletingId === team.id}
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
