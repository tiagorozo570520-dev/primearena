"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerMatchResult } from "@/lib/actions/matches"

interface Match {
  id: string
  round_name: string
  round_order: number
  match_number: number | null
  home_participant_id: string | null
  away_participant_id: string | null
  home_score: number | null
  away_score: number | null
  status: string
  leg: number
}

interface BracketViewProps {
  matches: Match[]
  nameById: Record<string, string>
  tournamentId: string
}

export function BracketView({ matches, nameById, tournamentId }: BracketViewProps) {
  const router = useRouter()
  const [activeRound, setActiveRound] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState<string | null>(null)

  const knockout = matches.filter((m) => m.round_order >= 10)
  if (knockout.length === 0) return null

  const rounds = new Map<string, Match[]>()
  for (const m of knockout) {
    const list = rounds.get(m.round_name) || []
    list.push(m)
    rounds.set(m.round_name, list)
  }

  const roundNames = Array.from(rounds.keys())
  const current = activeRound || roundNames[0]

  function groupIntoTies(list: Match[]) {
    const ties: Match[][] = []
    const used = new Set<string>()
    for (const m of list) {
      if (used.has(m.id) || !m.home_participant_id || !m.away_participant_id) continue
      const key = [m.home_participant_id, m.away_participant_id].sort().join("|")
      const tie = list.filter(
        (x) =>
          x.home_participant_id &&
          x.away_participant_id &&
          [x.home_participant_id, x.away_participant_id].sort().join("|") === key
      )
      tie.forEach((x) => used.add(x.id))
      if (tie.length) ties.push(tie)
    }
    return ties
  }

  const currentMatches = rounds.get(current) || []
  let ties = groupIntoTies(currentMatches)

  // Filter by search (partial names with space)
  if (search.trim()) {
    const terms = search.toLowerCase().split(/\\s+/).filter(Boolean)
    ties = ties.filter((tie) => {
      const names = [
        nameById[tie[0].home_participant_id || ""] || "",
        nameById[tie[0].away_participant_id || ""] || "",
      ].map((n) => n.toLowerCase())
      return terms.every((term) => names.some((n) => n.includes(term)))
    })
  }

  async function save(matchId: string, homeScore: number, awayScore: number) {
    setSaving(matchId)
    const fd = new FormData()
    fd.set("home_score", String(homeScore))
    fd.set("away_score", String(awayScore))
    const res = await registerMatchResult(matchId, tournamentId, {}, fd)
    setSaving(null)
    if (res.error) alert(res.error)
    else router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cruce (ej: sanj wose)"
          className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 text-sm"
        />
      </div>

      {/* Round tabs */}
      <div className="flex flex-wrap gap-2">
        {roundNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveRound(name)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              current === name
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "bg-white/5 text-slate-400 border border-white/5 hover:border-white/10"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Ties */}
      {ties.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No se encontraron cruces</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ties.map((tie, idx) => {
            const m1 = tie[0]
            const m2 = tie[1]
            const home = nameById[m1.home_participant_id || ""] || "TBD"
            const away = nameById[m1.away_participant_id || ""] || "TBD"

            let aggHome = 0
            let aggAway = 0
            for (const m of tie) {
              if (m.home_participant_id === m1.home_participant_id) {
                aggHome += m.home_score || 0
                aggAway += m.away_score || 0
              } else {
                aggHome += m.away_score || 0
                aggAway += m.home_score || 0
              }
            }
            const finished = tie.every((m) => m.status === "finished")

            return (
              <div key={idx} className="glass rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-2">Cruce {idx + 1}</div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex-1 text-right text-sm font-medium text-white truncate">{home}</div>
                  <div className="text-slate-500 text-xs">vs</div>
                  <div className="flex-1 text-left text-sm font-medium text-white truncate">{away}</div>
                </div>
                {finished && (
                  <div className="text-center text-sm font-semibold text-cyan-400 mb-3">
                    Global: {aggHome} - {aggAway}
                  </div>
                )}
                <div className="space-y-2 text-xs">
                  {tie.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <span className="text-slate-500 w-12">{i === 0 ? "Ida" : "Vuelta"}</span>
                      <input
                        type="number"
                        min={0}
                        defaultValue={m.home_score ?? ""}
                        id={`h-${m.id}`}
                        className="w-12 px-1 py-1 rounded bg-black/50 border border-white/10 text-white text-center"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        min={0}
                        defaultValue={m.away_score ?? ""}
                        id={`a-${m.id}`}
                        className="w-12 px-1 py-1 rounded bg-black/50 border border-white/10 text-white text-center"
                      />
                      <button
                        onClick={() => {
                          const h = document.getElementById(`h-${m.id}`) as HTMLInputElement
                          const a = document.getElementById(`a-${m.id}`) as HTMLInputElement
                          const hs = Number(h.value)
                          const as = Number(a.value)
                          if (!Number.isNaN(hs) && !Number.isNaN(as)) save(m.id, hs, as)
                        }}
                        disabled={saving === m.id}
                        className="ml-auto text-[11px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 disabled:opacity-50"
                      >
                        {saving === m.id ? "..." : "OK"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
