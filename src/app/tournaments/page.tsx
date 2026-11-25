import Link from "next/link"
import Image from "next/image"
import { Trophy } from "lucide-react"
import { getPublicTournaments } from "@/lib/actions/public"

const statusLabels: Record<string, string> = {
  upcoming: "Próximo",
  active: "En curso",
  finished: "Finalizado",
}

const statusColors: Record<string, string> = {
  upcoming: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  finished: "text-violet-400 bg-violet-500/10 border-violet-500/20",
}

export default async function PublicTournamentsPage() {
  const tournaments = await getPublicTournaments()

  return (
    <div className="min-h-screen tech-bg">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-prime-arena.png" alt="Prime Arena" width={40} height={40} className="rounded" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-wider text-white">TITANS</span>
              <span className="text-[9px] uppercase tracking-widest text-cyan-400/70">Arena</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/tournaments" className="btn-ghost text-cyan-400 text-sm">Torneos</Link>
            <Link href="/admin" className="btn-primary text-xs">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-cyan-400" />
          Torneos
        </h1>
        <p className="text-slate-400 mb-8">Competiciones de la comunidad Prime Arena Arena</p>

        {tournaments.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-slate-500">
            No hay torneos públicos todavía.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="group glass rounded-2xl overflow-hidden glass-hover"
              >
                {t.banner_url ? (
                  <div className="h-28 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-cyan-400/30" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {t.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.logo_url} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <Trophy className="w-5 h-5 text-cyan-400/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {t.name}
                      </h2>
                      <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${statusColors[t.status] || ""}`}>
                        {statusLabels[t.status] || t.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
