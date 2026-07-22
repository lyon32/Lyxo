import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import fr from './fr.json';

// Fichiers de traduction vides à ce stade (tâche ROADMAP 1.1) — le
// contenu arrive avec chaque écran (règle CONVENTIONS §5.6 : zéro
// string UI en dur, même "juste pour tester").
// .use() est une méthode d'instance i18next, pas le hook React `use` — faux positif connu
// eslint-disable-next-line import/no-named-as-default-member
i18next.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

export default i18next;
