# NeuroNav

NeuroNav is a Progressive Web App (PWA) built with React and Vite, designed to help users manage their tasks and goals effectively. It leverages a local, on-device LLM to break down tasks into smaller, manageable steps. All data is stored locally on the client-side using IndexedDB, ensuring privacy and offline functionality.

## Screenshots

*(coming soon)*

## Features

*   **Offline Functionality:** Full offline capabilities implemented via a service worker.
*   **Local Data Storage:** All application data is stored locally on the client-side using IndexedDB.
*   **On-Device LLM:** Uses a local, on-device LLM for task breakdown.
*   **Modern UI:** Built with Google Material 3 components using the MUI for React library.
*   **State Management:** Global state management is handled by Zustand.
*   **Animations:** UI animations are implemented using `framer-motion`.

## Tech Stack

*   **Framework:** React
*   **Build Tool:** Vite
*   **UI Library:** Material-UI (MUI) for React
*   **State Management:** Zustand
*   **Database:** IndexedDB with Dexie.js
*   **LLM:** `@xenova/transformers` with `Xenova/flan-t5-small`
*   **Animations:** `framer-motion`
*   **PWA:** `vite-plugin-pwa`

## Quickstart

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/neuronav.git
    ```
2.  Install dependencies:
    ```bash
    cd neuronav
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## License

Mishra CSIL-2025 (Code Source Inspection License 2025)
Copyright (c) 2025 Agastya Mishra
