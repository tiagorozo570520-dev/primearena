export type Platform = 'PlayStation' | 'Xbox' | 'PC'

export type TournamentStatus = 'draft' | 'upcoming' | 'active' | 'paused' | 'finished' | 'archived'

export type CompetitionType =
  | 'champions_league_36'
  | 'knockout_cup'
  | 'round_robin'
  | 'league_to_quarters'
  | 'custom'
  | 'prime_league_d1'
  | 'prime_league_d2'
  | 'prime_champions'
  | 'prime_qualifiers'

export type ParticipantType = 'players' | 'clubs' | 'national_teams'

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'walkover' | 'cancelled'

export interface Player {
  id: string
  gamertag: string
  real_name: string | null
  platform: Platform
  country_code: string
  country_name: string
  photo_url: string | null
  registered_at: string
  created_at: string
  updated_at: string
}

export interface Club {
  id: string
  name: string
  short_name: string
  full_name: string | null
  country_code: string
  country_name: string
  crest_url: string | null
  created_at: string
  updated_at: string
}

export interface NationalTeam {
  id: string
  name: string
  short_name: string
  country_code: string
  country_name: string
  flag_url: string | null
  crest_url: string | null
  created_at: string
  updated_at: string
}

export interface Tournament {
  id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  competition_type: CompetitionType
  category: string | null
  status: TournamentStatus
  participant_type: ParticipantType
  max_participants: number | null
  logo_url: string | null
  banner_url: string | null
  cover_url: string | null
  background_url: string | null
  promo_url: string | null
  champion_id: string | null
  runner_up_id: string | null
  created_at: string
  updated_at: string
  finished_at: string | null
}

export interface TournamentParticipant {
  id: string
  tournament_id: string
  player_id: string | null
  club_id: string | null
  national_team_id: string | null
  display_name: string
  short_name: string | null
  crest_url: string | null
  photo_url: string | null
  country_code: string | null
  seed: number | null
  group_name: string | null
  created_at: string
}

export interface Match {
  id: string
  tournament_id: string
  round_name: string
  round_order: number
  match_number: number | null
  home_participant_id: string | null
  away_participant_id: string | null
  leg: number
  related_match_id: string | null
  scheduled_at: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  home_score_agg: number | null
  away_score_agg: number | null
  winner_participant_id: string | null
  decided_by_penalties: boolean
  home_penalties: number | null
  away_penalties: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Standing {
  id: string
  tournament_id: string
  participant_id: string
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  position: number | null
  form: string | null
  updated_at: string
}

export interface HistoricalChampion {
  id: string
  tournament_id: string
  tournament_name: string
  season_label: string | null
  champion_participant_id: string | null
  champion_name: string
  champion_crest_url: string | null
  runner_up_participant_id: string | null
  runner_up_name: string | null
  runner_up_crest_url: string | null
  finished_at: string
  created_at: string
}
