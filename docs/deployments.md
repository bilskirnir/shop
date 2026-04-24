---
title: Bilskirnir — Déploiements
date: 2026-04-24
---

# Déploiements

## Environnements Oxygen

| Env | URL | Note |
|---|---|---|
| Production | https://01kpzpn85xrex44zqxkshjjczy-24e050e5b40234b8507d.myshopify.dev | Premier deploy — 2026-04-24 |

## Process de deploy

Déploiement **manuel** (pas de CI/CD GitHub — on a refusé la PR Shopify au setup).

Depuis `storefront/` :

```bash
npm run build            # sanity check local
npx shopify hydrogen deploy
```

Choisir l'environnement au prompt (par défaut : Production).

## Store Shopify

- **Admin** : https://admin.shopify.com/store/bilskirnir-2
- **Store domain (API)** : `v0xsuc-pj.myshopify.com` — c'est le canonical URL utilisé par le Storefront API et le `.env`, alias de bilskirnir-2
- **Hydrogen storefront** : `Bilskirnir` (liste dans Admin → Hydrogen)

## Remote GitHub

- `https://github.com/bilskirnir/shop.git` — org Bilskirnir (gérée par Uriel)
- Branch principale : `main`
- Pas de déploiement continu : Oxygen deploy reste 100 % manuel.
