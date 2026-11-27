"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const tournamentSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  competition_type: z.enum([
    "champions_league_36",
    "knockout_cup",
    "round_robin",
    "league_to_quarters",
    "custom",
    "prime_league_d1",
    "prime_league_d2",
    "prime_champions",
    "prime_qualifiers",
  ]),
  category: z.string().max(50).optional().nullable(),
  status: z.enum(["draft", "upcoming", "active", "paused", "finished", "archived"]),
  participant_type: z.enum(["players", "clubs", "national_teams"]),
  max_participants: z.coerce.number().int().positive().optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal("")),
  banner_url: z.string().url().optional().nullable().or(z.literal("")),
  cover_url: z.string().url().optional().nullable().or(z.literal("")),
  background_url: z.string().url().optional().nullable().or(z.literal("")),
  promo_url: z.string().url().optional().nullable().or(z.literal("")),
})

export type TournamentFormState = {
  success?: boolean
  error?: string
  tournamentId?: string
  fieldErrors?: Record<string, string[]>
}

export async function createTournament(
  _prevState: TournamentFormState,
  formData: FormData
): Promise<TournamentFormState> {
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    competition_type: formData.get("competition_type") as string,
    category: (formData.get("category") as string) || null,
    status: (formData.get("status") as string) || "draft",
    participant_type: formData.get("participant_type") as string,
    max_participants: formData.get("max_participants")
      ? Number(formData.get("max_participants"))
      : null,
    logo_url: (formData.get("logo_url") as string) || null,
    banner_url: (formData.get("banner_url") as string) || null,
    cover_url: (formData.get("cover_url") as string) || null,
    background_url: (formData.get("background_url") as string) || null,
    promo_url: (formData.get("promo_url") as string) || null,
  }

  const parsed = tournamentSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      competition_type: parsed.data.competition_type,
      category: parsed.data.category,
      status: parsed.data.status,
      participant_type: parsed.data.participant_type,
      max_participants: parsed.data.max_participants,
      logo_url: parsed.data.logo_url || null,
      banner_url: parsed.data.banner_url || null,
      cover_url: parsed.data.cover_url || null,
      background_url: parsed.data.background_url || null,
      promo_url: parsed.data.promo_url || null,
    })
    .select("id")
    .single()

  if (error) {
    console.error("createTournament error:", error)
    return { error: error.message || "Error al crear el torneo" }
  }

  revalidatePath("/admin/tournaments")
  return { success: true, tournamentId: data.id }
}

export async function updateTournament(
  id: string,
  _prevState: TournamentFormState,
  formData: FormData
): Promise<TournamentFormState> {
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    competition_type: formData.get("competition_type") as string,
    category: (formData.get("category") as string) || null,
    status: (formData.get("status") as string) || "draft",
    participant_type: formData.get("participant_type") as string,
    max_participants: formData.get("max_participants")
      ? Number(formData.get("max_participants"))
      : null,
    logo_url: (formData.get("logo_url") as string) || null,
    banner_url: (formData.get("banner_url") as string) || null,
    cover_url: (formData.get("cover_url") as string) || null,
    background_url: (formData.get("background_url") as string) || null,
    promo_url: (formData.get("promo_url") as string) || null,
  }

  const parsed = tournamentSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("tournaments")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      start_date: parsed.data.start_date || null,
      end_date: parsed.data.end_date || null,
      competition_type: parsed.data.competition_type,
      category: parsed.data.category,
      status: parsed.data.status,
      participant_type: parsed.data.participant_type,
      max_participants: parsed.data.max_participants,
      logo_url: parsed.data.logo_url || null,
      banner_url: parsed.data.banner_url || null,
      cover_url: parsed.data.cover_url || null,
      background_url: parsed.data.background_url || null,
      promo_url: parsed.data.promo_url || null,
    })
    .eq("id", id)

  if (error) {
    console.error("updateTournament error:", error)
    return { error: error.message || "Error al actualizar el torneo" }
  }

  revalidatePath("/admin/tournaments")
  revalidatePath(`/admin/tournaments/${id}`)
  return { success: true, tournamentId: id }
}

export async function deleteTournament(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("tournaments").delete().eq("id", id)

  if (error) {
    console.error("deleteTournament error:", error)
    return { error: error.message || "Error al eliminar el torneo" }
  }

  revalidatePath("/admin/tournaments")
  return { success: true }
}

export async function getTournaments(status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    console.error("getTournaments error:", error)
    return []
  }

  return data || []
}

export async function getTournamentById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("getTournamentById error:", error)
    return null
  }

  return data
}

export async function getTournamentParticipants(tournamentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tournament_participants")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("display_name", { ascending: true })

  if (error) {
    console.error("getTournamentParticipants error:", error)
    return []
  }

  return data || []
}

export async function addParticipantToTournament(params: {
  tournamentId: string
  participantType: "players" | "clubs" | "national_teams"
  entityId: string
  displayName: string
  shortName?: string | null
  crestUrl?: string | null
  photoUrl?: string | null
  countryCode?: string | null
}) {
  const supabase = await createClient()

  const insertData: Record<string, unknown> = {
    tournament_id: params.tournamentId,
    display_name: params.displayName,
    short_name: params.shortName || null,
    crest_url: params.crestUrl || null,
    photo_url: params.photoUrl || null,
    country_code: params.countryCode || null,
  }

  if (params.participantType === "players") {
    insertData.player_id = params.entityId
  } else if (params.participantType === "clubs") {
    insertData.club_id = params.entityId
  } else {
    insertData.national_team_id = params.entityId
  }

  const { error } = await supabase.from("tournament_participants").insert(insertData)

  if (error) {
    console.error("addParticipant error:", error)
    return { error: error.message || "Error al agregar participante" }
  }

  revalidatePath(`/admin/tournaments/${params.tournamentId}`)
  revalidatePath(`/admin/tournaments/${params.tournamentId}/participants`)
  return { success: true }
}

export async function removeParticipant(participantId: string, tournamentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tournament_participants")
    .delete()
    .eq("id", participantId)

  if (error) {
    console.error("removeParticipant error:", error)
    return { error: error.message || "Error al quitar participante" }
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`)
  revalidatePath(`/admin/tournaments/${tournamentId}/participants`)
  return { success: true }
}


export async function getTournamentMatches(tournamentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("round_order", { ascending: true })
    .order("match_number", { ascending: true })

  if (error) {
    console.error("getTournamentMatches error:", error)
    return []
  }

  return data || []
}

export async function getTournamentStandings(tournamentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("standings")
    .select("*, tournament_participants(display_name, crest_url, short_name, group_name)")
    .eq("tournament_id", tournamentId)
    .order("points", { ascending: false })
    .order("goal_difference", { ascending: false })
    .order("goals_for", { ascending: false })

  if (error) {
    console.error("getTournamentStandings error:", error)
    return []
  }

  return data || []
}

export async function setParticipantGroup(
  participantId: string,
  tournamentId: string,
  groupName: string | null
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tournament_participants")
    .update({ group_name: groupName || null })
    .eq("id", participantId)

  if (error) {
    console.error("setParticipantGroup:", error)
    return { error: error.message || "Error al asignar grupo" }
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`)
  revalidatePath(`/admin/tournaments/${tournamentId}/participants`)
  return { success: true }
}
