# Texas Grant Attestation — Ellucian Experience Card

> Ellucian Experience card that records a Texas Grant felony/controlled-substance attestation to Banner (RRAAREQ) using Ethos Integration & Data Connect Pipelines, with offline React + Ellucian Design System demos.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Ellucian Design System](https://img.shields.io/badge/Ellucian%20Design%20System-8.2-3C3489)
![Ethos Integration](https://img.shields.io/badge/Ethos-Integration-0F6E56)
![Data Connect](https://img.shields.io/badge/Data%20Connect-Pipelines-185FA5)
![Banner](https://img.shields.io/badge/Banner-RRAAREQ-993C1D)
![Node](https://img.shields.io/badge/Node-22-339933?logo=node.js&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-5-8DD6F9?logo=webpack&logoColor=black)

A higher-education financial-aid workflow built as an [Ellucian Experience](https://www.ellucian.com/solutions/ellucian-experience)
extension. A student awarded a **Texas Grant** is asked to attest to the statement
**"I have no felony convictions or crimes involving a controlled substance,"** and the
response is written back to the Banner Financial Aid **RRAAREQ** tracking-requirements
table through **Ethos Integration** and a **Data Connect** serverless pipeline.

It is modeled on Ellucian's
[`experience-ethos-examples/emergency-contacts`](https://github.com/ellucian-developer/experience-ethos-examples)
pattern — a card that reads via Ethos and writes to Banner through Data Connect.

---

## Screenshots

The real Ellucian Design System card, rendered by the standalone harness with a mock data
layer — no tenant, no Ethos, no Data Connect required.

| Attestation form | After submit (confirmation) |
| --- | --- |
| ![Attestation form](docs/images/standalone/card-form.png) | ![Confirmation](docs/images/standalone/card-confirmation.png) |

The full standalone harness, with controls to toggle eligibility / prior response and reload the card:

![Standalone harness](docs/images/standalone/harness.png)

---

## Highlights

- **End-to-end Ellucian integration** spanning all three platform layers — Experience (UI),
  Ethos Integration (API), and Data Connect (serverless pipeline) — writing to Banner Financial Aid.
- **Banner write-back**, not just read: records the attestation to **RRAAREQ** via the
  `applicant_requirements` Banner Business API.
- **Dynamic eligibility gating** — the card only appears for students with a Texas Grant
  award, checked at runtime against `award-maintenance` (RPRAWRD).
- **Re-submission protection** — once recorded, the response is final and the card hides
  itself on subsequent loads to prevent erroneous duplicate submissions.
- **Zero hardcoding** — aid year, fund codes, and Banner requirement/status codes are all
  card configuration bound to pipeline parameters.
- **Runs fully offline** for development and demos via a build-time mock data layer and a
  standalone React + EDS harness — no Banner, no tenant needed.

---

## Tech stack

| Area | Technology | Used for |
| --- | --- | --- |
| UI | **React 19**, **Ellucian Design System (EDS) 8.2** | The card components (`Button`, `RadioGroup`, `Typography`, `Snackbar`), theming, and tokens |
| Experience SDK | `@ellucian/experience-extension`, `@ellucian/experience-extension-utils`, `@ellucian/experience-extension-extras` | Card lifecycle, `useData`/`useCardInfo`/`useExtensionControl` hooks, Data Connect query helpers |
| Integration | **Ethos Integration**, **Data Connect** serverless pipelines | Authenticated calls from the card to Banner Business APIs |
| ERP | **Banner Financial Aid** Business APIs — `applicant_requirements` (RRAAREQ), `award-maintenance` (RPRAWRD), EEDM `persons` | Eligibility check + attestation write-back |
| i18n | `react-intl` | All user-facing strings are localizable |
| Build | **Webpack 5**, **Babel**, **ESLint (flat config)**, **Node 22** | SDK build/deploy + a separate standalone bundle |

---

## Architecture

```
 Student
   │
   ▼
┌──────────────────────────────┐     ┌──────────────────────┐     ┌──────────────────────────────┐
│ Experience Card              │     │ Data Connect         │     │ Ethos Integration            │
│ (React + EDS)                │ ──▶ │ serverless pipeline  │ ──▶ │ Banner Business APIs         │
│ AttestationView + container  │     │ GET (eligibility)    │     │  • persons (EEDM)            │
│                              │     │ POST (record)        │     │  • award-maintenance (RPRAWRD)│
└──────────────────────────────┘     └──────────────────────┘     │  • applicant_requirements     │
                                                                   │       → Banner RRAAREQ        │
                                                                   └──────────────────────────────┘
```

1. **Eligibility (GET pipeline)** — resolves the student's Banner ID via Ethos `persons`,
   checks `award-maintenance` (RPRAWRD) for a configured Texas-grant fund code in the aid
   year, and reads any existing row from `applicant_requirements` (RRAAREQ).
2. **Form** — eligible students with no prior response see the attestation statement with
   Yes/No and a Submit button.
3. **Record (POST pipeline)** — re-validates eligibility, maps the answer to the configured
   RRRAREQ status code, stamps the status date, and writes the row to RRAAREQ via the
   `applicant_requirements` Business API.

### Code structure

The card is split into a pure presentational view and swappable data containers, so the
same UI runs against real Data Connect, an offline mock, or the standalone harness:

```
AttestationView (pure UI, EDS)
   ├── Live container   → Data Connect pipelines via the Experience SDK   (production)
   ├── Mock container   → in-memory data layer (USE_MOCK_DATA=true)        (offline dev)
   └── Standalone entry → bundles React + EDS, mock data + controls        (no tenant)
```

---

## When the card is shown

| Situation | Card |
| --- | --- |
| Not awarded a Texas grant | Hidden (renders nothing) |
| Eligible, no response yet | Shows the attestation form |
| Just submitted (this session) | Read-only confirmation, no form |
| Already submitted (any later load) | Hidden — prevents erroneous re-submission |

> The Experience SDK has no runtime "remove card" API, so an ineligible/already-submitted
> student gets an empty render. For guaranteed non-delivery, the card would also be gated
> to a role/group of eligible students in Experience Setup.

---

## Banner mapping

The attestation is stored on RRAAREQ (table `RRRAREQ`) as a financial-aid tracking
requirement, written through the `applicant_requirements` Business API:

| Concept | RRRAREQ field | Source |
| --- | --- | --- |
| Banner ID | `keyblckId` | Ethos `persons` → bannerId credential |
| Aid year | `keyblckAidyCode` | Card configuration |
| The attestation (requirement) | `treqCode` | Card configuration (RTVTREQ) |
| The answer (status) | `trstCode` | Card configuration (RTVTRST, yes/no) |
| Status date | `statDate` | Submission date |

Eligibility ("awarded a Texas grant") is matched against `award-maintenance` (RPRAWRD)
`fundCode` for the configured aid year.

---

## Run it locally (no Banner, no tenant)

This project is designed to be explored entirely offline.

| What | How |
| --- | --- |
| **Quick look, no build** | Open [`standalone-demo/index.html`](standalone-demo/index.html) — a dependency-free HTML demo of every state (not real EDS). |
| **Real EDS card, no tenant** | `cd extension && npm install && npm run build-standalone`, then open `extension/standalone/index.html`. Bundles React + EDS and renders the actual card with mock data + controls. |
| **Real card in the SDK dev server** | Set `USE_MOCK_DATA=true` in `extension/.env`, then `npm start` (needs an Experience tenant pointed at the dev server to render). |

Standalone deep-link params (used to capture the screenshots above): `?bare=1` (card only),
`?eligible=false` (hidden), `?recorded=yes|no` (prior response), `?auto=submit-yes|submit-no`
(auto-submit to the confirmation).

---

## Repository layout

```
texas-grant-attestation/
├── extension/            Experience extension (React card + SDK build)
│   ├── src/cards/        AttestationView (UI) + live/mock containers
│   ├── src/data/         POST helper + offline mock data layer
│   ├── standalone/       React + EDS standalone harness (webpack.standalone.js)
│   └── extension.js      card definition + configuration fields
├── dataconnect/          GET + POST Data Connect pipeline definitions (JSON)
├── docs/                 Ethos guide + screenshots
├── standalone-demo/      dependency-free offline HTML demo
└── serve.js              tiny no-cache static server for the demos
```

See [`extension/README.md`](extension/README.md) and [`dataconnect/README.md`](dataconnect/README.md)
for build/deploy and pipeline setup details.

---

## Status & notes

This is a learning/portfolio project built against Ellucian's public developer SDK and
documented Business APIs; it has **not** been run against a live Banner tenant. Before a
real deployment you would confirm in your environment:

- The Business API resource names (`award-maintenance`, `applicant-requirements`) and the
  `acceptVersions` / `contentVersion` values used in the pipelines.
- That the `treqCode` / `trstCode` values exist on RTVTREQ / RTVTRST in Banner Financial Aid.

Verified locally: ESLint clean, the SDK build (`build-dev`) and the standalone build
(`build-standalone`) both compile, and the standalone harness renders and runs end-to-end.

<br/>

Built with Ellucian Experience, Ethos Integration, and Data Connect.
