import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PlayerForm } from "@/components/players/PlayerForm"

export default function NewPlayerPage() {
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
        <h1 className="text-2xl font-bold text-white">Agregar jugador</h1>
        <p className="text-slate-400 text-sm mt-1">
          El jugador quedará registrado permanentemente y podrá reutilizarse en cualquier torneo.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <PlayerForm />
      </div>
    </div>
  )
}
