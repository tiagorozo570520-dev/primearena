"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { setParticipantGroup } from "@/lib/actions/tournaments"

interface Props {
  participantId: string
  tournamentId: string
  currentGroup: string | null
}

export function ChangeGroupButton({ participantId, tournamentId, currentGroup }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function change(group: string | null) {
    setLoading(true)
    const result = await setParticipantGroup(participantId, tournamentId, group)
    setLoading(false)
    if (result.error) {
      alert(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-500 mr-1">{currentGroup ? `Grupo ${currentGroup}` : "Sin grupo"}</span>
      <button
        onClick={() => change("A")}
        disabled={loading || currentGroup === "A"}
        className="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 text-cyan-400 disabled:opacity-40"
      >
        A
      </button>
      <button
        onClick={() => change("B")}
        disabled={loading || currentGroup === "B"}
        className="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 text-cyan-400 disabled:opacity-40"
      >
        B
      </button>
    </div>
  )
}
