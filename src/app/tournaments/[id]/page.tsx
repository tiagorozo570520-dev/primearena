import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Trophy, ArrowLeft, Crown } from "lucide-react"
import {
  getPublicTournament,
  getPublicParticipants,
  getPublicMatches,
  getPublicStandings,
} from "@/lib/actions/public"
import { PublicTournamentView } from "@/components/public/PublicTournamentView"

interface PageProps {
  params: Promise<{ id: string }>
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  upcoming: "Próximo",
  active: "En curso",
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
  round_robin: "Liga",
  league_to_quarters: "Liga + Cuartos",
  custom: "Personalizado",
}

export default async function PublicTournamentPage({ params }: PageProps) {
  const { id } = await params
  const tournament = await getPublicTournament(id)
  if (!tournament) notFound()
  if (tournament.status === "draft") notFound()

  const [participants, matches, standings] = await Promise.all([
    getPublicParticipants(id),
    getPublicMatches(id),
    getPublicStandings(id),
  ])

  const nameById = Object.fromEntries(participants.map((p) => [p.id, p.display_name]))

  const hasKnockout = matches.some((m) => m.round_order >= 10)
  const knockoutActive = matches.some(
    (m) => m.round_order >= 10 && (m.home_participant_id || m.status === "finished")
  )

  let currentPhase = "Fase de grupos"
  if (tournament.status === "finished") currentPhase = "Finalizado"
  else if (knockoutActive) currentPhase = "Eliminatorias"
  else if (hasKnockout) currentPhase = "Listo para eliminatorias"

  const champion = tournament.champion_id
    ? participants.find((p) => p.id === tournament.champion_id)
    : null
  const runnerUp = tournament.runner_up_id
    ? participants.find((p) => p.id === tournament.runner_up_id)
    : null

  return (
    <div className="min-h-screen tech-bg">
      <header className="sticky top-0 z-50 border-b border-purple-500/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-prime-arena.png" alt="Prime Arena" width={36} height={36} className="rounded" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-wider text-white">PRIME</span>
              <span className="text-[9px] uppercase tracking-widest text-cyan-400/80">Arena</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/tournaments" className="btn-ghost text-sm">Torneos</Link>
            <Link href="/admin" className="btn-primary text-xs">Admin</Link>
          </nav>
        </div>
      </header>

      {tournament.banner_url && (
        <div className="relative h-40 sm:h-52 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tournament.banner_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tournaments" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Todos los torneos
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-5 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-black/60 border border-purple-500/20 flex items-center justify-center overflow-hidden shrink-0">
            {tournament.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tournament.logo_url} alt="" className="w-full h-full object-contain p-2" />
            ) : (
              <Trophy className="w-10 h-10 text-cyan-400/50" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{tournament.name}</h1>
            <p className="text-slate-400 mt-1">
              {formatLabels[tournament.competition_type]} · {statusLabels[tournament.status]}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {currentPhase}
            </div>
          </div>
        </div>

        {/* Champion */}
        {champion && (
          <div className="premium-card rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 border border-amber-500/20">
            <div className="flex items-center gap-4">
              <Crown className="w-10 h-10 text-amber-400" />
              <div>
                <div className="text-xs text-amber-400/80 uppercase tracking-wider">Campeón</div>
                <div className="text-xl font-bold text-white">{champion.display_name}</div>
              </div>
            </div>
            {runnerUp && (
              <div className="sm:ml-auto text-center sm:text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Subcampeón</div>
                <div className="text-lg font-semibold text-slate-300">{runnerUp.display_name}</div>
              </div>
            )}
          </div>
        )}

        {/* Main view with tabs */}
        <PublicTournamentView
          matches={matches}
          standings={standings}
          nameById={nameById}
          hasKnockout={hasKnockout}
          knockoutActive={knockoutActive}
        />
      </main>

      <footer className="border-t border-purple-500/10 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-600 tracking-wider uppercase">
          Prime Arena · The Next Level of Competition
        </div>
      </footer>
    </div>
  )
}
