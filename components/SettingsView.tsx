
import React, { useRef } from 'react';
import { UIMode, EnergyLevel, Task, Routine, NotificationPermission } from '../types';
import { List, Wind, Sparkles, Brain, Download, Upload, Bell, BellOff } from 'lucide-react';

interface SettingsViewProps {
  uiMode: UIMode;
  setUiMode: (mode: UIMode) => void;
  energyLevel: EnergyLevel;
  setEnergyLevel: (level: EnergyLevel) => void;
  notificationPermission: NotificationPermission;
  setNotificationPermission: (permission: NotificationPermission) => void;
  tasks: Task[];
  routines: Routine[];
  setTasks: (tasks: Task[]) => void;
  setRoutines: (routines: Routine[]) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  uiMode,
  setUiMode,
  energyLevel,
  setEnergyLevel,
  notificationPermission,
  setNotificationPermission,
  tasks,
  routines,
  setTasks,
  setRoutines,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            tasks,
            routines,
            settings: { uiMode, energyLevel }
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `neuronav-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const data = JSON.parse(text);
                    if (data.tasks) setTasks(data.tasks);
                    if (data.routines) setRoutines(data.routines);
                    if (data.settings) {
                        if (data.settings.uiMode) setUiMode(data.settings.uiMode);
                        if (data.settings.energyLevel) setEnergyLevel(data.settings.energyLevel);
                    }
                    alert('Data imported successfully!');
                }
            } catch (error) {
                console.error("Failed to parse imported file", error);
                alert('Failed to import data. The file may be corrupt.');
            }
        };
        reader.readAsText(file);
    };

    const handleEnableNotifications = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
        } else {
            alert('This browser does not support desktop notification');
        }
    };


  const OptionButton = ({ label, value, selectedValue, onClick, icon: Icon }: any) => (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
        selectedValue === value ? 'bg-primary-light border-primary' : 'bg-surface border-surface-variant'
      }`}
    >
      <Icon size={24} className={selectedValue === value ? 'text-primary' : 'text-on-surface-variant'} />
      <span className={`font-medium ${selectedValue === value ? 'text-primary' : 'text-on-surface'}`}>{label}</span>
    </button>
  );

  const getNotificationStatusText = () => {
    switch (notificationPermission) {
      case 'granted':
        return 'Reminders are enabled.';
      case 'denied':
        return 'Reminders are disabled. You need to grant permission in your browser settings.';
      case 'default':
        return 'Enable reminders for tasks with due dates.';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-3">Interface Mode</h2>
        <div className="grid grid-cols-2 gap-3">
          <OptionButton label="Linear" value={UIMode.Linear} selectedValue={uiMode} onClick={() => setUiMode(UIMode.Linear)} icon={List} />
          <OptionButton label="Mind Map" value={UIMode.MindMap} selectedValue={uiMode} onClick={() => setUiMode(UIMode.MindMap)} icon={Brain} />
          <OptionButton label="Low Stimulus" value={UIMode.LowStimulus} selectedValue={uiMode} onClick={() => setUiMode(UIMode.LowStimulus)} icon={Wind} />
          <OptionButton label="Gamified" value={UIMode.Gamified} selectedValue={uiMode} onClick={() => setUiMode(UIMode.Gamified)} icon={Sparkles} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-on-surface mb-3">Today's Energy</h2>
        <div className="flex gap-3">
          <OptionButton label="Low" value={EnergyLevel.Low} selectedValue={energyLevel} onClick={() => setEnergyLevel(EnergyLevel.Low)} icon={() => <div className="h-6 w-1/3 bg-red-400 rounded-full"/>} />
          <OptionButton label="Medium" value={EnergyLevel.Medium} selectedValue={energyLevel} onClick={() => setEnergyLevel(EnergyLevel.Medium)} icon={() => <div className="h-6 w-2/3 bg-yellow-400 rounded-full"/>} />
          <OptionButton label="High" value={EnergyLevel.High} selectedValue={energyLevel} onClick={() => setEnergyLevel(EnergyLevel.High)} icon={() => <div className="h-6 w-full bg-green-400 rounded-full"/>} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-on-surface mb-3">Reminders</h2>
        <p className="text-sm text-on-surface-variant mb-4">{getNotificationStatusText()}</p>
        {notificationPermission === 'default' && (
            <button onClick={handleEnableNotifications} className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary p-3 rounded-xl font-medium">
                <Bell size={20} />
                Enable Task Reminders
            </button>
        )}
        {notificationPermission === 'granted' && (
             <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-800 p-3 rounded-xl font-medium">
                <Bell size={20} />
                Reminders Active
            </div>
        )}
         {notificationPermission === 'denied' && (
             <div className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-800 p-3 rounded-xl font-medium">
                <BellOff size={20} />
                Permission Denied
            </div>
        )}
      </div>
      
       <div>
        <h2 className="text-xl font-bold text-on-surface mb-3">Data Management</h2>
         <p className="text-sm text-on-surface-variant mb-4">Your data is stored locally on this device. You can back it up and restore it here.</p>
        <div className="flex gap-3">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-secondary text-on-secondary p-3 rounded-xl font-medium">
                <Download size={20} />
                Export Data
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-secondary text-on-secondary p-3 rounded-xl font-medium">
                <Upload size={20} />
                Import Data
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
