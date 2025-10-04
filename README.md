# NeuroNav

A neurodivergent-friendly task management Progressive Web App (PWA) designed with privacy, accessibility, and adaptability at its core.

## Features

### Core Architecture & Platform
- **Progressive Web App (PWA)**: Installable on mobile and desktop devices with full offline functionality
- **Client-Side Storage**: All data stored locally using IndexedDB - no cloud backend or user accounts required
- **Material 3 Design**: Modern, accessible UI built with Google Material Design 3 components

### Core Functionality
- **AI-Powered Task Breakdown**: Input complex tasks (e.g., "plan vacation") and automatically generate actionable sub-tasks using client-side pattern matching
- **Personalized Routine Builder**: Create and save daily routines using natural language input (e.g., "Morning: wake up, make coffee, check email")
- **Task Management**: Full CRUD operations for tasks with completion tracking

### Adaptive User Experience
- **Energy-Based Planning**: Daily view adapts based on your current energy level
  - **Low Energy**: Shows only essential/survival tasks
  - **Medium Energy**: Shows survival tasks plus low-to-medium energy tasks
  - **High Energy**: Shows all tasks
  
- **Adaptive Interface Modes**:
  - **Linear Mode**: Traditional list view for sequential task management
  - **Mind Map Mode**: Visual, non-linear layout for brainstorming and viewing task relationships
  - **Low-Stimulus Mode**: Minimalist, low-contrast UI showing one task at a time to minimize overwhelm
  - **Gamified Mode**: Progress bars, points, streaks, and celebratory animations for motivation

### User-Centric & Privacy Features
- **Emotional Intelligence**: Supportive, non-judgmental language throughout the app
- **Encouraging Messages**: Optional motivational messages that rotate periodically
- **Privacy First**: Fully functional offline with no internet connection required
- **Data Portability**: Local data export/import for backups (JSON format)

## Installation

### As a Web App
1. Open the app in a modern web browser (Chrome, Firefox, Safari, Edge)
2. The browser will prompt you to install the app
3. Click "Install" to add NeuroNav to your device

### For Development
1. Clone the repository:
   ```bash
   git clone https://github.com/endrocryne/NeuroNav.git
   cd NeuroNav
   ```

2. Serve the files using any static file server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   ```

3. Open `http://localhost:8000` in your browser

## Usage

### Getting Started
1. **Set Your Energy Level**: Start by selecting how you're feeling today (High, Medium, or Low Energy)
2. **Add Tasks**: Type tasks into the input field and press Enter or click the + button
3. **Use AI Breakdown**: Click the sparkle icon (✨) to automatically break down complex tasks into smaller steps
4. **Choose Your View Mode**: Select the interface mode that works best for you:
   - List icon for Linear mode
   - Tree icon for Mind Map mode
   - Minimize icon for Low-Stimulus/Focus mode
   - Trophy icon for Gamified mode

### Creating Routines
1. Open the menu (☰) and select "Routines"
2. Enter a routine name (e.g., "Morning Routine")
3. Describe your routine in natural language:
   ```
   Morning: wake up, make coffee, check email, take vitamins, walk dog
   ```
4. Click "Save Routine" to save for future use

### Task Tags
Tasks are automatically tagged based on content:
- **⭐ Essential**: Survival/essential tasks (medications, bills, work deadlines)
- **Energy Level**: 🌙 Low / ☀️ Medium / ⚡ High
- **🔄 Routine**: Tasks created from routines

### Data Management
- **Export Data**: Menu → Export Data (saves as JSON file)
- **Import Data**: Menu → Import Data (restore from JSON backup)

## Privacy & Security

NeuroNav is built with privacy as a fundamental principle:
- **No User Accounts**: No sign-up, no login, no personal information collected
- **No Cloud Storage**: All data stays on your device
- **No Analytics**: No tracking, no telemetry, no third-party services
- **Offline First**: Works completely offline after initial load
- **Local Backups**: Export your data anytime for safekeeping

## Accessibility

NeuroNav includes several accessibility features:
- **High Contrast Mode**: Automatic support for system high contrast preferences
- **Reduced Motion**: Respects prefers-reduced-motion settings
- **Dark Mode**: Automatic dark mode based on system preferences
- **Keyboard Navigation**: Full keyboard support for all features
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Customizable Interface**: Multiple viewing modes to suit different needs

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage**: IndexedDB for client-side data persistence
- **UI Framework**: Material Design 3 principles
- **PWA**: Service Workers for offline functionality
- **No Build Tools Required**: Works directly in the browser

## Browser Compatibility

NeuroNav works in all modern browsers that support:
- IndexedDB
- Service Workers
- ES6+ JavaScript
- CSS Grid and Flexbox

Recommended browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the LICENSE file for details.

## Acknowledgments

Built with neurodivergent users in mind, incorporating best practices for ADHD, autism, and other cognitive differences. Special thanks to the neurodivergent community for inspiration and feedback.

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.