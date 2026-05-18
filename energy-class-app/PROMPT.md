# Prompt de reprise — Energy Class App

Copie-colle ce texte en début de conversation :

---

Je reprends le projet **Energy Class App** — une application React de classification énergétique des bâtiments.

Lis d'abord `PLAN.md` à la racine du projet pour avoir le contexte complet des décisions d'architecture.

**Résumé rapide :**
- Stack actuelle : Create React App + MUI + Supabase (partiellement intégré)
- Stack cible : Vite + shadcn/ui + Tailwind + TanStack Query + Supabase cloud
- Frontend self-hosted (Nginx/Caddy), auth + DB sur Supabase cloud
- Multi-utilisateurs avec RLS

**État du code :**
- `feature/supabase-auth` a un commit non mergé dans main (politiques RLS `global_results`)
- 2 TODOs bloquants : `created_by: 'current-user-id'` dans `TechnicalSolutionForm.tsx` et `TechnicalSolutionsList.tsx`

**On commence par le Sprint 1 :**
1. Merger `feature/supabase-auth` dans main
2. Migrer CRA → Vite
3. Remplacer MUI → shadcn/ui + Tailwind
4. Conserver la logique métier intacte (JSON classifications, contexts, services, types)
