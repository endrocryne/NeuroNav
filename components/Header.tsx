
import React from 'react';
import { BrainCircuit } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="p-4 sm:p-6 bg-surface">
      <div className="flex items-center gap-3">
        <div className="bg-primary-light p-2 rounded-full">
            <BrainCircuit className="text-primary" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">
          NeuroNav
        </h1>
      </div>
       <p className="mt-2 text-on-surface-variant text-sm">Your adaptive task navigator.</p>
    </header>
  );
};

export default Header;
