# 🏛️ Lumi: The Luxury Digital Concierge

Lumi is a state-of-the-art hospitality assistant developed for **The Lumiere Grand Erode**, a 5-star boutique establishment in Tamil Nadu, India. This application demonstrates the pinnacle of AI-driven guest relations, combining sophisticated natural language processing with real-world grounding and a unique theatrical audio experience.

---

## 🌟 Hero Feature: Immersive Multi-Speaker Audio Tour

The standout feature of Lumi is its **Dual-Persona Audio Briefing Engine**. Unlike standard text-to-speech systems, Lumi provides a conversational tour of its recommendations.

-   **The Persona Duo**: 
    -   **Lumi**: A refined, professional, and eloquent concierge (voiced by `Kore`).
    -   **Arun**: A local Erode guide, passionate about history and heritage (voiced by `Puck`).
-   **Dynamic Scripting**: When a guest requests an "Audio Tour," the system uses `gemini-2.5-flash-preview-tts` to generate a script where these two characters discuss the hotel's recommendations, finish each other's sentences, and provide a lively, high-energy briefing.
-   **Technical Implementation**: Raw PCM audio data is streamed from the Gemini API, decoded in the browser using the Web Audio API (`AudioContext`), and visualized with a dynamic CSS-animated waveform.

---

## 🚀 Core Functionalities

### 1. Intelligent Guest Onboarding
Upon arrival, guests are categorized into one of four tailored archetypes:
-   **Culinary**: Focuses on authentic South Indian Thalis and the Erode Turmeric Market.
-   **Business**: Prioritizes soundproof suites, high-speed connectivity, and textile logistics.
-   **Relaxation**: Highlights Ayurvedic rituals at the Lotus Spa and riverside meditation.
-   **Exploration**: Suggests historic temple circuits and waterfall excursions.

### 2. Real-World Grounding (Google Search & Maps)
Lumi doesn't just hallucinate local details; it is grounded in reality:
-   **Google Maps Integration**: Uses the `googleMaps` tool to provide live locations for temples, markets, and restaurants.
-   **Google Search Integration**: Provides up-to-date links and snippets for local events and trending spots in Erode.
-   **Grounding UI**: Interactive links appear directly in the chat bubbles, allowing guests to jump straight to Google Maps for navigation.

### 3. Lotus Spa Booking Engine
A fully integrated booking workflow for the hotel's premier wellness center:
-   **Interactive Modals**: Guests can browse a menu of Ayurvedic treatments (Abhyanga, Shirodhara, etc.).
-   **Slot Management**: A selection of time slots specifically curated for the guest's convenience.
-   **Automated Confirmation**: The booking is fed back into the AI context to provide a seamless confirmation message within the chat flow.

---

## 🛠️ Technical Architecture

### Tech Stack
-   **Frontend**: React 19 with TypeScript.
-   **AI SDK**: `@google/genai` (Native ESM support).
-   **Models**: 
    -   `gemini-3-flash-preview` / `gemini-2.5-flash` for reasoning and grounding.
    -   `gemini-2.5-flash-preview-tts` for high-fidelity multi-speaker audio.
-   **Styling**: Tailwind CSS with custom Glassmorphism effects.
-   **State Management**: React Hooks (useState, useEffect, useRef).

### Project Structure
```text
.
├── components/
│   └── ChatMessage.tsx      # Handles rendering logic, grounding UI, and Audio Tour playback.
├── services/
│   └── geminiService.ts     # API orchestration for Chat and Multi-Speaker TTS.
├── App.tsx                  # Root component, Onboarding, and Spa Booking state.
├── constants.tsx            # Hotel-specific data and interest-based suggestion logic.
├── types.ts                 # TypeScript definitions for Profiles, Messages, and Location.
├── index.html               # Entry point with Tailwind and Font configurations.
├── metadata.json            # App permissions (Geolocation) and manifest data.
└── README.md                # Detailed technical documentation.
```

---

## 🔒 Security & Performance

-   **Environment Variables**: The application strictly uses `process.env.API_KEY` for secure Gemini API access.
-   **Geolocation API**: Requires user permission to provide hyper-local recommendations within the Erode district.
-   **Optimized Audio Pipeline**: Implements custom Base64-to-Uint8Array decoding to handle raw PCM streams efficiently without third-party library bloat.
-   **Responsive Design**: A hybrid sidebar-chat layout optimized for both desktop executive suites and mobile travel.

---

## 📖 Setup Instructions

1.  **Obtain API Key**: Get your key from [Google AI Studio](https://aistudio.google.com/).
2.  **Environment Setup**: Ensure `process.env.API_KEY` is available in your development environment.
3.  **Permissions**: When prompted, allow **Location** access to enable the full Google Maps grounding feature.
4.  **Audio Setup**: Ensure your browser volume is on to experience the multi-speaker briefings.

---

## ⚖️ Disclaimer
This application is a demonstration for the hospitality industry. **The Lumiere Grand Erode** is a fictional boutique hotel. All local attraction data is provided via real-time AI grounding tools.
