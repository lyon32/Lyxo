import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react-native';

import type { SessionPR } from '../../db/use-workout-summary';
import { prDeltaLabel } from '../../lib/pr-display';
import { formatWeight, type Locale, type WeightUnit } from '../../lib/units';
import { groupPRsByExercise } from '../../lib/workout-summary';

// Libellé accessible d'une ligne de record : type, valeur, et la progression
// en toutes lettres. La phrase complète n'existe QUE ici — à l'écran, le
// delta est réduit à "+2,5 kg" faute de place.
function buildRowLabel(
  pr: SessionPR,
  t: (key: string, options?: Record<string, unknown>) => string,
  unit: WeightUnit,
  locale: Locale,
): string {
  const value = pr.type === 'reps' ? `${pr.value}` : formatWeight(pr.value, unit, locale);
  const delta = prDeltaLabel(pr, unit, locale);
  const base = `${t(`workout.pr.badge_${pr.type}`)}, ${value}`;
  return delta ? `${base}, ${t('workout.summary.prs_delta_a11y', { delta })}` : base;
}

// Bloc "Records" du résumé de fin de séance — refonte du 2026-08-03.
//
// Remplace l'empilement d'une `PRCard` pleine largeur par record. Ce format
// était justifié dans la MODALE de célébration (moment "peak" : un exercice,
// un record, plein écran) et ne l'était pas ici (moment "end" : toute la
// séance d'un coup d'œil). Deux raisons concrètes :
//
// 1. Le nom de l'exercice y est perdu : `PRCard` ne l'affiche que pour
//    `pr.type === 'weight'`. Sur une séance à plusieurs exercices, les autres
//    records ne disaient pas d'où ils venaient. C'est l'argument qui tient
//    toujours et qui justifie à lui seul de ne pas revenir à `PRCard`.
// 2. ⚠️ PRÉMISSE PÉRIMÉE, conservée pour mémoire : la refonte invoquait aussi
//    le fait qu'une `PRCard` était presque vide, son delta ne s'affichant que
//    si `previousBest` était renseigné — or il était codé en dur à `null`.
//    Depuis le 2026-08-03, `previous_best` est persisté (schéma v4) et le
//    delta s'affiche ici comme dans la modale. Cet argument ne vaut donc
//    plus ; le premier suffit.
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
                    // Ligne groupée pour les lecteurs d'écran : sans ça, les
                    // trois `Text` sont annoncés séparément et le delta perd
                    // son sens. C'est ici, et seulement ici, qu'on écrit la
                    // phrase complète — à l'écran elle ne tiendrait pas.
                    accessible
                    accessibilityLabel={buildRowLabel(pr, t, unit, locale)}
                    className="flex-row items-baseline gap-3 px-4 pb-2.5"
                  >
                    <Text className="flex-1 text-xs uppercase tracking-wider text-ember">
                      {t(`workout.pr.badge_${pr.type}`)}
                    </Text>
                    <Text className="font-inter-bold text-lg text-fg">
                      {pr.type === 'reps' ? `${pr.value}` : formatWeight(pr.value, unit, locale)}
                    </Text>
                    {/* Delta seul ("+2,5 kg"), jamais la phrase complète : la
                        ligne fait déjà trois colonnes sous un nom d'exercice
                        tronqué. Rien du tout quand `previousBest` est inconnu
                        — pas de badge "1er record", qui couvrirait TOUTES les
                        lignes d'un compte neuf et recréerait le mur que cette
                        refonte a supprimé. */}
                    {prDeltaLabel(pr, unit, locale) ? (
                      <Text className="font-inter-semibold text-xs text-ember">
                        {prDeltaLabel(pr, unit, locale)}
                      </Text>
                    ) : null}
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
