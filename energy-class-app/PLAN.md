# Plan de reprise — Energy Class App

_Décisions prises le 2026-05-18_

---

## Contexte

Application de classification énergétique des bâtiments (7 catégories : chauffage, ECS, refroidissement, ventilation/clim, éclairage, stores, GTB). Logique métier stockée en JSON, interface React, backend Supabase partiellement intégré.

---

## État actuel des branches

```
● 967266d  ◄─── feature/project-management  (localStorage + roadmap)
● ef61043  ◄─── feature/supabase-integration
● 04e6cba  ◄─── feature/supabase-deployment  (UI/UX responsive)
● 4eea7ac  (point de divergence)
         ├─● 4f9c929  ◄─── feature/supabase-auth  (RLS global_results — non mergé)
         │
● 661b91b  retire .env du git
● ca219ec  ◄─── main / HEAD
```

**Point de reprise :** `feature/supabase-auth` contient un commit non mergé dans main — correction des politiques RLS pour `global_results`. À merger avant de commencer.

**TODOs laissés dans le code :**
- `TechnicalSolutionForm.tsx` → `created_by: 'current-user-id'`
- `TechnicalSolutionsList.tsx` → `approveSolution(..., 'current-user-id')`

---

## Décisions d'architecture

### Priorités
- Légèreté et pérennité avant tout
- SEO non critique (app outil, utilisateurs authentifiés)
- Intégration future possible comme service / agent IA

### Stack retenue

| Couche | Choix | Remplace |
|---|---|---|
| Build | **Vite** | Create React App (abandonné) |
| UI | **shadcn/ui + Tailwind CSS** | Material-UI (lourd) |
| Data fetching | **TanStack Query** | Contexts custom |
| Auth + DB | **Supabase cloud** | — (déjà en place) |
| Déploiement frontend | **Nginx ou Caddy** (self-hosted) | — |

### Hébergement
- **Frontend** : self-hosted (serveur propre, fichiers statiques Vite)
- **Auth + Database** : Supabase cloud (PostgreSQL + RLS + API auto-générée)

```
Self-hosted (serveur)            Supabase cloud
─────────────────────────        ──────────────────────
Vite + React + TypeScript   ──►  Auth (OAuth, email...)
shadcn/ui + Tailwind             PostgreSQL + RLS
TanStack Query                   API REST auto-générée
Nginx / Caddy (static)
```

### Vision long terme
La logique de classification JSON est un **moteur d'évaluation** réutilisable.
À terme, l'exposer via **Supabase Edge Functions** pour permettre une intégration en service ou via un agent IA (Claude tool use).

---

## Plan de livraison

### Sprint 1 — Fondations (2-3 jours)
- [ ] Merger `feature/supabase-auth` dans main
- [ ] Migrer CRA → Vite
- [ ] Remplacer MUI → shadcn/ui + Tailwind
- [ ] Conserver la logique métier intacte (JSON, contexts, services, types)

### Sprint 2 — Auth complète (1 jour)
- [ ] Wiring Supabase Auth — remplacer les 2 `'current-user-id'` par `session.user.id`
- [ ] Page login / register fonctionnelle
- [ ] Protection des routes (redirect si non authentifié)

### Sprint 3 — Gestion projets (1-2 jours)
- [ ] CRUD projets isolés par utilisateur (RLS)
- [ ] Interface admin projets (TODO laissé dans `feature/supabase-auth`)
- [ ] Vérification cohérence `global_results` (discordance signalée dans les commits)

### Sprint 4 — Déploiement self-hosted (1 jour)
- [ ] Build Vite → dossier static
- [ ] Config Nginx / Caddy sur le serveur
- [ ] Variables d'environnement Supabase en prod
- [ ] Créer `.env.example` pour documenter les variables requises

### Sprint 5 — Service / Agent (plus tard)
- [ ] Extraire le moteur d'évaluation → Supabase Edge Functions
- [ ] Exposer les endpoints `/evaluate`, `/classify`, `/suggest`
- [ ] Intégration Claude API (tool use)

---

## Références utiles

- [shadcn/ui](https://ui.shadcn.com)
- [Vite migration depuis CRA](https://vitejs.dev/guide)
- [TanStack Query](https://tanstack.com/query)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth avec RLS](https://supabase.com/docs/guides/auth/row-level-security)
