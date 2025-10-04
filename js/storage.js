// Storage Layer - IndexedDB for client-side data storage

class StorageManager {
    constructor() {
        this.dbName = 'NeuroNavDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Tasks store
                if (!db.objectStoreNames.contains('tasks')) {
                    const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
                    taskStore.createIndex('completed', 'completed', { unique: false });
                    taskStore.createIndex('energyLevel', 'energyLevel', { unique: false });
                    taskStore.createIndex('isSurvival', 'isSurvival', { unique: false });
                }

                // Routines store
                if (!db.objectStoreNames.contains('routines')) {
                    const routineStore = db.createObjectStore('routines', { keyPath: 'id', autoIncrement: true });
                    routineStore.createIndex('name', 'name', { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Gamification store
                if (!db.objectStoreNames.contains('gamification')) {
                    db.createObjectStore('gamification', { keyPath: 'key' });
                }
            };
        });
    }

    // Task operations
    async addTask(task) {
        const transaction = this.db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');
        return new Promise((resolve, reject) => {
            const request = store.add({
                ...task,
                createdAt: new Date().toISOString(),
                completed: false
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllTasks() {
        const transaction = this.db.transaction(['tasks'], 'readonly');
        const store = transaction.objectStore('tasks');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getTask(id) {
        const transaction = this.db.transaction(['tasks'], 'readonly');
        const store = transaction.objectStore('tasks');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateTask(id, updates) {
        const transaction = this.db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');
        return new Promise((resolve, reject) => {
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const task = getRequest.result;
                const updatedTask = { ...task, ...updates };
                const updateRequest = store.put(updatedTask);
                updateRequest.onsuccess = () => resolve(updatedTask);
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteTask(id) {
        const transaction = this.db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Routine operations
    async addRoutine(routine) {
        const transaction = this.db.transaction(['routines'], 'readwrite');
        const store = transaction.objectStore('routines');
        return new Promise((resolve, reject) => {
            const request = store.add({
                ...routine,
                createdAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllRoutines() {
        const transaction = this.db.transaction(['routines'], 'readonly');
        const store = transaction.objectStore('routines');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteRoutine(id) {
        const transaction = this.db.transaction(['routines'], 'readwrite');
        const store = transaction.objectStore('routines');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Settings operations
    async getSetting(key) {
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result?.value);
            request.onerror = () => reject(request.error);
        });
    }

    async setSetting(key, value) {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        return new Promise((resolve, reject) => {
            const request = store.put({ key, value });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Gamification operations
    async getGamificationData(key) {
        const transaction = this.db.transaction(['gamification'], 'readonly');
        const store = transaction.objectStore('gamification');
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result?.value || 0);
            request.onerror = () => reject(request.error);
        });
    }

    async setGamificationData(key, value) {
        const transaction = this.db.transaction(['gamification'], 'readwrite');
        const store = transaction.objectStore('gamification');
        return new Promise((resolve, reject) => {
            const request = store.put({ key, value });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Export all data
    async exportData() {
        const tasks = await this.getAllTasks();
        const routines = await this.getAllRoutines();
        
        const allSettings = await new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        const allGamification = await new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['gamification'], 'readonly');
            const store = transaction.objectStore('gamification');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return {
            version: this.version,
            exportDate: new Date().toISOString(),
            tasks,
            routines,
            settings: allSettings,
            gamification: allGamification
        };
    }

    // Import data
    async importData(data) {
        if (!data || !data.tasks || !data.routines) {
            throw new Error('Invalid import data format');
        }

        // Clear existing data
        await this.clearAllData();

        // Import tasks
        for (const task of data.tasks) {
            await this.addTask(task);
        }

        // Import routines
        for (const routine of data.routines) {
            await this.addRoutine(routine);
        }

        // Import settings
        if (data.settings) {
            for (const setting of data.settings) {
                await this.setSetting(setting.key, setting.value);
            }
        }

        // Import gamification
        if (data.gamification) {
            for (const item of data.gamification) {
                await this.setGamificationData(item.key, item.value);
            }
        }
    }

    // Clear all data
    async clearAllData() {
        const stores = ['tasks', 'routines', 'settings', 'gamification'];
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }
}

// Global storage instance
const storage = new StorageManager();
