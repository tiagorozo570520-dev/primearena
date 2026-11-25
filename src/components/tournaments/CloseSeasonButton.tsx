"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { closeSeason } from "@/lib/actions/season"

export function CloseSeasonButton({ tournamentId }: { tournamentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClose() {
    if (
      !confirm(
        "¿Cerrar la temporada?\n\nSe marcarán ascensos y descensos según el reglamento y el torneo pasará a Finalizado."
      )
    ) {
      return
    }

    setLoading(true)
    const result = await closeSeason(tournamentId)
    setLoading(false)

    if (result.error) {
      alert(result.error)
      return
    }

    alert(result.summary || "Temporada cerrada.")
    router.refresh()
  }

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="btn-primary text-sm disabled:opacity-50"
    >
      {loading ? "Cerrando..." : "Cerrar temporada"}
    </button>
  )
}
