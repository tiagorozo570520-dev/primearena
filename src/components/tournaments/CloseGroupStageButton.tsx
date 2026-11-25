"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { closeGroupStageAndAdvance, closeChampionsGroupStage } from "@/lib/actions/advance"

interface Props {
  tournamentId: string
  competitionType: string
}

export function CloseGroupStageButton({ tournamentId, competitionType }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClose() {
    const isChampions = competitionType === "prime_champions"
    const msg = isChampions
      ? "¿Cerrar fase de grupos y avanzar a cuartos?\n\nSe tomarán los 2 primeros de cada grupo."
      : "¿Cerrar fase de grupos y avanzar a cuartos?\n\nSe tomarán los 4 primeros de cada grupo con el cruce oficial."

    if (!confirm(msg)) return

    setLoading(true)
    const result = isChampions
      ? await closeChampionsGroupStage(tournamentId)
      : await closeGroupStageAndAdvance(tournamentId)
    setLoading(false)

    if (result.error) {
      alert(result.error)
      return
    }

    alert("Fase de grupos cerrada. Eliminatorias generadas.")
    router.refresh()
  }

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="btn-ghost text-sm disabled:opacity-50"
    >
      {loading ? "Cerrando..." : "Cerrar grupos y avanzar"}
    </button>
  )
}
