"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPlayer, updatePlayer, type PlayerFormState } from "@/lib/actions/players"
import { COUNTRIES } from "@/lib/countries"
import type { Player } from "@/types/database"

interface PlayerFormProps {
  player?: Player
}

const initialState: PlayerFormState = {}

export function PlayerForm({ player }: PlayerFormProps) {
  const router = useRouter()
  const isEditing = !!player

  const action = isEditing
    ? updatePlayer.bind(null, player.id)
    : createPlayer

  const [state, formAction, isPending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success) {
      router.push("/admin/players")
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
        {/* Gamertag */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Gamertag *
          </label>
          <input
            name="gamertag"
            defaultValue={player?.gamertag || ""}
            required
            minLength={2}
            maxLength={50}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Ej: TitanKiller99"
          />
          {state.fieldErrors?.gamertag && (
            <p className="text-xs text-red-400 mt-1">{state.fieldErrors.gamertag[0]}</p>
          )}
        </div>

        {/* Real name */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Nombre real / Apodo
          </label>
          <input
            name="real_name"
            defaultValue={player?.real_name || ""}
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Opcional"
          />
        </div>

        {/* Platform */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Plataforma *
          </label>
          <select
            name="platform"
            defaultValue={player?.platform || "PlayStation"}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
          >
            <option value="PlayStation">PlayStation</option>
            <option value="Xbox">Xbox</option>
            <option value="PC">PC</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            País *
          </label>
          <select
            name="country_code"
            defaultValue={player?.country_code || "CO"}
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
            defaultValue={player?.country_name || "Colombia"}
          />
        </div>

        {/* Photo URL (temporary until Storage) */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            URL de fotografía (opcional)
          </label>
          <input
            name="photo_url"
            type="url"
            defaultValue={player?.photo_url || ""}
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
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar jugador"}
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
