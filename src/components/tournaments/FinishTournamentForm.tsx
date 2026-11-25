"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy } from "lucide-react"
import { finishTournament } from "@/lib/actions/history"
import type { TournamentParticipant } from "@/types/database"

interface FinishTournamentFormProps {
  tournamentId: string
  participants: TournamentParticipant[]
  currentStatus: string
}

export function FinishTournamentForm({
  tournamentId,
  participants,
  currentStatus,
}: FinishTournamentFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [championId, setChampionId] = useState("")
  const [runnerUpId, setRunnerUpId] = useState("")
  const [loading, setLoading] = useState(false)

  if (currentStatus === "finished" || currentStatus === "archived") {
    return null
  }

  async function handleFinish() {
    if (!championId) {
      alert("Debes seleccionar un campeón")
      return
    }

    if (
      !confirm(
        "¿Finalizar el torneo?\n\nSe declarará el campeón y el torneo pasará al historial. Esta acción marca el torneo como Finalizado."
      )
    ) {
      return
    }

    setLoading(true)
    const result = await finishTournament({
      tournamentId,
      championParticipantId: championId,
      runnerUpParticipantId: runnerUpId || null,
    })
    setLoading(false)

    if (result.error) {
      alert(result.error)
      return
    }

    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">
        <Trophy className="w-4 h-4" />
        Finalizar torneo
      </button>
    )
  }

  return (
    <div className="glass rounded-xl p-5 space-y-4 border border-cyan-500/20">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Trophy className="w-4 h-4 text-cyan-400" />
        Declarar campeón y finalizar
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
            Campeón *
          </label>
          <select
            value={championId}
            onChange={(e) => setChampionId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">Seleccionar...</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
            Subcampeón
          </label>
          <select
            value={runnerUpId}
            onChange={(e) => setRunnerUpId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">Ninguno</option>
            {participants
              .filter((p) => p.id !== championId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleFinish}
          disabled={loading || !championId}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {loading ? "Finalizando..." : "Confirmar y finalizar"}
        </button>
        <button onClick={() => setOpen(false)} className="btn-ghost text-sm">
          Cancelar
        </button>
      </div>
    </div>
  )
}
