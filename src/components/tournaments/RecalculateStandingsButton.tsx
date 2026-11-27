"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { recalculateStandings } from "@/lib/actions/matches"

export function RecalculateStandingsButton({ tournamentId }: { tournamentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!confirm("¿Recalcular la tabla de posiciones?\n\nSe reconstruye a partir de los resultados actuales. No se borra nada.")) {
      return
    }
    setLoading(true)
    const result = await recalculateStandings(tournamentId)
    setLoading(false)
    if (result.error) {
      alert(result.error)
      return
    }
    alert("Tabla recalculada.")
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-ghost text-sm disabled:opacity-50"
    >
      {loading ? "Recalculando..." : "Recalcular tabla"}
    </button>
  )
}
