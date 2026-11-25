"use server"

import { createClient } from "@/lib/supabase/server"

export async function getPublicTournament(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data
}

export async function getPublicParticipants(tournamentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("tournament_participants")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("display_name")
  return data || []
}

export async function getPublicMatches(tournamentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("round_order")
    .order("match_number")
  return data || []
}

export async function getPublicStandings(tournamentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("standings")
    .select("*, tournament_participants(display_name, crest_url, short_name, group_name)")
    .eq("tournament_id", tournamentId)
    .order("points", { ascending: false })
    .order("goal_difference", { ascending: false })
    .order("goals_for", { ascending: false })
  return data || []
}

export async function getPublicTournaments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("tournaments")
    .select("id, name, status, competition_type, logo_url, banner_url, start_date, end_date, participant_type")
    .in("status", ["upcoming", "active", "finished"])
    .order("created_at", { ascending: false })
  return data || []
}
