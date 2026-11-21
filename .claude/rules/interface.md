---
paths:
  - "**/*.css"
  - "**/*.tsx"
  - "**/*.jsx"
---

# Interface et direction artistique

> Choix visuels arrêtés par Uriel pour la boutique de Gauthier.
> Regroupé le 25/09/2026 depuis la mémoire locale, pour que ce savoir voyage avec le dépôt.

## feedback_visual_direction

> **DÉPASSÉ (19/11/2026)** : la direction artistique validée est désormais celle de `docs/brief-theme-liquid.md` et de la maquette `docs/maquette-2026-11-19/` (encre + ivoire `#ece5d6`, boutons pilule **or antique** `#d2b06a`, Buenard + Source Sans 3, forêt et braises). Les choix « zéro or » et Bricolage/Inter ci-dessous ne valent plus. Le reste de ce fichier (animations, rayon) reste valable.

**Soul (unchanged):** dark, atmospheric, heroic; covers as the stars; equal-weight universe presentation (see [[feedback_no_hero_treatment]]); modern motion. The **old flyer brand** (crimson/brick CTAs, Norse knotwork/interlace, parchment) stays **dated and rejected**. Reuse only the **hall emblem logo** from `\\EGIDE\Bilskirnir` (`Logos\Logo Blanc.png`).

**Skin — SUPERSEDED (2026-06-19):** the refonte-1 execution (bronze/**gold** accents, **Cabinet Grotesk + Switzer**, horizontal universe slider) was judged **"vieillot / 2010"** by the user ("le doré sur noir, les polices… c'est tellement 2010"). New validated language = **« encre »**:
- Palette **ink `#0b0b0c` + cream `#f2efe7`**, **zero gold**; accent = **per-univers/saga colour** (halo), neutral cream by default.
- Type: **Bricolage Grotesque** (display/titles 600/800) + **Inter** (labels/body). Replaces Cabinet/Switzer/gold.
- Finition: **coloured halo** bleeding over covers (per saga), film **grain**, hairlines, cream-inverted CTA pills.
- Accueil: **vertical scroll-snap "Reels", 1 screen per SAGA** (not per univers — saga = narrative unit), parallax layers. Replaces the horizontal slider.

**Why:** evolved taste; the prior direction now reads as a "premium whisky" cliché to the user. **How to apply:** validated via visual companion across all surfaces (home, footer, univers, fiche, catalogue, nav/atoms). See spec + Phase A plan — [[project_redesign_progress]]. The halo colour must come from a **Saga metaobject** field.

## feedback_animation_approach

On the Bilskirnir vertical home (`SagaScroller`), **CSS scroll-driven animations (`animation-timeline: view()`) rendered completely STATIC** — nothing animated at all. Cause: the panels are `overflow:hidden` inside a nested `overflow-y:scroll` scroll-snap container with `position:absolute` layers; `view()` timelines don't resolve/drive in that setup (and it's not reduced-motion — the user had all animations maxed and confirmed other sites animate). Cost a long debugging loop.

**Use instead (reliable everywhere):** the `useActivePanel` IntersectionObserver already computes the active panel index → pass it down to add a **`is-active` class** on the active panel; drive entrance reveals with **plain CSS `transition`s** keyed off `.is-active`, and add life with **plain infinite `@keyframes` loops** (float/pulse/bob). Footer entrance: SagaScroller adds `is-active` to the footer wrapper when `activeIndex === screens.length`.

**Why:** user wants the site VIVANT (alive), not static; `view()` silently failed. **How to apply:** for Phase C/D and any future scroll animation on this project, default to JS-class + CSS transitions/loops; don't rely on `animation-timeline: view()` inside scroll-snap/overflow-hidden contexts. Always gate motion under `prefers-reduced-motion: reduce`. See [[project_redesign_progress]].

## feedback_base_radius

Le rayon de base du site Bilskirnir est le token **`--bsk-radius` (14px)**, défini dans `app/styles/tokens.css`. Il est calé sur la zone de dédicaces (`DedicaceField`). Tout élément à coins arrondis **non totalement rond** (boutons, champs, cartes, blocs…) doit utiliser `var(--bsk-radius)`.

**Why:** L'utilisateur a explicitement posé cette convention (2026-05-23) après avoir trouvé un bouton à radius incohérent « moche ». Les éléments complètement ronds (pills, pastilles, avatars) gardent `999px`/`50%`.

**How to apply:** Pour tout nouvel élément arrondi non-circulaire, écrire `borderRadius: 'var(--bsk-radius)'` (inline) ou `border-radius: var(--bsk-radius)` (CSS) plutôt qu'une valeur en dur. Ne pas réintroduire de `10px`/`14px`/`16px` codés en dur pour ce cas.

Note : le bouton Shop Pay (`<shop-pay-button>`, web component Shopify) n'expose pas son border-radius — impossible de l'aligner sur le token. Voir [[feedback_visual_direction]].

## feedback_no_collection_images

Pour Bilskirnir, il n'y a **pas d'image de fond / illustration_hero** pour les collections (univers). On ne dispose **que des couvertures des livres**. Tout design de page univers/collection (et tout ce qui « attend » une image d'ambiance) doit donc s'appuyer sur **les couvertures + la description de l'univers (lore)**, pas sur un hero à grande image de fond.

**Why:** L'utilisateur l'a répété plusieurs fois (dont le 2026-05-23, agacé). La 1ère version de la page univers reposait sur un hero atmosphérique pensé pour une image de fond → paraît vide/« ancien design » sans image.

**How to apply:** Concevoir les pages univers/catalogue autour des couvertures (mises en valeur, object-fit:cover, hover) et du texte de lore. Le hero teinté (gradient `--bsk-uni`) peut rester en accent, mais ne doit jamais être le pilier visuel. Voir [[feedback_visual_direction]], [[reference_visual_redesign]].

## User dislikes "hero" single-item homepage treatments

Do **not** propose a single-item cinematic hero (big full-screen featured item with tagline and CTA) on homepages for this user's projects.

**Why:** The user explicitly rejected this treatment with "pas de héros à la con." They want the "stand de libraire / stand de salon" effect — visitors arrive and see the works/products laid out equally, no hierarchy between them, the catalog itself is the hero. They reference Runes de Chêne's homepage as inspiration: a carousel of product tiles, all at the same visual weight.

**How to apply:**
- For homepage proposals, default to **carousel/slideshow of item tiles** as the dominant element (not a single featured item hero).
- If a welcoming element is needed, keep it small (a one-line tagline, a thin header bar) — never a big hero block above the catalog.
- Equal visual weight across items. No "book of the month" singled out cinematically.
- When in doubt, lean toward the Runes de Chêne reference pattern (runesdechene.com).

## Use frontend-design skill for visual phase of Bilskirnir

The user (illustrator + dev) has explicitly asked to be flagged when the `frontend-design:frontend-design` skill should kick in for the Bilskirnir project.

**Rule:** Before writing any page that has creative/visual ambition (homepage slideshow "stand de libraire", page univers with hero banner + saga sections, fiche tome with cover stacking + sidebar, fiche one-shot immersive), propose running `frontend-design:frontend-design` to generate a distinctive, production-grade design rather than vanilla defaults.

**Why:** Plan 1 deliberately stayed functional/infra-only — dark tokens, plain grids, no creative styling. That was the right choice for nav + tokens + testing harness. But from Plan 2 onward the product starts showing its face to readers, and vanilla inline styles will look "old-school" (user's words). The frontend-design skill exists specifically to avoid generic AI aesthetics.

**How to apply:**
- Before Plan 2 Task 1 (homepage slideshow), say: "This is where frontend-design should run — want me to invoke it?"
- Same gate for page univers, fiche tome, fiche one-shot
- For components that are purely structural (Container, Ornament, Header nav grid) vanilla tokens are fine
- Don't invoke for data layer tasks, Shopify setup, or tests

**Confirmed by:** user message on 2026-04-24 after Plan 1 wrap-up: « Le design est bien sûr encore un peu vieux jeu car c'est de la base, on est pas encore placé par Claude Design. Ce sera à toi de me dire quand d'ailleurs. »

## Bilskirnir shop — design spec and editorial library

The validated design spec for the Bilskirnir shop project lives at:

`docs/superpowers/specs/2026-04-23-bilskirnir-shop-design.md`

It is the source of truth for:

- **Tech stack decisions** (Shopify + Hydrogen + Oxygen, rejected alternatives)
- **Data model** (Univers = Collection, Saga = Metaobject, Tome = Product)
- **Commerce and ops** (dédicace UX, precommande, VAT, shipping, payments)
- **Design language** (dark mode global, cover stacking rules, ornamental separators)
- **All page templates** (homepage, page univers, fiche tome, fiche one-shot immersive, page "La maison", nav globale)
- **Editorial content library** (Section 2) — taglines, catchphrases, manifeste, lore univers, synopses sagas, teasers — to be validated by Gautier Durieux de Madron before publication
- **Scope in/out** and open questions

The user wanted the editorial texts preserved explicitly (brand voice, catchphrases, synopses) and may import the file into Obsidian. The spec serves as their durable reference.

**Mockups** are preserved at `.superpowers/brainstorm/16170-*/content/*.html` — each step of the brainstorm has its dark-mode mockup.

**When starting implementation work on this project**, read the spec first — it captures all decisions made during brainstorming and avoids re-litigating them.

## reference_visual_redesign

The validated **visual redesign** of the Bilskirnir shop (the immersive/animated/pro design phase, mobile-first) lives at:

- Spec: `docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md`
- Mockups (open in browser): `docs/superpowers/mockups/2026-05-22-visual-redesign/` — home (desktop+mobile), univers, fiche tome, fiche one-shot, La maison.

Design system: dark grey (`#131419`) base + **gold/bronze** permanent accent + per-universe master colour used only as a discreet accent; **Cabinet Grotesk + Switzer**; covers are transparent 3D mock-ups → always `drop-shadow`, never a framed box; full-height equal-weight **universe slider** home with no footer; smart hide/show nav; dedication block; status badges on covers. See [[feedback_visual_direction]] and [[feedback_no_hero_treatment]]. Builds on the structural/editorial spec [[reference_design_spec]].

Next step after this spec: an implementation plan (writing-plans) to build it in Hydrogen, which also fixes the known bugs (product `options` missing query, empty img src, missing founder photo).
