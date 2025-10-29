import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Task, Routine, UIMode, EnergyLevel, Page, Priority, NotificationPermission } from './types';
import Header from './components/Header';
import TaskView from './components/TaskView';
import RoutinesView from './components/RoutinesView';
import SettingsView from './components/SettingsView';
import AssistantView from './components/AssistantView';
import { Plus, List, Settings, Bot } from 'lucide-react';

const App: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [routines, setRoutines] = useLocalStorage<Routine[]>('routines', []);
  const [uiMode, setUiMode] = useLocalStorage<UIMode>('uiMode', UIMode.Linear);
  const [energyLevel, setEnergyLevel] = useLocalStorage<EnergyLevel>('energyLevel', EnergyLevel.Medium);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Tasks);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
      return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied';
  });

  useEffect(() => {
    document.documentElement.className = '';
    if (uiMode === UIMode.LowStimulus) {
      document.documentElement.classList.add('low-stimulus');
    } else if (uiMode === UIMode.Gamified) {
        document.documentElement.classList.add('gamified');
    }
  }, [uiMode]);
  
  useEffect(() => {
    const sw = navigator.serviceWorker;
    if (notificationPermission === 'granted' && sw.controller) {
        tasks.forEach(task => {
            if (task.dueDate && !task.completed) {
                sw.controller.postMessage({
                    type: 'SCHEDULE_REMINDER',
                    task: { id: task.id, title: task.title, dueDate: task.dueDate, completed: task.completed }
                });
            } else {
                sw.controller.postMessage({ type: 'CANCEL_REMINDER', taskId: task.id });
            }
        });
    }
  }, [tasks, notificationPermission]);

  const addTask = (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'priority' | 'dueDate' | 'energyRequired'>): Task => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      completed: false,
      createdAt: new Date().toISOString(),
      priority: Priority.Medium,
      dueDate: null,
      energyRequired: EnergyLevel.Medium,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  };

  const addMultipleTasks = (newTasks: Omit<Task, 'id' | 'completed' | 'createdAt' | 'priority' | 'dueDate' | 'energyRequired'>[]) => {
    const tasksToAdd: Task[] = newTasks.map(t => ({
      ...t,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      completed: false,
      createdAt: new Date().toISOString(),
      priority: Priority.Medium,
      dueDate: null,
      energyRequired: EnergyLevel.Medium,
    }));
    setTasks(prevTasks => [...prevTasks, ...tasksToAdd]);
  };

  const toggleTask = (id: string) => {
    setTasks(prevTasks => {
      const taskToToggle = prevTasks.find(t => t.id === id);
      if (!taskToToggle) return prevTasks;

      const newCompletedState = !taskToToggle.completed;
      
      const taskMap: Map<string, Task> = new Map(prevTasks.map(t => [t.id, { ...t }]));

      taskMap.get(id)!.completed = newCompletedState;


      if (!taskToToggle.parentId) {
        prevTasks.forEach(task => {
          if (task.parentId === id) {
            taskMap.get(task.id)!.completed = newCompletedState;
          }
        });
      }

      const parentId = taskToToggle.parentId;
      if (parentId) {
        const siblings = prevTasks.filter(t => t.parentId === parentId);
        const updatedSiblings = siblings.map(s => taskMap.get(s.id)!);
        const allSubtasksCompleted = updatedSiblings.every(s => s.completed);
        
        const parentTask = taskMap.get(parentId);
        if (parentTask && parentTask.completed !== allSubtasksCompleted) {
          parentTask.completed = allSubtasksCompleted;
        }
      }
      
      return Array.from(taskMap.values());
    });
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => {
        if (task.id === id) {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'CANCEL_REMINDER', taskId: id });
            }
            return false;
        }
        return true;
    }));
  };
  
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };
  
  const addRoutine = (routine: Omit<Routine, 'id'>) => {
    setRoutines(prev => [...prev, { ...routine, id: Date.now().toString() }]);
  };

  const updateRoutine = (id: string, updates: Partial<Routine>) => {
      setRoutines(routines.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRoutine = (id: string) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  const applyRoutine = (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
        const tasksFromRoutine = routine.tasks.map(title => ({
            title,
            isSurvival: false,
            parentId: null,
        }));
        addMultipleTasks(tasksFromRoutine);
        setCurrentPage(Page.Tasks);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Tasks:
        return <TaskView 
                  tasks={tasks}
                  setTasks={setTasks}
                  uiMode={uiMode}
                  energyLevel={energyLevel}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  addMultipleTasks={addMultipleTasks}
                  addTask={addTask}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
               />;
      case Page.Routines:
        return <RoutinesView 
                  routines={routines}
                  addRoutine={addRoutine}
                  updateRoutine={updateRoutine}
                  deleteRoutine={deleteRoutine}
                  applyRoutine={applyRoutine}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
               />;
      case Page.Settings:
        return <SettingsView 
                  uiMode={uiMode}
                  setUiMode={setUiMode}
                  energyLevel={energyLevel}
                  setEnergyLevel={setEnergyLevel}
                  notificationPermission={notificationPermission}
                  setNotificationPermission={setNotificationPermission}
                  tasks={tasks}
                  routines={routines}
                  setTasks={setTasks}
                  setRoutines={setRoutines}
               />;
      case Page.Assistant:
        return <AssistantView
                  tasks={tasks}
                  routines={routines}
                  uiMode={uiMode}
                  energyLevel={energyLevel}
                  setTasks={setTasks}
                  setRoutines={setRoutines}
                  setUiMode={setUiMode}
                  setEnergyLevel={setEnergyLevel}
                  addTask={addTask}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  addRoutine={addRoutine}
                  updateRoutine={updateRoutine}
                  deleteRoutine={deleteRoutine}
                  applyRoutine={applyRoutine}
                  setCurrentPage={setCurrentPage}
                />;
      default:
        return <TaskView
                  tasks={tasks}
                  setTasks={setTasks}
                  uiMode={uiMode}
                  energyLevel={energyLevel}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  addMultipleTasks={addMultipleTasks}
                  addTask={addTask}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
               />;
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans text-on-surface transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex flex-col min-h-screen">
        <Header />
        <main className={`flex-grow ${currentPage === Page.Assistant ? '' : 'p-4 sm:p-6'}`}>
          {renderPage()}
        </main>
        <footer className="sticky bottom-0 bg-surface/80 backdrop-blur-lg border-t border-surface-variant">
          <nav className="max-w-4xl mx-auto flex justify-around items-center h-16">
            <button onClick={() => setCurrentPage(Page.Tasks)} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentPage === Page.Tasks ? 'text-primary' : 'text-on-surface-variant'}`}>
              <List size={24}/>
              <span className="text-xs font-medium">Tasks</span>
            </button>
             <button onClick={() => setCurrentPage(Page.Routines)} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentPage === Page.Routines ? 'text-primary' : 'text-on-surface-variant'}`}>
              <Plus size={24}/>
              <span className="text-xs font-medium">Routines</span>
            </button>
            <button onClick={() => setCurrentPage(Page.Assistant)} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentPage === Page.Assistant ? 'text-primary' : 'text-on-surface-variant'}`}>
              <Bot size={24}/>
              <span className="text-xs font-medium">Assistant</span>
            </button>
            <button onClick={() => setCurrentPage(Page.Settings)} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentPage === Page.Settings ? 'text-primary' : 'text-on-surface-variant'}`}>
              <Settings size={24}/>
              <span className="text-xs font-medium">Settings</span>
            </button>
          </nav>
        </footer>
      </div>
    </div>
  );
};

export default App;