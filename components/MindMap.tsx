
import React from 'react';
import { Task } from '../types';
import { Check } from 'lucide-react';

interface MindMapNodeProps {
    task: Task;
    toggleTask: (id: string) => void;
    level: number;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({ task, toggleTask, level }) => {
    const nodeColor = task.completed ? 'bg-green-100 border-green-400' : 'bg-primary-light border-primary';
    const textColor = task.completed ? 'text-gray-500 line-through' : 'text-on-primary';
    const fontSize = level === 0 ? 'text-lg' : level === 1 ? 'text-base' : 'text-sm';

    return (
        <button 
            onClick={() => toggleTask(task.id)}
            className={`p-4 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 ${nodeColor} ${fontSize} ${task.completed ? 'opacity-70' : ''}`}
        >
            <span className={`font-medium ${task.completed ? 'text-on-surface-variant line-through' : 'text-primary-dark'}`}>{task.title}</span>
        </button>
    )
}

interface MindMapProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
}

const MindMap: React.FC<MindMapProps> = ({ tasks, toggleTask }) => {
    if (tasks.length === 0) {
        return <div className="text-center py-10 text-on-surface-variant">
            <p>Nothing to map. Add a task to build your mind map.</p>
        </div>;
    }

    const parentTasks = tasks.filter(t => !t.parentId);
    const subTasksByParent = tasks.reduce((acc, task) => {
        if (task.parentId) {
            if (!acc[task.parentId]) {
                acc[task.parentId] = [];
            }
            acc[task.parentId].push(task);
        }
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <div className="p-4 space-y-8 flex flex-col items-center">
            {parentTasks.map(parent => (
                <div key={parent.id} className="flex flex-col items-center gap-4">
                    <MindMapNode task={parent} toggleTask={toggleTask} level={0} />
                    {subTasksByParent[parent.id] && (
                         <div className="relative flex justify-center gap-4 flex-wrap before:content-[''] before:absolute before:w-px before:bg-surface-variant before:h-4 before:-top-4">
                            {subTasksByParent[parent.id].map(subtask => (
                                <div key={subtask.id} className="relative flex flex-col items-center">
                                     <div className="absolute w-px h-4 bg-surface-variant -top-4"></div>
                                     <MindMapNode task={subtask} toggleTask={toggleTask} level={1} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MindMap;
