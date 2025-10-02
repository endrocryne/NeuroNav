import Dexie from 'dexie';

export const db = new Dexie('NeuroNavDB');

db.version(1).stores({
  tasks: '++id, title, date, completed, tags', // '++id' is an auto-incrementing primary key
  routines: '++id, name, tasks', // `tasks` will be an array of strings
  settings: 'key', // Simple key-value store for settings
});