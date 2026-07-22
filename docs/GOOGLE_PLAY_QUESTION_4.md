# GOOGLE_PLAY_QUESTION_4.md — LYXO · Question écrite n°4 au Play Support
# Statut : ✅ RÉSOLU — envoyée (version courte < 1000 chars) et RÉPONDUE
# (Juillet 2026). Réponse : l'affichage des prix + badge est CONFORME sans
# bouton/lien/URL/CTA. Réponse intégrale archivée : BILLING_FLOW.md §9ter.
# Décision appliquée : écran 16 garde sa grille tarifaire ; variante sans
# prix conservée en fallback derrière feature flag. Dossier clos.
# Objet : affichage des PRIX sur l'écran informatif "consumption-only" Afrique
# Référence interne : BILLING_FLOW.md §8 (checklist), §9/§9bis (réponses 1-3 archivées)
# Canal : Play Console → Help → Contact support (même fil que les questions 1-3 si possible)
# ⚠️ À l'envoi : rester factuel, ne rien promettre, citer le contexte des réponses précédentes.
# Archiver la réponse INTÉGRALE dans BILLING_FLOW.md §9ter dès réception.

---

## 1. Texte à envoyer (EN — langue du support)

> Subject: Follow-up — displaying subscription prices on an informational
> screen in countries where Google Play's billing system is unavailable
>
> Hello,
>
> This is a follow-up to previous answers your team kindly provided
> regarding our app (package: com.lyxo.app). Context confirmed so far:
>
> 1. For users in countries where Google Play's billing system is not
>    available (e.g. Cameroon), our app remains consumption-only: an
>    in-app informational screen with NO payment button, NO link, NO URL,
>    NO site name, and NO wording that encourages an out-of-app purchase.
>    The purchase invitation lives exclusively in an email sent outside
>    the app. Your team confirmed this flow is compliant.
> 2. We provide active, reusable reviewer credentials in App access for
>    both user states.
>
> Our remaining question concerns one specific detail of that
> informational screen:
>
> **May this consumption-only screen display the subscription tier
> information — feature list, local prices (e.g. "Pass Mensuel — 3 500
> FCFA / mois", "Pass Annuel — 15 000 FCFA / an") and a "best value"
> badge — provided that the screen still contains no payment button, no
> link, no URL, no site name, and no call to action to purchase?**
>
> In other words: is a plain price display on an account-information
> screen considered "language that encourages an out-of-app purchase"
> under the Payments policy, or is it acceptable as product information,
> as long as the actual purchase path is never referenced in-app?
>
> If displaying prices is not acceptable, we will ship a price-free
> variant of the screen (benefits + trial information only) for these
> users — we have both variants ready and simply want to ship the
> compliant one.
>
> Thank you for your guidance.

---

## 2. Décision selon la réponse (à exécuter à réception)

| Réponse de Google | Action |
|---|---|
| Prix autorisés | Garder l'écran 16 actuel (LYXO_UI_PROMPT). Archiver la réponse en §9ter. Cocher la case checklist §8. |
| Prix interdits / ambigus | Activer la variante SANS grille tarifaire (bénéfices + trial uniquement — feature flag déjà prévu, LYXO_UI_PROMPT écran 16 "PRICE-DISPLAY CAVEAT"). Mettre à jour LYXO_UI_PROMPT + BILLING_FLOW §4.1. |
| Pas de réponse avant le Bloc R9 | Par défaut : variante SANS prix (échec fermé, SECURITY_NOTES §4 — on ne soumet jamais sur une zone grise non confirmée). |

---

## 3. Rappels avant envoi
- Envoyer depuis le compte développeur officiel (le même que les fils 1-3).
- Ne PAS mentionner PawaPay/Mobile Money dans la question (non pertinent :
  la question porte sur l'écran in-app, pas sur le moyen de paiement).
- Copier la réponse INTÉGRALE (pas un résumé) dans BILLING_FLOW.md §9ter,
  datée, comme pour les réponses 1-3.

*Documents liés : BILLING_FLOW.md §4.1/§8/§9/§9bis · LYXO_UI_PROMPT.md
écran 16 · CLAUDE_LYXO_V3.md §19.12bis.*
