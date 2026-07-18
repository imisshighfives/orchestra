# Transition Readiness

An operational orchestration prototype for a high-risk clinical transition (PICU → Urgent Brain MRI). It is not a clinical decision tool — it identifies, routes, tracks, and verifies operational prerequisites while leaving all clinical judgment with the care team.

The app has two presentation modes, switched with a segmented control at the top:

- **Demo** (default) — the original, fully deterministic ~55-second scripted sequence. No microphone, no network calls, no external APIs.
- **Live** — a live speech-to-readiness mode. Spoken (or typed) operational updates are turned into proposed readiness changes that a user reviews and accepts before they count.

All patient information (Mateo Patel, MRN SYN-004182, etc.) is synthetic. There are no real EHR integrations or credentials anywhere in this project.

## Install and run

```bash
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

## Demo Mode

Unchanged from the original build: a scripted, timer-driven sequence through 7 states (baseline → transition detected → context analyzed → blocker identified → bedside update → device response → all requirements complete), landing on the complete state at ~47 seconds. Controls: Start Demo / Pause / Resume / Reset / Previous / Next, plus keyboard shortcuts (Space, ←, →, R). See the in-app synthetic activity feed and readiness grid for details — nothing about this mode changed when Live mode was added.

## Live Mode — agentic checklist confirmation

Live Mode preloads a **patient-specific checklist** from chart context (Mateo's ventilator/oxygen/suction needs, vascular access, RT transport, pacemaker pathway, monitoring, and MRI destination requirements). Speech does not create the checklist — it confirms or resolves existing items.

For every finalized voice segment (or typed transcript — both call the same `processTranscript()` pipeline):

1. Deterministic clause-level rules extract operational facts (one sentence can contain several).
2. Each fact is matched to existing checklist subrequirements and applied **immediately**.
3. A confirmed item turns green and shows the **exact transcript clause** as provenance, with source, timestamp, and confidence.
4. Card status is recomputed deterministically from its subrequirements: green **Ready** only when every required item is satisfied; amber while anything is unresolved; red for **Blocked** or **Contradictory** items. Chart-documented facts show a neutral "Chart" chip.
5. Negated reports ("the oxygen tank is **not** full") mark the item **Contradictory** rather than confirmed.
6. "Still waiting on…" language keeps a blocked item blocked (e.g. cardiology has not yet confirmed MRI-conditionality).
7. Medical clearance statements ("the patient is cleared for MRI") are **never** recorded as readiness. They surface separately with: *"Medical clearance statements require clinician judgment and are not recorded as operational readiness completion."*

The model never decides readiness — extraction only identifies facts; fixed checklist rules decide every state.

Live Mode's state is fully independent from Demo Mode's.

### Try it without a working microphone

Type these into the transcript field:

1. `The transport ventilator is ready, oxygen tank is full, and portable suction is good to go.` → all three Airway items confirm → Airway turns green **Ready**.
2. `Mateo has two working bilateral PIVs, an arterial line, and a PICC with drips.` → three vascular items confirm; Infusions stays **In progress** until drips are confirmed secured/accounted for.
3. `Cardiology still needs to confirm the pacemaker is MRI compatible.` → Cardiac Device stays **Blocked** (red).
4. `The Spanish interpreter is connected.` → interpreter item green; Destination remains pending until its other items resolve.
5. `The patient is cleared for MRI.` → no state change; clearance-guard notice shown.

## Microphone access requires a secure context

Browsers only allow microphone access (and therefore the Web Speech API) on `https://` origins or on `localhost`. **A plain `http://` LAN address — e.g. `http://10.1.62.169:3000` on your phone — will not be able to request the microphone.** Live Mode's text-transcript fallback still works over plain HTTP, but real voice input needs one of:

- Testing on the same machine via `http://localhost:3000` (works, since localhost is exempt), or
- Deploying the app to an HTTPS URL (Vercel, Netlify, or any static/Node host with TLS) and opening that URL on the iPhone.

Demo Mode has no such restriction and works over plain LAN HTTP today.

## Open on an iPhone (same Wi-Fi network, for Demo Mode / UI testing)

1. Confirm the Mac and iPhone are on the same Wi-Fi network.
2. `npm run dev`
3. Find the Mac's LAN IP: `ipconfig getifaddr en0` (this machine: `10.1.62.169` — yours may differ).
4. On the iPhone, open Safari to `http://<your-mac-ip>:3000`.

Remember: this gets you Demo Mode and the Live Mode UI/text-fallback, but not live microphone input (see above).

## Install as a home-screen app (PWA-style)

The app ships a web manifest (`public/manifest.json`), a full icon set, and the required mobile meta tags (`apple-mobile-web-app-capable`, themed status bar, `viewport-fit=cover`). On an iPhone, once the app is loaded over HTTPS (or localhost), use Safari's Share sheet → **Add to Home Screen** to install it as a standalone launch icon. This is a web app, not a native iOS build.

## Visual language

The shell (navy "Patient Chart" context bar, title, segmented control) is styled to feel like an embedded panel inside an EHR patient chart rather than a standalone consumer app — no gradients, no glassmorphism, no illustrations or mascots. Demo Mode's own screen content is untouched from the original build.

## Known items

- **Next.js version**: pinned to `14.2.15` (matching the original build) rather than the latest `16.x`. `npm audit` flags several CVEs in this version; all of them are in server-side features (Server Actions, middleware, RSC caching) that this fully static, client-rendered app doesn't use. Upgrading is a breaking change and was deliberately deferred rather than bundled into this feature work — revisit before any production deployment handling real traffic.
- This project was ported from an earlier prototype (`BUDDY`) and rebuilt standalone here; that original project was left untouched.

## Presenter script (Demo Mode, ~46s)

> "Meet Mateo — seven months old, post-Glenn, day one, seven-point-two kilos, PICU bed four. Overnight, new left-sided weakness. Rounds order an urgent brain MRI — the agent catches it instantly. It pulls his real chart context: ventilated, on infusions, invasive lines — and a permanent pacemaker. That pacemaker needs MRI-pathway verification first. The agent routes it straight to cardiac device — no phone calls. The nurse gives her normal update — tubing switched, meds ready, RT's ventilator standing by. The agent turns that into tracked readiness. Cardiac device responds: pathway verified, programming complete. Every requirement's tracked and complete — transport window ten-thirty. Final judgment always stays with the bedside team."
