import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getTournamentById } from "@/lib/actions/tournaments"
import { TournamentForm } from "@/components/tournaments/TournamentForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTournamentPage({ params }: PageProps) {
  const { id } = await params
  const tournament = await getTournamentById(id)

  if (!tournament) notFound()

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
        <h1 className="text-2xl font-bold text-white">Editar torneo</h1>
        <p className="text-slate-400 text-sm mt-1">
          Modificando: <span className="text-cyan-400">{tournament.name}</span>
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <TournamentForm tournament={tournament} />
      </div>
    </div>
  )
}
