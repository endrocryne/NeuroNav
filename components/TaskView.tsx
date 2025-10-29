
import React, { useState, useMemo } from 'react';
import { Task, UIMode, EnergyLevel } from '../types';
import { breakdownTask, getRecommendedTasks } from '../services/geminiService';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import MindMap from './MindMap';
import { Sparkles, RefreshCw, X } from 'lucide-react';

interface TaskViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  uiMode: UIMode;
  energyLevel: EnergyLevel;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  addMultipleTasks: (tasks: Omit<Task, 'id' | 'completed' | 'createdAt' | 'priority' | 'dueDate' | 'energyRequired'>[]) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'priority' | 'dueDate' | 'energyRequired'>) => Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

const TaskView: React.FC<TaskViewProps> = ({
  tasks,
  setTasks,
  uiMode,
  energyLevel,
  isLoading,
  setIsLoading,
  addMultipleTasks,
  addTask,
  toggleTask,
  deleteTask,
  updateTask,
}) => {
  const [recommendedTaskIds, setRecommendedTaskIds] = useState<string[] | null>(null);

  const handleAIBreakdown = async (mainTaskTitle: string) => {
    setIsLoading(true);
    const mainTaskObject = { title: mainTaskTitle, isSurvival: false, parentId: null };
    const addedTask = addTask(mainTaskObject);
    
    const subTasks = await breakdownTask(mainTaskTitle);
    if (subTasks && subTasks.length > 0) {
        const subTaskObjects = subTasks.map(title => ({
          title,
          isSurvival: false,
          parentId: addedTask.id,
        }));
        addMultipleTasks(subTaskObjects);
    }
    setIsLoading(false);
  };
  
  const handleAIFilter = async () => {
    setIsLoading(true);
    const uncompletedTasks = tasks.filter(t => !t.completed);

    const recommendedIds = await getRecommendedTasks(uncompletedTasks, energyLevel);
    
    if (recommendedIds && recommendedIds.length > 0) {
        setRecommendedTaskIds(recommendedIds);
    } else {
        console.error("AI filtering failed or returned no tasks.");
        setRecommendedTaskIds([]); // Set to empty array to show a helpful message
    }
    setIsLoading(false);
  };

  const progress = useMemo(() => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return 0;
    const completedTasks = tasks.filter(t => t.completed).length;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [tasks]);

  const displayedTasks = useMemo(() => {
    if (recommendedTaskIds) {
        const recommendedSet = new Set(recommendedTaskIds);
        
        const parentIdsOfRecommendedSubtasks = new Set<string>();
        tasks.forEach(task => {
            if (recommendedSet.has(task.id) && task.parentId) {
                parentIdsOfRecommendedSubtasks.add(task.parentId);
            }
        });

        return tasks.filter(task => 
            recommendedSet.has(task.id) || parentIdsOfRecommendedSubtasks.has(task.id)
        );
    }
    return tasks;
  }, [tasks, recommendedTaskIds]);

  const renderContent = () => {
    if (uiMode === UIMode.MindMap) {
      return <MindMap tasks={displayedTasks} toggleTask={toggleTask} />;
    }
    return <TaskList 
        tasks={displayedTasks} 
        toggleTask={toggleTask} 
        deleteTask={deleteTask} 
        updateTask={updateTask}
        setTasks={setTasks}
    />;
  };

  return (
    <div className="space-y-6">
      <TaskInput onAddTask={addTask} onAIBreakdown={handleAIBreakdown} isLoading={isLoading} />
      
      <div className="[.gamified_&]:block hidden bg-secondary p-4 rounded-xl">
          <h3 className="text-sm font-medium text-on-secondary">Your Progress Today</h3>
          <div className="w-full bg-surface-variant rounded-full h-2.5 mt-2">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
          </div>
          <p className="text-xs text-right mt-1 text-on-surface-variant">{progress}% Complete!</p>
      </div>

      <div className="space-y-2">
        {recommendedTaskIds ? (
           <div className="bg-primary-light p-3 rounded-xl border border-primary/50 space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-primary-dark">AI Focus Suggestions</h2>
                    <p className="text-sm text-on-surface-variant">Here are a few tasks to get you started.</p>
                </div>
                 <button onClick={() => setRecommendedTaskIds(null)} aria-label="Show all tasks" className="text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-full">
                    <X size={20} />
                </button>
            </div>
            {recommendedTaskIds.length === 0 && !isLoading && (
                <p className="text-center text-on-surface-variant py-2">No specific suggestions right now, feel free to pick any task!</p>
            )}
             <div className="flex gap-2">
                <button onClick={handleAIFilter} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 bg-white text-primary border border-primary p-2 rounded-full text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50">
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <RefreshCw size={18} />
                    )}
                    <span>Suggest Again</span>
                </button>
            </div>
          </div>
        ) : (
            <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold text-on-surface-variant">
                    Today's Focus
                </h2>
                <button 
                    onClick={handleAIFilter}
                    disabled={isLoading || tasks.filter(t => !t.completed).length === 0}
                    className="flex items-center gap-2 bg-primary-light text-primary px-3 py-2 rounded-full text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Sparkles size={18} />
                    )}
                    <span>Filter with AI</span>
                </button>
            </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default TaskView;
