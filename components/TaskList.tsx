
import React, { useState, useEffect, useRef } from 'react';
import { Task, Priority, EnergyLevel } from '../types';
import { Check, Trash2, Edit3, Save, X, Flag, Calendar, Battery, ChevronDown, ChevronRight } from 'lucide-react';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


interface TaskItemProps {
  task: Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  isSubtask: boolean;
  hasSubtasks: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, toggleTask, deleteTask, updateTask, isSubtask, hasSubtasks, isCollapsed, onToggleCollapse }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState({
        title: task.title,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority,
        energyRequired: task.energyRequired
    });

    const handleSave = () => {
        if (editState.title.trim()) {
            updateTask(task.id, {
                title: editState.title.trim(),
                dueDate: editState.dueDate || null,
                priority: editState.priority,
                energyRequired: editState.energyRequired,
            });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditState({
            title: task.title,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            priority: task.priority,
            energyRequired: task.energyRequired,
        });
        setIsEditing(false);
    };
    
    const priorityColors: { [key in Priority]: string } = {
        [Priority.High]: 'text-red-600',
        [Priority.Medium]: 'text-yellow-600',
        [Priority.Low]: 'text-green-600',
    };

    const energyColors: { [key in EnergyLevel]: string } = {
        [EnergyLevel.High]: 'text-red-500',
        [EnergyLevel.Medium]: 'text-yellow-500',
        [EnergyLevel.Low]: 'text-green-500',
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

    if (isEditing) {
        return (
            <div className={`p-3 rounded-lg bg-surface shadow-lg border border-primary`}>
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex-shrink-0"></div>
                    <input 
                        type="text"
                        value={editState.title}
                        onChange={(e) => setEditState(prev => ({ ...prev, title: e.target.value }))}
                        className="flex-grow bg-surface-variant/50 border border-surface-variant rounded-md py-1 px-2 outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 sm:pl-9 text-sm">
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Due Date</label>
                        <input
                            type="date"
                            value={editState.dueDate}
                            onChange={(e) => setEditState(prev => ({...prev, dueDate: e.target.value}))}
                            className="w-full bg-surface-variant/50 border border-surface-variant rounded-md p-1 outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Priority</label>
                        <select
                            value={editState.priority}
                            onChange={(e) => setEditState(prev => ({...prev, priority: e.target.value as Priority}))}
                            className="w-full bg-surface-variant/50 border border-surface-variant rounded-md p-1 outline-none focus:ring-1 focus:ring-primary"
                        >
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Energy</label>
                        <select
                            value={editState.energyRequired}
                            onChange={(e) => setEditState(prev => ({...prev, energyRequired: e.target.value as EnergyLevel}))}
                            className="w-full bg-surface-variant/50 border border-surface-variant rounded-md p-1 outline-none focus:ring-1 focus:ring-primary"
                        >
                           {Object.values(EnergyLevel).map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 items-center justify-end mt-3">
                    <button onClick={handleCancel} className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-full"><X size={20} /></button>
                    <button onClick={handleSave} className="bg-primary text-on-primary p-2 rounded-full hover:bg-primary-dark"><Save size={20} /></button>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative flex items-start gap-3 p-3 rounded-lg transition-colors duration-200 ${isSubtask ? 'pl-10' : ''} ${task.completed ? 'bg-green-50' : 'bg-surface'}`}>
            {hasSubtasks && (
                 <button
                    onClick={() => onToggleCollapse(task.id)}
                    aria-label={isCollapsed ? `Expand subtasks for ${task.title}` : `Collapse subtasks for ${task.title}`}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </button>
            )}
            <button
                onClick={() => toggleTask(task.id)}
                aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                className={`mt-1 w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${hasSubtasks ? 'ml-6' : ''} ${task.completed ? 'bg-primary border-primary' : 'bg-transparent border-primary'}`}
            >
                {task.completed && <Check size={16} className="text-on-primary" />}
            </button>
            <div className="flex-grow">
                <span className={` ${task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'} [.low-stimulus_&]:text-xl`}>
                    {task.title}
                </span>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-1.5 flex-wrap">
                    {task.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                            <Calendar size={14} />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                    )}
                    <span className={`flex items-center gap-1 font-medium ${priorityColors[task.priority]}`}>
                        <Flag size={14} />
                        {task.priority}
                    </span>
                    <span className={`flex items-center gap-1 font-medium ${energyColors[task.energyRequired]}`}>
                        <Battery size={14} />
                        {task.energyRequired}
                    </span>
                </div>
            </div>
            <div className="flex gap-1 items-center self-start">
                <button onClick={() => setIsEditing(true)} aria-label={`Edit ${task.title}`} className="text-on-surface-variant hover:text-primary p-1 rounded-full"><Edit3 size={18} /></button>
                <button onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`} className="text-on-surface-variant hover:text-red-500 p-1 rounded-full">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};


interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  toggleTask: (id: string) => void;
  deleteTask: (id:string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, toggleTask, deleteTask, updateTask }) => {
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const prevTasks = usePrevious(tasks);
  
  useEffect(() => {
    if (!prevTasks) return;
    const newlyCompletedParentIds = tasks
      .filter(task => {
        if (task.parentId || !task.completed) return false;
        const prevTask = prevTasks.find(pt => pt.id === task.id);
        return prevTask && !prevTask.completed;
      })
      .map(t => t.id);
    
    if (newlyCompletedParentIds.length > 0) {
      setCollapsedTasks(prev => new Set([...prev, ...newlyCompletedParentIds]));
    }
  }, [tasks, prevTasks]);

  const toggleCollapse = (taskId: string) => {
    setCollapsedTasks(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  if (tasks.length === 0) {
    return <div className="text-center py-10 text-on-surface-variant">
        <p>All clear! Add a task to get started.</p>
    </div>;
  }
    
  const parentTasks = tasks.filter(t => !t.parentId);
  const subTasks = tasks.filter(t => t.parentId);

  const getSubtasksFor = (parentId: string) => {
    return subTasks.filter(st => st.parentId === parentId);
  }

  return (
    <div className="space-y-2">
      {parentTasks.map(task => {
        const subtasksForParent = getSubtasksFor(task.id);
        const hasSubtasks = subtasksForParent.length > 0;
        const isCollapsed = collapsedTasks.has(task.id);

        return (
          <div key={task.id} className="bg-secondary/70 rounded-xl p-1.5">
              <TaskItem 
                task={task} 
                toggleTask={toggleTask} 
                deleteTask={deleteTask} 
                updateTask={updateTask} 
                isSubtask={false}
                hasSubtasks={hasSubtasks}
                isCollapsed={isCollapsed}
                onToggleCollapse={toggleCollapse}
              />
              {!isCollapsed && subtasksForParent.map(subtask => (
                  <div key={subtask.id} className="mt-1">
                      <TaskItem 
                        task={subtask} 
                        toggleTask={toggleTask} 
                        deleteTask={deleteTask} 
                        updateTask={updateTask} 
                        isSubtask={true}
                        hasSubtasks={false}
                        isCollapsed={false}
                        onToggleCollapse={() => {}} // No-op for subtasks
                      />
                  </div>
              ))}
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
