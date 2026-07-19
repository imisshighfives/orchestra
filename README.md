# Orchestra

**Orchestra is a nursing-owned, AI-assisted clinical coordination platform** designed to reduce delays and safety gaps during complex patient transitions.

Nurses hold the operational picture together across procedures, imaging, transfers, and discharges — yet they must coordinate through fragmented chart review, phone calls, and verbal updates. That makes it hard for the bedside team to know whether every dependency has actually been completed.

Orchestra gives the bedside nurse a **patient-specific readiness checklist**, captures natural clinical updates (spoken or typed), extracts operational facts, and maps them to readiness requirements in real time. It identifies confirmed items and unresolved dependencies — transport staffing, equipment, consent, fasting status, interpreter access, anesthesia assessment, cardiac-device planning — with an auditable source for every update.

**The demo:** an MRI readiness workflow for a critically ill pediatric patient. **Mateo** — seven months old, day one after open-heart surgery, new left-sided weakness overnight, destination: urgent brain MRI. His checklist populates from chart context, and the platform already knows the destination-specific hazard: **Cardiac Device — Blocked.** He has a pacemaker, and the destination is a giant magnet.

**The AI does not medically clear the patient.** It supports nursing coordination by extracting and reconciling information, while deterministic rules calculate operational readiness. Statements of medical clearance are deliberately never recorded as readiness — clinical judgment stays with the care team.

MRI is the initial use case; the same nursing-led orchestration engine could support OR handoffs, ICU transport, interfacility transfers, and high-risk discharge workflows.

**All patient data is synthetic** (Mateo Patel, MRN `SYN-004182`). There are no real EHR integrations, no credentials, and no network calls at runtime — extraction is fully deterministic and local.

## Quick start

```bash
git clone https://github.com/imisshighfives/orchestra.git
cd orchestra
npm install
npm run dev
```

Open `http://localhost:3000`.

## How it works

The app opens onto a checklist preloaded from (synthetic) chart context — airway equipment, vascular access, RT transport, a pacemaker requiring cardiology verification, monitoring, and MRI destination requirements. Speech never creates the checklist; it confirms or resolves existing items.

Every finalized voice segment — or typed update, both share one `processTranscript()` pipeline — flows through:

1. **Deterministic clause-level extraction.** Fixed rules identify operational facts; one sentence can contain several ("vent is ready, oxygen's full, and suction is good to go" → three facts).
2. **Immediate reconciliation.** Each fact maps to a checklist subrequirement and is applied on the spot, with the exact transcript clause shown as provenance plus source, timestamp, and confidence.
3. **Derived card status.** A category turns green **Ready** only when every required item is satisfied; amber while anything is unresolved; red for **Blocked** or **Contradictory** items. Chart-documented facts carry a neutral "Chart" chip.

Safety behaviors, all rule-based:

- Negated reports ("the oxygen tank is **not** full") mark an item **Contradictory**, never confirmed.
- "Still waiting on cardiology…" keeps a blocked item blocked.
- Clearance language ("the patient is cleared for MRI") triggers a notice — *"Medical clearance statements require clinician judgment and are not recorded as operational readiness completion."* — and changes nothing.

**Agentic verification loop.** Hearing that cardiology confirmation is still outstanding makes the agent route a verification request to a Cardiology / EP service on its own — the UI shows the request as *routed → awaiting response*. About 28 seconds later a **simulated** service response arrives asynchronously, confirms the MRI-conditional and device-plan items with `Cardiology` provenance, and flips the card to Ready — with no user action. A verbal confirmation spoken before the response supersedes it cleanly. (The service is simulated and labeled as such in the UI; there is no real paging or EHR messaging. The delay is tunable via `CARDIOLOGY_RESPONSE_DELAY_MS`.)

No model decides readiness. Extraction only identifies facts; fixed checklist rules decide every state.

## Try it (no microphone needed)

Type these into **Add Clinical Update**:

| Say / type | Result |
|---|---|
| `The transport ventilator is ready, oxygen tank is full, and portable suction is good to go.` | All three Airway items confirm → Airway turns **Ready** |
| `Mateo has two working bilateral PIVs, an arterial line, and a PICC with drips.` | Three vascular items confirm; Infusions stays **In progress** (drips not yet confirmed secured) |
| `Cardiology still needs to confirm the pacemaker is MRI compatible.` | Cardiac Device stays **Blocked** — and the agent routes a verification request; ~28s later the simulated Cardiology/EP response confirms the device items autonomously |
| `The Spanish interpreter is connected.` | Interpreter item confirms; Destination remains pending |
| `The patient is cleared for MRI.` | No state change; clearance-guard notice shown |

## Voice input needs HTTPS

Browsers expose the microphone (and the Web Speech API) only on secure origins: `https://…` or `localhost`. Typed updates work anywhere, but for live voice on a phone, deploy to any HTTPS host (e.g. Vercel/Netlify) and open that URL. On iOS Safari the app also handles the platform's quirks: speech that never gets marked "final" is flushed when the session ends, and listening auto-restarts after iOS's stop-on-silence.

## Install to home screen

Ships as a PWA-style web app: manifest, icons, and iOS meta tags included. Over HTTPS (or localhost), use Safari's Share → **Add to Home Screen**.

## Project structure

```
app/                      Next.js app router (single screen)
components/shell/         Patient-chart context bar + app frame
components/live-voice/    Checklist board, mic controls, transcript, updates feed
lib/live-voice/           patientContext (preloaded checklist), extraction rules,
                          speech wrapper, engine hook
components/transition-readiness/, lib/transition-readiness/
                          Legacy scripted demo mode — retained in code, not rendered
```

## Known items

- **Next.js is pinned to `14.2.15`**, which `npm audit` flags (CVEs in Server Actions / middleware / RSC caching — server-side features this static client-rendered app doesn't use). Upgrading to 16.x is a breaking change and is deferred; do it before any real production deployment.

## License / status

Prototype for demonstration purposes. All clinical content is synthetic; nothing here is medical software or medical advice.
