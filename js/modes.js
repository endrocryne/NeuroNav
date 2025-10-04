// Modes Module - Handle different interface modes

class ModeManager {
    constructor() {
        this.currentMode = 'linear';
        this.focusTaskIndex = 0;
    }

    setMode(mode) {
        this.currentMode = mode;
        this.updateUI();
        storage.setSetting('currentMode', mode);
    }

    updateUI() {
        // Hide all views
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.remove('active');
        });

        // Update mode tabs
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show active view and tab
        const activeView = document.getElementById(`${this.currentMode}-view`);
        const activeTab = document.querySelector(`[data-mode="${this.currentMode}"]`);
        
        if (activeView) activeView.classList.add('active');
        if (activeTab) activeTab.classList.add('active');

        // Apply mode-specific body classes
        document.body.className = '';
        if (this.currentMode === 'low-stimulus') {
            document.body.classList.add('low-stimulus-mode');
        }

        // Render the appropriate view
        this.renderCurrentMode();
    }

    renderCurrentMode() {
        switch (this.currentMode) {
            case 'linear':
                this.renderLinearMode();
                break;
            case 'mindmap':
                this.renderMindMapMode();
                break;
            case 'low-stimulus':
                this.renderLowStimulusMode();
                break;
            case 'gamified':
                this.renderGamifiedMode();
                break;
        }
    }

    renderLinearMode() {
        const tasks = taskManager.getFilteredTasks();
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--on-surface-variant);">No tasks yet. Add one to get started!</p>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = 'task-item' + (task.completed ? ' completed' : '');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            taskManager.toggleTaskCompletion(task.id);
        });

        const content = document.createElement('div');
        content.className = 'task-content';

        const title = document.createElement('div');
        title.className = 'task-title';
        title.textContent = task.title;

        const tags = document.createElement('div');
        tags.className = 'task-tags';
        
        if (task.isSurvival) {
            const survivalTag = document.createElement('span');
            survivalTag.className = 'task-tag';
            survivalTag.textContent = '⭐ Essential';
            tags.appendChild(survivalTag);
        }

        if (task.energyLevel) {
            const energyTag = document.createElement('span');
            energyTag.className = 'task-tag';
            energyTag.textContent = `${this.getEnergyIcon(task.energyLevel)} ${task.energyLevel}`;
            tags.appendChild(energyTag);
        }

        if (task.routine) {
            const routineTag = document.createElement('span');
            routineTag.className = 'task-tag';
            routineTag.textContent = `🔄 ${task.routine}`;
            tags.appendChild(routineTag);
        }

        content.appendChild(title);
        if (tags.children.length > 0) {
            content.appendChild(tags);
        }

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-button';
        deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
        deleteBtn.addEventListener('click', async () => {
            await taskManager.deleteTask(task.id);
            this.renderCurrentMode();
        });

        actions.appendChild(deleteBtn);

        div.appendChild(checkbox);
        div.appendChild(content);
        div.appendChild(actions);

        return div;
    }

    getEnergyIcon(level) {
        const icons = {
            low: '🌙',
            medium: '☀️',
            high: '⚡'
        };
        return icons[level] || '☀️';
    }

    renderMindMapMode() {
        const canvas = document.getElementById('mindmap-canvas');
        canvas.innerHTML = '';

        const tasks = taskManager.getFilteredTasks();
        const parentTasks = tasks.filter(t => !t.parent);

        // Simple mind map layout
        const centerX = 300;
        const centerY = 200;
        const radius = 150;

        parentTasks.forEach((task, index) => {
            const angle = (index / parentTasks.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const node = this.createMindMapNode(task, x, y);
            canvas.appendChild(node);

            // Draw connections for subtasks
            const subtasks = taskManager.getTasksByParent(task.id);
            subtasks.forEach((subtask, subIndex) => {
                const subAngle = angle + ((subIndex - subtasks.length / 2) * 0.3);
                const subX = x + 100 * Math.cos(subAngle);
                const subY = y + 100 * Math.sin(subAngle);

                const subNode = this.createMindMapNode(subtask, subX, subY);
                canvas.appendChild(subNode);

                // Draw connection line
                const connection = this.createConnection(x, y, subX, subY);
                canvas.appendChild(connection);
            });
        });
    }

    createMindMapNode(task, x, y) {
        const node = document.createElement('div');
        node.className = 'mindmap-node' + 
            (task.completed ? ' completed' : '') +
            (!task.parent ? ' parent' : '');
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.textContent = task.title;
        
        node.addEventListener('click', () => {
            taskManager.toggleTaskCompletion(task.id);
            this.renderCurrentMode();
        });

        return node;
    }

    createConnection(x1, y1, x2, y2) {
        const line = document.createElement('div');
        line.className = 'mindmap-connection';
        
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}deg)`;
        
        return line;
    }

    renderLowStimulusMode() {
        const pendingTasks = taskManager.getPendingTasks();
        const focusContainer = document.getElementById('focus-task');

        if (pendingTasks.length === 0) {
            focusContainer.innerHTML = '<p class="focus-task-title">All done! Take a well-deserved break. 🎉</p>';
            return;
        }

        // Ensure index is valid
        this.focusTaskIndex = Math.max(0, Math.min(this.focusTaskIndex, pendingTasks.length - 1));
        const currentTask = pendingTasks[this.focusTaskIndex];

        focusContainer.innerHTML = `
            <h2 class="focus-task-title">${currentTask.title}</h2>
            <input type="checkbox" class="focus-task-checkbox" ${currentTask.completed ? 'checked' : ''}>
            ${currentTask.description ? `<p class="focus-task-description">${currentTask.description}</p>` : ''}
            <p style="text-align: center; color: var(--on-surface-variant); margin-top: 1rem;">
                Task ${this.focusTaskIndex + 1} of ${pendingTasks.length}
            </p>
        `;

        const checkbox = focusContainer.querySelector('.focus-task-checkbox');
        checkbox.addEventListener('change', async () => {
            await taskManager.toggleTaskCompletion(currentTask.id);
            this.renderCurrentMode();
        });
    }

    nextFocusTask() {
        const pendingTasks = taskManager.getPendingTasks();
        if (this.focusTaskIndex < pendingTasks.length - 1) {
            this.focusTaskIndex++;
            this.renderCurrentMode();
        }
    }

    previousFocusTask() {
        if (this.focusTaskIndex > 0) {
            this.focusTaskIndex--;
            this.renderCurrentMode();
        }
    }

    async renderGamifiedMode() {
        // Update stats
        const points = await storage.getGamificationData('points');
        const streak = await storage.getGamificationData('streak');

        document.getElementById('points-value').textContent = points;
        document.getElementById('streak-value').textContent = streak;

        // Update progress bar
        const tasks = taskManager.tasks;
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        document.getElementById('progress-fill').style.width = `${progress}%`;

        // Render task list with gamified elements
        const taskList = document.getElementById('gamified-task-list');
        taskList.innerHTML = '';

        const filteredTasks = taskManager.getFilteredTasks();
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskElement.classList.add('gamified-task-item');
            taskList.appendChild(taskElement);
        });
    }

    async loadMode() {
        const savedMode = await storage.getSetting('currentMode');
        if (savedMode) {
            this.currentMode = savedMode;
        }
    }
}

// Global mode manager instance
const modeManager = new ModeManager();
