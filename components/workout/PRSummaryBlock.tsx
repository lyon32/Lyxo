import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react-native';

import type { SessionPR } from '../../db/use-workout-summary';
import { formatWeight, type Locale, type WeightUnit } from '../../lib/units';
import { groupPRsByExercise } from '../../lib/workout-summary';

// Bloc "Records" du résumé de fin de séance — refonte du 2026-08-03.
//
// Remplace l'empilement d'une `PRCard` pleine largeur par record. Ce format
// était justifié dans la MODALE de célébration (moment "peak" : un exercice,
// un record, plein écran) et ne l'était pas ici (moment "end" : toute la
// séance d'un coup d'œil). Deux raisons concrètes :
//
// 1. Une `PRCard` sur cet écran est presque vide. Son delta ne s'affiche que
//    si `previousBest` est renseigné (`PRCelebrationModal.deltaLabel`), or
//    `use-workout-summary.ts` le code en dur à `null` — la carte se réduit
//    donc à un badge et un chiffre dans une boîte de ~160 px.
// 2. Le nom de l'exercice y est perdu : `PRCard` ne l'affiche que pour
//    `pr.type === 'weight'`. Sur une séance à plusieurs exercices, les autres
//    records ne disaient pas d'où ils venaient.
//
// ⚠️ `PRCard` reste inchangée et reste utilisée par la modale : les deux
// écrans ont des intentions différentes, les faire diverger est plus honnête
// que de tordre un composant pour en servir deux.
export function PRSummaryBlock({
  prs,
  exerciseNameById,
  unit,
  locale,
}: {
  prs: SessionPR[];
  exerciseNameById: (exerciseId: string) => string;
  unit: WeightUnit;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const groups = groupPRsByExercise(prs);

  // Repliable — ajouté après test sur appareil : une séance de 4 exercices
  // battant les 4 types produit 16 lignes, et le bloc redevenait un mur.
  //
  // Le PREMIER groupe est ouvert par défaut, les autres repliés. Tout replier
  // ferait de l'écran de célébration un simple menu (aucun chiffre visible) ;
  // tout déplier reproduit le mur. Ouvrir le premier donne une récompense
  // immédiate tout en gardant l'écran court. Une seule ligne à inverser si on
  // veut changer d'avis.
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    groups.length > 0 ? { [groups[0]!.exerciseId]: true } : {},
  );

  if (prs.length === 0) return null;

  const toggle = (exerciseId: string) =>
    setExpanded((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }));

  // La mention "visible uniquement dans tes stats perso" était répétée sur
  // CHAQUE ligne — sur un compte où l'anti-triche marque tout non éligible
  // (moins de 3 séances sur l'exercice, §18.1), les 16 lignes la portaient.
  // Une note unique en pied de bloc dit la même chose sans le bruit ; la
  // supprimer entièrement effacerait une promesse de confidentialité.
  const privateCount = prs.filter((pr) => !pr.isSocialEligible).length;

  return (
    <View className="w-full overflow-hidden rounded-card border border-border bg-card">
      <View className="flex-row items-baseline justify-between px-4 pb-2 pt-3">
        {/* Capitales toujours interlettrées (typographie, 5-12 %) : sans ça
            elles forment un bloc gris illisible à cette taille. */}
        <Text className="text-xs uppercase tracking-widest text-muted">
          {t('workout.summary.prs_title')}
        </Text>
        <Text className="text-xs text-muted">
          {t('workout.summary.prs_count', { count: prs.length, exercises: groups.length })}
        </Text>
      </View>

      {groups.map((group) => {
        const isOpen = expanded[group.exerciseId] ?? false;
        return (
          <View key={group.exerciseId} className="border-t border-border">
            <Pressable
              onPress={() => toggle(group.exerciseId)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              accessibilityLabel={exerciseNameById(group.exerciseId)}
              // `min-h-tap` : la zone tactile fait 56 px même quand le
              // texte est plus court.
              className="min-h-tap flex-row items-center gap-2 px-4 py-3 active:bg-input"
            >
              {/* Le nom apparaît UNE fois, en tête de groupe — c'est tout
                  l'objet de la refonte. `numberOfLines` plutôt qu'un retour
                  à la ligne : un nom long ne doit pas pousser le compteur
                  hors du bloc. */}
              <Text className="flex-1 font-inter-semibold text-sm text-fg" numberOfLines={1}>
                {exerciseNameById(group.exerciseId)}
              </Text>
              <Text className="text-xs text-muted">
                {t('workout.summary.prs_group_count', { count: group.prs.length })}
              </Text>
              <ChevronDown
                size={16}
                color="#8E8781"
                style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
              />
            </Pressable>

            {isOpen
              ? group.prs.map((pr, index) => (
                  <View
                    // Un même type peut être battu deux fois sur le même
                    // exercice (deux séries distinctes) : l'index complète
                    // la clé.
                    key={`${pr.type}-${index}`}
                    className="flex-row items-center gap-3 px-4 pb-2.5"
                  >
                    <Text className="flex-1 text-xs uppercase tracking-wider text-ember">
                      {t(`workout.pr.badge_${pr.type}`)}
                    </Text>
                    <Text className="font-inter-bold text-lg text-fg">
                      {pr.type === 'reps' ? `${pr.value}` : formatWeight(pr.value, unit, locale)}
                    </Text>
                  </View>
                ))
              : null}
          </View>
        );
      })}

      {privateCount > 0 ? (
        <Text className="border-t border-border px-4 py-2.5 text-xs text-muted">
          {privateCount === prs.length
            ? t('workout.summary.prs_private_all')
            : t('workout.summary.prs_private_some')}
        </Text>
      ) : null}
    </View>
  );
}
