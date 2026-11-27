import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Pencil, Users, Trophy } from "lucide-react"
import {
  getTournamentById,
  getTournamentParticipants,
  getTournamentMatches,
  getTournamentStandings,
} from "@/lib/actions/tournaments"
import { GenerateStructureButton } from "@/components/tournaments/GenerateStructureButton"
import { FinishTournamentForm } from "@/components/tournaments/FinishTournamentForm"
import { CloseGroupStageButton } from "@/components/tournaments/CloseGroupStageButton"
import { CloseSeasonButton } from "@/components/tournaments/CloseSeasonButton"
import { RegenerateKeepGroupsButton } from "@/components/tournaments/RegenerateKeepGroupsButton"
import { RecalculateStandingsButton } from "@/components/tournaments/RecalculateStandingsButton"
import { BracketView } from "@/components/tournaments/BracketView"
import { MatchListWithSearch } from "@/components/tournaments/MatchListWithSearch"

interface PageProps {
  params: Promise<{ id: string }>
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  upcoming: "Próximo",
  active: "Activo",
  paused: "Pausado",
  finished: "Finalizado",
  archived: "Archivado",
}

const formatLabels: Record<string, string> = {
  prime_league_d1: "PRIME LEAGUE — División 1",
  prime_league_d2: "PRIME LEAGUE — División 2",
  prime_champions: "PRIME CHAMPIONS ARENA",
  prime_qualifiers: "PRIME QUALIFIERS",
  champions_league_36: "Champions League (36)",
  knockout_cup: "Copa Eliminatoria",
  round_robin: "Liga (Todos contra todos)",
  league_to_quarters: "Liga + Clasificación a Cuartos",
  custom: "Personalizado / Libre",
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params
  const tournament = await getTournamentById(id)
  if (!tournament) notFound()

  const [participants, matches, standings] = await Promise.all([
    getTournamentParticipants(id),
    getTournamentMatches(id),
    getTournamentStandings(id),
  ])

  const nameById = new Map(participants.map((p) => [p.id, p.display_name]))

  const groupsMap = new Map<string, typeof participants>()
  for (const p of participants) {
    if (p.group_name) {
      const list = groupsMap.get(p.group_name) || []
      list.push(p)
      groupsMap.set(p.group_name, list)
    }
  }
  const groups = Array.from(groupsMap.entries()).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <Link
          href="/admin/tournaments"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a torneos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
              {tournament.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tournament.logo_url} alt={tournament.name} className="w-full h-full object-contain p-1" />
              ) : (
                <Trophy className="w-8 h-8 text-cyan-400/70" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
              <p className="text-slate-400 text-sm mt-1">
                {formatLabels[tournament.competition_type]} · {statusLabels[tournament.status]}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/tournaments/${id}/participants`} className="btn-ghost text-sm">
              <Users className="w-4 h-4" />
              Participantes ({participants.length})
            </Link>
            <Link href={`/admin/tournaments/${id}/edit`} className="btn-primary text-sm">
              <Pencil className="w-4 h-4" />
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Participantes</div>
          <div className="text-2xl font-bold text-white">{participants.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Partidos</div>
          <div className="text-2xl font-bold text-white">{matches.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Estado</div>
          <div className="text-lg font-semibold text-white">{statusLabels[tournament.status]}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Formato</div>
          <div className="text-sm font-medium text-cyan-400">{formatLabels[tournament.competition_type]}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="premium-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Gestión del torneo</h2>
          <p className="text-xs text-slate-500 mt-1">Genera estructura, registra resultados o avanza fases.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GenerateStructureButton
            tournamentId={id}
            competitionType={tournament.competition_type}
            participantsCount={participants.length}
          />
          {(tournament.competition_type === "prime_league_d1" ||
            tournament.competition_type === "prime_league_d2") && (
            <RegenerateKeepGroupsButton tournamentId={id} />
          )}
          <RecalculateStandingsButton tournamentId={id} />
          {(tournament.competition_type === "prime_league_d1" ||
            tournament.competition_type === "prime_league_d2" ||
            tournament.competition_type === "prime_champions") && (
            <CloseGroupStageButton tournamentId={id} competitionType={tournament.competition_type} />
          )}
          {(tournament.competition_type === "prime_league_d1" ||
            tournament.competition_type === "prime_league_d2") &&
            tournament.status !== "finished" && (
            <CloseSeasonButton tournamentId={id} />
          )}
        </div>
      </div>

      {/* Groups */}
      {groups.length > 0 && (
        <div className="space-y-4">
          <h2 className="section-title">Grupos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {groups.map(([name, members]) => (
              <div key={name} className="glass rounded-xl p-4">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Grupo {name}</h3>
                <ul className="space-y-2">
                  {members.map((m) => (
                    <li key={m.id} className="flex items-center gap-2 text-sm text-white">
                      <div className="w-6 h-6 rounded bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                        {m.crest_url || m.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.crest_url || m.photo_url || ""} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-500">{m.display_name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="truncate">{m.display_name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standings */}
      {standings.length > 0 && (() => {
        const byGroup = new Map<string, any[]>()
        let hasGroups = false
        for (const s of standings as any[]) {
          const g = s.tournament_participants?.group_name
          if (g) {
            hasGroups = true
            const list = byGroup.get(g) || []
            list.push(s)
            byGroup.set(g, list)
          } else {
            const list = byGroup.get("_all") || []
            list.push(s)
            byGroup.set("_all", list)
          }
        }
        const entries = hasGroups
          ? Array.from(byGroup.entries()).filter(([k]) => k !== "_all").sort(([a], [b]) => a.localeCompare(b))
          : [["_all", standings] as [string, any[]]]

        return (
          <div className="space-y-4">
            <h2 className="section-title">Clasificación</h2>
            <div className={hasGroups ? "grid lg:grid-cols-2 gap-4" : ""}>
              {entries.map(([gName, rows]) => (
                <div key={gName} className="glass rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5">
                    <h3 className="text-sm font-semibold text-cyan-400">
                      {gName === "_all" ? "Tabla general" : `Grupo ${gName}`}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-500 border-b border-white/5">
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Equipo</th>
                          <th className="px-3 py-2 text-center">PJ</th>
                          <th className="px-3 py-2 text-center">Pts</th>
                          <th className="px-3 py-2 text-center">DG</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {rows.map((s: any, idx: number) => (
                          <tr key={s.id}>
                            <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-2 text-white">{s.tournament_participants?.display_name || "—"}</td>
                            <td className="px-3 py-2 text-center text-slate-400">{s.played}</td>
                            <td className="px-3 py-2 text-center font-semibold text-cyan-400">{s.points}</td>
                            <td className="px-3 py-2 text-center text-slate-400">{s.goal_difference}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Knockout Bracket */}
      {matches.some((m) => m.round_order >= 10) && (
        <div className="space-y-4">
          <h2 className="section-title">Eliminatorias</h2>
          <BracketView
            matches={matches}
            nameById={Object.fromEntries(nameById)}
            tournamentId={id}
          />
        </div>
      )}

      {/* League / Group matches with search */}
      {matches.some((m) => m.round_order < 10) && (
        <div className="space-y-4">
          <h2 className="section-title">Fase de grupos / Liga</h2>
          <MatchListWithSearch
            matches={matches}
            nameById={Object.fromEntries(nameById)}
            tournamentId={id}
          />
        </div>
      )}

      {/* Finish tournament */}
      <FinishTournamentForm
        tournamentId={id}
        participants={participants}
        currentStatus={tournament.status}
      />

      {tournament.status === "finished" && tournament.champion_id && (
        <div className="premium-card rounded-xl p-5 border border-amber-500/20">
          <h2 className="text-sm font-semibold text-amber-400 mb-2">Torneo finalizado</h2>
          <p className="text-white">
            Campeón:{" "}
            <span className="font-semibold">
              {participants.find((p) => p.id === tournament.champion_id)?.display_name || "—"}
            </span>
          </p>
          {tournament.runner_up_id && (
            <p className="text-slate-400 text-sm mt-1">
              Subcampeón:{" "}
              {participants.find((p) => p.id === tournament.runner_up_id)?.display_name || "—"}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
