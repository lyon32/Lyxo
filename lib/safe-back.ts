import { router, type Href } from 'expo-router';

// router.back() plante ("GO_BACK not handled") quand l'écran courant a
// été atteint via replace() plutôt que push() — pas d'historique à
// dépiler. Toujours passer par ici plutôt que router.back() direct sur
// un écran atteignable par les deux chemins (auth notamment : signOut
// fait un replace, la navigation normale un push).
export function goBackSafely(fallbackHref: Href) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref);
  }
}
