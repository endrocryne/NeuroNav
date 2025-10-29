
import React, { useState } from 'react';
import { Routine } from '../types';
import { createRoutineFromText } from '../services/geminiService';
import { Sparkles, Trash2, Play, Edit3, Save, X } from 'lucide-react';

interface RoutinesViewProps {
  routines: Routine[];
  addRoutine: (routine: Omit<Routine, 'id'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  applyRoutine: (id: string) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const RoutinesView: React.FC<RoutinesViewProps> = ({ routines, addRoutine, updateRoutine, deleteRoutine, applyRoutine, isLoading, setIsLoading }) => {
  const [text, setText] = useState('');
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [editState, setEditState] = useState({ name: '', tasks: '' });

  const handleCreateRoutine = async () => {
    if (text.trim()) {
      setIsLoading(true);
      const newRoutine = await createRoutineFromText(text);
      if (newRoutine.tasks.length > 0) {
        addRoutine(newRoutine);
      }
      setText('');
      setIsLoading(false);
    }
  };

  const handleStartEditing = (routine: Routine) => {
    setEditingRoutineId(routine.id);
    setEditState({ name: routine.name, tasks: routine.tasks.join('\n') });
  };

  const handleCancelEditing = () => {
    setEditingRoutineId(null);
    setEditState({ name: '', tasks: ''});
  };

  const handleSaveEditing = () => {
    if (editingRoutineId && editState.name.trim()) {
      updateRoutine(editingRoutineId, {
        name: editState.name.trim(),
        tasks: editState.tasks.split('\n').map(t => t.trim()).filter(t => t),
      });
      handleCancelEditing();
    }
  };

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-xl font-bold text-on-surface">Create Routine</h2>
            <p className="text-sm text-on-surface-variant mt-1">Type your routine below. For example: "Morning: walk dog, make coffee, check email"</p>
            <div className="mt-4 flex gap-2">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Describe your routine..."
                    rows={3}
                    className="flex-grow bg-surface-variant/50 border border-surface-variant focus:ring-2 focus:ring-primary focus:border-primary rounded-xl p-3 outline-none transition-all duration-300 text-on-surface placeholder:text-on-surface-variant"
                    disabled={isLoading}
                />
                <button
                    onClick={handleCreateRoutine}
                    className="bg-primary-light text-primary p-3 rounded-full hover:bg-secondary transition-transform active:scale-95 disabled:bg-gray-300 self-start"
                    disabled={isLoading || !text.trim()}
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={24} />}
                </button>
            </div>
        </div>

        <div className="space-y-4">
             <h2 className="text-xl font-bold text-on-surface">Saved Routines</h2>
             {routines.length === 0 ? (
                 <p className="text-center py-6 text-on-surface-variant">No routines saved yet.</p>
             ) : (
                <div className="space-y-3">
                    {routines.map(routine => (
                        <div key={routine.id} className="bg-secondary rounded-xl p-4 transition-all">
                           {editingRoutineId === routine.id ? (
                               <div className="space-y-3">
                                   <input 
                                     type="text"
                                     value={editState.name}
                                     onChange={(e) => setEditState(prev => ({ ...prev, name: e.target.value }))}
                                     className="w-full bg-surface-variant/50 border border-surface-variant rounded-md py-1 px-2 font-bold text-on-secondary outline-none focus:ring-1 focus:ring-primary"
                                   />
                                   <textarea
                                      value={editState.tasks}
                                      onChange={(e) => setEditState(prev => ({ ...prev, tasks: e.target.value }))}
                                      rows={routine.tasks.length}
                                      className="w-full bg-surface-variant/50 border border-surface-variant rounded-md py-1 px-2 text-sm text-on-surface-variant outline-none focus:ring-1 focus:ring-primary"
                                   />
                                   <div className="flex justify-end items-center gap-2">
                                        <button onClick={handleCancelEditing} className="p-2 text-on-surface-variant rounded-full hover:bg-surface-variant"><X size={20}/></button>
                                        <button onClick={handleSaveEditing} className="p-2 bg-primary text-on-primary rounded-full hover:bg-primary-dark"><Save size={20}/></button>
                                   </div>
                               </div>
                           ) : (
                               <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-on-secondary">{routine.name}</h3>
                                        <ul className="list-disc list-inside mt-2 text-sm text-on-surface-variant space-y-1">
                                            {routine.tasks.map((task, index) => <li key={index}>{task}</li>)}
                                        </ul>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                         <button onClick={() => applyRoutine(routine.id)} className="p-2 bg-primary-light text-primary rounded-full hover:bg-primary-light/70"><Play size={20}/></button>
                                         <button onClick={() => handleStartEditing(routine)} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"><Edit3 size={20}/></button>
                                         <button onClick={() => deleteRoutine(routine.id)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><Trash2 size={20}/></button>
                                    </div>
                               </div>
                           )}
                        </div>
                    ))}
                </div>
             )}
        </div>
    </div>
  );
};

export default RoutinesView;
