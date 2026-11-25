-- ============================================
-- Políticas adicionales para escritura del administrador
-- Ejecutar este archivo DESPUÉS del schema.sql
-- ============================================

-- Permitir a usuarios autenticados (el admin) hacer INSERT, UPDATE, DELETE

-- PLAYERS
CREATE POLICY "Admin insert players" ON players
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update players" ON players
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete players" ON players
  FOR DELETE TO authenticated USING (true);

-- CLUBS (preparado para el siguiente módulo)
CREATE POLICY "Admin insert clubs" ON clubs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update clubs" ON clubs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete clubs" ON clubs
  FOR DELETE TO authenticated USING (true);

-- NATIONAL TEAMS
CREATE POLICY "Admin insert national_teams" ON national_teams
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update national_teams" ON national_teams
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete national_teams" ON national_teams
  FOR DELETE TO authenticated USING (true);

-- TOURNAMENTS
CREATE POLICY "Admin insert tournaments" ON tournaments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update tournaments" ON tournaments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete tournaments" ON tournaments
  FOR DELETE TO authenticated USING (true);

-- TOURNAMENT PARTICIPANTS
CREATE POLICY "Admin insert tournament_participants" ON tournament_participants
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update tournament_participants" ON tournament_participants
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete tournament_participants" ON tournament_participants
  FOR DELETE TO authenticated USING (true);

-- MATCHES
CREATE POLICY "Admin insert matches" ON matches
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update matches" ON matches
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete matches" ON matches
  FOR DELETE TO authenticated USING (true);

-- STANDINGS
CREATE POLICY "Admin insert standings" ON standings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update standings" ON standings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete standings" ON standings
  FOR DELETE TO authenticated USING (true);

-- HISTORICAL CHAMPIONS
CREATE POLICY "Admin insert historical_champions" ON historical_champions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update historical_champions" ON historical_champions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete historical_champions" ON historical_champions
  FOR DELETE TO authenticated USING (true);

-- ENTITY STATS
CREATE POLICY "Admin insert entity_stats" ON entity_stats
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update entity_stats" ON entity_stats
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete entity_stats" ON entity_stats
  FOR DELETE TO authenticated USING (true);
