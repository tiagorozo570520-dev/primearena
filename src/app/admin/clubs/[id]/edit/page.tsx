import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getClubById } from "@/lib/actions/clubs"
import { ClubForm } from "@/components/clubs/ClubForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditClubPage({ params }: PageProps) {
  const { id } = await params
  const club = await getClubById(id)

  if (!club) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          href="/admin/clubs"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a clubes
        </Link>
        <h1 className="text-2xl font-bold text-white">Editar club</h1>
        <p className="text-slate-400 text-sm mt-1">
          Modificando: <span className="text-cyan-400">{club.name}</span>
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <ClubForm club={club} />
      </div>
    </div>
  )
}
