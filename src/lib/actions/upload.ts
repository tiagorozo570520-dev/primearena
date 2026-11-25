"use server"

import { createClient } from "@/lib/supabase/server"

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) {
    return { error: "No se seleccionó archivo" }
  }

  const supabase = await createClient()

  const ext = file.name.split(".").pop() || "png"
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from("prime-arena").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("upload error:", error)
    return { error: error.message || "Error al subir imagen" }
  }

  const { data } = supabase.storage.from("prime-arena").getPublicUrl(path)
  return { url: data.publicUrl }
}
