import AsyncStorage from '@react-native-async-storage/async-storage';

// Choix pré-auth (LLD.md §4) : AsyncStorage brut, PAS Zustand — lus une
// seule fois par le PATCH post-login (API_SPEC §4.2), puis supprimés.
// profiles.goal/preferred_split (DB) devient l'unique source de vérité
// après le premier login.

export type OnboardingGoal = 'force' | 'masse' | 'regularite';
export type OnboardingSplit = 'ppl' | 'upper_lower' | 'full_body' | 'custom';

const GOAL_KEY = 'onboarding_goal';
const SPLIT_KEY = 'onboarding_split';
const LANGUAGE_KEY = 'app_language';

export async function getOnboardingGoal(): Promise<OnboardingGoal | null> {
  return (await AsyncStorage.getItem(GOAL_KEY)) as OnboardingGoal | null;
}

export async function setOnboardingGoal(goal: OnboardingGoal): Promise<void> {
  await AsyncStorage.setItem(GOAL_KEY, goal);
}

export async function getOnboardingSplit(): Promise<OnboardingSplit | null> {
  return (await AsyncStorage.getItem(SPLIT_KEY)) as OnboardingSplit | null;
}

export async function setOnboardingSplit(split: OnboardingSplit): Promise<void> {
  await AsyncStorage.setItem(SPLIT_KEY, split);
}

// Appelé après le PATCH post-login réussi (tâche 1.6) — la DB devient
// l'unique source de vérité, ces clés n'ont plus de raison d'exister.
export async function clearOnboardingChoices(): Promise<void> {
  await AsyncStorage.multiRemove([GOAL_KEY, SPLIT_KEY]);
}

export async function getStoredLanguage(): Promise<'fr' | 'en' | null> {
  return (await AsyncStorage.getItem(LANGUAGE_KEY)) as 'fr' | 'en' | null;
}

export async function setStoredLanguage(language: 'fr' | 'en'): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}
