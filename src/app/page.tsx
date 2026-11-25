import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getPublicTournaments } from "@/lib/actions/public";

const statusLabels: Record<string, string> = {
  upcoming: "Próximo",
  active: "En curso",
  finished: "Finalizado",
};

export default async function HomePage() {
  const tournaments = await getPublicTournaments();
  const active = tournaments.filter((t) => t.status === "active" || t.status === "upcoming");
  const finished = tournaments.filter((t) => t.status === "finished").slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-purple-500/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-prime-arena.png"
              alt="Prime Arena"
              width={44}
              height={44}
              className="rounded-lg object-contain"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-wider text-white">PRIME</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/90">Arena</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="btn-ghost text-cyan-400">Inicio</Link>
            <Link href="/tournaments" className="btn-ghost">Torneos</Link>
          </nav>
          <Link href="/admin" className="btn-primary text-xs uppercase tracking-wider">Admin</Link>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/12 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-8">
              <Image
                src="/logo-prime-arena.png"
                alt="Prime Arena"
                width={220}
                height={220}
                className="rounded-full object-contain neon-pulse drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              The Next Level of Competition
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-4">
              <span className="glow-text-purple">PRIME</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">ARENA</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-xl mx-auto mb-8">
              El centro oficial de gestión y visualización de competiciones de eFootball.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/tournaments" className="btn-primary px-8 py-3 text-base">Entrar a la Arena</Link>
              <Link href="/admin" className="btn-ghost px-8 py-3 text-base">Panel Admin</Link>
            </div>
          </div>
        </section>

        {/* Active & Finished */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="premium-card rounded-2xl p-6">
              <h2 className="section-title">Torneos activos / próximos</h2>
              {active.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No hay torneos activos.</p>
              ) : (
                <ul className="space-y-2">
                  {active.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/tournaments/${t.id}`}
                        className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <span className="text-sm text-white truncate">{t.name}</span>
                        <span className="text-[11px] text-cyan-400 shrink-0 ml-2">{statusLabels[t.status]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="premium-card rounded-2xl p-6">
              <h2 className="section-title">Últimos campeones</h2>
              {finished.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">Aún no hay torneos finalizados.</p>
              ) : (
                <ul className="space-y-2">
                  {finished.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/tournaments/${t.id}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-sm text-white truncate">{t.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-purple-500/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo-prime-arena.png" alt="Prime Arena" width={28} height={28} className="opacity-80" />
            <span className="text-sm text-slate-500">© {new Date().getFullYear()} Prime Arena</span>
          </div>
          <div className="text-xs text-slate-600 tracking-wider uppercase">The Next Level of Competition</div>
        </div>
      </footer>
    </div>
  );
}
