"use client"

import { ChangeGroupButton } from "./ChangeGroupButton"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus, Trash2, Search } from "lucide-react"
import type { TournamentParticipant } from "@/types/database"
import {
  addParticipantToTournament,
  removeParticipant,
} from "@/lib/actions/tournaments"

interface AvailableEntity {
  id: string
  name: string
  short_name?: string | null
  crest_url?: string | null
  photo_url?: string | null
  country_code?: string | null
}

interface ParticipantsManagerProps {
  tournamentId: string
  participantType: "players" | "clubs" | "national_teams"
  participants: TournamentParticipant[]
  available: AvailableEntity[]
}

export function ParticipantsManager({
  tournamentId,
  participantType,
  participants,
  available,
}: ParticipantsManagerProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = available.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAdd(entity: AvailableEntity) {
    setLoading(entity.id)
    const result = await addParticipantToTournament({
      tournamentId,
      participantType,
      entityId: entity.id,
      displayName: entity.name,
      shortName: entity.short_name,
      crestUrl: entity.crest_url,
      photoUrl: entity.photo_url,
      countryCode: entity.country_code,
    })
    setLoading(null)

    if (result.error) {
      alert(result.error)
      return
    }

    router.refresh()
  }

  async function handleRemove(participantId: string, name: string) {
    if (!confirm(`¿Quitar a "${name}" del torneo?`)) return

    setLoading(participantId)
    const result = await removeParticipant(participantId, tournamentId)
    setLoading(null)

    if (result.error) {
      alert(result.error)
      return
    }

    router.refresh()
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Current participants */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">
          Inscritos ({participants.length})
        </h2>
        {participants.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Ningún participante inscrito todavía
          </p>
        ) : (
          <ul className="space-y-2 max-h-[480px] overflow-y-auto">
            {participants.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-black/30 border border-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {p.crest_url || p.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.crest_url || p.photo_url || ""}
                        alt={p.display_name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-500">
                        {p.display_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-white truncate">{p.display_name}</span>
                </div>
                <ChangeGroupButton
                  participantId={p.id}
                  tournamentId={tournamentId}
                  currentGroup={p.group_name}
                />
                <button
                  onClick={() => handleRemove(p.id, p.display_name)}
                  disabled={loading === p.id}
                  className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Available to add */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">
          Agregar desde biblioteca
        </h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            {available.length === 0
              ? "No hay más elementos disponibles en la biblioteca"
              : "No se encontraron resultados"}
          </p>
        ) : (
          <ul className="space-y-2 max-h-[420px] overflow-y-auto">
            {filtered.map((entity) => (
              <li
                key={entity.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-cyan-500/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {entity.crest_url || entity.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={entity.crest_url || entity.photo_url || ""}
                        alt={entity.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-500">
                        {entity.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-white truncate">{entity.name}</span>
                </div>
                <button
                  onClick={() => handleAdd(entity)}
                  disabled={loading === entity.id}
                  className="p-1.5 rounded-md text-cyan-400 hover:bg-cyan-500/10 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
