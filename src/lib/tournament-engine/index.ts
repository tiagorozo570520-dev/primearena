/**
 * TITANS eFootball - Tournament Engine
 * Generates groups, fixtures and knockout brackets.
 */

export type ParticipantRef = {
  id: string // tournament_participants.id
  display_name: string
}

export type GeneratedMatch = {
  round_name: string
  round_order: number
  match_number: number
  home_participant_id: string | null
  away_participant_id: string | null
  leg: number
  group_name?: string
}

export type GeneratedGroup = {
  name: string // "A", "B", "C"...
  participant_ids: string[]
}

export type EngineResult = {
  groups: GeneratedGroup[]
  matches: GeneratedMatch[]
  standings_participant_ids: string[] // all that need a standings row
}

/** Shuffle array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Round-robin fixtures for a list of participant IDs (single leg) */
function roundRobinMatches(
  participantIds: string[],
  roundName: string,
  roundOrder: number,
  startMatchNumber = 1,
  groupName?: string
): GeneratedMatch[] {
  const ids = [...participantIds]
  // If odd, add a bye (null)
  if (ids.length % 2 === 1) {
    ids.push("__BYE__")
  }

  const n = ids.length
  const rounds = n - 1
  const half = n / 2
  const matches: GeneratedMatch[] = []
  let matchNumber = startMatchNumber

  // Circle method
  const rotation = [...ids]

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const home = rotation[i]
      const away = rotation[n - 1 - i]
      if (home === "__BYE__" || away === "__BYE__") continue

      matches.push({
        round_name: groupName ? `${roundName} - Grupo ${groupName}` : roundName,
        round_order: roundOrder,
        match_number: matchNumber++,
        home_participant_id: home,
        away_participant_id: away,
        leg: 1,
        group_name: groupName,
      })
    }
    // rotate (keep first fixed)
    const fixed = rotation[0]
    const rest = rotation.slice(1)
    rest.unshift(rest.pop()!)
    rotation.splice(0, rotation.length, fixed, ...rest)
  }

  return matches
}

/**
 * CUSTOM / FREE FORMAT
 * You decide number of groups and how many advance later.
 * Participants are randomly distributed into groups.
 */
export function generateCustomGroups(params: {
  participants: ParticipantRef[]
  numberOfGroups: number
  shuffleParticipants?: boolean
  twoLegs?: boolean
}): EngineResult {
  const { participants, numberOfGroups, shuffleParticipants = true, twoLegs = false } = params

  if (numberOfGroups < 1) {
    throw new Error("Debe haber al menos 1 grupo")
  }
  if (participants.length < numberOfGroups) {
    throw new Error("No hay suficientes participantes para esa cantidad de grupos")
  }

  const pool = shuffleParticipants ? shuffle(participants) : [...participants]
  const groups: GeneratedGroup[] = []

  for (let i = 0; i < numberOfGroups; i++) {
    groups.push({
      name: String.fromCharCode(65 + i), // A, B, C...
      participant_ids: [],
    })
  }

  // Distribute round-robin style into groups
  pool.forEach((p, idx) => {
    groups[idx % numberOfGroups].participant_ids.push(p.id)
  })

  // Generate round-robin within each group
  const matches: GeneratedMatch[] = []
  let matchNumber = 1

  for (const g of groups) {
    const groupMatches = roundRobinMatches(
      g.participant_ids,
      "Fase de grupos",
      1,
      matchNumber,
      g.name
    )
    matches.push(...groupMatches)
    matchNumber += groupMatches.length

    if (twoLegs) {
      const returnLegs: GeneratedMatch[] = groupMatches.map((m, i) => ({
        round_name: `Fase de grupos (Vuelta) - Grupo ${g.name}`,
        round_order: 2,
        match_number: matchNumber + i,
        home_participant_id: m.away_participant_id,
        away_participant_id: m.home_participant_id,
        leg: 2,
        group_name: g.name,
      }))
      matches.push(...returnLegs)
      matchNumber += returnLegs.length
    }
  }

  return {
    groups,
    matches,
    standings_participant_ids: participants.map((p) => p.id),
  }
}

/**
 * PURE ROUND ROBIN (everyone vs everyone)
 */
export function generateRoundRobin(params: {
  participants: ParticipantRef[]
  twoLegs?: boolean
}): EngineResult {
  const { participants, twoLegs = false } = params
  const ids = participants.map((p) => p.id)

  let matches = roundRobinMatches(ids, "Liga", 1, 1)

  if (twoLegs) {
    const returnLegs: GeneratedMatch[] = matches.map((m, i) => ({
      ...m,
      round_name: "Liga (Vuelta)",
      round_order: 2,
      match_number: matches.length + i + 1,
      home_participant_id: m.away_participant_id,
      away_participant_id: m.home_participant_id,
      leg: 2,
    }))
    matches = [...matches, ...returnLegs]
  }

  return {
    groups: [],
    matches,
    standings_participant_ids: ids,
  }
}

/**
 * KNOCKOUT CUP
 * Supports 4, 8, 16, 32, 64. Adds byes if needed.
 */
export function generateKnockoutCup(params: {
  participants: ParticipantRef[]
  shuffleSeeds?: boolean
}): EngineResult {
  const { participants, shuffleSeeds = true } = params
  let pool = shuffleSeeds ? shuffle(participants) : [...participants]

  // Next power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(Math.max(pool.length, 2))))
  while (pool.length < size) {
    pool.push({ id: "__BYE__", display_name: "BYE" })
  }

  const matches: GeneratedMatch[] = []
  let matchNumber = 1

  const roundNames: Record<number, string> = {
    2: "Final",
    4: "Semifinales",
    8: "Cuartos de final",
    16: "Octavos de final",
    32: "Dieciseisavos",
    64: "Treintaidosavos",
  }

  // First round
  const firstRoundName = roundNames[size] || `Ronda de ${size}`
  const firstRoundOrder = 10

  for (let i = 0; i < size; i += 2) {
    const home = pool[i]
    const away = pool[i + 1]
    const isBye = home.id === "__BYE__" || away.id === "__BYE__"

    matches.push({
      round_name: firstRoundName,
      round_order: firstRoundOrder,
      match_number: matchNumber++,
      home_participant_id: home.id === "__BYE__" ? null : home.id,
      away_participant_id: away.id === "__BYE__" ? null : away.id,
      leg: 1,
    })
  }

  // Placeholder matches for subsequent rounds
  let teamsLeft = size / 2
  let roundOrder = firstRoundOrder + 1

  while (teamsLeft >= 2) {
    const roundName = roundNames[teamsLeft] || `Ronda de ${teamsLeft}`
    for (let i = 0; i < teamsLeft / 2; i++) {
      matches.push({
        round_name: roundName,
        round_order: roundOrder,
        match_number: matchNumber++,
        home_participant_id: null, // TBD when previous round finishes
        away_participant_id: null,
        leg: 1,
      })
    }
    teamsLeft = teamsLeft / 2
    roundOrder++
  }

  return {
    groups: [],
    matches,
    standings_participant_ids: [],
  }
}

/**
 * LEAGUE then top 8 to quarters (1st vs 8th, etc.)
 */
export function generateLeagueToQuarters(params: {
  participants: ParticipantRef[]
}): EngineResult {
  const league = generateRoundRobin({ participants: params.participants, twoLegs: false })

  // Placeholder knockout matches (filled after league ends)
  const koRounds = [
    { name: "Cuartos de final", order: 20, count: 4 },
    { name: "Semifinales", order: 21, count: 2 },
    { name: "Final", order: 22, count: 1 },
  ]

  let matchNumber = league.matches.length + 1
  const koMatches: GeneratedMatch[] = []

  for (const r of koRounds) {
    for (let i = 0; i < r.count; i++) {
      koMatches.push({
        round_name: r.name,
        round_order: r.order,
        match_number: matchNumber++,
        home_participant_id: null,
        away_participant_id: null,
        leg: 1,
      })
    }
  }

  return {
    groups: [],
    matches: [...league.matches, ...koMatches],
    standings_participant_ids: league.standings_participant_ids,
  }
}

/**
 * CHAMPIONS LEAGUE 36 (simplified engine for now)
 * Single league table, each team plays 8 matches against different opponents.
 * Full draw logic can be refined later.
 */
export function generateChampionsLeague36(params: {
  participants: ParticipantRef[]
}): EngineResult {
  if (params.participants.length !== 36) {
    throw new Error("Champions League actual requiere exactamente 36 participantes")
  }

  // For now: treat as round-robin limited - each team gets 8 random opponents
  // A proper UEFA-style draw is more complex; this is a solid first version.
  const ids = shuffle(params.participants.map((p) => p.id))
  const matches: GeneratedMatch[] = []
  let matchNumber = 1
  const played = new Map<string, Set<string>>()

  ids.forEach((id) => played.set(id, new Set()))

  // Greedy: for each team, assign up to 8 opponents they haven't played
  for (const home of ids) {
    const homePlayed = played.get(home)!
    if (homePlayed.size >= 8) continue

    for (const away of ids) {
      if (home === away) continue
      if (homePlayed.has(away)) continue
      if ((played.get(away)?.size || 0) >= 8) continue

      matches.push({
        round_name: "Fase de liga",
        round_order: 1,
        match_number: matchNumber++,
        home_participant_id: home,
        away_participant_id: away,
        leg: 1,
      })

      homePlayed.add(away)
      played.get(away)!.add(home)

      if (homePlayed.size >= 8) break
    }
  }

  // Placeholder knockout rounds
  const ko = [
    { name: "Playoff", order: 10, count: 8 }, // 16 teams in playoff = 8 ties
    { name: "Octavos de final", order: 11, count: 8 },
    { name: "Cuartos de final", order: 12, count: 4 },
    { name: "Semifinales", order: 13, count: 2 },
    { name: "Final", order: 14, count: 1 },
  ]

  for (const r of ko) {
    for (let i = 0; i < r.count; i++) {
      matches.push({
        round_name: r.name,
        round_order: r.order,
        match_number: matchNumber++,
        home_participant_id: null,
        away_participant_id: null,
        leg: 1,
      })
    }
  }

  return {
    groups: [],
    matches,
    standings_participant_ids: ids,
  }
}

/**
 * PRIME LEAGUE D1 / D2
 * 2 groups, max 10 per group, home-and-away, top 4 advance to quarters
 * Quarters: 1st A vs 4th B, 2nd B vs 3rd A, etc.
 */
export function generatePrimeLeague(params: {
  participants: ParticipantRef[]
  division: 1 | 2
}): EngineResult {
  const { participants, division } = params
  if (participants.length < 4) {
    throw new Error("Se necesitan al menos 4 participantes")
  }

  // Force 2 groups
  const groupsResult = generateCustomGroups({
    participants,
    numberOfGroups: 2,
    shuffleParticipants: true,
    twoLegs: true,
  })

  // Placeholder knockout rounds (will be filled after group stage)
  const koMatches: GeneratedMatch[] = []
  let matchNumber = groupsResult.matches.length + 1
  const koRounds = [
    { name: "Cuartos de final", order: 10, count: 4 },
    { name: "Semifinales", order: 11, count: 2 },
    { name: "Final", order: 12, count: 1 },
  ]

  for (const r of koRounds) {
    for (let i = 0; i < r.count; i++) {
      // Each tie is two legs
      for (let leg = 1; leg <= 2; leg++) {
        koMatches.push({
          round_name: r.name,
          round_order: r.order,
          match_number: matchNumber++,
          home_participant_id: null,
          away_participant_id: null,
          leg,
        })
      }
    }
  }

  return {
    groups: groupsResult.groups,
    matches: [...groupsResult.matches, ...koMatches],
    standings_participant_ids: groupsResult.standings_participant_ids,
  }
}

/**
 * PRIME CHAMPIONS ARENA
 * 16 players, 4 groups of 4, home-and-away, top 2 advance
 */
export function generatePrimeChampions(params: {
  participants: ParticipantRef[]
}): EngineResult {
  if (params.participants.length !== 16) {
    throw new Error("Champions Arena requiere exactamente 16 participantes")
  }

  const groupsResult = generateCustomGroups({
    participants: params.participants,
    numberOfGroups: 4,
    shuffleParticipants: true,
    twoLegs: true,
  })

  const koMatches: GeneratedMatch[] = []
  let matchNumber = groupsResult.matches.length + 1
  const koRounds = [
    { name: "Cuartos de final", order: 10, count: 4 },
    { name: "Semifinales", order: 11, count: 2 },
    { name: "Final", order: 12, count: 1 },
  ]

  for (const r of koRounds) {
    for (let i = 0; i < r.count; i++) {
      for (let leg = 1; leg <= 2; leg++) {
        koMatches.push({
          round_name: r.name,
          round_order: r.order,
          match_number: matchNumber++,
          home_participant_id: null,
          away_participant_id: null,
          leg,
        })
      }
    }
  }

  return {
    groups: groupsResult.groups,
    matches: [...groupsResult.matches, ...koMatches],
    standings_participant_ids: groupsResult.standings_participant_ids,
  }
}

/**
 * PRIME QUALIFIERS
 * Direct elimination, home-and-away, finalists enter Division 2
 */
export function generatePrimeQualifiers(params: {
  participants: ParticipantRef[]
}): EngineResult {
  const size = Math.pow(2, Math.ceil(Math.log2(Math.max(params.participants.length, 2))))
  const pool = [...params.participants]
  while (pool.length < size) {
    pool.push({ id: "__BYE__", display_name: "BYE" })
  }

  const matches: GeneratedMatch[] = []
  let matchNumber = 1
  let roundOrder = 10

  const roundNames: Record<number, string> = {
    2: "Final",
    4: "Semifinales",
    8: "Cuartos de final",
    16: "Octavos de final",
  }

  let teamsLeft = size
  while (teamsLeft >= 2) {
    const roundName = roundNames[teamsLeft] || `Ronda de ${teamsLeft}`
    for (let i = 0; i < teamsLeft / 2; i++) {
      for (let leg = 1; leg <= 2; leg++) {
        matches.push({
          round_name: roundName,
          round_order: roundOrder,
          match_number: matchNumber++,
          home_participant_id: null,
          away_participant_id: null,
          leg,
        })
      }
    }
    teamsLeft = teamsLeft / 2
    roundOrder++
  }

  // Fill first round with participants
  const firstRound = matches.filter(m => m.round_order === 10)
  let pIdx = 0
  for (const m of firstRound) {
    if (pIdx < pool.length) m.home_participant_id = pool[pIdx].id === "__BYE__" ? null : pool[pIdx].id
    pIdx++
    if (pIdx < pool.length) m.away_participant_id = pool[pIdx].id === "__BYE__" ? null : pool[pIdx].id
    pIdx++
  }

  return {
    groups: [],
    matches,
    standings_participant_ids: [],
  }
}
