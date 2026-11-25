"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Gamepad2 } from "lucide-react"
import type { Player } from "@/types/database"
import { deletePlayer } from "@/lib/actions/players"
import { useState } from "react"

interface PlayersTableProps {
  players: Player[]
}

const platformColors: Record<string, string> = {
  PlayStation: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Xbox: "text-green-400 bg-green-500/10 border-green-500/20",
  PC: "text-orange-400 bg-orange-500/10 border-orange-500/20",
}

export function PlayersTable({ players }: PlayersTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, gamertag: string) {
    if (!confirm(`¿Eliminar al jugador "${gamertag}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    setDeletingId(id)
    const result = await deletePlayer(id)
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
                Jugador
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                Plataforma
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                País
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                Registro
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0">
                      {player.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={player.photo_url}
                          alt={player.gamertag}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <Gamepad2 className="w-4 h-4 text-cyan-400/70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{player.gamertag}</div>
                      {player.real_name && (
                        <div className="text-xs text-slate-500 truncate">{player.real_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                      platformColors[player.platform] || "text-slate-400 bg-slate-500/10"
                    }`}
                  >
                    {player.platform}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-slate-300">{player.country_name}</span>
                  <span className="text-slate-600 ml-1.5 text-xs">({player.country_code})</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                  {new Date(player.registered_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/players/${player.id}/edit`}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(player.id, player.gamertag)}
                      disabled={deletingId === player.id}
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
