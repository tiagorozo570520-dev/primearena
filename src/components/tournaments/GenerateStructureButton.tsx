"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wand2 } from "lucide-react"
import { generateTournamentStructure } from "@/lib/actions/tournament-engine"

interface GenerateStructureButtonProps {
  tournamentId: string
  competitionType: string
  participantsCount: number
}

export function GenerateStructureButton({
  tournamentId,
  competitionType,
  participantsCount,
}: GenerateStructureButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [numberOfGroups, setNumberOfGroups] = useState(2)
  const [twoLegs, setTwoLegs] = useState(false)

  const showGroups = competitionType === "custom"
  const showTwoLegs = competitionType === "custom" || competitionType === "round_robin" || competitionType === "league_to_quarters"

  async function handleGenerate() {
    if (participantsCount < 2) {
      alert("Necesitas al menos 2 participantes")
      return
    }

    if (competitionType === "champions_league_36" && participantsCount !== 36) {
      alert("Champions League actual requiere exactamente 36 participantes")
      return
    }

    const legsLabel = twoLegs ? "ida y vuelta" : "solo ida"
    const msg =
      competitionType === "custom"
        ? `¿Generar ${numberOfGroups} grupos con los ${participantsCount} participantes (${legsLabel})?\n\nSe borrarán partidos y clasificaciones existentes de este torneo.`
        : `¿Generar la estructura del torneo (${legsLabel})?\n\nSe borrarán partidos y clasificaciones existentes de este torneo.`

    if (!confirm(msg)) return

    setLoading(true)
    const result = await generateTournamentStructure({
      tournamentId,
      numberOfGroups: competitionType === "custom" ? numberOfGroups : undefined,
      shuffle: true,
      twoLegs,
    })
    setLoading(false)

    if (result.error) {
      alert(result.error)
      return
    }

    alert(`Estructura generada: ${result.matchesCreated} partidos creados.`)
    router.refresh()
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
      {showGroups && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Grupos:</label>
          <input
            type="number"
            min={1}
            max={Math.max(1, Math.floor(participantsCount / 2))}
            value={numberOfGroups}
            onChange={(e) => setNumberOfGroups(Number(e.target.value) || 1)}
            className="w-16 px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      )}

      {showTwoLegs && (
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={twoLegs}
            onChange={(e) => setTwoLegs(e.target.checked)}
            className="rounded border-white/20"
          />
          Ida y vuelta
        </label>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || participantsCount < 2}
        className="btn-primary text-sm disabled:opacity-50"
      >
        <Wand2 className="w-4 h-4" />
        {loading ? "Generando..." : "Generar estructura"}
      </button>
    </div>
  )
}
