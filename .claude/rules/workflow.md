# Façon de travailler dans ce dépôt

> Se charge toujours. La méthode générale vit dans le vault : `_Socle/Méthode.md`.
> Regroupé le 25/09/2026 depuis la mémoire locale, pour que ce savoir voyage avec le dépôt.

## Always query graphify-out/graph.json before fresh Grep/Read on this repo

**Rule:** On any session working in `C:\Users\uriel\Desktop\DEVs\bilskirnir`, BEFORE running Grep/Read to answer a navigation or architecture question, check if `graphify-out/graph.json` exists and query it.

**Why:** User invested in graphify specifically to avoid me re-discovering the codebase at every session. Benchmark measured ~260× token reduction per navigation query. Expected session-wide savings 40-55% (pic 80-95% on exploration-heavy sessions) IF I actually use the index. If I default to Grep/Read, the entire investment is wasted.

**How to apply:**

1. **At session start (first message involving code):** silently verify `graphify-out/graph.json` exists. If yes, it's queryable — assume it's fresh unless more than a week has passed or the user mentions major changes.

2. **Reach for the graph FIRST in these cases:**
   - "Where does X live?" / "What's the file for Y?"
   - "What depends on Z?" / "Who imports Z?"
   - "How are the components organized?"
   - "What's the architecture of the storefront?"
   - Any question requiring a sweep across multiple files
   - Picking up an unfamiliar part of the codebase

3. **Query syntax:**
   - `/graphify query "<question>"` — BFS, broad context (default for "what's around X")
   - `/graphify query "<question>" --dfs` — follow a specific chain (for "how does X reach Y")
   - `/graphify path "A" "B"` — shortest path between two concepts
   - `/graphify explain "NodeName"` — plain-language description of one node + its neighbors

4. **Fall back to Grep/Read only when:**
   - The graph query returns "No matching nodes" for the terms
   - The question is about EXACT syntax/value (Grep is better for "find this string")
   - The code file is already known and I just need to edit it

5. **Propose `/graphify --update`:**
   - After implementing a plan that adds >5 new files
   - When the user reports a lot has changed since last graphify
   - BEFORE starting a new plan if the index is more than 1-2 weeks old

6. **Never silently skip the index.** If I do a Grep sweep without first trying the graph, that's a violation of this rule.

**Confirmed by:** user's explicit concern on 2026-04-24 — « Tu t'es mis ça comme règle ou pas? Pour bien bien avoir ça en tête. »

## graphify is a codebase index for Claude, not a human visualization tool

**What graphify is used for on this project:**

The user runs `/graphify` against the repo to produce a structured index (files, symbols, functions, types, relationships) that Claude consults in subsequent sessions **instead of scanning with Grep/Read from scratch**. User reports ~70% token savings on other repos where this is in place.

**Not** primarily a human-facing visualization tool. The HTML/JSON/audit report is a side-effect — the index is the main deliverable for Claude sessions.

**How to apply:**

- Propose a `/graphify` run at clean checkpoints (end of a plan, after a big refactor, when adding a lot of new code) so the next session has a fresh index
- When starting a new plan, check if a graphify index exists for the repo; if yes, query it before doing fresh Grep/Read
- If the user asks about anything that requires navigating the code, favor the graphify index over ad-hoc searching

**When NOT to run it:**

- During an in-flight task (no need for a new index mid-edit)
- For things unrelated to code structure (writing plans, design decisions, chat)

**Known trigger:** the user's global CLAUDE.md invokes it via `/graphify`. It's installed at `~/.claude/skills/graphify/SKILL.md`.

**Correction to a past mistake:** in the 2026-04-24 session I framed graphify as "synthesis / lens for humans". That's wrong. User clarified it's a code index for Claude's own efficiency.

## Avoid proposing Shopify classic Liquid themes as a default

> **DÉPASSÉ (19/10/2026, confirmé le 19/11/2026)** : Uriel a tranché pour un **thème Liquid OS 2.0**, pour que Gautier gère sa boutique seul. Hydrogen (`storefront/`) est abandonné. Voir `docs/brief-theme-liquid.md`. Le texte ci-dessous ne vaut plus.

When Shopify is the right backend, **default to Hydrogen (headless) over classic Liquid themes**.

**Why:** The user finds the Shopify CLI classic-theme workflow painful — `shopify theme dev` proxy, `theme push/pull` sync bugs, preview flakiness. They explicitly called it "chiant, long, des bugs, un peu insupportable." They strongly prefer local React dev (`npm run dev`) + simple deploy (`shopify hydrogen deploy`), which gives them a real collaborative code workflow with me.

**How to apply:** If Shopify comes up as a candidate backend, propose **Shopify + Hydrogen + Oxygen** first. Only fall back to a classic Liquid theme if there's a hard constraint (e.g. the client already has a theme, Hydrogen doesn't support a needed feature). Do not suggest classic theme dev via Shopify CLI as the default path.

## feedback_wire_entities_on_trust

On Bilskirnir, when the user asks to relate/use a Shopify entity (a metaobject, a metafield link, an author, etc.), **wire the code right away** even if a Storefront API probe returns null/empty. The user is **frequently creating or enabling that entity in admin in parallel** — a null probe means "not ready yet," NOT "doesn't exist / don't build it."

**Why:** the user said explicitly (2026-06-19): "quand je te demande de relier une entité, tu me fais confiance, tu la relies. Souvent je suis en train de la créer en parallèle." Blocking to ask first is friction.

**How to apply:**
- Implement the fragment + parsing + render with the most likely keys, following existing conventions (e.g. saga/author name field = `nom`; links live under `custom.<thing>`). Confirm the link key with the user if they volunteer it (they confirmed `custom.auteur` on products).
- **Document the assumed keys** in code comments + tell the user exactly which keys/convention to match in admin, so it lights up automatically once they finish.
- Guard the render so a null value simply doesn't show (no broken UI) until the data exists.
- Reminder of the gotchas that make probes return null even when the field exists: field needs **Storefront API access** ON; the field **KEY ≠ display name**; `metaobject.fields` only lists fields that have a value; loader `CacheShort` + browser cache → hard-refresh after admin edits. See [[reference_saga_metaobject]].

## reference_saga_metaobject

The Bilskirnir home slider (`buildHomeScreens`/`HOME_SAGA_FRAGMENT`, queried via `metaobjects(type:"saga")`) reads these **real** field keys on the `saga` metaobject (type = `saga`; confirmed against the live store, NOT the guessed `accroche/lore/couleur/tomes`):

- `nom` — multi_line_text → slide title
- `synopsis` — **rich_text** → description (parse with `richTextToPlain`)
- `ordre_des_tomes` — list.product_reference → cover éventail, **explicit order, do NOT re-sort**
- `univers_parent` — collection_reference → the parent univers (CTA link + halo colour + fallback bg)
- `illustration_hero_de_la_saga` — file_reference (Image) → per-saga background; resolves as `reference { ... on MediaImage { image { url } } }`

**Halo colour:** the saga has NO `couleur` field → inherit the parent collection's `custom.couleur_theme` (e.g. `#8b6b3a` for Au Nom des Dieux). **Background image:** saga's `illustration_hero_de_la_saga` if set, else the univers collection's `custom.illustration_hero` (e.g. `banner-1.webp`).

**Gotchas (cost real debugging time):**
- A metaobject field's value is invisible to Storefront if the **entry has no value** — `metaobject.fields` only lists fields that have a value, and `field(key)` returns null. Don't conclude "field doesn't exist" from a null.
- The field KEY ≠ the field display name. The hero key is `illustration_hero_de_la_saga` (not `illustration_hero`).
- After editing admin data, the loader's `CacheShort()` + browser cache serve stale for a bit → **hard refresh** (Ctrl+Shift+R) to see changes.
- **Still missing for richer slides (user wants):** a per-saga **buttons** field (free list: label + action) — not in the metaobject yet; needs a new admin field + build. See [[project_redesign_progress]].
