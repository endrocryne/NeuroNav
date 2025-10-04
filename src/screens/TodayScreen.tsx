import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  IconButton,
  Stack,
  Fab,
  List,
  Paper,
  LinearProgress,
  Snackbar,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAppStore } from '../stores/appStore';
import { TaskItem } from '../components/TaskItem';
import { TaskBreakdownDialog } from '../components/TaskBreakdownDialog';
import { MindMapView } from '../components/MindMapView';
import { type Task, db } from '../services/db';
import { getRandomEncouragementMessage } from '../utils/encouragementMessages';
import Confetti from 'react-confetti';
import { useWindowSize } from '../utils/useWindowSize';

export function TodayScreen() {
  const { energyLevel, setEnergyLevel, mood, setMood, viewMode, enableEncouragement } = useAppStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const { width, height } = useWindowSize();

  const loadTasks = async () => {
    const today = new Date().toISOString().split('T')[0];
    const allTasks = await db.tasks.where('date').equals(today).toArray();
    
    // Filter by energy level
    let filtered = allTasks;
    if (energyLevel <= 2) {
      filtered = allTasks.filter(task => task.tags.includes('#survival'));
    }
    
    setTasks(filtered.sort((a, b) => (a.order || 0) - (b.order || 0)));
  };

  useEffect(() => {
    loadTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energyLevel]);

  const handleTaskChange = async () => {
    const previousCompletedCount = tasks.filter(t => t.completed).length;
    await loadTasks();
    const newTasks = await db.tasks.where('date').equals(new Date().toISOString().split('T')[0]).toArray();
    const newCompletedCount = newTasks.filter(t => t.completed).length;

    if (newCompletedCount > previousCompletedCount) {
      if (viewMode === 'gamified') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      if (enableEncouragement && Math.random() > 0.5) {
        setSnackbarMessage(getRandomEncouragementMessage());
        setSnackbarOpen(true);
      }
    }
  };

  const moods = [
    { emoji: '😊', value: 'happy' as const, label: 'Happy' },
    { emoji: '🙂', value: 'okay' as const, label: 'Okay' },
    { emoji: '😟', value: 'overwhelmed' as const, label: 'Overwhelmed' },
    { emoji: '😴', value: 'tired' as const, label: 'Tired' },
  ];

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const showIcons = viewMode !== 'lowstim';

  const renderTaskList = () => {
    if (tasks.length === 0) {
      return (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          Ready for your first task? Use the '+' button to begin.
        </Typography>
      );
    }

    if (viewMode === 'mindmap') {
      return <MindMapView tasks={tasks} onTaskClick={handleTaskChange} />;
    }

    if (viewMode === 'lowstim' && tasks.length > 0) {
      const visibleTask = tasks[currentTaskIndex];
      return (
        <Box>
          <List>
            <TaskItem task={visibleTask} onTaskChange={handleTaskChange} />
          </List>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setCurrentTaskIndex(Math.max(0, currentTaskIndex - 1))}
              disabled={currentTaskIndex === 0}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              {currentTaskIndex + 1} of {tasks.length}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setCurrentTaskIndex(Math.min(tasks.length - 1, currentTaskIndex + 1))}
              disabled={currentTaskIndex === tasks.length - 1}
            >
              Next
            </Button>
          </Stack>
        </Box>
      );
    }

    return (
      <List>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onTaskChange={handleTaskChange} />
        ))}
      </List>
    );
  };

  return (
    <Box sx={{ pb: 10, position: 'relative' }}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      {viewMode === 'gamified' && totalTasks > 0 && (
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          How are you feeling today?
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Energy Level
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">Low Energy</Typography>
          <Slider
            value={energyLevel}
            onChange={(_, value) => setEnergyLevel(value as number)}
            min={1}
            max={5}
            step={1}
            marks
            sx={{ flexGrow: 1 }}
          />
          <Typography variant="body2">High Energy</Typography>
        </Stack>

        {showIcons && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mood
            </Typography>
            <Stack direction="row" spacing={1}>
              {moods.map((m) => (
                <IconButton
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  sx={{
                    fontSize: '2rem',
                    border: mood === m.value ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                  title={m.label}
                >
                  {m.emoji}
                </IconButton>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {renderTaskList()}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 76, right: 16 }}
        onClick={() => setDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <TaskBreakdownDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onTasksAdded={loadTasks}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
