// Tasks Module - Task Management Logic

class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentEnergyLevel = 'medium';
    }

    async loadTasks() {
        this.tasks = await storage.getAllTasks();
        return this.tasks;
    }

    async addTask(taskData) {
        const task = {
            title: taskData.title,
            description: taskData.description || '',
            completed: false,
            energyLevel: taskData.energyLevel || aiBreakdown.suggestEnergyLevel(taskData.title),
            isSurvival: taskData.isSurvival || aiBreakdown.suggestSurvival(taskData.title),
            parent: taskData.parent || null,
            tags: taskData.tags || [],
            subtasks: taskData.subtasks || []
        };

        const taskId = await storage.addTask(task);
        task.id = taskId;
        this.tasks.push(task);
        
        return task;
    }

    async updateTask(id, updates) {
        const updatedTask = await storage.updateTask(id, updates);
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks[index] = updatedTask;
        }
        return updatedTask;
    }

    async deleteTask(id) {
        await storage.deleteTask(id);
        this.tasks = this.tasks.filter(t => t.id !== id);
    }

    async toggleTaskCompletion(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const completed = !task.completed;
            await this.updateTask(id, { 
                completed,
                completedAt: completed ? new Date().toISOString() : null
            });
            
            // Trigger gamification update
            if (completed) {
                await this.handleTaskCompletion(task);
            }
        }
    }

    async handleTaskCompletion(task) {
        // Update points
        const currentPoints = await storage.getGamificationData('points');
        const newPoints = currentPoints + this.calculateTaskPoints(task);
        await storage.setGamificationData('points', newPoints);

        // Update streak
        await this.updateStreak();

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('taskCompleted', { detail: { task, points: newPoints } }));
    }

    calculateTaskPoints(task) {
        let points = 10; // Base points
        
        // Energy level multiplier
        if (task.energyLevel === 'high') points *= 1.5;
        if (task.energyLevel === 'low') points *= 0.8;
        
        // Survival task bonus
        if (task.isSurvival) points += 5;
        
        return Math.floor(points);
    }

    async updateStreak() {
        const today = new Date().toDateString();
        const lastCompletionDate = await storage.getGamificationData('lastCompletionDate');
        const currentStreak = await storage.getGamificationData('streak');

        if (lastCompletionDate === today) {
            // Already completed a task today
            return currentStreak;
        }

        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let newStreak = currentStreak;

        if (lastCompletionDate === yesterday) {
            // Continuing streak
            newStreak = currentStreak + 1;
        } else if (lastCompletionDate !== today) {
            // Starting new streak
            newStreak = 1;
        }

        await storage.setGamificationData('lastCompletionDate', today);
        await storage.setGamificationData('streak', newStreak);

        return newStreak;
    }

    async breakdownTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        const subtasks = aiBreakdown.breakdown(task.title);
        const subtaskIds = [];

        for (const subtaskData of subtasks) {
            const subtask = await this.addTask({
                ...subtaskData,
                parent: taskId
            });
            subtaskIds.push(subtask.id);
        }

        // Update parent task with subtask references
        await this.updateTask(taskId, { subtasks: subtaskIds });

        return subtaskIds;
    }

    getFilteredTasks() {
        let filtered = [...this.tasks];

        // Filter based on energy level
        if (this.currentEnergyLevel === 'low') {
            // Only show survival tasks or completed tasks
            filtered = filtered.filter(t => t.isSurvival || t.completed);
        } else if (this.currentEnergyLevel === 'medium') {
            // Show survival tasks and medium energy tasks
            filtered = filtered.filter(t => 
                t.isSurvival || 
                t.energyLevel === 'low' || 
                t.energyLevel === 'medium' ||
                t.completed
            );
        }
        // High energy: show all tasks

        return filtered;
    }

    setEnergyLevel(level) {
        this.currentEnergyLevel = level;
        storage.setSetting('currentEnergyLevel', level);
    }

    async loadEnergyLevel() {
        const savedLevel = await storage.getSetting('currentEnergyLevel');
        if (savedLevel) {
            this.currentEnergyLevel = savedLevel;
        }
    }

    getTasksByParent(parentId) {
        return this.tasks.filter(t => t.parent === parentId);
    }

    getCompletedTasks() {
        return this.tasks.filter(t => t.completed);
    }

    getPendingTasks() {
        return this.tasks.filter(t => !t.completed);
    }

    searchTasks(query) {
        const lowerQuery = query.toLowerCase();
        return this.tasks.filter(t => 
            t.title.toLowerCase().includes(lowerQuery) ||
            (t.description && t.description.toLowerCase().includes(lowerQuery))
        );
    }
}

// Global task manager instance
const taskManager = new TaskManager();
