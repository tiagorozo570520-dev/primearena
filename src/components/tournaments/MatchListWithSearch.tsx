"use client"

import { useState } from "react"
import { MatchResultForm } from "./MatchResultForm"

interface Match {
  id: string
  round_name: string
  round_order: number
  home_participant_id: string | null
  away_participant_id: string | null
  home_score: number | null
  away_score: number | null
  status: string
}

interface Props {
  matches: Match[]
  nameById: Record<string, string>
  tournamentId: string
}

export function MatchListWithSearch({ matches, nameById, tournamentId }: Props) {
  const [search, setSearch] = useState("")

  // Only show group / league matches (round_order < 10)
  const leagueMatches = matches.filter((m) => m.round_order < 10)

  const filtered = search.trim()
    ? leagueMatches.filter((m) => {
        const terms = search.toLowerCase().split(/\\s+/).filter(Boolean)
        const names = [
          nameById[m.home_participant_id || ""] || "",
          nameById[m.away_participant_id || ""] || "",
        ].map((n) => n.toLowerCase())
        return terms.every((term) => names.some((n) => n.includes(term)))
      })
    : leagueMatches

  // Group by round
  const rounds = new Map<string, Match[]>()
  for (const m of filtered) {
    const list = rounds.get(m.round_name) || []
    list.push(m)
    rounds.set(m.round_name, list)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar partido (ej: sanj wose)"
          className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No se encontraron partidos</p>
      ) : (
        Array.from(rounds.entries()).map(([roundName, list]) => (
          <div key={roundName} className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-cyan-400">{roundName}</h3>
            </div>
            <ul className="divide-y divide-white/5">
              {list.map((m) => {
                const home = m.home_participant_id ? nameById[m.home_participant_id] || "TBD" : "TBD"
                const away = m.away_participant_id ? nameById[m.away_participant_id] || "TBD" : "TBD"
                const canResult = !!m.home_participant_id && !!m.away_participant_id

                return (
                  <li key={m.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4 flex-1 min-w-0">
                      <div className="flex-1 text-right text-white truncate">{home}</div>
                      <div className="px-3 py-1 rounded bg-black/40 text-slate-400 text-xs font-mono min-w-[60px] text-center shrink-0">
                        {m.status === "finished" ? `${m.home_score ?? 0} - ${m.away_score ?? 0}` : "vs"}
                      </div>
                      <div className="flex-1 text-left text-white truncate">{away}</div>
                    </div>
                    {canResult && (
                      <MatchResultForm
                        matchId={m.id}
                        tournamentId={tournamentId}
                        homeName={home}
                        awayName={away}
                        currentHomeScore={m.home_score}
                        currentAwayScore={m.away_score}
                        status={m.status}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
