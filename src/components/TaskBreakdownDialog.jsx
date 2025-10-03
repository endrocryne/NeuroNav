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
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppStore } from '../store';
import { db } from '../db';
import { breakdownTask } from '../llm';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TaskBreakdownDialog = () => {
  const { isTaskBreakdownOpen, closeTaskBreakdown } = useAppStore();
  const [taskInput, setTaskInput] = useState('');
  const [subTasks, setSubTasks] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');


  const handleBreakdown = async () => {
    setIsLoading(true);
    const progressCallback = (data) => {
      if (data.status === 'progress') {
        setProgress(data.progress);
        setProgressMessage(`Loading model: ${Math.round(data.progress)}%`);
      } else {
        setProgressMessage(data.status);
      }
    };
    const generatedTasks = await breakdownTask(taskInput, progressCallback);
    setSubTasks(generatedTasks.map(task => ({ text: task, checked: false })));
    setIsReviewing(true);
    setIsLoading(false);
  };

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0];
    const tasksToAdd = subTasks.map(subtask => ({
      title: subtask.text,
      date: today,
      completed: false,
      tags: '', // Tags can be added later
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
    setIsLoading(false);
    setProgress(0);
    setProgressMessage('');
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
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleBreakdown()}
              disabled={isLoading}
            />
            <Button onClick={handleBreakdown} variant="contained" sx={{ mt: 2 }} disabled={!taskInput || isLoading}>
              {isLoading ? <CircularProgress size={24} /> : 'Break it down'}
            </Button>
            {isLoading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="caption">{progressMessage}</Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}
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