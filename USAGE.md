# NeuroNav Usage Guide

## Quick Start

### Running the App

1. **Using npm (recommended)**:
   ```bash
   npm start
   ```
   This will start a local server on http://localhost:8000

2. **Using Python**:
   ```bash
   python -m http.server 8000
   ```

3. **Using any static file server** - just serve the root directory

4. **Open in browser**: Navigate to `http://localhost:8000`

### Installing as PWA

1. Open the app in your browser
2. Look for the install prompt or browser menu option
3. Click "Install" to add NeuroNav to your device
4. The app will work offline after installation

## Features Guide

### 1. Energy Level Selection

Start each session by selecting your current energy level:

- **High Energy** ⚡: Shows all tasks
- **Medium Energy** ☀️: Shows survival tasks + low/medium energy tasks  
- **Low Energy** 🌙: Shows only essential/survival tasks + completed tasks

The encouragement message adapts based on your energy level.

### 2. Adding Tasks

**Simple Task**:
1. Type task in the input field
2. Press Enter or click the + button
3. Task is automatically tagged with energy level and survival priority

**AI-Powered Breakdown**:
1. Type a complex task (e.g., "plan vacation")
2. Click the sparkle icon (✨) 
3. Task is automatically broken down into subtasks

Recognized patterns:
- Vacation/Travel
- Shopping/Groceries
- Cleaning/Organizing
- Cooking/Meal prep
- Job search
- Moving/Relocating
- Event planning
- Exercise/Fitness
- Learning/Study
- Home maintenance

### 3. Interface Modes

#### Linear Mode (List View)
- Traditional task list
- Best for: Sequential task completion
- Shows all task details and tags

#### Mind Map Mode
- Visual, non-linear layout
- Best for: Brainstorming and seeing relationships
- Parent tasks and their subtasks displayed spatially

#### Low-Stimulus Mode (Focus)
- Shows ONE task at a time
- Minimalist, low-contrast design
- Navigate with Previous/Next buttons
- Best for: Reducing overwhelm, maintaining focus

#### Gamified Mode
- Points system (base 10 points per task)
- Bonus points for essential tasks (+5)
- Energy level multipliers (high: 1.5x, low: 0.8x)
- Day streak tracking
- Progress bar
- Celebration animations and confetti
- Best for: Motivation and achievement

### 4. Creating Routines

1. Open menu (☰) → Routines
2. Enter routine name (e.g., "Morning Routine")
3. Describe in natural language:
   ```
   Morning: wake up, stretch, make coffee, take medication, check email, plan day
   ```
4. Click "Save Routine"

The parser understands:
- Commas, semicolons, line breaks
- "then", "and" connectors
- Numbered or bulleted lists
- Routine prefixes (e.g., "Morning:")

### 5. Task Tags

Tasks are automatically tagged:

- **⭐ Essential**: Survival tasks (medicine, bills, food, work)
- **🌙 Low Energy**: Planning, reading, checking
- **☀️ Medium Energy**: Most standard tasks
- **⚡ High Energy**: Exercise, cleaning, building
- **🔄 Routine**: Tasks created from routines

### 6. Data Management

#### Export Data
1. Open menu → Export Data
2. Downloads JSON file with all your data
3. Save for backup

#### Import Data
1. Open menu → Import Data
2. Select your backup JSON file
3. All data is restored

**Data stored locally includes**:
- Tasks (with all metadata)
- Routines
- Settings (energy level, mode, preferences)
- Gamification data (points, streaks)

### 7. Settings

Access via settings icon in header:

- **Show encouraging messages**: Toggle supportive messages
- **Auto-suggest task breakdown**: Toggle AI breakdown suggestions

## Keyboard Shortcuts

- `Enter` in task input: Add task
- `Tab`: Navigate between elements
- `Escape`: Close modals

## Tips for Best Experience

### For ADHD
- Use **Gamified Mode** for dopamine hits
- Set energy level honestly each day
- Use **AI Breakdown** for overwhelming tasks
- Create routines for recurring activities

### For Autism/Sensory Processing
- Use **Low-Stimulus Mode** for focus
- Disable encouraging messages if preferred
- Use **Linear Mode** for predictability
- Keep routines consistent

### For Anxiety/Depression
- Start with **Low Energy** on difficult days
- Focus on essential tasks only
- Use encouraging messages for support
- Celebrate small wins

### General Tips
- Review energy level throughout the day
- Export data weekly for backups
- Use routines for automatic task creation
- Switch modes based on current needs

## Troubleshooting

### App Won't Load
- Clear browser cache
- Ensure JavaScript is enabled
- Try a different browser (Chrome, Firefox, Safari, Edge recommended)

### Data Not Saving
- Check browser storage permissions
- Ensure sufficient disk space
- Try exporting and importing data

### Service Worker Issues
- Clear browser cache
- Unregister and re-register service worker
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Performance Issues
- Close unused browser tabs
- Clear old completed tasks
- Export data and start fresh if database is very large

## Browser Compatibility

**Fully Supported**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Required Features**:
- IndexedDB
- Service Workers
- ES6+ JavaScript
- CSS Grid and Flexbox

## Privacy Notes

- **No Internet Required**: Fully functional offline
- **No Tracking**: No analytics or telemetry
- **No Accounts**: No sign-up or login
- **Local Storage Only**: All data stays on your device
- **No External APIs**: AI breakdown is local pattern matching
- **Data Control**: Export/import your data anytime

## Support

For issues or suggestions:
1. Check this usage guide
2. Review the README.md
3. Open an issue on GitHub

## License

GNU Affero General Public License v3.0 (AGPL-3.0)
