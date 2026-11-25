"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  createTournament,
  updateTournament,
  type TournamentFormState,
} from "@/lib/actions/tournaments"
import type { Tournament } from "@/types/database"

interface TournamentFormProps {
  tournament?: Tournament
}

const initialState: TournamentFormState = {}

const competitionTypes = [
  { value: "prime_league_d1", label: "PRIME LEAGUE — División 1" },
  { value: "prime_league_d2", label: "PRIME LEAGUE — División 2" },
  { value: "prime_champions", label: "PRIME CHAMPIONS ARENA" },
  { value: "prime_qualifiers", label: "PRIME QUALIFIERS" },
  { value: "champions_league_36", label: "Champions League (36 equipos)" },
  { value: "knockout_cup", label: "Copa Eliminatoria" },
  { value: "round_robin", label: "Liga (Todos contra todos)" },
  { value: "league_to_quarters", label: "Liga + Clasificación a Cuartos" },
  { value: "custom", label: "Personalizado / Libre" },
]

const statuses = [
  { value: "draft", label: "Borrador" },
  { value: "upcoming", label: "Próximo" },
  { value: "active", label: "Activo" },
  { value: "paused", label: "Pausado" },
  { value: "finished", label: "Finalizado" },
  { value: "archived", label: "Archivado" },
]

const participantTypes = [
  { value: "clubs", label: "Clubes de fútbol" },
  { value: "national_teams", label: "Selecciones nacionales" },
  { value: "players", label: "Jugadores individuales" },
]

export function TournamentForm({ tournament }: TournamentFormProps) {
  const router = useRouter()
  const isEditing = !!tournament

  const action = isEditing
    ? updateTournament.bind(null, tournament.id)
    : createTournament

  const [state, formAction, isPending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success && state.tournamentId) {
      router.push(`/admin/tournaments/${state.tournamentId}`)
      router.refresh()
    }
  }, [state.success, state.tournamentId, router])

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      {state.error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Información general */}
      <section className="space-y-5">
        <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
          Información general
        </h2>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Nombre del torneo *
          </label>
          <input
            name="name"
            defaultValue={tournament?.name || ""}
            required
            maxLength={120}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Ej: UEFA Champions League / Copa Titans 2026"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Descripción
          </label>
          <textarea
            name="description"
            defaultValue={tournament?.description || ""}
            rows={3}
            maxLength={2000}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 resize-y"
            placeholder="Descripción del torneo..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Fecha de inicio
            </label>
            <input
              name="start_date"
              type="date"
              defaultValue={tournament?.start_date || ""}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Fecha de finalización
            </label>
            <input
              name="end_date"
              type="date"
              defaultValue={tournament?.end_date || ""}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Formato de competición *
            </label>
            <select
              name="competition_type"
              defaultValue={tournament?.competition_type || "knockout_cup"}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            >
              {competitionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Estado
            </label>
            <select
              name="status"
              defaultValue={tournament?.status || "draft"}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Tipo de participantes *
            </label>
            <select
              name="participant_type"
              defaultValue={tournament?.participant_type || "clubs"}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            >
              {participantTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Máx. participantes
            </label>
            <input
              name="max_participants"
              type="number"
              min={2}
              defaultValue={tournament?.max_participants || ""}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              placeholder="Ej: 16, 32, 36..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Categoría
          </label>
          <input
            name="category"
            defaultValue={tournament?.category || ""}
            maxLength={50}
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            placeholder="Ej: Clubes, Selecciones, Individual..."
          />
        </div>
      </section>

      {/* Identidad visual */}
      <section className="space-y-5 pt-4 border-t border-white/5">
        <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
          Identidad visual (URLs)
        </h2>
        <p className="text-xs text-slate-500">
          Por ahora se usan URLs. Más adelante se implementará subida de archivos a Storage.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Logo del torneo
            </label>
            <input
              name="logo_url"
              type="url"
              defaultValue={tournament?.logo_url || ""}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Banner horizontal
            </label>
            <input
              name="banner_url"
              type="url"
              defaultValue={tournament?.banner_url || ""}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Imagen de portada
            </label>
            <input
              name="cover_url"
              type="url"
              defaultValue={tournament?.cover_url || ""}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Imagen de fondo
            </label>
            <input
              name="background_url"
              type="url"
              defaultValue={tournament?.background_url || ""}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              placeholder="https://..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Imagen promocional
            </label>
            <input
              name="promo_url"
              type="url"
              defaultValue={tournament?.promo_url || ""}
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              placeholder="https://..."
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-6 py-2.5 disabled:opacity-60"
        >
          {isPending
            ? "Guardando..."
            : isEditing
            ? "Guardar cambios"
            : "Crear torneo"}
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
