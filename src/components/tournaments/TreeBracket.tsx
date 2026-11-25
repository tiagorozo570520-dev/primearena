"use client"

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
  nameById: Record<string, string>
}

export function TreeBracket({ matches, nameById }: Props) {
  const knockout = matches.filter((m) => m.round_order >= 10)
  if (knockout.length === 0) return null

  // Group by round order
  const byRound = new Map<number, Match[]>()
  for (const m of knockout) {
    const list = byRound.get(m.round_order) || []
    list.push(m)
    byRound.set(m.round_order, list)
  }

  const orders = Array.from(byRound.keys()).sort((a, b) => a - b)

  function getTies(list: Match[]) {
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

  return (
    <div className="overflow-x-auto">
      <div className="flex items-stretch gap-6 min-w-max py-4">
        {orders.map((order) => {
          const list = byRound.get(order) || []
          const ties = getTies(list)
          const name = list[0]?.round_name || ""

          return (
            <div key={order} className="flex flex-col justify-center gap-4 w-56">
              <div className="text-center text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                {name}
              </div>
              <div className="flex flex-col justify-around flex-1 gap-4">
                {ties.map((tie, i) => {
                  const m = tie[0]
                  const home = nameById[m.home_participant_id || ""] || "TBD"
                  const away = nameById[m.away_participant_id || ""] || "TBD"
                  let h = 0, a = 0
                  for (const mm of tie) {
                    if (mm.home_participant_id === m.home_participant_id) {
                      h += mm.home_score || 0
                      a += mm.away_score || 0
                    } else {
                      h += mm.away_score || 0
                      a += mm.home_score || 0
                    }
                  }
                  const done = tie.every((x) => x.status === "finished")

                  return (
                    <div key={i} className="premium-card rounded-xl p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate text-white font-medium">{home}</span>
                        {done && <span className="text-cyan-400 font-bold ml-2">{h}</span>}
                      </div>
                      <div className="my-1.5 border-t border-white/5" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate text-white font-medium">{away}</span>
                        {done && <span className="text-cyan-400 font-bold ml-2">{a}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
