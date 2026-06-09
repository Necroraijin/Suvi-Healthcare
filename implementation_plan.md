# Implementation Plan: SUVI AI Swarm Workspace & HMS Integration

This plan details the steps required to transition the SUVI AI desktop dashboard from a static visual mockup into a fully functioning, interconnected client application simulating multi-agent workflows, HMS bridging, and Indian digital health moats (ABHA, PMJAY, CDSCO lists).

---

## User Review Required

> [!IMPORTANT]
> **Data Flow Scenarios**: We will implement a mock-database state engine in [actions.ts](file:///c:/Users/DELL/Desktop/PROJECTS/Suvi-Healthcare/app/actions.ts) to handle state persistence (appointments, diagnostic statuses, ICU beds). Since Tauri client runs inside a local sandbox, this mock state will persist within the session, simulating active connection to an external HMS database.
>
> **Indian Localization Lists**: We will include local databases in a new file [lib/mock-data.ts](file:///c:/Users/DELL/Desktop/PROJECTS/Suvi-Healthcare/lib/mock-data.ts) (CDSCO drug brand indices, CGHS lists, and Ayushman Bharat packages) to feed the Consultant and Coder agents deterministically.

---

## Open Questions

> [!NOTE]
> * None at present. The three open questions regarding HMS endpoints, PACS integration, and GPU settings have been addressed as IT configuration toggles directly editable inside the [SuperAdminClient](file:///c:/Users/DELL/Desktop/PROJECTS/Suvi-Healthcare/components/super-admin-client.tsx) interface.

---

## Proposed Changes

We will restructure the frontend components and actions to connect the Receptionist booking flow, Doctor queues, PACS imaging, and the ICU room workspace in a single reactive layout.

---

### Component & State Engine

#### [NEW] [mock-data.ts](file:///c:/Users/DELL/Desktop/PROJECTS/Suvi-Healthcare/lib/mock-data.ts)
* Contains data assets for:
  * **CDSCO Generic & Brand Drugs**: Formulations, common DDI lists (e.g. Antacids vs Quinones).
  * **Ayushman Bharat HBP 2.0 Packages**: Selection of packages (e.g. K21.9 medical management, cardiology inserts) with prices.
  * **IndicTrans2 Sample Lexicons**: 22-language translation scripts for common discharge patterns.
  * **ABDM Health Locker Records**: Pullable historical profiles.

#### [MODIFY] [actions.ts](file:///c:/Users/DELL/Desktop/PROJECTS/Suvi-Healthcare/app/actions.ts)
* Implement a stateful clinical event engine (in-memory during development/Tauri runtime):
  * `createAppointment(patientName, abhaId, doctorId)` -> returns appointment ticket and pushes to the target doctor's queue.
  * `updatePatientVitals(bedId, vitals)` -> saves and broadcasts vital signals.
  * `transferToICU(patientId, bedId, clinicHistory)` -> moves patient state, registers consent, and unlocks the ICU room monitor sheet.
  * `simulateCloudInference(input, agentId)` -> handles MedGemma mock completions (SOAP structuring, DDI audits, Indic translation).

#### [MODIFY] [dashboard-client.tsx](file:///c:/Users/DELL/Desktop/PROJECTS/Suvi-Healthcare/components/dashboard-client.tsx)
* Redesign UI layout into a single, fully interactive multi-workspace interface depending on selected role:
  * **Receptionist Workspace**:
    * OPD Booking panel, telephone simulator (Twilio Exotel status indicators), ABHA ID generator/validator, and ABDM health history loader.
  * **Doctor's Workspace**:
    * Dynamic Patient Queue (displays only patients registered to this doctor).
    * Integrated Scribe with fluid Bezier waveforms, dual English/Hindi live audio text fields.
    * Consultant diagnostics recommendation box, real-time DDI checking alert widget, and Ayush formulation verification toggles.
  * **Imaging PACS Workspace**:
    * Slices list, contrast/brightness sliders, AI highlighted polygon box overlays.
    * "Send to ICU" triage action triggers state transmission.
  * **ICU Room Monitor View**:
    * Crimson glass-panel theme with live vital graphs (Heart Rate, SpO2 borderline warning alerts).
    * Medical history timeline (incorporates previous X-ray findings and Scribe SOAP notes).
  * **Coder & Insurance Billing Desk**:
    * PMJAY Claims Verifier panel, CGHS rate lookup, pre-auth request outbox container showing auto-retry exponential backoff simulator.

#### [MODIFY] [super-admin-client.tsx](file:///c:/Users/DELL/Desktop/PROJECTS/Suvi-Healthcare/components/super-admin-client.tsx)
* Integrate system settings with the workspace state engine:
  * Add configurable text fields for PACS Modality URLs, HMS database connection strings, and Bhashini API keys.
  * Update simulated audit logs to dynamically append actions from the Receptionist, Scribe, and ICU transfers.

---

## Verification Plan

We will perform automated lint checks and manual walkthrough validations inside the Next.js development server.

### Automated Tests
* Validate TypeScript and ESLint:
  ```bash
  npm run lint
  ```
* Run local production build:
  ```bash
  npm run build
  ```

### Manual Verification
1. **Flow Verification**:
   * Log in as `receptionist` -> register a mock patient "Aarav Sharma" with ABHA ID -> assign to `doctor`.
   * Log in as `doctor` -> verify Aarav is in the queue -> run Ambient Scribe to generate SOAP note.
   * Open PACS Radiology panel -> run scan analysis -> select **Transfer to ICU**.
   * Log in as `nurse`/`icu_monitor` -> verify Aarav's complete records (X-ray, SOAP summary, and vitals telemetry) are populated.
2. **Visual & Animations Check**:
   * Verify card expansions morph seamlessly using Framer Motion.
   * Verify the "Swarm Bus" glow updates during processing.
