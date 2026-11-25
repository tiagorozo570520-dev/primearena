"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Shield } from "lucide-react"
import type { Club } from "@/types/database"
import { deleteClub } from "@/lib/actions/clubs"
import { useState } from "react"

interface ClubsTableProps {
  clubs: Club[]
}

export function ClubsTable({ clubs }: ClubsTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar el club "${name}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    setDeletingId(id)
    const result = await deleteClub(id)
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
                Club
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
            {clubs.map((club) => (
              <tr key={club.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {club.crest_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={club.crest_url}
                          alt={club.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Shield className="w-5 h-5 text-emerald-400/70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{club.name}</div>
                      {club.full_name && (
                        <div className="text-xs text-slate-500 truncate">{club.full_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-300">
                  {club.short_name}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-slate-300">{club.country_name}</span>
                  <span className="text-slate-600 ml-1.5 text-xs">({club.country_code})</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/clubs/${club.id}/edit`}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(club.id, club.name)}
                      disabled={deletingId === club.id}
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
