import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getNationalTeamById } from "@/lib/actions/national-teams"
import { NationalTeamForm } from "@/components/national-teams/NationalTeamForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditNationalTeamPage({ params }: PageProps) {
  const { id } = await params
  const team = await getNationalTeamById(id)

  if (!team) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          href="/admin/national-teams"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a selecciones
        </Link>
        <h1 className="text-2xl font-bold text-white">Editar selección</h1>
        <p className="text-slate-400 text-sm mt-1">
          Modificando: <span className="text-cyan-400">{team.name}</span>
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <NationalTeamForm team={team} />
      </div>
    </div>
  )
}
