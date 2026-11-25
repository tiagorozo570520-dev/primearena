"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createNationalTeam, updateNationalTeam, type NationalTeamFormState } from "@/lib/actions/national-teams"
import { COUNTRIES } from "@/lib/countries"
import type { NationalTeam } from "@/types/database"

interface NationalTeamFormProps {
  team?: NationalTeam
}

const initialState: NationalTeamFormState = {}

export function NationalTeamForm({ team }: NationalTeamFormProps) {
  const router = useRouter()
  const isEditing = !!team

  const action = isEditing
    ? updateNationalTeam.bind(null, team.id)
    : createNationalTeam

  const [state, formAction, isPending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success) {
      router.push("/admin/national-teams")
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
            Nombre de la selección *
          </label>
          <input
            name="name"
            defaultValue={team?.name || ""}
            required
            minLength={2}
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Ej: Colombia"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Nombre corto *
          </label>
          <input
            name="short_name"
            defaultValue={team?.short_name || ""}
            required
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Ej: COL"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            País *
          </label>
          <select
            name="country_code"
            defaultValue={team?.country_code || "CO"}
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
            defaultValue={team?.country_name || "Colombia"}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            URL de la bandera (opcional)
          </label>
          <input
            name="flag_url"
            type="url"
            defaultValue={team?.flag_url || ""}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            URL del escudo / emblema (opcional)
          </label>
          <input
            name="crest_url"
            type="url"
            defaultValue={team?.crest_url || ""}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-6 py-2.5 disabled:opacity-60"
        >
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar selección"}
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
