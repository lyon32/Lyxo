// Génère un GIF animé (ping-pong) à partir des 2 JPG statiques d'un
// exercice free-exercise-db, en remplacement des vrais GIFs ExerciseDB Pro
// (voir décision : alternative gratuite/Unlicense, cf. conversation import).
import sharp from 'sharp';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

const FRAME_SIZE = 480; // carré, cohérent avec un affichage carte/liste
const FRAME_DELAY_MS = 700;

async function fetchImageRgba(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Téléchargement image échoué (${res.status}) : ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return sharp(Buffer.from(arrayBuffer))
    .resize(FRAME_SIZE, FRAME_SIZE, {
      fit: 'contain',
      background: { r: 24, g: 22, b: 21, alpha: 1 }, // fond proche du thème Braise (bg app)
    })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

// 2 images sources -> boucle allongée en ping-pong (A, B, B, A) pour un
// mouvement moins saccadé qu'un simple aller-retour A/B.
export async function generateExerciseGif(imageUrls: [string, string]): Promise<Buffer> {
  const [frameA, frameB] = await Promise.all(imageUrls.map(fetchImageRgba));

  const combined = new Uint8Array(frameA.length + frameB.length);
  combined.set(frameA, 0);
  combined.set(frameB, frameA.length);
  const palette = quantize(combined, 256);

  const indexA = applyPalette(frameA, palette);
  const indexB = applyPalette(frameB, palette);

  const gif = GIFEncoder();
  const sequence = [indexA, indexB, indexB, indexA];
  sequence.forEach((index, i) => {
    gif.writeFrame(index, FRAME_SIZE, FRAME_SIZE, {
      palette: i === 0 ? palette : undefined,
      delay: FRAME_DELAY_MS,
      repeat: 0,
    });
  });
  gif.finish();

  return Buffer.from(gif.bytes());
}
