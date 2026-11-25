import Link from "next/link"
import { Trophy, Crown } from "lucide-react"
import { getHistoricalChampions } from "@/lib/actions/history"

export default async function HistoryPage() {
  const champions = await getHistoricalChampions()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Historial y Palmarés
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Competiciones finalizadas y campeones
        </p>
      </div>

      {champions.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Crown className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            Aún no hay torneos finalizados.
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Cuando finalices un torneo y declares campeón, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {champions.map((c) => (
            <div
              key={c.id}
              className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                {c.champion_crest_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.champion_crest_url}
                    alt={c.champion_name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Crown className="w-7 h-7 text-amber-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/tournaments/${c.tournament_id}`}
                  className="font-semibold text-white hover:text-cyan-400 transition-colors"
                >
                  {c.tournament_name}
                </Link>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className="text-amber-400">
                    🏆 {c.champion_name}
                  </span>
                  {c.runner_up_name && (
                    <span className="text-slate-400">
                      🥈 {c.runner_up_name}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(c.finished_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
