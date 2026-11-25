"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { registerMatchResult } from "@/lib/actions/matches"

interface Props {
  matchId: string
  tournamentId: string
  homeName: string
  awayName: string
  currentHomeScore?: number | null
  currentAwayScore?: number | null
  status: string
}

export function MatchResultForm({
  matchId,
  tournamentId,
  homeName,
  awayName,
  currentHomeScore,
  currentAwayScore,
  status,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [home, setHome] = useState(currentHomeScore ?? 0)
  const [away, setAway] = useState(currentAwayScore ?? 0)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const fd = new FormData()
    fd.set("home_score", String(home))
    fd.set("away_score", String(away))

    // Optimistic: close form immediately
    setOpen(false)

    startTransition(async () => {
      const result = await registerMatchResult(matchId, tournamentId, {}, fd)
      if (result.error) {
        alert(result.error)
      }
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20"
      >
        {status === "finished" ? "Editar" : "Resultado"}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={home}
        onChange={(e) => setHome(Number(e.target.value))}
        className="w-12 px-1.5 py-1 rounded bg-black/60 border border-white/10 text-white text-center text-sm"
      />
      <span className="text-slate-500">-</span>
      <input
        type="number"
        min={0}
        value={away}
        onChange={(e) => setAway(Number(e.target.value))}
        className="w-12 px-1.5 py-1 rounded bg-black/60 border border-white/10 text-white text-center text-sm"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className="btn-primary py-1 px-3 text-xs disabled:opacity-50"
      >
        {isPending ? "..." : "OK"}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-slate-500">
        X
      </button>
    </div>
  )
}
