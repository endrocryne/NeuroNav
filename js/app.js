// Main Application Logic

class NeuroNavApp {
    constructor() {
        this.initialized = false;
    }

    async init() {
        try {
            // Initialize storage
            await storage.init();

            // Load all data
            await taskManager.loadTasks();
            await taskManager.loadEnergyLevel();
            await routineManager.loadRoutines();
            await modeManager.loadMode();
            await encouragementManager.loadSettings();
            await aiBreakdown.loadLLMConfig();

            // Setup UI
            this.setupEventListeners();
            this.setupCustomEventListeners();

            // Initial render
            modeManager.updateUI();
            encouragementManager.updateEncouragementDisplay();
            encouragementManager.startRotation();

            // Hide loading screen
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize app:', error);
            alert('Failed to load NeuroNav. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Menu button
        document.getElementById('menu-button').addEventListener('click', () => {
            document.getElementById('side-nav').classList.add('open');
        });

        // Close nav
        document.getElementById('close-nav').addEventListener('click', () => {
            document.getElementById('side-nav').classList.remove('open');
        });

        // Settings button
        document.getElementById('settings-button').addEventListener('click', () => {
            // Load current LLM settings
            document.getElementById('llm-endpoint').value = aiBreakdown.llmEndpoint || '';
            document.getElementById('llm-api-key').value = aiBreakdown.llmApiKey || '';
            document.getElementById('settings-modal').classList.add('open');
        });

        // Close settings modal
        document.getElementById('close-settings-modal').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.remove('open');
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.remove('open');
        });

        // Energy level selection
        document.querySelectorAll('.energy-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const level = e.currentTarget.dataset.level;
                this.setEnergyLevel(level);
            });
        });

        // Mode selection
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                modeManager.setMode(mode);
            });
        });

        // Task input
        document.getElementById('add-task-button').addEventListener('click', () => {
            this.addTask();
        });

        document.getElementById('task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // AI breakdown button
        document.getElementById('ai-breakdown-button').addEventListener('click', async () => {
            const input = document.getElementById('task-input');
            const taskText = input.value.trim();
            
            if (taskText) {
                await this.breakdownAndAddTask(taskText);
                input.value = '';
            }
        });

        // Navigation items
        document.getElementById('nav-tasks').addEventListener('click', () => {
            document.getElementById('side-nav').classList.remove('open');
        });

        document.getElementById('nav-routines').addEventListener('click', () => {
            document.getElementById('side-nav').classList.remove('open');
            document.getElementById('routine-modal').classList.add('open');
        });

        document.getElementById('nav-export').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('nav-import').addEventListener('click', () => {
            this.importData();
        });

        // Routine modal
        document.getElementById('close-routine-modal').addEventListener('click', () => {
            document.getElementById('routine-modal').classList.remove('open');
        });

        document.getElementById('cancel-routine').addEventListener('click', () => {
            document.getElementById('routine-modal').classList.remove('open');
        });

        document.getElementById('save-routine').addEventListener('click', () => {
            this.saveRoutine();
        });

        // Focus mode navigation
        document.getElementById('prev-task-button').addEventListener('click', () => {
            modeManager.previousFocusTask();
        });

        document.getElementById('next-task-button').addEventListener('click', () => {
            modeManager.nextFocusTask();
        });

        // Settings toggles
        document.getElementById('encouragement-toggle').addEventListener('change', (e) => {
            encouragementManager.setEnabled(e.target.checked);
        });

        // Edit task modal
        document.getElementById('close-edit-task-modal').addEventListener('click', () => {
            document.getElementById('edit-task-modal').classList.remove('open');
        });

        document.getElementById('cancel-edit-task').addEventListener('click', () => {
            document.getElementById('edit-task-modal').classList.remove('open');
        });

        document.getElementById('save-edit-task').addEventListener('click', () => {
            modeManager.saveEditedTask();
        });

        // LLM configuration
        document.getElementById('close-settings').addEventListener('click', async () => {
            const endpoint = document.getElementById('llm-endpoint').value.trim();
            const apiKey = document.getElementById('llm-api-key').value.trim();
            
            if (endpoint) {
                aiBreakdown.configureLLM(endpoint, apiKey || null);
                encouragementManager.showToast('LLM configured successfully');
            } else if (aiBreakdown.llmEndpoint) {
                // User cleared the endpoint, disable LLM
                aiBreakdown.disableLLM();
            }
            
            document.getElementById('settings-modal').classList.remove('open');
        });

        // FAB
        document.getElementById('fab').addEventListener('click', () => {
            document.getElementById('task-input').focus();
        });
    }

    setupCustomEventListeners() {
        // Listen for task completion events
        window.addEventListener('taskCompleted', (e) => {
            encouragementManager.showCompletionCelebration(e.detail.task);
            modeManager.renderCurrentMode();
        });
    }

    setEnergyLevel(level) {
        // Update button states
        document.querySelectorAll('.energy-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-level="${level}"]`).classList.add('active');

        // Update task manager
        taskManager.setEnergyLevel(level);

        // Update encouragement message
        encouragementManager.updateForEnergyLevel(level);

        // Re-render current view
        modeManager.renderCurrentMode();
    }

    async addTask() {
        const input = document.getElementById('task-input');
        const taskText = input.value.trim();

        if (taskText) {
            try {
                await taskManager.addTask({ title: taskText });
                input.value = '';
                modeManager.renderCurrentMode();
                encouragementManager.showToast('Task added!');
            } catch (error) {
                console.error('Failed to add task:', error);
                encouragementManager.showToast('Failed to add task. Please try again.');
            }
        }
    }

    async breakdownAndAddTask(taskText) {
        try {
            // Add parent task
            const parentTask = await taskManager.addTask({ title: taskText });

            // Break it down
            await taskManager.breakdownTask(parentTask.id);

            modeManager.renderCurrentMode();
            encouragementManager.showToast('Task broken down into smaller steps!');
        } catch (error) {
            console.error('Failed to breakdown task:', error);
            encouragementManager.showToast('Failed to break down task. Please try again.');
        }
    }

    async saveRoutine() {
        const nameInput = document.getElementById('routine-name');
        const routineInput = document.getElementById('routine-input');

        const name = nameInput.value.trim();
        const text = routineInput.value.trim();

        if (!name || !text) {
            encouragementManager.showToast('Please provide a routine name and description.');
            return;
        }

        try {
            const tasks = routineManager.parseRoutineInput(text);
            await routineManager.createRoutine(name, tasks);

            // Clear inputs
            nameInput.value = '';
            routineInput.value = '';

            // Close modal
            document.getElementById('routine-modal').classList.remove('open');

            encouragementManager.showToast('Routine saved!');
        } catch (error) {
            console.error('Failed to save routine:', error);
            encouragementManager.showToast('Failed to save routine. Please try again.');
        }
    }

    async exportData() {
        try {
            const data = await storage.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `neuronav-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            document.getElementById('side-nav').classList.remove('open');
            encouragementManager.showToast('Data exported successfully!');
        } catch (error) {
            console.error('Failed to export data:', error);
            encouragementManager.showToast('Failed to export data. Please try again.');
        }
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                await storage.importData(data);
                
                // Reload all data
                await taskManager.loadTasks();
                await routineManager.loadRoutines();
                
                // Re-render
                modeManager.renderCurrentMode();
                
                document.getElementById('side-nav').classList.remove('open');
                encouragementManager.showToast('Data imported successfully!');
            } catch (error) {
                console.error('Failed to import data:', error);
                encouragementManager.showToast('Failed to import data. Please check the file format.');
            }
        });

        input.click();
    }
}

// Initialize app when DOM is ready
const app = new NeuroNavApp();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
