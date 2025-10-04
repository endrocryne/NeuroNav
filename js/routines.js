// Routines Module - Natural Language Processing for Routine Creation

class RoutineManager {
    constructor() {
        this.routines = [];
    }

    // Parse natural language routine input
    parseRoutineInput(text) {
        // Remove common prefixes and clean up
        const cleaned = text.trim();
        
        // Split by common separators
        const separators = [',', ';', '\n', ' then ', ' and ', ' -> '];
        let tasks = [cleaned];
        
        for (const separator of separators) {
            const newTasks = [];
            for (const task of tasks) {
                newTasks.push(...task.split(separator).map(t => t.trim()));
            }
            tasks = newTasks;
        }
        
        // Filter out empty tasks and remove routine name prefix if present
        tasks = tasks.filter(task => task.length > 0);
        
        // Check if first item is a routine name (e.g., "Morning:")
        if (tasks.length > 0 && tasks[0].includes(':')) {
            tasks = tasks.slice(1);
        }
        
        return tasks.map(task => this.cleanTask(task));
    }

    cleanTask(task) {
        // Remove common prefixes like numbers, bullets, etc.
        let cleaned = task.replace(/^[\d\.\-\*\•\→]+\s*/, '');
        
        // Capitalize first letter
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        
        // Remove trailing punctuation except necessary ones
        cleaned = cleaned.replace(/[,;]+$/, '');
        
        return cleaned;
    }

    async createRoutine(name, tasks) {
        const routine = {
            name: name,
            tasks: tasks,
            createdAt: new Date().toISOString()
        };
        
        const routineId = await storage.addRoutine(routine);
        routine.id = routineId;
        this.routines.push(routine);
        
        return routine;
    }

    async loadRoutines() {
        this.routines = await storage.getAllRoutines();
        return this.routines;
    }

    async deleteRoutine(id) {
        await storage.deleteRoutine(id);
        this.routines = this.routines.filter(r => r.id !== id);
    }

    async applyRoutine(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) {
            throw new Error('Routine not found');
        }

        // Create tasks from routine
        const taskIds = [];
        for (const taskTitle of routine.tasks) {
            const task = {
                title: taskTitle,
                completed: false,
                energyLevel: aiBreakdown.suggestEnergyLevel(taskTitle),
                isSurvival: aiBreakdown.suggestSurvival(taskTitle),
                routine: routine.name
            };
            const taskId = await storage.addTask(task);
            taskIds.push(taskId);
        }

        return taskIds;
    }

    getRoutineById(id) {
        return this.routines.find(r => r.id === id);
    }
}

// Global routine manager instance
const routineManager = new RoutineManager();
