import React, { useState } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Box,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppStore } from '../store';
import { db } from '../db';

// --- Client-Side "AI" Logic ---
const breakdownTask = (taskString) => {
  const lowerCaseTask = taskString.toLowerCase();
  const keywords = {
    clean: ['Declutter surfaces', 'Wipe down counters', 'Do the dishes', 'Sweep the floor', 'Take out the trash'],
    project: ['Review the requirements', 'Create an outline', 'Research one source article', 'Write the introduction', 'Take a 5-minute break'],
    essay: ['Review the requirements', 'Create an outline', 'Research one source article', 'Write the introduction', 'Take a 5-minute break'],
    laundry: ['Sort clothes', 'Wash one load', 'Dry one load', 'Fold and put away'],
    'morning routine': ['Take meds', 'Brush teeth', 'Make coffee', 'Get dressed'],
  };

  for (const key in keywords) {
    if (lowerCaseTask.includes(key)) {
      return keywords[key];
    }
  }
  return [taskString]; // Default: return the original task as a single item
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TaskBreakdownDialog = () => {
  const { isTaskBreakdownOpen, closeTaskBreakdown } = useAppStore();
  const [taskInput, setTaskInput] = useState('');
  const [subTasks, setSubTasks] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleBreakdown = () => {
    const generatedTasks = breakdownTask(taskInput);
    setSubTasks(generatedTasks.map(task => ({ text: task, checked: false })));
    setIsReviewing(true);
  };

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0];
    const tasksToAdd = subTasks.map(subtask => ({
      title: subtask.text,
      date: today,
      completed: false,
      tags: taskInput.toLowerCase().includes('clean') ? '#survival' : '', // Example tag
    }));

    try {
      await db.tasks.bulkAdd(tasksToAdd);
      handleClose();
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const handleClose = () => {
    setTaskInput('');
    setSubTasks([]);
    setIsReviewing(false);
    closeTaskBreakdown();
  };

  return (
    <Dialog
      fullScreen
      open={isTaskBreakdownOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {isReviewing ? `Review: ${taskInput}` : 'Break Down a Task'}
          </Typography>
          {isReviewing && (
            <Button autoFocus color="inherit" onClick={handleSave}>
              Save to My Day
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        {!isReviewing ? (
          <>
            <TextField
              autoFocus
              margin="dense"
              id="task-input"
              label="What's on your mind? (e.g., 'Clean the kitchen')"
              type="text"
              fullWidth
              variant="outlined"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBreakdown()}
            />
            <Button onClick={handleBreakdown} variant="contained" sx={{ mt: 2 }} disabled={!taskInput}>
              Break it down
            </Button>
          </>
        ) : (
          <List>
            {subTasks.map((task, index) => (
              <ListItem key={index}>
                <Checkbox checked={task.checked} disabled />
                <ListItemText primary={task.text} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Dialog>
  );
};

export default TaskBreakdownDialog;