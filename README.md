# NeuroNav

An adaptive life co-pilot designed for the neurodivergent community. NeuroNav is a Progressive Web App (PWA) that provides flexible, personalized support for executive functions with a focus on privacy and accessibility.

## Features

- **Privacy-First**: All data stored locally on your device using IndexedDB. No servers, no accounts, no data collection.
- **Energy-Aware Task Management**: Filter tasks based on your current energy level
- **AI-Powered Task Breakdown**: Automatically break down complex tasks into manageable steps
- **Flexible View Modes**:
  - **Default**: Clean Material Design 3 interface
  - **Mind Map Mode**: Visual representation of task relationships
  - **Low-Stim Mode**: Dark theme, larger text, one task at a time for reduced cognitive load
  - **Gamified Mode**: Celebrations and progress tracking to maintain motivation
- **Routine Builder**: Create and save repeatable task routines
- **Mood Tracking**: Check in with yourself throughout the day
- **Encouragement System**: Optional positive reinforcement messages
- **Offline-Capable**: Works completely offline as a PWA
- **Data Portability**: Export and import your data as JSON

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5 with Material Design 3 theme
- **State Management**: Zustand
- **Database**: IndexedDB via Dexie.js
- **PWA**: Vite PWA plugin with Workbox
- **Animations**: Framer Motion & React Confetti

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/endrocryne/NeuroNav.git
cd NeuroNav

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the PWA
npm run build

# Preview the production build
npm run preview
```

## Usage

### First Launch

On your first visit, you'll see a welcome dialog explaining the app's privacy-first approach. Click "Get Started" to begin.

### Today Screen

The main dashboard where you manage your daily tasks:

1. **Set Your Energy Level**: Use the slider to indicate how much energy you have (1-5)
2. **Check Your Mood**: Tap an emoji to log how you're feeling
3. **View Your Tasks**: Tasks are automatically filtered based on your energy level
   - Low energy (1-2): Shows only #survival tagged tasks
   - Medium/High energy (3-5): Shows all tasks
4. **Add New Tasks**: Tap the + button to use the AI task breakdown feature

### AI Task Breakdown

1. Tap the + button on the Today screen
2. Enter a task description (e.g., "Clean the kitchen" or "Write essay")
3. Tap "Break it down" to generate subtasks automatically
4. Review, edit, or remove subtasks as needed
5. Tap "Save to My Day" to add them to your task list

### Plan Screen

**All Tasks Tab**: View all your tasks grouped by date (Today, Tomorrow, Past, Future)

**Routines Tab**: 
1. Create routines by giving them a name and listing tasks (separated by commas or new lines)
2. Save routines for repeated use
3. Add entire routines to your day with one tap

### Settings Screen

- **Focus Modes**: Choose how you want to interact with tasks
- **Emotional Intelligence**: Toggle encouraging messages on/off
- **Data Management**: Export your data as JSON or import from a previous export

## Configuration

### Customizing the Theme

Edit `src/theme.ts` to customize colors and typography. The theme automatically adjusts for Low-Stim mode.

### Adding Task Breakdown Keywords

Edit `src/utils/taskBreakdown.ts` to add more keyword patterns and their corresponding subtask templates.

### Modifying Encouragement Messages

Edit `src/utils/encouragementMessages.ts` to customize or add new positive reinforcement messages.

## Development

### Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── TaskItem.tsx
│   ├── TaskBreakdownDialog.tsx
│   └── WelcomeDialog.tsx
├── screens/          # Main app screens
│   ├── TodayScreen.tsx
│   ├── PlanScreen.tsx
│   └── SettingsScreen.tsx
├── stores/           # Zustand state management
│   └── appStore.ts
├── services/         # Database and external services
│   └── db.ts
├── utils/            # Helper functions and hooks
│   ├── taskBreakdown.ts
│   ├── encouragementMessages.ts
│   └── useWindowSize.ts
├── theme.ts          # Material Design 3 theme configuration
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database Schema

The app uses three IndexedDB tables:

**tasks**: Stores individual tasks
- `id`, `text`, `completed`, `date`, `tags[]`, `project`, `parentTask`, `order`, `createdAt`

**routines**: Stores reusable task routines
- `id`, `name`, `tasks[]`, `createdAt`

**settings**: Stores app configuration
- `id`, `hasSeenWelcome`, `viewMode`, `enableEncouragement`

## Debugging

### Common Issues

**PWA not updating**: Clear site data in browser DevTools and reload

**Database errors**: Open DevTools → Application → IndexedDB → Delete database → Reload

**Build errors**: Delete `node_modules` and `package-lock.json`, then run `npm install`

### Development Tools

- Open browser DevTools (F12)
- **Application tab**: View PWA manifest, service worker, and IndexedDB
- **Console tab**: View app logs and errors
- **Network tab**: Monitor offline functionality

### Debugging Tips

1. Use React DevTools extension to inspect component state
2. Check IndexedDB in Application tab to verify data persistence
3. Test offline mode by checking "Offline" in Network tab
4. Use Lighthouse to audit PWA capabilities

## Contributing

Contributions are welcome! This is an open-source project designed to support the neurodivergent community.

## License

GNU Affero General Public License v3.0 (AGPL-3.0) - see LICENSE file for details.

## Privacy & Data

- **No data collection**: Nothing is sent to any server
- **Local storage only**: All data stays on your device
- **No analytics**: We don't track how you use the app
- **No accounts**: No login required, no personal information collected

## Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

Built with ❤️ for the neurodivergent community
