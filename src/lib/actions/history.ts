"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function finishTournament(params: {
  tournamentId: string
  championParticipantId: string
  runnerUpParticipantId?: string | null
}): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: tournament, error: tErr } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", params.tournamentId)
    .single()

  if (tErr || !tournament) {
    return { error: "Torneo no encontrado" }
  }

  // Load champion / runner-up display data
  const { data: champion } = await supabase
    .from("tournament_participants")
    .select("*")
    .eq("id", params.championParticipantId)
    .single()

  if (!champion) {
    return { error: "Campeón no válido" }
  }

  let runnerUp = null
  if (params.runnerUpParticipantId) {
    const { data } = await supabase
      .from("tournament_participants")
      .select("*")
      .eq("id", params.runnerUpParticipantId)
      .single()
    runnerUp = data
  }

  // Update tournament status
  const { error: uErr } = await supabase
    .from("tournaments")
    .update({
      status: "finished",
      champion_id: params.championParticipantId,
      runner_up_id: params.runnerUpParticipantId || null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", params.tournamentId)

  if (uErr) {
    return { error: uErr.message || "Error al finalizar el torneo" }
  }

  // Insert historical record
  const { error: hErr } = await supabase.from("historical_champions").insert({
    tournament_id: params.tournamentId,
    tournament_name: tournament.name,
    season_label: tournament.name,
    champion_participant_id: champion.id,
    champion_name: champion.display_name,
    champion_crest_url: champion.crest_url || champion.photo_url,
    runner_up_participant_id: runnerUp?.id || null,
    runner_up_name: runnerUp?.display_name || null,
    runner_up_crest_url: runnerUp?.crest_url || runnerUp?.photo_url || null,
    finished_at: new Date().toISOString(),
  })

  if (hErr) {
    console.error("historical insert:", hErr)
    // non-fatal for status update
  }

  revalidatePath(`/admin/tournaments/${params.tournamentId}`)
  revalidatePath("/admin/tournaments")
  revalidatePath("/admin/history")
  revalidatePath("/admin")
  return { success: true }
}

export async function getHistoricalChampions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("historical_champions")
    .select("*")
    .order("finished_at", { ascending: false })

  if (error) {
    console.error("getHistoricalChampions:", error)
    return []
  }

  return data || []
}

export async function getDashboardStats() {
  const supabase = await createClient()

  const [players, clubs, teams, tournaments, active, finished] = await Promise.all([
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("clubs").select("id", { count: "exact", head: true }),
    supabase.from("national_teams").select("id", { count: "exact", head: true }),
    supabase.from("tournaments").select("id", { count: "exact", head: true }),
    supabase.from("tournaments").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("tournaments").select("id", { count: "exact", head: true }).eq("status", "finished"),
  ])

  return {
    players: players.count ?? 0,
    clubs: clubs.count ?? 0,
    nationalTeams: teams.count ?? 0,
    tournaments: tournaments.count ?? 0,
    activeTournaments: active.count ?? 0,
    finishedTournaments: finished.count ?? 0,
  }
}

export async function getRecentTournaments(limit = 5) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("tournaments")
    .select("id, name, status, competition_type, logo_url, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  return data || []
}
