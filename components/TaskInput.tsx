
import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (task: { title: string; isSurvival: boolean; parentId: string | null }) => void;
  onAIBreakdown: (taskTitle: string) => void;
  isLoading: boolean;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, onAIBreakdown, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask({ title: inputValue, isSurvival: false, parentId: null });
      setInputValue('');
    }
  };
  
  const handleAIClick = () => {
      if (inputValue.trim()) {
          onAIBreakdown(inputValue);
          setInputValue('');
      }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="e.g., Plan my vacation..."
        className="flex-grow bg-surface-variant/50 border border-surface-variant focus:ring-2 focus:ring-primary focus:border-primary rounded-full py-3 px-5 outline-none transition-all duration-300 text-on-surface placeholder:text-on-surface-variant [.low-stimulus_&]:text-2xl [.low-stimulus_&]:py-4"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-primary text-on-primary p-3 rounded-full hover:bg-primary-dark transition-transform active:scale-95 disabled:bg-gray-300"
        disabled={isLoading || !inputValue.trim()}
      >
        <Plus size={24} />
      </button>
      <button
        type="button"
        onClick={handleAIClick}
        className="bg-primary-light text-primary p-3 rounded-full hover:bg-secondary transition-transform active:scale-95 disabled:bg-gray-300 flex items-center gap-2"
        disabled={isLoading || !inputValue.trim()}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Sparkles size={24} />
        )}
      </button>
    </form>
  );
};

export default TaskInput;
