"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

const playerSchema = z.object({
  gamertag: z.string().min(2, "Gamertag debe tener al menos 2 caracteres").max(50),
  real_name: z.string().max(100).optional().nullable(),
  platform: z.enum(["PlayStation", "Xbox", "PC"]),
  country_code: z.string().length(2, "Código de país inválido"),
  country_name: z.string().min(2),
  photo_url: z.string().url().optional().nullable().or(z.literal("")),
})

export type PlayerFormState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createPlayer(
  _prevState: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  const raw = {
    gamertag: formData.get("gamertag") as string,
    real_name: (formData.get("real_name") as string) || null,
    platform: formData.get("platform") as string,
    country_code: (formData.get("country_code") as string)?.toUpperCase(),
    country_name: formData.get("country_name") as string,
    photo_url: (formData.get("photo_url") as string) || null,
  }

  const parsed = playerSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  // Check duplicate gamertag
  const { data: existing } = await supabase
    .from("players")
    .select("id")
    .eq("gamertag", parsed.data.gamertag)
    .maybeSingle()

  if (existing) {
    return { error: "Ya existe un jugador con ese gamertag" }
  }

  const { error } = await supabase.from("players").insert({
    gamertag: parsed.data.gamertag,
    real_name: parsed.data.real_name || null,
    platform: parsed.data.platform,
    country_code: parsed.data.country_code,
    country_name: parsed.data.country_name,
    photo_url: parsed.data.photo_url || null,
  })

  if (error) {
    console.error("createPlayer error:", error)
    return { error: error.message || "Error al crear el jugador" }
  }

  revalidatePath("/admin/players")
  return { success: true }
}

export async function updatePlayer(
  id: string,
  _prevState: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  const raw = {
    gamertag: formData.get("gamertag") as string,
    real_name: (formData.get("real_name") as string) || null,
    platform: formData.get("platform") as string,
    country_code: (formData.get("country_code") as string)?.toUpperCase(),
    country_name: formData.get("country_name") as string,
    photo_url: (formData.get("photo_url") as string) || null,
  }

  const parsed = playerSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  // Check duplicate gamertag (excluding current player)
  const { data: existing } = await supabase
    .from("players")
    .select("id")
    .eq("gamertag", parsed.data.gamertag)
    .neq("id", id)
    .maybeSingle()

  if (existing) {
    return { error: "Ya existe otro jugador con ese gamertag" }
  }

  const { error } = await supabase
    .from("players")
    .update({
      gamertag: parsed.data.gamertag,
      real_name: parsed.data.real_name || null,
      platform: parsed.data.platform,
      country_code: parsed.data.country_code,
      country_name: parsed.data.country_name,
      photo_url: parsed.data.photo_url || null,
    })
    .eq("id", id)

  if (error) {
    console.error("updatePlayer error:", error)
    return { error: error.message || "Error al actualizar el jugador" }
  }

  revalidatePath("/admin/players")
  revalidatePath(`/admin/players/${id}`)
  return { success: true }
}

export async function deletePlayer(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("players").delete().eq("id", id)

  if (error) {
    console.error("deletePlayer error:", error)
    return { error: error.message || "Error al eliminar el jugador" }
  }

  revalidatePath("/admin/players")
  return { success: true }
}

export async function getPlayers(search?: string, country?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("players")
    .select("*")
    .order("gamertag", { ascending: true })

  if (search) {
    query = query.ilike("gamertag", `%${search}%`)
  }

  if (country) {
    query = query.eq("country_code", country.toUpperCase())
  }

  const { data, error } = await query

  if (error) {
    console.error("getPlayers error:", error)
    return []
  }

  return data || []
}

export async function getPlayerById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("getPlayerById error:", error)
    return null
  }

  return data
}
