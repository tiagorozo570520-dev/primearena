"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const clubSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  short_name: z.string().min(1).max(20),
  full_name: z.string().max(150).optional().nullable(),
  country_code: z.string().length(2, "Código de país inválido"),
  country_name: z.string().min(2),
  crest_url: z.string().url().optional().nullable().or(z.literal("")),
})

export type ClubFormState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createClub(
  _prevState: ClubFormState,
  formData: FormData
): Promise<ClubFormState> {
  const raw = {
    name: formData.get("name") as string,
    short_name: formData.get("short_name") as string,
    full_name: (formData.get("full_name") as string) || null,
    country_code: (formData.get("country_code") as string)?.toUpperCase(),
    country_name: formData.get("country_name") as string,
    crest_url: (formData.get("crest_url") as string) || null,
  }

  const parsed = clubSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.from("clubs").insert({
    name: parsed.data.name,
    short_name: parsed.data.short_name,
    full_name: parsed.data.full_name || null,
    country_code: parsed.data.country_code,
    country_name: parsed.data.country_name,
    crest_url: parsed.data.crest_url || null,
  })

  if (error) {
    console.error("createClub error:", error)
    return { error: error.message || "Error al crear el club" }
  }

  revalidatePath("/admin/clubs")
  return { success: true }
}

export async function updateClub(
  id: string,
  _prevState: ClubFormState,
  formData: FormData
): Promise<ClubFormState> {
  const raw = {
    name: formData.get("name") as string,
    short_name: formData.get("short_name") as string,
    full_name: (formData.get("full_name") as string) || null,
    country_code: (formData.get("country_code") as string)?.toUpperCase(),
    country_name: formData.get("country_name") as string,
    crest_url: (formData.get("crest_url") as string) || null,
  }

  const parsed = clubSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("clubs")
    .update({
      name: parsed.data.name,
      short_name: parsed.data.short_name,
      full_name: parsed.data.full_name || null,
      country_code: parsed.data.country_code,
      country_name: parsed.data.country_name,
      crest_url: parsed.data.crest_url || null,
    })
    .eq("id", id)

  if (error) {
    console.error("updateClub error:", error)
    return { error: error.message || "Error al actualizar el club" }
  }

  revalidatePath("/admin/clubs")
  revalidatePath(`/admin/clubs/${id}`)
  return { success: true }
}

export async function deleteClub(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("clubs").delete().eq("id", id)

  if (error) {
    console.error("deleteClub error:", error)
    return { error: error.message || "Error al eliminar el club" }
  }

  revalidatePath("/admin/clubs")
  return { success: true }
}

export async function getClubs(search?: string, country?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("clubs")
    .select("*")
    .order("name", { ascending: true })

  if (search) {
    query = query.or(`name.ilike.%${search}%,short_name.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  if (country) {
    query = query.eq("country_code", country.toUpperCase())
  }

  const { data, error } = await query

  if (error) {
    console.error("getClubs error:", error)
    return []
  }

  return data || []
}

export async function getClubById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("getClubById error:", error)
    return null
  }

  return data
}
