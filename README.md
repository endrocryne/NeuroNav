# NeuroNav

**An adaptive life co-pilot for the neurodivergent community.**

NeuroNav is a Progressive Web App (PWA) designed to be a flexible, personalized, and supportive tool for managing daily tasks and routines. Built with privacy as a core principle, all data is stored locally on your device and is never sent to a server.

## ✨ Features

*   **100% Offline & Private:** All your data is stored in your browser's IndexedDB. No accounts, no cloud, no tracking.
*   **Adaptive "Today" View:** An energy and mood check-in filters your daily tasks, showing you only what's manageable right now.
*   **AI-Powered Task Breakdown:** Turn large tasks (like "clean the kitchen") into a simple checklist of sub-tasks with a single click.
*   **Flexible Planning:** Manage all your tasks in one place and create reusable routines for common schedules (e.g., "Morning Routine").
*   **Customizable Focus Modes:**
    *   **Default:** A clean, standard Material 3 interface.
    *   **Mind Map:** A visual layout connecting tasks and sub-tasks (simplified).
    *   **Low-Stimulation:** A dark, low-contrast theme with larger fonts and hidden icons to reduce sensory input.
    *   **Gamified:** Adds fun animations and a progress bar for task completion.
*   **Data Control:** Easily export all your data to a JSON file for backup or import it to a new device.

## 🚀 Quick Start

To get the application running locally, follow these steps.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <directory-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173` (or the port specified in the console).

## 🛠️ Technology Stack

*   **Framework:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
*   **UI Library:** [MUI for React](https://mui.com/) (Material Design 3)
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
*   **Client-Side Storage:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [Dexie.js](https://dexie.org/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **PWA:** Service worker and manifest managed by `vite-plugin-pwa`.

## ⚙️ Configuration

The application is configured through several key files:

*   `vite.config.js`: Configures the Vite build process, including the PWA plugin.
*   `src/theme.js`: Defines the global Material 3 theme, including colors and typography.
*   `src/store.js`: Manages all global application state with Zustand, including user settings.
*   `src/db.js`: Defines the IndexedDB database schema using Dexie.js.

## 🐛 Debugging

*   **IndexedDB:** You can inspect the client-side database using your browser's developer tools. Go to the "Application" tab (in Chrome/Edge) or "Storage" tab (in Firefox) and look for "IndexedDB" in the sidebar. You will find the `NeuroNavDB` database and its tables (`tasks`, `routines`).
*   **Zustand State:** Use the [React Developer Tools](https://react.dev/learn/react-developer-tools) to inspect the `useAppStore` hook and see the current global state. For a more advanced setup, you can integrate Zustand's `devtools` middleware.
*   **Service Worker:** The service worker's status can be monitored from the "Application" or "Storage" tab in your browser's developer tools. You can unregister it, force updates, and test offline functionality from there.