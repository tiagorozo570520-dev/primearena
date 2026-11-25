"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

/**
 * Close group stage and advance top 4 of each group to quarters
 * with correct seeding: 1st A vs 4th B, 2nd B vs 3rd A, 1st B vs 4th A, 2nd A vs 3rd B
 */
export async function closeGroupStageAndAdvance(tournamentId: string): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = await createClient()

  // Get current standings with group info
  const { data: standings } = await supabase
    .from("standings")
    .select("*, tournament_participants(display_name, group_name)")
    .eq("tournament_id", tournamentId)

  if (!standings || standings.length === 0) {
    return { error: "No hay clasificación para avanzar" }
  }

  // Group by group_name and sort by points → GD → GF
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

  const groups = Array.from(byGroup.keys()).sort()
  if (groups.length < 2) {
    return { error: "Se necesitan al menos 2 grupos para avanzar a cuartos" }
  }

  // Top 4 of each group (in order: 1st, 2nd, 3rd, 4th)
  const top: Record<string, string[]> = {}
  for (const g of groups) {
    const list = byGroup.get(g) || []
    top[g] = list.slice(0, 4).map((s) => s.participant_id)
  }

  const [gA, gB] = groups

  // Official pairings
  const pairings: [string | undefined, string | undefined][] = [
    [top[gA]?.[0], top[gB]?.[3]], // 1A vs 4B
    [top[gB]?.[1], top[gA]?.[2]], // 2B vs 3A
    [top[gB]?.[0], top[gA]?.[3]], // 1B vs 4A
    [top[gA]?.[1], top[gB]?.[2]], // 2A vs 3B
  ]

  // Find quarter-final matches (round_order = 10)
  const { data: quarters } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("round_order", 10)
    .order("match_number", { ascending: true })

  if (!quarters || quarters.length < 8) {
    return { error: "No se encontraron suficientes partidos de cuartos" }
  }

  // Clear existing quarter assignments
  for (const q of quarters) {
    await supabase
      .from("matches")
      .update({ home_participant_id: null, away_participant_id: null })
      .eq("id", q.id)
  }

  // Fill pairings (each pairing = 2 legs)
  let qIdx = 0
  for (const [home, away] of pairings) {
    if (!home || !away) continue

    // Leg 1
    if (quarters[qIdx]) {
      await supabase
        .from("matches")
        .update({ home_participant_id: home, away_participant_id: away })
        .eq("id", quarters[qIdx].id)
    }
    qIdx++

    // Leg 2 (swap home/away)
    if (quarters[qIdx]) {
      await supabase
        .from("matches")
        .update({ home_participant_id: away, away_participant_id: home })
        .eq("id", quarters[qIdx].id)
    }
    qIdx++
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`)
  return { success: true }
}


/**
 * Close group stage for Champions Arena
 * Top 2 of each of the 4 groups advance to quarters
 */
export async function closeChampionsGroupStage(tournamentId: string): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = await createClient()

  const { data: standings } = await supabase
    .from("standings")
    .select("*, tournament_participants(display_name, group_name)")
    .eq("tournament_id", tournamentId)

  if (!standings || standings.length === 0) {
    return { error: "No hay clasificación" }
  }

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

  const groups = Array.from(byGroup.keys()).sort()
  if (groups.length < 4) {
    return { error: "Se necesitan 4 grupos" }
  }

  // Top 2 of each group: [1st, 2nd]
  const top: Record<string, string[]> = {}
  for (const g of groups) {
    const list = byGroup.get(g) || []
    top[g] = list.slice(0, 2).map((s) => s.participant_id)
  }

  // Cross groups: 1A vs 2B, 1B vs 2C, 1C vs 2D, 1D vs 2A
  const g = groups
  const pairings: [string, string][] = [
    [top[g[0]]?.[0], top[g[1]]?.[1]], // 1A vs 2B
    [top[g[1]]?.[0], top[g[2]]?.[1]], // 1B vs 2C
    [top[g[2]]?.[0], top[g[3]]?.[1]], // 1C vs 2D
    [top[g[3]]?.[0], top[g[0]]?.[1]], // 1D vs 2A
  ].filter((p) => p[0] && p[1]) as [string, string][]

  const { data: quarters } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("round_order", 10)
    .order("match_number", { ascending: true })

  if (!quarters || quarters.length < 8) {
    return { error: "No se encontraron partidos de cuartos" }
  }

  // Clear and fill
  for (const q of quarters) {
    await supabase
      .from("matches")
      .update({ home_participant_id: null, away_participant_id: null })
      .eq("id", q.id)
  }

  let qIdx = 0
  for (const [home, away] of pairings) {
    if (quarters[qIdx]) {
      await supabase
        .from("matches")
        .update({ home_participant_id: home, away_participant_id: away })
        .eq("id", quarters[qIdx].id)
    }
    qIdx++
    if (quarters[qIdx]) {
      await supabase
        .from("matches")
        .update({ home_participant_id: away, away_participant_id: home })
        .eq("id", quarters[qIdx].id)
    }
    qIdx++
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`)
  return { success: true }
}
