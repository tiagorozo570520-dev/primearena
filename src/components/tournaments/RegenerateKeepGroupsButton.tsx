"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { regenerateMatchesKeepGroups } from "@/lib/actions/tournament-engine"

export function RegenerateKeepGroupsButton({ tournamentId }: { tournamentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (
      !confirm(
        "¿Regenerar partidos manteniendo los grupos actuales?\n\nSe borrarán los partidos y resultados existentes, pero los grupos que asignaste se respetan."
      )
    ) {
      return
    }

    setLoading(true)
    const result = await regenerateMatchesKeepGroups(tournamentId)
    setLoading(false)

    if (result.error) {
      alert(result.error)
      return
    }

    alert("Partidos regenerados respetando los grupos.")
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-ghost text-sm disabled:opacity-50"
    >
      {loading ? "Regenerando..." : "Regenerar partidos (mantener grupos)"}
    </button>
  )
}
