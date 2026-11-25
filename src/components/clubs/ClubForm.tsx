"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClub, updateClub, type ClubFormState } from "@/lib/actions/clubs"
import { COUNTRIES } from "@/lib/countries"
import type { Club } from "@/types/database"

interface ClubFormProps {
  club?: Club
}

const initialState: ClubFormState = {}

export function ClubForm({ club }: ClubFormProps) {
  const router = useRouter()
  const isEditing = !!club

  const action = isEditing
    ? updateClub.bind(null, club.id)
    : createClub

  const [state, formAction, isPending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success) {
      router.push("/admin/clubs")
      router.refresh()
    }
  }, [state.success, router])

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state.error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Nombre del club *
          </label>
          <input
            name="name"
            defaultValue={club?.name || ""}
            required
            minLength={2}
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Ej: Inter de Milán"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Nombre corto *
          </label>
          <input
            name="short_name"
            defaultValue={club?.short_name || ""}
            required
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Ej: Inter"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Nombre completo
          </label>
          <input
            name="full_name"
            defaultValue={club?.full_name || ""}
            maxLength={150}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Ej: FC Internazionale Milano"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            País *
          </label>
          <select
            name="country_code"
            defaultValue={club?.country_code || "IT"}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            onChange={(e) => {
              const nameInput = e.target.form?.elements.namedItem("country_name") as HTMLInputElement
              const found = COUNTRIES.find((c) => c.code === e.target.value)
              if (nameInput && found) nameInput.value = found.name
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="hidden"
            name="country_name"
            defaultValue={club?.country_name || "Italia"}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            URL del escudo (opcional)
          </label>
          <input
            name="crest_url"
            type="url"
            defaultValue={club?.crest_url || ""}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="https://..."
          />
          <p className="text-[11px] text-slate-600 mt-1">
            Por ahora se usa URL. Más adelante se implementará subida de imágenes a Storage.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-6 py-2.5 disabled:opacity-60"
        >
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar club"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost px-5 py-2.5"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
