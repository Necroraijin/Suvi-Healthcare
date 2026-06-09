# SUVI AI: Enterprise Architecture & Agentic Swarm Report

This document outlines the high-level architecture, inter-agent communication protocols, and proposed enhancements for the **SUVI AI Secure Clinical Swarm Workspace** desktop application. It details how the app integrates with existing Indian Hospital Management Systems (HMS), ensures patient data privacy (Separation of Duties), and maintains smooth UX/animations.

---

## 🏛️ High-Level System Architecture

To ensure enterprise-grade stability, security, and low latency, SUVI AI employs a hybrid **On-Premise + Secure Cloud Gateway** architecture.

```mermaid
graph TB
    subgraph Client Application (Tauri + Next.js)
        UI[Next.js Frontend / Framer Motion] <--> |Tauri IPC / Events| RustCore[Tauri Rust Core]
        RustCore <--> |Local SQLite Cache| LocDB[(Local Cache)]
        RustCore <--> |Local ASR / Whisper.cpp| OfflineASR[Offline Speech Engine]
    end

    subgraph Hospital Intranet
        HMS[(Existing Hospital HMS / HIS)] <--> |FHIR R4 Adapter / REST APIs| Gateway[SUVI Secure Intranet Gateway]
        PACS[(PACS Server / DICOM Node)] <--> |WADO-RS API / Orthanc| UI
        Gateway <--> |Secure Intranet Port| RustCore
        GPU_Node[Local On-Premise GPU Node] <--> |MedGemma Inference / CDSCO DB| RustCore
    end

    subgraph Secure Cloud Services
        Bhashini[Bhashini Translation API] <--> |REST / gRPC| RustCore
        CloudAI[Gemini Cloud API / MedGemma 27B] <--> |Encrypted HTTPS| RustCore
        ABDM[ABDM Health Locker / ABHA Gateways] <--> |ABDM Sandboxed API| RustCore
        GovPortals[PMJAY BIS / NHA TMS Gateway] <--> |JSON Gateway API| RustCore
    end
```

### 1. The Inter-Agent Communication Bus
Tauri's Rust Core runs a local pub/sub **Swarm Event Loop**. Agents post events to the bus, which are then routed to other connected agents or dashboards based on role permissions:
* **Receptionist Event**: `patient.registered` -> broadcast to assigned Doctor's panel.
* **Imaging Event**: `scan.completed` -> payload containing PACS ID and provisional visual report -> routed directly to Doctor's active SOAP editor and Coder Agent.
* **Consultant Event**: `diagnosis.confirmed` -> triggers Coder Agent to fetch corresponding PMJAY package codes and Insurance Verifier to fetch pre-auth eligibility.

### 2. Connected Data Pipeline & Separation of Duties
To preserve HIPAA/DPDP compliance and enforce strict data boundaries:
* **Doctor's Dashboard**: Only displays patients currently assigned to their OPD queue or ward beds.
* **ICU Ward Sync**: When a patient is escalated from Diagnostics to ICU, the **HMS Gateway** writes a `ward.transfer` event. The system automatically pulls their complete clinical history, translates relevant vernacular instructions, and casts it to the designated ICU smart-monitor/tablet.
* **Zero Admin PHI Exposure**: All administrative logs, CPU usage statistics, and system support configs are visually isolated from Protected Health Information (PHI). IT Admins see only cryptographic hashes (`0x88f2a...`) representing state transitions, never the patient's vitals or chart contents.

---

## 🛠️ Critiques & Suggested Enhancements for the 7 Agents

Here is an analysis of your proposed agents with suggested improvements to build a bulletproof "India Moat."

### 1. Receptionist Agent
> **Your Concept**: Gemma 4 + voice telephony via Twilio/Exotel, WhatsApp reminders (360Dialog), ABHA ID verification, pulls history from ABDM Health Locker, integrates with Practo/eHospital/HIS by Insta.

* **Suggested Enhancement**: Hospital lobbies in India are chaotic and noisy. Voice telephony bots often fail due to network drops or accent misinterpretations. 
* **Implementation Strategy**: Implement an **Asynchronous Voice-to-Text Fallback**. If a call quality drops below a threshold, the agent should instantly send a WhatsApp message containing a secure, lightweight **ABDM Self-Registration Webview** link. Here, the patient can authenticate their ABHA ID via Aadhaar OTP, which automatically pulls their ABDM Health Locker records and updates the doctor's queue without manual receptionist intervention.

### 2. Scribe Agent
> **Your Concept**: MedASR + MedGemma 27B for SOAP JSON output, fine-tuned on Indian medical terminology, FHIR R4 push to HMS, code-mixed Hinglish dialect translation.

* **Suggested Enhancement**: Reliable internet is a luxury in many Indian Tier 2/3 hospitals. 
* **Implementation Strategy**: Build a **Dual-Mode Pipeline**. Run a highly optimized, quantized version of MedASR (e.g., Whisper.cpp with an Indian medical lexicon extension) **locally on the desktop CPU** via Tauri's sidecar capability. If the internet is active, run the audio through the cloud for maximum accuracy; if it drops, seamlessly switch to local offline processing. This prevents the doctor's workspace from freezing during a consultation.

### 3. Interpreter Agent
> **Your Concept**: IndicTrans2 (AI4Bharat) for real-time bidirectional translation across 22 scheduled Indian languages.

* **Suggested Enhancement**: Bidirectional speech translation is highly sensitive to latency. Any delay over 500ms makes doctor-patient dialogues feel awkward.
* **Implementation Strategy**: Utilize a **Hybrid Cache + Stream Engine**. Cache common medical greetings, clinical instructions, and dosage descriptions locally in the database. When the doctor says standard terms ("Take this tablet once daily after dinner"), the system retrieves the pre-recorded translation instantly instead of passing it to the LLM. Reserve real-time stream translation for subjective complaints.

### 4. Medical Consultant Agent
> **Your Concept**: MedGemma 27B fine-tuned on NMC protocols, ICMR guidelines, National Health Mission protocols; RAG over CDSCO, AIIMS, and CGHS lists; DDI checker.

* **Suggested Enhancement**: RAG is prone to hallucinations, which is an extreme legal risk in clinical diagnostics.
* **Implementation Strategy**: **Deterministic Rule Guarding**. Do NOT let the LLM guess drug-drug interactions (DDIs). Instead, construct a structured SQLite database of CDSCO generics and DDIs. When a doctor drafts a prescription, run a traditional backend lookup programmatically. Use the MedGemma agent only to **explain** the reason behind the interaction or suggest alternative generics from the CGHS list.

### 5. Coder Agent
> **Your Concept**: MedGemma 27B fine-tuned on Ayushman Bharat HBP 2.0 codes (1,949 packages), ICD-10-CM, CGHS, ESIC; auto-generates pre-auth requests.

* **Suggested Enhancement**: Pre-auth rejection is the leading cause of delayed hospital billing cycles in India.
* **Implementation Strategy**: Add an **AI Appeal Generator**. When the Insurance Verifier Agent intercepts a pre-auth rejection from the PMJAY portal (due to insufficient documentation or wrong code pairings), the Coder Agent should analyze the rejection code, match it with clinical evidence from the SOAP notes, and auto-draft a formal appeals PDF to submit to the TPA.

### 6. Imaging Agent
> **Your Concept**: MedGemma Multimodal handling 3D CT/MRI volumes, gigapixel pathology slides, and chest X-rays.

* **Suggested Enhancement**: Loading 3D volumes and gigapixel images in a desktop app can cause significant lag.
* **Implementation Strategy**: Implement **Cornerstone.js / Orthanc WADO-RS Streaming** inside the Next.js viewer. Instead of downloading full 3D volumes, stream sliced images frame-by-frame. Offload MedGemma multimodal inference to an on-premise hospital GPU node (configured via the Support Panel) and return lightweight polygon coordinate bounding boxes (JSON) to render visual overlays (e.g., highlighting a nodule) in the browser view.

### 7. Insurance Verifier Agent
> **Your Concept**: PMJAY BIS API, NHA TMS for pre-auth, private TPA integrations.

* **Suggested Enhancement**: Government portals (TMS/BIS) experience frequent outages.
* **Implementation Strategy**: Build a **Reliable Asynchronous Outbox Queue**. If a portal is unresponsive, do not block the discharge process. The app should cache the signed claim package locally, flag the billing screen as "Queued - Pending NHA Gateway Response," and automatically retry the submission in the background using exponential backoff.

---

## 🎨 Premium Visuals, Animations & UX Strategy

To make SUVI feel premium, modern, and state-of-the-art:

### 🌟 1. Dynamic Design & HSL Palette
Avoid harsh flat colors. Use a sophisticated dark mode for diagnostics (PACS/Imaging) and a bright glassmorphic layout for general workflows.
* **Brand Colors**:
  * Clinical Indigo: `hsl(243, 75%, 59%)` (Represents reliability and focus)
  * Alert Crimson: `hsl(343, 89%, 60%)` (For critical vitals and escalations)
  * Cashless Emerald: `hsl(142, 72%, 29%)` (For verified claims and insurance)
  * Dark Steel: `hsl(215, 25%, 27%)` (For diagnostic dashboards)

### 🌀 2. Micro-Animations
* **The Swarm Bus Glow**: An ambient, pulsating border running across the top header of the workspace showing active agents in real-time (e.g., a subtle green pulse when the Coder is matching a claim).
* **Card Expansions**: When a doctor clicks on a patient in the vital queue, use Framer Motion's `layoutId` to morph the small queue card smoothly into the center EHR modal, preventing cognitive jump-cuts.
* **Voice Waveforms**: When the Scribe Agent is active, display a multi-color, fluid Bezier waveform reacting to the audio frequency to visually indicate to the doctor that transcription is running in the background.

---

## 🚀 Recommended Immediate Next Steps

1. **Verify ABDM Gateway Connectivity**: Draft mock FHIR R4 JSON payloads representing a standard Indian consultation (consisting of ABHA IDs and CDSCO prescription lists) to test data integration with typical HMS schemas.
2. **Setup Local Tauri Sidecars**: Embed a test Python or C++ runtime for offline ASR testing inside the Tauri development bundle.
3. **Refine UI Prototypes**: Implement the dynamic client workspaces inside `components/dashboard-client.tsx` using responsive CSS grid layouts and smooth Framer Motion states.
