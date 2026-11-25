-- ============================================
-- TITANS eFOOTBALL - Database Schema
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PLAYERS
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gamertag TEXT NOT NULL UNIQUE,
  real_name TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('PlayStation', 'Xbox', 'PC')),
  country_code TEXT NOT NULL, -- ISO 3166-1 alpha-2
  country_name TEXT NOT NULL,
  photo_url TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_gamertag ON players(gamertag);
CREATE INDEX idx_players_country ON players(country_code);

-- ============================================
-- 2. CLUBS
-- ============================================
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  full_name TEXT,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  crest_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clubs_name ON clubs(name);
CREATE INDEX idx_clubs_country ON clubs(country_code);

-- ============================================
-- 3. NATIONAL TEAMS
-- ============================================
CREATE TABLE IF NOT EXISTS national_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  flag_url TEXT,
  crest_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_national_teams_name ON national_teams(name);

-- ============================================
-- 4. TOURNAMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  competition_type TEXT NOT NULL CHECK (competition_type IN (
    'champions_league_36',
    'knockout_cup',
    'round_robin',
    'league_to_quarters'
  )),
  category TEXT, -- e.g. 'Club', 'National', 'Individual'
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'upcoming', 'active', 'paused', 'finished', 'archived'
  )),
  participant_type TEXT NOT NULL CHECK (participant_type IN (
    'players', 'clubs', 'national_teams'
  )),
  max_participants INTEGER,
  -- Visual identity
  logo_url TEXT,
  banner_url TEXT,
  cover_url TEXT,
  background_url TEXT,
  promo_url TEXT,
  -- Meta
  champion_id UUID, -- references tournament_participants
  runner_up_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_type ON tournaments(competition_type);

-- ============================================
-- 5. TOURNAMENT PARTICIPANTS
-- ============================================
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  -- One of these will be set depending on participant_type
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  national_team_id UUID REFERENCES national_teams(id) ON DELETE SET NULL,
  -- Snapshot of visual data at registration time (important for history)
  display_name TEXT NOT NULL,
  short_name TEXT,
  crest_url TEXT,
  photo_url TEXT,
  country_code TEXT,
  seed INTEGER,
  group_name TEXT, -- for group stages if needed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, player_id),
  UNIQUE(tournament_id, club_id),
  UNIQUE(tournament_id, national_team_id)
);

CREATE INDEX idx_tp_tournament ON tournament_participants(tournament_id);

-- ============================================
-- 6. MATCHES
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_name TEXT NOT NULL, -- e.g. 'League Phase', 'Round of 16', 'Quarter-finals', 'Final'
  round_order INTEGER NOT NULL DEFAULT 0,
  match_number INTEGER,
  home_participant_id UUID REFERENCES tournament_participants(id) ON DELETE SET NULL,
  away_participant_id UUID REFERENCES tournament_participants(id) ON DELETE SET NULL,
  -- For two-legged ties
  leg INTEGER DEFAULT 1, -- 1 or 2
  related_match_id UUID REFERENCES matches(id), -- the other leg
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'live', 'finished', 'walkover', 'cancelled'
  )),
  -- Results
  home_score INTEGER,
  away_score INTEGER,
  home_score_agg INTEGER, -- aggregate for two legs
  away_score_agg INTEGER,
  winner_participant_id UUID REFERENCES tournament_participants(id),
  decided_by_penalties BOOLEAN DEFAULT FALSE,
  home_penalties INTEGER,
  away_penalties INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_round ON matches(tournament_id, round_order);

-- ============================================
-- 7. STANDINGS
-- ============================================
CREATE TABLE IF NOT EXISTS standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES tournament_participants(id) ON DELETE CASCADE,
  played INTEGER NOT NULL DEFAULT 0,
  won INTEGER NOT NULL DEFAULT 0,
  drawn INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points INTEGER NOT NULL DEFAULT 0,
  position INTEGER,
  form TEXT, -- e.g. "WWDLW"
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, participant_id)
);

CREATE INDEX idx_standings_tournament ON standings(tournament_id);

-- ============================================
-- 8. HISTORICAL CHAMPIONS / PALMARÉS
-- ============================================
CREATE TABLE IF NOT EXISTS historical_champions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  tournament_name TEXT NOT NULL,
  season_label TEXT, -- e.g. "2025/26" or "Titans Cup 2026"
  champion_participant_id UUID REFERENCES tournament_participants(id),
  champion_name TEXT NOT NULL,
  champion_crest_url TEXT,
  runner_up_participant_id UUID REFERENCES tournament_participants(id),
  runner_up_name TEXT,
  runner_up_crest_url TEXT,
  finished_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 9. PLAYER / CLUB / TEAM STATS (aggregated)
-- ============================================
CREATE TABLE IF NOT EXISTS entity_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('player', 'club', 'national_team')),
  entity_id UUID NOT NULL,
  tournaments_played INTEGER NOT NULL DEFAULT 0,
  titles_won INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_drawn INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0,
  goals_scored INTEGER NOT NULL DEFAULT 0,
  goals_conceded INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_national_teams_updated_at BEFORE UPDATE ON national_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_stats ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Public read national_teams" ON national_teams FOR SELECT USING (true);
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read tournament_participants" ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read standings" ON standings FOR SELECT USING (true);
CREATE POLICY "Public read historical_champions" ON historical_champions FOR SELECT USING (true);
CREATE POLICY "Public read entity_stats" ON entity_stats FOR SELECT USING (true);

-- Only authenticated admin can write (we'll use service role for admin operations)
-- For extra safety we can later add more granular policies based on auth.uid()

