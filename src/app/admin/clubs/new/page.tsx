import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ClubForm } from "@/components/clubs/ClubForm"

export default function NewClubPage() {
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
        <h1 className="text-2xl font-bold text-white">Agregar club</h1>
        <p className="text-slate-400 text-sm mt-1">
          El club quedará en la biblioteca permanente y podrás usarlo en cualquier torneo.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <ClubForm />
      </div>
    </div>
  )
}
