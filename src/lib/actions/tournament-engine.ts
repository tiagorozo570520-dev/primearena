"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  generateCustomGroups,
  generateRoundRobin,
  generateKnockoutCup,
  generateLeagueToQuarters,
  generateChampionsLeague36,
  generatePrimeLeague,
  generatePrimeChampions,
  generatePrimeQualifiers,
  type ParticipantRef,
} from "@/lib/tournament-engine"

export async function generateTournamentStructure(params: {
  tournamentId: string
  // For custom format:
  numberOfGroups?: number
  shuffle?: boolean
  twoLegs?: boolean
}): Promise<{ success?: boolean; error?: string; matchesCreated?: number }> {
  const supabase = await createClient()

  // Load tournament
  const { data: tournament, error: tErr } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", params.tournamentId)
    .single()

  if (tErr || !tournament) {
    return { error: "Torneo no encontrado" }
  }

  // Load participants
  const { data: participants, error: pErr } = await supabase
    .from("tournament_participants")
    .select("id, display_name")
    .eq("tournament_id", params.tournamentId)

  if (pErr || !participants || participants.length < 2) {
    return { error: "Se necesitan al menos 2 participantes para generar la estructura" }
  }

  const refs: ParticipantRef[] = participants.map((p) => ({
    id: p.id,
    display_name: p.display_name,
  }))

  // Clear existing matches and standings for this tournament
  await supabase.from("matches").delete().eq("tournament_id", params.tournamentId)
  await supabase.from("standings").delete().eq("tournament_id", params.tournamentId)

  // Clear group assignments
  await supabase
    .from("tournament_participants")
    .update({ group_name: null })
    .eq("tournament_id", params.tournamentId)

  let result
  try {
    switch (tournament.competition_type) {
      case "custom": {
        const nGroups = params.numberOfGroups || 2
        result = generateCustomGroups({
          participants: refs,
          numberOfGroups: nGroups,
          shuffleParticipants: params.shuffle !== false,
          twoLegs: params.twoLegs === true,
        })
        break
      }
      case "round_robin":
        result = generateRoundRobin({ participants: refs, twoLegs: params.twoLegs === true })
        break
      case "knockout_cup":
        result = generateKnockoutCup({ participants: refs, shuffleSeeds: true })
        break
      case "league_to_quarters":
        result = generateLeagueToQuarters({ participants: refs })
        break
      case "champions_league_36":
        result = generateChampionsLeague36({ participants: refs })
        break
      case "prime_league_d1":
        result = generatePrimeLeague({ participants: refs, division: 1 })
        break
      case "prime_league_d2":
        result = generatePrimeLeague({ participants: refs, division: 2 })
        break
      case "prime_champions":
        result = generatePrimeChampions({ participants: refs })
        break
      case "prime_qualifiers":
        result = generatePrimeQualifiers({ participants: refs })
        break
      default:
        return { error: `Formato no soportado: ${tournament.competition_type}` }
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al generar estructura" }
  }

  // Assign groups to participants
  for (const g of result.groups) {
    for (const pid of g.participant_ids) {
      await supabase
        .from("tournament_participants")
        .update({ group_name: g.name })
        .eq("id", pid)
    }
  }

  // Insert matches
  if (result.matches.length > 0) {
    const rows = result.matches.map((m) => ({
      tournament_id: params.tournamentId,
      round_name: m.round_name,
      round_order: m.round_order,
      match_number: m.match_number,
      home_participant_id: m.home_participant_id,
      away_participant_id: m.away_participant_id,
      leg: m.leg,
      status: "scheduled" as const,
    }))

    const { error: mErr } = await supabase.from("matches").insert(rows)
    if (mErr) {
      console.error("insert matches error:", mErr)
      return { error: mErr.message || "Error al guardar partidos" }
    }
  }

  // Insert standings rows
  if (result.standings_participant_ids.length > 0) {
    const standingsRows = result.standings_participant_ids.map((pid) => ({
      tournament_id: params.tournamentId,
      participant_id: pid,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
    }))

    const { error: sErr } = await supabase.from("standings").insert(standingsRows)
    if (sErr) {
      console.error("insert standings error:", sErr)
      // non-fatal
    }
  }

  revalidatePath(`/admin/tournaments/${params.tournamentId}`)
  return { success: true, matchesCreated: result.matches.length }
}
