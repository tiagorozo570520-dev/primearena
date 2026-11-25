import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import {
  getTournamentById,
  getTournamentParticipants,
  getTournamentMatches,
} from "@/lib/actions/tournaments"
import { ResultsManager } from "@/components/tournaments/ResultsManager"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params
  const tournament = await getTournamentById(id)
  if (!tournament) notFound()

  const [participants, matches] = await Promise.all([
    getTournamentParticipants(id),
    getTournamentMatches(id),
  ])

  const nameById = new Map(participants.map((p) => [p.id, p.display_name]))

  // Group matches by round
  const roundsMap = new Map<string, typeof matches>()
  for (const m of matches) {
    const list = roundsMap.get(m.round_name) || []
    list.push(m)
    roundsMap.set(m.round_name, list)
  }
  const rounds = Array.from(roundsMap.entries())

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          href={`/admin/tournaments/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al torneo
        </Link>
        <h1 className="text-2xl font-bold text-white">Registrar resultados</h1>
        <p className="text-slate-400 text-sm mt-1">{tournament.name}</p>
      </div>

      <ResultsManager
        tournamentId={id}
        rounds={rounds}
        nameById={Object.fromEntries(nameById)}
      />
    </div>
  )
}
