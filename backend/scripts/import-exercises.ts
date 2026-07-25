// Import de la bibliothèque d'exercices — ROADMAP 2.1 (DATA_MODEL.md §2.3).
//
// Remplace ExerciseDB Pro (payant) par free-exercise-db (Unlicense,
// github.com/yuhonas/free-exercise-db) : sélectionne 200 exercices
// équilibrés par groupe musculaire, traduit le nom en FR (best-effort,
// cf. lib/translate-fr.ts), génère un GIF animé à partir des 2 JPG
// statiques source, l'upload dans Supabase Storage, puis upsert la table
// `exercises`.
//
// Usage :
//   npx tsx scripts/import-exercises.ts --dry-run            (aucun réseau/DB, juste la sélection + rapport)
//   npx tsx scripts/import-exercises.ts --limit=5             (test réel limité : gif + upload + upsert sur 5 lignes)
//   npx tsx scripts/import-exercises.ts                       (run complet, 200 exercices)
//
// Variables d'env requises pour un run non --dry-run : SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY (backend/.env, cf. ENV_SETUP.md §1.2).

import 'dotenv/config';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';

import { translateExerciseName } from './lib/translate-fr';
import { generateExerciseGif } from './lib/gif';
import { NAME_FR_OVERRIDES } from './lib/name-fr-overrides';

const DATASET_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const CACHE_PATH = path.join(__dirname, '.cache', 'exercises.json');
const OUTPUT_DIR = path.join(__dirname, 'output');
const STORAGE_BUCKET = 'exercise-gifs';

const TARGET_TOTAL = 200;
const EMBEDDED_PACK_TARGET = 50;
const MUSCLE_FLOOR = 4;
const MUSCLE_CAP = 26;

// Groupes musculaires "gros compound, utilisables sans salle complète" —
// candidats naturels pour le pack embarqué (IMPLEMENTATION_PLAN B1).
const EMBEDDED_ELIGIBLE_MUSCLES = new Set([
  'chest',
  'lats',
  'middle back',
  'shoulders',
  'quadriceps',
  'hamstrings',
  'glutes',
  'biceps',
  'triceps',
  'abdominals',
  'calves',
]);
const EMBEDDED_ELIGIBLE_EQUIPMENT = new Set(['body only', 'dumbbell', 'barbell']);
const EMBEDDED_PER_MUSCLE_CAP = 6;

const LEVEL_RANK: Record<string, number> = { beginner: 0, intermediate: 1, expert: 2 };

interface SourceExercise {
  id: string;
  name: string;
  level: string;
  category: string;
  equipment: string | null;
  primaryMuscles: string[];
  images: string[];
}

interface Candidate {
  source: SourceExercise;
  muscleGroup: string;
  equipment: string | null;
  nameFr: string;
  needsReview: boolean;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  return { dryRun, limit };
}

async function loadDataset(): Promise<SourceExercise[]> {
  if (existsSync(CACHE_PATH)) {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
  }
  const res = await fetch(DATASET_URL);
  if (!res.ok) throw new Error(`Téléchargement dataset échoué (${res.status})`);
  const data = (await res.json()) as SourceExercise[];
  mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(data));
  return data;
}

function buildCandidates(dataset: SourceExercise[]): Candidate[] {
  const pool = dataset.filter(
    (e) =>
      ['strength', 'powerlifting', 'olympic weightlifting'].includes(e.category) &&
      e.primaryMuscles.length > 0 &&
      e.images.length >= 2
  );
  return pool.map((source) => {
    const override = NAME_FR_OVERRIDES[source.id];
    const { nameFr, needsReview } = override
      ? { nameFr: override, needsReview: false }
      : translateExerciseName(source.name);
    return {
      source,
      muscleGroup: source.primaryMuscles[0],
      equipment: source.equipment,
      nameFr,
      needsReview,
    };
  });
}

// Score de tri : propre (déjà traduit), niveau accessible, nom court (les
// noms longs/à qualificatifs sont souvent des variantes obscures).
function qualityScore(c: Candidate): number {
  let score = 0;
  if (c.needsReview) score += 100;
  score += (LEVEL_RANK[c.source.level] ?? 1) * 10;
  score += Math.min(c.source.name.length, 60) / 10;
  return score;
}

function allocateMuscleTargets(candidates: Candidate[]): Record<string, number> {
  const countsByMuscle = new Map<string, number>();
  for (const c of candidates) {
    countsByMuscle.set(c.muscleGroup, (countsByMuscle.get(c.muscleGroup) ?? 0) + 1);
  }
  const muscles = [...countsByMuscle.keys()];
  const targets: Record<string, number> = {};
  for (const m of muscles) {
    targets[m] = Math.min(MUSCLE_FLOOR, countsByMuscle.get(m)!);
  }
  let allocated = Object.values(targets).reduce((a, b) => a + b, 0);
  const weights = muscles.map((m) => Math.sqrt(countsByMuscle.get(m)!));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Distribution proportionnelle du reste, au prorata de sqrt(pool
  // disponible) pour ne pas laisser 2-3 gros groupes (quadriceps,
  // shoulders...) monopoliser les 200 slots.
  let remaining = TARGET_TOTAL - allocated;
  let guard = 0;
  while (remaining > 0 && guard < 10000) {
    guard += 1;
    let progressed = false;
    for (let i = 0; i < muscles.length && remaining > 0; i++) {
      const m = muscles[i];
      const share = Math.max(1, Math.round((weights[i] / totalWeight) * (TARGET_TOTAL - allocated)));
      const room = Math.min(share, MUSCLE_CAP - targets[m], countsByMuscle.get(m)! - targets[m]);
      if (room > 0) {
        const take = Math.min(room, remaining);
        targets[m] += take;
        remaining -= take;
        allocated += take;
        progressed = true;
      }
    }
    if (!progressed) break; // tout le monde est plafonné (cap ou pool épuisé)
  }
  return targets;
}

function selectExercises(candidates: Candidate[]): Candidate[] {
  const targets = allocateMuscleTargets(candidates);
  const byMuscle = new Map<string, Candidate[]>();
  for (const c of candidates) {
    if (!byMuscle.has(c.muscleGroup)) byMuscle.set(c.muscleGroup, []);
    byMuscle.get(c.muscleGroup)!.push(c);
  }

  const selected: Candidate[] = [];
  for (const [muscle, target] of Object.entries(targets)) {
    const list = (byMuscle.get(muscle) ?? []).slice().sort((a, b) => qualityScore(a) - qualityScore(b));
    const equipmentCounts = new Map<string, number>();
    const softCap = Math.max(3, Math.ceil(target / 3));
    const picked: Candidate[] = [];
    const leftover: Candidate[] = [];
    for (const c of list) {
      if (picked.length >= target) break;
      const eq = c.equipment ?? 'none';
      const count = equipmentCounts.get(eq) ?? 0;
      if (count < softCap) {
        picked.push(c);
        equipmentCounts.set(eq, count + 1);
      } else {
        leftover.push(c);
      }
    }
    for (const c of leftover) {
      if (picked.length >= target) break;
      picked.push(c);
    }
    selected.push(...picked);
  }

  // Ajustement final : compléter/tronquer pour tomber pile sur TARGET_TOTAL
  // (les caps/planchers ci-dessus peuvent légèrement sous/sur-allouer).
  if (selected.length < TARGET_TOTAL) {
    const selectedIds = new Set(selected.map((c) => c.source.id));
    const rest = candidates
      .filter((c) => !selectedIds.has(c.source.id))
      .sort((a, b) => qualityScore(a) - qualityScore(b));
    for (const c of rest) {
      if (selected.length >= TARGET_TOTAL) break;
      selected.push(c);
    }
  } else if (selected.length > TARGET_TOTAL) {
    selected.sort((a, b) => qualityScore(a) - qualityScore(b));
    selected.length = TARGET_TOTAL;
  }

  return selected;
}

function pickEmbeddedPack(selected: Candidate[]): Set<string> {
  const eligible = selected
    .filter(
      (c) =>
        EMBEDDED_ELIGIBLE_MUSCLES.has(c.muscleGroup) &&
        (c.equipment === null || EMBEDDED_ELIGIBLE_EQUIPMENT.has(c.equipment))
    )
    .sort((a, b) => qualityScore(a) - qualityScore(b));

  const perMuscleCount = new Map<string, number>();
  const pack = new Set<string>();
  for (const c of eligible) {
    if (pack.size >= EMBEDDED_PACK_TARGET) break;
    const count = perMuscleCount.get(c.muscleGroup) ?? 0;
    if (count >= EMBEDDED_PER_MUSCLE_CAP) continue;
    pack.add(c.source.id);
    perMuscleCount.set(c.muscleGroup, count + 1);
  }
  return pack;
}

function writeReport(rows: Array<Candidate & { isEmbeddedPack: boolean }>) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const header = 'external_id,name_en,name_fr,muscle_group,equipment,level,needs_review,is_embedded_pack';
  const csvRows = rows.map((r) =>
    [
      r.source.id,
      csvEscape(r.source.name),
      csvEscape(r.nameFr),
      r.muscleGroup,
      r.equipment ?? '',
      r.source.level,
      r.needsReview ? 'yes' : '',
      r.isEmbeddedPack ? 'yes' : '',
    ].join(',')
  );
  writeFileSync(path.join(OUTPUT_DIR, 'exercises-report.csv'), [header, ...csvRows].join('\n') + '\n');
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

async function ensureBucket(supabase: SupabaseClient) {
  const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);
  if (data) return;
  if (error && !/not found/i.test(error.message)) throw error;
  const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: '2MB',
  });
  if (createError && !/already exists/i.test(createError.message)) throw createError;
}

async function main() {
  const { dryRun, limit } = parseArgs();

  console.log('Chargement du dataset free-exercise-db...');
  const dataset = await loadDataset();
  console.log(`  ${dataset.length} exercices source.`);

  const candidates = buildCandidates(dataset);
  console.log(`  ${candidates.length} candidats (catégories strength/powerlifting/olympic).`);

  const selected = selectExercises(candidates);
  const embeddedIds = pickEmbeddedPack(selected);

  const rows = selected
    .map((c) => ({ ...c, isEmbeddedPack: embeddedIds.has(c.source.id) }))
    .sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup) || a.source.name.localeCompare(b.source.name));

  writeReport(rows);

  const byMuscle = new Map<string, number>();
  let reviewCount = 0;
  for (const r of rows) {
    byMuscle.set(r.muscleGroup, (byMuscle.get(r.muscleGroup) ?? 0) + 1);
    if (r.needsReview) reviewCount++;
  }
  console.log(`\nSélection : ${rows.length} exercices, ${embeddedIds.size} dans le pack embarqué.`);
  console.log(`À relire humainement (traduction FR best-effort) : ${reviewCount}/${rows.length}.`);
  console.log('Répartition par groupe musculaire :');
  for (const [m, n] of [...byMuscle.entries()].sort()) console.log(`  ${m.padEnd(15)} ${n}`);
  console.log(`\nRapport détaillé : ${path.join(OUTPUT_DIR, 'exercises-report.csv')}`);

  if (dryRun) {
    console.log('\n--dry-run : aucun appel réseau image, aucune écriture Supabase.');
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants (backend/.env).');
  }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    // Node 20 n'a le WebSocket natif que depuis Node 22 — même contournement
    // que lib/supabase-admin.ts (Realtime non utilisé par ce script).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    realtime: { transport: ws as any },
  });
  await ensureBucket(supabase);

  const toProcess = typeof limit === 'number' ? rows.slice(0, limit) : rows;
  console.log(`\nGénération GIF + upload + upsert pour ${toProcess.length} exercice(s)...`);

  let done = 0;
  for (const r of toProcess) {
    const [img0, img1] = r.source.images;
    const gifBuffer = await generateExerciseGif([IMAGE_BASE_URL + img0, IMAGE_BASE_URL + img1]);

    const storagePath = `${r.source.id}.gif`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, gifBuffer, { contentType: 'image/gif', upsert: true });
    if (uploadError) throw new Error(`Upload GIF échoué (${r.source.id}) : ${uploadError.message}`);

    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    const { error: upsertError } = await supabase.from('exercises').upsert(
      {
        external_id: r.source.id,
        name_fr: r.nameFr,
        name_en: r.source.name,
        muscle_group: r.muscleGroup,
        equipment: r.equipment,
        gif_url: publicUrlData.publicUrl,
        is_embedded_pack: r.isEmbeddedPack,
      },
      { onConflict: 'external_id' }
    );
    if (upsertError) throw new Error(`Upsert échoué (${r.source.id}) : ${upsertError.message}`);

    done += 1;
    if (done % 10 === 0 || done === toProcess.length) {
      console.log(`  ${done}/${toProcess.length}`);
    }
  }

  console.log('\nTerminé.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
