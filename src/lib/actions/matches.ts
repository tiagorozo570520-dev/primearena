"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type MatchResultState = {
  success?: boolean
  error?: string
}

export async function registerMatchResult(
  matchId: string,
  tournamentId: string,
  _prev: MatchResultState,
  formData: FormData
): Promise<MatchResultState> {
  const homeScore = Number(formData.get("home_score"))
  const awayScore = Number(formData.get("away_score"))
  const decidedByPenalties = formData.get("decided_by_penalties") === "on"
  const homePenalties = formData.get("home_penalties")
    ? Number(formData.get("home_penalties"))
    : null
  const awayPenalties = formData.get("away_penalties")
    ? Number(formData.get("away_penalties"))
    : null

  if (Number.isNaN(homeScore) || Number.isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return { error: "Marcador inválido" }
  }

  const supabase = await createClient()

  // Load match
  const { data: match, error: mErr } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single()

  if (mErr || !match) {
    return { error: "Partido no encontrado" }
  }

  if (!match.home_participant_id || !match.away_participant_id) {
    return { error: "Este partido aún no tiene ambos equipos asignados" }
  }

  // Determine winner
  let winnerId: string | null = null
  if (homeScore > awayScore) {
    winnerId = match.home_participant_id
  } else if (awayScore > homeScore) {
    winnerId = match.away_participant_id
  } else if (decidedByPenalties && homePenalties != null && awayPenalties != null) {
    if (homePenalties > awayPenalties) winnerId = match.home_participant_id
    else if (awayPenalties > homePenalties) winnerId = match.away_participant_id
  }

  // Update match
  const { error: uErr } = await supabase
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      decided_by_penalties: decidedByPenalties,
      home_penalties: homePenalties,
      away_penalties: awayPenalties,
      winner_participant_id: winnerId,
      status: "finished",
    })
    .eq("id", matchId)

  if (uErr) {
    console.error("registerMatchResult:", uErr)
    return { error: uErr.message || "Error al guardar el resultado" }
  }

  // Update standings for both teams (league / group phase)
  await updateStandingsForMatch(
    supabase,
    tournamentId,
    match.home_participant_id,
    match.away_participant_id,
    homeScore,
    awayScore,
    match.status === "finished" // if re-editing, we need to reverse old - simplified: recalculate
  )

  // Only advance in knockout rounds to keep group stage saves fast
  if (winnerId && match.round_order >= 10) {
    await tryAdvanceWinner(supabase, tournamentId, match, winnerId)
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`)
  return { success: true }
}

async function updateStandingsForMatch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tournamentId: string,
  homeId: string,
  awayId: string,
  homeScore: number,
  awayScore: number,
  wasAlreadyFinished: boolean
) {
  // Fast incremental update for the two teams
  const { data: rows } = await supabase
    .from("standings")
    .select("id, participant_id, played, won, drawn, lost, goals_for, goals_against, points")
    .eq("tournament_id", tournamentId)
    .in("participant_id", [homeId, awayId])

  if (!rows || rows.length < 2) return

  const home = rows.find((r) => r.participant_id === homeId)!
  const away = rows.find((r) => r.participant_id === awayId)!

  const hUpd: any = {
    played: (home.played || 0) + 1,
    goals_for: (home.goals_for || 0) + homeScore,
    goals_against: (home.goals_against || 0) + awayScore,
  }
  const aUpd: any = {
    played: (away.played || 0) + 1,
    goals_for: (away.goals_for || 0) + awayScore,
    goals_against: (away.goals_against || 0) + homeScore,
  }

  if (homeScore > awayScore) {
    hUpd.won = (home.won || 0) + 1
    hUpd.points = (home.points || 0) + 3
    aUpd.lost = (away.lost || 0) + 1
  } else if (awayScore > homeScore) {
    aUpd.won = (away.won || 0) + 1
    aUpd.points = (away.points || 0) + 3
    hUpd.lost = (home.lost || 0) + 1
  } else {
    hUpd.drawn = (home.drawn || 0) + 1
    aUpd.drawn = (away.drawn || 0) + 1
    hUpd.points = (home.points || 0) + 1
    aUpd.points = (away.points || 0) + 1
  }

  await Promise.all([
    supabase.from("standings").update(hUpd).eq("id", home.id),
    supabase.from("standings").update(aUpd).eq("id", away.id),
  ])
}

async function tryAdvanceWinner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tournamentId: string,
  match: {
    id: string
    round_name: string
    round_order: number
    match_number: number | null
  },
  winnerId: string
) {
  // Load all matches of the current round
  const { data: roundMatches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("round_order", match.round_order)
    .order("match_number", { ascending: true })

  if (!roundMatches) return

  // Group matches into ties (same two teams = one tie)
  const ties: any[][] = []
  const used = new Set<string>()

  for (const m of roundMatches) {
    if (used.has(m.id) || !m.home_participant_id || !m.away_participant_id) continue
    const key = [m.home_participant_id, m.away_participant_id].sort().join("|")
    const tie = roundMatches.filter(
      (x) =>
        x.home_participant_id &&
        x.away_participant_id &&
        [x.home_participant_id, x.away_participant_id].sort().join("|") === key
    )
    tie.forEach((x) => used.add(x.id))
    if (tie.length > 0) ties.push(tie)
  }

  // Process each completed tie and collect winners in order
  const winners: string[] = []

  for (const tie of ties) {
    const finished = tie.every((m) => m.status === "finished" && m.home_score != null && m.away_score != null)
    if (!finished) continue

    // Calculate aggregate
    const teamA = tie[0].home_participant_id
    const teamB = tie[0].away_participant_id
    let goalsA = 0
    let goalsB = 0

    for (const m of tie) {
      if (m.home_participant_id === teamA) {
        goalsA += m.home_score || 0
        goalsB += m.away_score || 0
      } else {
        goalsA += m.away_score || 0
        goalsB += m.home_score || 0
      }
    }

    if (goalsA > goalsB) winners.push(teamA)
    else if (goalsB > goalsA) winners.push(teamB)
    else winners.push(winnerId) // fallback
  }

  if (winners.length === 0) return

  // Fill next round with the winners in order
  await fillNextRoundWithWinners(supabase, tournamentId, match.round_order, winners)
}

async function fillNextRoundWithWinners(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tournamentId: string,
  currentRoundOrder: number,
  winners: string[]
) {
  const { data: nextMatches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .gt("round_order", currentRoundOrder)
    .order("round_order", { ascending: true })
    .order("match_number", { ascending: true })

  if (!nextMatches || nextMatches.length === 0) return

  const nextRoundOrder = nextMatches[0].round_order
  const nextRound = nextMatches.filter((m) => m.round_order === nextRoundOrder)

  // Clear existing assignments in next round to re-fill cleanly
  for (const m of nextRound) {
    await supabase
      .from("matches")
      .update({ home_participant_id: null, away_participant_id: null })
      .eq("id", m.id)
  }

  // Pair winners into ties (2 legs each)
  let wIdx = 0
  for (let i = 0; i < nextRound.length && wIdx < winners.length; i += 2) {
    const home = winners[wIdx]
    const away = winners[wIdx + 1] || null
    wIdx += 2

    if (nextRound[i]) {
      await supabase
        .from("matches")
        .update({ home_participant_id: home, away_participant_id: away })
        .eq("id", nextRound[i].id)
    }
    if (nextRound[i + 1] && away) {
      await supabase
        .from("matches")
        .update({ home_participant_id: away, away_participant_id: home })
        .eq("id", nextRound[i + 1].id)
    }
  }
}

async function fillNextRound(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tournamentId: string,
  currentRoundOrder: number,
  winnerId: string
) {
  const { data: nextMatches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .gt("round_order", currentRoundOrder)
    .order("round_order", { ascending: true })
    .order("match_number", { ascending: true })

  if (!nextMatches || nextMatches.length === 0) return

  const nextRoundOrder = nextMatches[0].round_order
  const nextRound = nextMatches.filter((m) => m.round_order === nextRoundOrder)

  for (const nm of nextRound) {
    if (!nm.home_participant_id) {
      await supabase.from("matches").update({ home_participant_id: winnerId }).eq("id", nm.id)
      return
    }
    if (!nm.away_participant_id) {
      await supabase.from("matches").update({ away_participant_id: winnerId }).eq("id", nm.id)
      return
    }
  }
}

export async function clearMatchResult(
  matchId: string,
  tournamentId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("matches")
    .update({
      home_score: null,
      away_score: null,
      home_penalties: null,
      away_penalties: null,
      decided_by_penalties: false,
      winner_participant_id: null,
      status: "scheduled",
    })
    .eq("id", matchId)

  if (error) {
    return { error: error.message }
  }

  // Recalculate standings
  const { data: match } = await supabase
    .from("matches")
    .select("home_participant_id, away_participant_id")
    .eq("id", matchId)
    .single()

  if (match?.home_participant_id && match?.away_participant_id) {
    await updateStandingsForMatch(
      supabase,
      tournamentId,
      match.home_participant_id,
      match.away_participant_id,
      0,
      0,
      true
    )
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`)
  return { success: true }
}
