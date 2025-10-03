import Dexie from 'dexie';

export const db = new Dexie('NeuroNavDB');

db.version(2).stores({
  tasks: '++id, title, date, completed, tags, dueDate, energy, priority',
  routines: '++id, name, tasks',
  settings: 'key',
}).upgrade(() => {
  // Migrations can be added here if needed in the future
});

db.version(1).stores({
  tasks: '++id, title, date, completed, tags', // '++id' is an auto-incrementing primary key
  routines: '++id, name, tasks', // `tasks` will be an array of strings
  settings: 'key', // Simple key-value store for settings
});