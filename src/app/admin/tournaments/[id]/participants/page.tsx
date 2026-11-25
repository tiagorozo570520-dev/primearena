import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import {
  getTournamentById,
  getTournamentParticipants,
} from "@/lib/actions/tournaments"
import { getClubs } from "@/lib/actions/clubs"
import { getNationalTeams } from "@/lib/actions/national-teams"
import { getPlayers } from "@/lib/actions/players"
import { ParticipantsManager } from "@/components/tournaments/ParticipantsManager"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ParticipantsPage({ params }: PageProps) {
  const { id } = await params
  const tournament = await getTournamentById(id)

  if (!tournament) notFound()

  const participants = await getTournamentParticipants(id)

  // Load available entities based on participant_type
  let available: Array<{
    id: string
    name: string
    short_name?: string | null
    crest_url?: string | null
    photo_url?: string | null
    country_code?: string | null
  }> = []

  if (tournament.participant_type === "clubs") {
    const clubs = await getClubs()
    available = clubs.map((c) => ({
      id: c.id,
      name: c.name,
      short_name: c.short_name,
      crest_url: c.crest_url,
      country_code: c.country_code,
    }))
  } else if (tournament.participant_type === "national_teams") {
    const teams = await getNationalTeams()
    available = teams.map((t) => ({
      id: t.id,
      name: t.name,
      short_name: t.short_name,
      crest_url: t.crest_url || t.flag_url,
      country_code: t.country_code,
    }))
  } else {
    const players = await getPlayers()
    available = players.map((p) => ({
      id: p.id,
      name: p.gamertag,
      short_name: p.real_name,
      photo_url: p.photo_url,
      country_code: p.country_code,
    }))
  }

  // Filter out already added
  const addedIds = new Set(
    participants.map((p) => p.player_id || p.club_id || p.national_team_id)
  )
  const availableToAdd = available.filter((a) => !addedIds.has(a.id))

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          href={`/admin/tournaments/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al torneo
        </Link>
        <h1 className="text-2xl font-bold text-white">Participantes</h1>
        <p className="text-slate-400 text-sm mt-1">
          {tournament.name} · {participants.length} inscrito
          {participants.length !== 1 ? "s" : ""}
          {tournament.max_participants
            ? ` / ${tournament.max_participants} máx.`
            : ""}
        </p>
      </div>

      <ParticipantsManager
        tournamentId={id}
        participantType={tournament.participant_type}
        participants={participants}
        available={availableToAdd}
      />
    </div>
  )
}
