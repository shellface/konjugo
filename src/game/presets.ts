import type {
  ArticleType,
  Case,
  CueMode,
  GenderCuePolicy,
  NumberKind,
} from '../content/types';

// A ramp stage defines the grammar pool a tier draws from. Each mode has a
// single stage that exhaustively covers its whole category right from round
// one — every case × every number (× every article type, for "all") is in
// the draw pool from the start, so `pick()` picks uniformly at random across
// the full category instead of unlocking cases in a fixed order. (Difficulty
// still climbs over time via the clock speeding up — see ramp.ts/CONFIG —
// just not via gating which grammar shows up.)

export interface Stage {
  cases: Case[];
  articleTypes: ArticleType[];
  numbers: NumberKind[];
}

// Strong declension (no article) — nominative through genitive are all
// carried by the adjective ending itself, singular and plural.
const RAMP_STRONG: Stage[] = [
  { cases: ['nom', 'acc', 'dat', 'gen'], articleTypes: ['none'], numbers: ['sg', 'pl'] },
];

// Weak declension (definite article: der/die/das) — same case/number spread
// as strong, just with the marker moved onto the article.
const RAMP_WEAK: Stage[] = [
  { cases: ['nom', 'acc', 'dat', 'gen'], articleTypes: ['definite'], numbers: ['sg', 'pl'] },
];

// Mixed declension (ein/kein/possessive) — plural collapses onto the weak
// pattern and isn't distinct, so v1 keeps mixed to singular only.
const RAMP_MIXED: Stage[] = [
  { cases: ['nom', 'acc', 'dat', 'gen'], articleTypes: ['indefinite'], numbers: ['sg'] },
];

// All categories together — every case × every article type × every number,
// all in one pool.
const RAMP_ALL: Stage[] = [
  {
    cases: ['nom', 'acc', 'dat', 'gen'],
    articleTypes: ['definite', 'indefinite', 'none'],
    numbers: ['sg', 'pl'],
  },
];

export interface Preset {
  id: 'strong' | 'weak' | 'mixed' | 'all';
  name: string;
  blurb: string;
  cueMode: CueMode;
  genderCue: GenderCuePolicy;
  baseClockMs: number;
  ramp: Stage[];
}

// Every mode uses the same standard clock and colours gender on the noun —
// no case labels anywhere; case reads from a preposition trigger (or, for
// nominative, from having no trigger at all).
const STANDARD_CLOCK_MS = 8112;

export const PRESETS: Preset[] = [
  {
    id: 'strong',
    name: 'Strong',
    blurb: 'No article · strong endings · gender coloured',
    cueMode: 'context',
    genderCue: 'color',
    baseClockMs: STANDARD_CLOCK_MS,
    ramp: RAMP_STRONG,
  },
  {
    id: 'weak',
    name: 'Weak',
    blurb: 'Definite article · weak endings · gender coloured',
    cueMode: 'context',
    genderCue: 'color',
    baseClockMs: STANDARD_CLOCK_MS,
    ramp: RAMP_WEAK,
  },
  {
    id: 'mixed',
    name: 'Mixed',
    blurb: 'Ein-words · mixed endings · gender coloured',
    cueMode: 'context',
    genderCue: 'color',
    baseClockMs: STANDARD_CLOCK_MS,
    ramp: RAMP_MIXED,
  },
  {
    id: 'all',
    name: 'All categories',
    blurb: 'Strong · weak · mixed together · gender coloured',
    cueMode: 'context',
    genderCue: 'color',
    baseClockMs: STANDARD_CLOCK_MS,
    ramp: RAMP_ALL,
  },
];

export function presetById(id: Preset['id']): Preset {
  const p = PRESETS.find((x) => x.id === id);
  if (!p) throw new Error(`unknown preset: ${id}`);
  return p;
}

