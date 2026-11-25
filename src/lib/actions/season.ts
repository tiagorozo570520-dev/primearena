"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

/**
 * Close season for a PRIME LEAGUE tournament
 * - D1: last of each group relegated
 * - D2: last of each group expelled + champion & runner-up promoted
 */
export async function closeSeason(tournamentId: string): Promise<{
  success?: boolean
  error?: string
  summary?: string
}> {
  const supabase = await createClient()

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .single()

  if (!tournament) return { error: "Torneo no encontrado" }

  const type = tournament.competition_type
  if (type !== "prime_league_d1" && type !== "prime_league_d2") {
    return { error: "Solo disponible para PRIME LEAGUE" }
  }

  // Get final standings
  const { data: standings } = await supabase
    .from("standings")
    .select("*, tournament_participants(display_name, group_name, player_id)")
    .eq("tournament_id", tournamentId)

  if (!standings) return { error: "No hay clasificación" }

  const byGroup = new Map<string, any[]>()
  for (const s of standings) {
    const g = s.tournament_participants?.group_name
    if (!g) continue
    const list = byGroup.get(g) || []
    list.push(s)
    byGroup.set(g, list)
  }

  for (const [, list] of byGroup) {
    list.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const gdA = (a.goals_for || 0) - (a.goals_against || 0)
      const gdB = (b.goals_for || 0) - (b.goals_against || 0)
      if (gdB !== gdA) return gdB - gdA
      return (b.goals_for || 0) - (a.goals_for || 0)
    })
  }

  const relegated: string[] = []
  const promoted: string[] = []

  if (type === "prime_league_d1") {
    // Last of each group relegated
    for (const [, list] of byGroup) {
      if (list.length > 0) {
        const last = list[list.length - 1]
        relegated.push(last.tournament_participants?.display_name || "Desconocido")
      }
    }
  }

  if (type === "prime_league_d2") {
    // Last of each group expelled
    for (const [, list] of byGroup) {
      if (list.length > 0) {
        const last = list[list.length - 1]
        relegated.push(last.tournament_participants?.display_name || "Desconocido")
      }
    }
    // Champion and runner-up promoted (from final if exists, otherwise top 2 overall)
    // For simplicity: top 2 of the whole competition (or from final)
    const allSorted = [...standings].sort((a, b) => b.points - a.points)
    if (allSorted.length >= 2) {
      promoted.push(allSorted[0].tournament_participants?.display_name || "")
      promoted.push(allSorted[1].tournament_participants?.display_name || "")
    }
  }

  // Mark tournament as finished
  await supabase
    .from("tournaments")
    .update({ status: "finished", finished_at: new Date().toISOString() })
    .eq("id", tournamentId)

  const summary = [
    type === "prime_league_d1" ? "División 1 cerrada." : "División 2 cerrada.",
    relegated.length ? `Descienden / Expulsados: ${relegated.join(", ")}` : "",
    promoted.length ? `Ascienden: ${promoted.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" ")

  revalidatePath(`/admin/tournaments/${tournamentId}`)
  revalidatePath("/admin/tournaments")
  return { success: true, summary }
}
