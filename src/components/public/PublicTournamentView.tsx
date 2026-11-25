"use client"

import { useState } from "react"
import { TreeBracket } from "@/components/tournaments/TreeBracket"

interface Match {
  id: string
  round_name: string
  round_order: number
  home_participant_id: string | null
  away_participant_id: string | null
  home_score: number | null
  away_score: number | null
  status: string
  leg: number
}

interface Props {
  matches: Match[]
  standings: any[]
  nameById: Record<string, string>
  hasKnockout: boolean
  knockoutActive: boolean
}

export function PublicTournamentView({ matches, standings, nameById, hasKnockout, knockoutActive }: Props) {
  const defaultTab = knockoutActive ? "knockout" : "groups"
  const [tab, setTab] = useState<"knockout" | "groups">(defaultTab)

  // Group matches
  const leagueMatches = matches.filter((m) => m.round_order < 10)
  const knockoutMatches = matches.filter((m) => m.round_order >= 10)

  const leagueRounds = new Map<string, Match[]>()
  for (const m of leagueMatches) {
    const list = leagueRounds.get(m.round_name) || []
    list.push(m)
    leagueRounds.set(m.round_name, list)
  }

  // Knockout ties
  function groupTies(list: Match[]) {
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

  const knockoutRounds = new Map<string, Match[]>()
  for (const m of knockoutMatches) {
    const list = knockoutRounds.get(m.round_name) || []
    list.push(m)
    knockoutRounds.set(m.round_name, list)
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        {hasKnockout && (
          <button
            onClick={() => setTab("knockout")}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "knockout"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Eliminatorias
          </button>
        )}
        <button
          onClick={() => setTab("groups")}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === "groups"
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Fase de grupos
        </button>
      </div>

      {/* Content */}
      {tab === "knockout" && hasKnockout && (
        <div className="space-y-6">
          <TreeBracket matches={matches} nameById={nameById} />
          {Array.from(knockoutRounds.entries()).map(([roundName, list]) => {
            const ties = groupTies(list)
            return (
              <div key={roundName}>
                <h3 className="text-sm font-semibold text-cyan-400 mb-3">{roundName}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ties.map((tie, idx) => {
                    const m1 = tie[0]
                    const home = nameById[m1.home_participant_id || ""] || "TBD"
                    const away = nameById[m1.away_participant_id || ""] || "TBD"
                    let aggH = 0, aggA = 0
                    for (const m of tie) {
                      if (m.home_participant_id === m1.home_participant_id) {
                        aggH += m.home_score || 0
                        aggA += m.away_score || 0
                      } else {
                        aggH += m.away_score || 0
                        aggA += m.home_score || 0
                      }
                    }
                    const finished = tie.every((m) => m.status === "finished")
                    return (
                      <div key={idx} className="premium-card rounded-xl p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex-1 text-right text-white truncate">{home}</div>
                          <div className="text-slate-500 text-xs">vs</div>
                          <div className="flex-1 text-left text-white truncate">{away}</div>
                        </div>
                        {finished && (
                          <div className="text-center text-sm font-semibold text-cyan-400 mt-2">
                            {aggH} - {aggA}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === "groups" && (
        <div className="space-y-6">
          {/* Standings by group */}
          {standings.length > 0 && (() => {
            const byGroup = new Map<string, any[]>()
            let hasGroups = false
            for (const s of standings) {
              const g = s.tournament_participants?.group_name
              if (g) {
                hasGroups = true
                const list = byGroup.get(g) || []
                list.push(s)
                byGroup.set(g, list)
              } else {
                const list = byGroup.get("_all") || []
                list.push(s)
                byGroup.set("_all", list)
              }
            }
            const entries = hasGroups
              ? Array.from(byGroup.entries()).filter(([k]) => k !== "_all").sort(([a], [b]) => a.localeCompare(b))
              : [["_all", standings] as [string, any[]]]

            return (
              <div className={hasGroups ? "grid lg:grid-cols-2 gap-4" : ""}>
                {entries.map(([gName, rows]) => (
                  <div key={gName} className="premium-card rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/5">
                      <h3 className="text-sm font-semibold text-cyan-400">
                        {gName === "_all" ? "Clasificación" : `Grupo ${gName}`}
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-500 border-b border-white/5">
                            <th className="px-4 py-2">#</th>
                            <th className="px-4 py-2">Equipo</th>
                            <th className="px-4 py-2 text-center">PJ</th>
                            <th className="px-4 py-2 text-center">Pts</th>
                            <th className="px-4 py-2 text-center">DG</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {rows.map((s: any, idx: number) => (
                            <tr key={s.id}>
                              <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                              <td className="px-4 py-2 text-white">{s.tournament_participants?.display_name || "—"}</td>
                              <td className="px-4 py-2 text-center text-slate-400">{s.played}</td>
                              <td className="px-4 py-2 text-center font-semibold text-cyan-400">{s.points}</td>
                              <td className="px-4 py-2 text-center text-slate-400">{s.goal_difference}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Matches */}
          {Array.from(leagueRounds.entries()).map(([roundName, list]) => (
            <div key={roundName} className="premium-card rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-cyan-400">{roundName}</h3>
              </div>
              <ul className="divide-y divide-white/5">
                {list.map((m) => (
                  <li key={m.id} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
                    <div className="flex-1 text-right text-white truncate">
                      {m.home_participant_id ? nameById[m.home_participant_id] || "TBD" : "TBD"}
                    </div>
                    <div className="px-3 py-1 rounded bg-black/40 text-slate-300 text-xs font-mono min-w-[60px] text-center">
                      {m.status === "finished" ? `${m.home_score ?? 0} - ${m.away_score ?? 0}` : "vs"}
                    </div>
                    <div className="flex-1 text-left text-white truncate">
                      {m.away_participant_id ? nameById[m.away_participant_id] || "TBD" : "TBD"}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
