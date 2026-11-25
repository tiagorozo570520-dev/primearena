import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { NationalTeamForm } from "@/components/national-teams/NationalTeamForm"

export default function NewNationalTeamPage() {
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
        <h1 className="text-2xl font-bold text-white">Agregar selección</h1>
        <p className="text-slate-400 text-sm mt-1">
          La selección quedará en la biblioteca permanente y podrás usarla en cualquier torneo.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <NationalTeamForm />
      </div>
    </div>
  )
}
