import React, { useMemo } from 'react';
import { List, Typography, Box, Slider } from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TaskItem from './TaskItem';
import { useAppStore } from '../store';

const priorityValues = {
  Low: 3,
  Medium: 2,
  High: 1,
};

const calculateTaskScore = (task) => {
  const now = new Date();
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const daysUntilDue = dueDate ? (dueDate - now) / (1000 * 60 * 60 * 24) : Infinity;

  const priority = priorityValues[task.priority] || 2;
  const energy = task.energy || 3;

  // Lower score is better
  let score = 0;
  if (daysUntilDue < 0) { // Overdue tasks get highest priority
    score -= 1000;
  } else if (daysUntilDue < 2) { // Due in next 2 days
    score -= 500;
  }

  score += priority * 100; // Higher priority (lower value) is better
  score += energy * 10; // Lower energy is slightly better

  return score;
};


const AllTasksTab = () => {
  const allTasks = useLiveQuery(() => db.tasks.toArray(), []);
  const { energyLevel, setEnergyLevel } = useAppStore();

  const sortedAndFilteredTasks = useMemo(() => {
    if (!allTasks) return [];

    const filtered = allTasks.filter(task => {
      if (energyLevel <= 2) {
        return (task.energy || 3) <= energyLevel;
      }
      return true;
    });

    return filtered.sort((a, b) => calculateTaskScore(a) - calculateTaskScore(b));

  }, [allTasks, energyLevel]);

  if (!allTasks) {
    return <Typography>Loading tasks...</Typography>;
  }

  return (
    <Box>
      <Typography gutterBottom>Your Current Energy Level</Typography>
      <Slider
        value={energyLevel}
        onChange={(e, newValue) => setEnergyLevel(newValue)}
        defaultValue={3}
        step={1}
        marks
        min={1}
        max={5}
        valueLabelDisplay="auto"
      />
      {sortedAndFilteredTasks.length === 0 ? (
        <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          No tasks match your current energy level.
        </Typography>
      ) : (
        <List>
          {sortedAndFilteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </List>
      )}
    </Box>
  );
};

export default AllTasksTab;