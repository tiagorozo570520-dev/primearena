import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TournamentForm } from "@/components/tournaments/TournamentForm"

export default function NewTournamentPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          href="/admin/tournaments"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a torneos
        </Link>
        <h1 className="text-2xl font-bold text-white">Crear torneo</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configura la información general y la identidad visual. Después podrás agregar participantes.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <TournamentForm />
      </div>
    </div>
  )
}
