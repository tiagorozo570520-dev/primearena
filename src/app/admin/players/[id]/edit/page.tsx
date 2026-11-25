import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getPlayerById } from "@/lib/actions/players"
import { PlayerForm } from "@/components/players/PlayerForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPlayerPage({ params }: PageProps) {
  const { id } = await params
  const player = await getPlayerById(id)

  if (!player) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          href="/admin/players"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a jugadores
        </Link>
        <h1 className="text-2xl font-bold text-white">Editar jugador</h1>
        <p className="text-slate-400 text-sm mt-1">
          Modificando: <span className="text-cyan-400">{player.gamertag}</span>
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <PlayerForm player={player} />
      </div>
    </div>
  )
}
