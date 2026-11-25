"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const nationalTeamSchema = z.object({
  name: z.string().min(2).max(100),
  short_name: z.string().min(1).max(20),
  country_code: z.string().min(2).max(3),
  country_name: z.string().min(2),
  flag_url: z.string().url().optional().nullable().or(z.literal("")),
  crest_url: z.string().url().optional().nullable().or(z.literal("")),
})

export type NationalTeamFormState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createNationalTeam(
  _prevState: NationalTeamFormState,
  formData: FormData
): Promise<NationalTeamFormState> {
  const raw = {
    name: formData.get("name") as string,
    short_name: formData.get("short_name") as string,
    country_code: (formData.get("country_code") as string)?.toUpperCase(),
    country_name: formData.get("country_name") as string,
    flag_url: (formData.get("flag_url") as string) || null,
    crest_url: (formData.get("crest_url") as string) || null,
  }

  const parsed = nationalTeamSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  // Check duplicate country_code
  const { data: existing } = await supabase
    .from("national_teams")
    .select("id")
    .eq("country_code", parsed.data.country_code)
    .maybeSingle()

  if (existing) {
    return { error: "Ya existe una selección con ese código de país" }
  }

  const { error } = await supabase.from("national_teams").insert({
    name: parsed.data.name,
    short_name: parsed.data.short_name,
    country_code: parsed.data.country_code,
    country_name: parsed.data.country_name,
    flag_url: parsed.data.flag_url || null,
    crest_url: parsed.data.crest_url || null,
  })

  if (error) {
    console.error("createNationalTeam error:", error)
    return { error: error.message || "Error al crear la selección" }
  }

  revalidatePath("/admin/national-teams")
  return { success: true }
}

export async function updateNationalTeam(
  id: string,
  _prevState: NationalTeamFormState,
  formData: FormData
): Promise<NationalTeamFormState> {
  const raw = {
    name: formData.get("name") as string,
    short_name: formData.get("short_name") as string,
    country_code: (formData.get("country_code") as string)?.toUpperCase(),
    country_name: formData.get("country_name") as string,
    flag_url: (formData.get("flag_url") as string) || null,
    crest_url: (formData.get("crest_url") as string) || null,
  }

  const parsed = nationalTeamSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("national_teams")
    .select("id")
    .eq("country_code", parsed.data.country_code)
    .neq("id", id)
    .maybeSingle()

  if (existing) {
    return { error: "Ya existe otra selección con ese código de país" }
  }

  const { error } = await supabase
    .from("national_teams")
    .update({
      name: parsed.data.name,
      short_name: parsed.data.short_name,
      country_code: parsed.data.country_code,
      country_name: parsed.data.country_name,
      flag_url: parsed.data.flag_url || null,
      crest_url: parsed.data.crest_url || null,
    })
    .eq("id", id)

  if (error) {
    console.error("updateNationalTeam error:", error)
    return { error: error.message || "Error al actualizar la selección" }
  }

  revalidatePath("/admin/national-teams")
  return { success: true }
}

export async function deleteNationalTeam(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("national_teams").delete().eq("id", id)

  if (error) {
    console.error("deleteNationalTeam error:", error)
    return { error: error.message || "Error al eliminar la selección" }
  }

  revalidatePath("/admin/national-teams")
  return { success: true }
}

export async function getNationalTeams(search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("national_teams")
    .select("*")
    .order("name", { ascending: true })

  if (search) {
    query = query.or(`name.ilike.%${search}%,short_name.ilike.%${search}%,country_name.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("getNationalTeams error:", error)
    return []
  }

  return data || []
}

export async function getNationalTeamById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("national_teams")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("getNationalTeamById error:", error)
    return null
  }

  return data
}
