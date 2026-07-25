// Génère les vignettes STATIQUES légères du pack embarqué — ROADMAP 2.1.
//
// Décision (2026-07-25) : bundler les 50 GIFs animés du pack embarqué
// coûterait ~14 Mo (moitié du budget < 30 Mo, PROJECT_BRIEF §3). À la
// place, on embarque 1 image statique WebP légère (~15-30 Ko) par exercice
// du pack — cohérent avec la logique Data Saver (.jpg/.webp statique au
// lieu du .gif animé, CONVENTIONS §5.7). L'image anime toujours (GIF
// distant) dans le détail quand le réseau est là ; la vignette locale sert
// d'aperçu offline instantané.
//
// Source : première frame free-exercise-db (même dataset que
// import-exercises.ts), recompressée. Sortie : assets/exercises/{id}.webp
// + un index de `require()` statiques (RN exige des chemins littéraux pour
// bundler un asset) : assets/exercises/embedded-images.generated.ts.
//
// Usage : npx tsx scripts/generate-embedded-thumbs.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const CACHE_PATH = path.join(__dirname, '.cache', 'exercises.json');
const REPORT_PATH = path.join(__dirname, 'output', 'exercises-report.csv');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'exercises');
const INDEX_PATH = path.join(ASSETS_DIR, 'embedded-images.generated.ts');

const THUMB_SIZE = 240; // carré, suffisant pour vignette liste + placeholder détail
const WEBP_QUALITY = 72; // ~15-30 Ko/image à cette taille

interface SourceExercise {
  id: string;
  images: string[];
}

// Lit les external_id du pack embarqué depuis le rapport d'import (col 8 =
// is_embedded_pack), pas de dépendance réseau/DB pour établir la liste.
function readEmbeddedIds(): string[] {
  const lines = readFileSync(REPORT_PATH, 'utf8').trim().split('\n').slice(1);
  const ids: string[] = [];
  for (const line of lines) {
    // CSV simple : les champs sans virgule interne (external_id, flags) ne
    // sont jamais quotés ; on lit le 1er et le 8e champ par split basique en
    // ne considérant que les lignes dont le dernier champ vaut 'yes'.
    const cols = line.split(',');
    const externalId = cols[0];
    const isEmbedded = cols[cols.length - 1] === 'yes';
    if (isEmbedded) ids.push(externalId);
  }
  return ids;
}

function loadImageMap(): Map<string, string> {
  if (!existsSync(CACHE_PATH)) {
    throw new Error(`Dataset cache absent (${CACHE_PATH}) — lance d'abord import-exercises.ts.`);
  }
  const dataset = JSON.parse(readFileSync(CACHE_PATH, 'utf8')) as SourceExercise[];
  const map = new Map<string, string>();
  for (const e of dataset) {
    if (e.images && e.images.length > 0) map.set(e.id, e.images[0]);
  }
  return map;
}

async function generateThumb(imagePath: string, outPath: string): Promise<number> {
  const res = await fetch(IMAGE_BASE_URL + imagePath);
  if (!res.ok) throw new Error(`Téléchargement image échoué (${res.status}) : ${imagePath}`);
  const input = Buffer.from(await res.arrayBuffer());
  const output = await sharp(input)
    .resize(THUMB_SIZE, THUMB_SIZE, {
      fit: 'contain',
      background: { r: 24, g: 22, b: 21, alpha: 1 }, // fond thème Braise (bg app)
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  writeFileSync(outPath, output);
  return output.length;
}

function writeIndex(ids: string[]) {
  const entries = ids
    .slice()
    .sort()
    .map((id) => `  ${JSON.stringify(id)}: require(${JSON.stringify(`./${id}.webp`)}),`)
    .join('\n');
  const content = `// AUTO-GÉNÉRÉ par backend/scripts/generate-embedded-thumbs.ts — NE PAS ÉDITER.
// Vignettes statiques du pack embarqué (ROADMAP 2.1). React Native exige des
// chemins require() littéraux pour bundler un asset : cet index les fournit.
// Clé = exercises.external_id ; valeur = module asset (numérique RN).

export const EMBEDDED_EXERCISE_IMAGES: Record<string, number> = {
${entries}
};
`;
  writeFileSync(INDEX_PATH, content);
}

async function main() {
  const embeddedIds = readEmbeddedIds();
  console.log(`Pack embarqué : ${embeddedIds.length} exercices.`);

  const imageMap = loadImageMap();
  mkdirSync(ASSETS_DIR, { recursive: true });

  const written: string[] = [];
  let totalBytes = 0;
  for (const id of embeddedIds) {
    const imagePath = imageMap.get(id);
    if (!imagePath) {
      console.warn(`  ⚠️ pas d'image source pour ${id} — ignoré.`);
      continue;
    }
    const outPath = path.join(ASSETS_DIR, `${id}.webp`);
    const bytes = await generateThumb(imagePath, outPath);
    totalBytes += bytes;
    written.push(id);
    if (written.length % 10 === 0) console.log(`  ${written.length}/${embeddedIds.length}`);
  }

  writeIndex(written);
  console.log(`\n${written.length} vignettes générées, index écrit (${path.basename(INDEX_PATH)}).`);
  console.log(`Poids total ajouté au bundle : ${(totalBytes / 1024 / 1024).toFixed(2)} Mo.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
