"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerMatchResult } from "@/lib/actions/matches"

interface ResultsManagerProps {
  tournamentId: string
  rounds: [string, any[]][]
  nameById: Record<string, string>
}

export function ResultsManager({ tournamentId, rounds, nameById }: ResultsManagerProps) {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)

  async function saveResult(matchId: string, homeScore: number, awayScore: number) {
    setSaving(matchId)
    const formData = new FormData()
    formData.set("home_score", String(homeScore))
    formData.set("away_score", String(awayScore))
    const result = await registerMatchResult(matchId, tournamentId, {}, formData)
    setSaving(null)
    if (result.error) {
      alert(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {rounds.map(([roundName, matches]) => (
        <div key={roundName} className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-sm font-semibold text-cyan-400">{roundName}</h2>
          </div>
          <div className="divide-y divide-white/5">
            {matches.map((m) => {
              const home = m.home_participant_id ? nameById[m.home_participant_id] || "TBD" : "TBD"
              const away = m.away_participant_id ? nameById[m.away_participant_id] || "TBD" : "TBD"
              const canEdit = !!m.home_participant_id && !!m.away_participant_id

              return (
                <div key={m.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
                    <div className="flex-1 text-right text-white truncate">{home}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      {canEdit ? (
                        <>
                          <input
                            type="number"
                            min={0}
                            defaultValue={m.home_score ?? ""}
                            id={`h-${m.id}`}
                            className="w-14 px-2 py-1.5 rounded bg-black/50 border border-white/10 text-white text-center text-sm"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            type="number"
                            min={0}
                            defaultValue={m.away_score ?? ""}
                            id={`a-${m.id}`}
                            className="w-14 px-2 py-1.5 rounded bg-black/50 border border-white/10 text-white text-center text-sm"
                          />
                        </>
                      ) : (
                        <span className="text-slate-500 text-sm">vs</span>
                      )}
                    </div>
                    <div className="flex-1 text-left text-white truncate">{away}</div>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => {
                        const h = document.getElementById(`h-${m.id}`) as HTMLInputElement
                        const a = document.getElementById(`a-${m.id}`) as HTMLInputElement
                        const hs = Number(h.value)
                        const as = Number(a.value)
                        if (Number.isNaN(hs) || Number.isNaN(as)) return
                        saveResult(m.id, hs, as)
                      }}
                      disabled={saving === m.id}
                      className="btn-primary text-xs px-4 py-2 disabled:opacity-50 shrink-0"
                    >
                      {saving === m.id ? "..." : m.status === "finished" ? "Actualizar" : "Guardar"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
