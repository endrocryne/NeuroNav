import React from 'react';
import { Box, Typography, Stack, Slider, IconButton, Fab, List, LinearProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoodIcon from '@mui/icons-material/Mood';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '../store';
import { db } from '../db';
import TaskItem from '../components/TaskItem';
import MindMapDisplay from '../components/MindMapDisplay';

const TodayScreen = () => {
  const { energyLevel, setEnergyLevel, mood, setMood, openTaskBreakdown, focusMode } = useAppStore();

  const today = new Date().toISOString().split('T')[0];

  const todaysTasks = useLiveQuery(() => db.tasks.where('date').equals(today).toArray(), [today]);

  const filteredTasks = todaysTasks?.filter(task => {
    if (energyLevel <= 2) {
      return task.tags && task.tags.includes('#survival');
    }
    return true;
  });

  const completedTasksCount = filteredTasks?.filter(t => t.completed).length || 0;
  const totalTasksCount = filteredTasks?.length || 0;
  const progress = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  const renderTaskList = () => {
    if (!filteredTasks || filteredTasks.length === 0) {
      return (
        <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          {todaysTasks && todaysTasks.length > 0 ? "Adjust your energy level to see more tasks." : "Ready for your first task? Use the '+' button to begin."}
        </Typography>
      );
    }

    if (focusMode === 'mindmap') {
      return <MindMapDisplay tasks={filteredTasks} />;
    }

    if (focusMode === 'lowstim' && filteredTasks.length > 0) {
      // In low-stim mode, show only the first uncompleted task
      const firstUncompleted = filteredTasks.find(t => !t.completed);
      if (firstUncompleted) {
        return <List><TaskItem key={firstUncompleted.id} task={firstUncompleted} /></List>;
      }
      // If all are complete, show a message
      return <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>All tasks complete!</Typography>;
    }

    return (
      <List>
        {filteredTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </List>
    );
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', pb: 8 }}>
      {focusMode === 'gamified' && totalTasksCount > 0 && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {`${completedTasksCount} of ${totalTasksCount} tasks complete!`}
          </Typography>
        </Box>
      )}
      <Stack spacing={4}>
        {/* Hide check-in on low-stim mode to reduce clutter */}
        {focusMode !== 'lowstim' && (
          <Box>
            <Typography variant="h5" gutterBottom>
              How are you feeling today?
            </Typography>
            <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
              <Typography>Low Energy</Typography>
              <Slider
                aria-label="Energy Level"
                value={energyLevel}
                onChange={(e, newValue) => setEnergyLevel(newValue)}
                step={1}
                marks
                min={1}
                max={5}
              />
              <Typography>High Energy</Typography>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="center">
              <IconButton onClick={() => setMood('happy')} color={mood === 'happy' ? 'primary' : 'default'}>
                <MoodIcon fontSize="large" />
              </IconButton>
              <IconButton onClick={() => setMood('okay')} color={mood === 'okay' ? 'primary' : 'default'}>
                <SentimentSatisfiedAltIcon fontSize="large" />
              </IconButton>
              <IconButton onClick={() => setMood('overwhelmed')} color={mood === 'overwhelmed' ? 'primary' : 'default'}>
                <SentimentVeryDissatisfiedIcon fontSize="large" />
              </IconButton>
              <IconButton onClick={() => setMood('tired')} color={mood === 'tired' ? 'primary' : 'default'}>
                <NightsStayIcon fontSize="large" />
              </IconButton>
            </Stack>
          </Box>
        )}

        {/* Task List */}
        <Box>
          <Typography variant="h6">Today's Tasks</Typography>
          {renderTaskList()}
        </Box>
      </Stack>

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
        }}
        onClick={openTaskBreakdown}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TodayScreen;