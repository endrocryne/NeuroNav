import React, { useState, useEffect } from 'react';
import {
  Dialog, AppBar, Toolbar, IconButton, Typography, Button, TextField, Box, Slide 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppStore } from '../store';
import { db } from '../db';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditRoutineDialog = () => {
  const { isEditRoutineOpen, closeEditRoutine, editingRoutine } = useAppStore();
  const [routine, setRoutine] = useState(null);
  const [tasks, setTasks] = useState('');

  useEffect(() => {
    if (editingRoutine) {
      setRoutine(editingRoutine);
      setTasks(editingRoutine.tasks.join('\n'));
    }
  }, [editingRoutine]);

  const handleNameChange = (e) => {
    setRoutine(prev => ({ ...prev, name: e.target.value }));
  };

  const handleTasksChange = (e) => {
    setTasks(e.target.value);
  };

  const handleSave = async () => {
    const updatedRoutine = {
      ...routine,
      tasks: tasks.split('\n').filter(t => t.trim() !== ''),
    };
    try {
      await db.routines.update(updatedRoutine.id, updatedRoutine);
      handleClose();
    } catch (error) {
      console.error('Failed to update routine:', error);
    }
  };

  const handleClose = () => {
    setRoutine(null);
    setTasks('');
    closeEditRoutine();
  };

  if (!routine) return null;

  return (
    <Dialog
      fullScreen
      open={isEditRoutineOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Edit Routine
          </Typography>
          <Button autoFocus color="inherit" onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Routine Name"
          type="text"
          fullWidth
          variant="outlined"
          value={routine.name}
          onChange={handleNameChange}
        />
        <TextField
          margin="dense"
          name="tasks"
          label="Tasks (one per line)"
          multiline
          rows={10}
          fullWidth
          variant="outlined"
          value={tasks}
          onChange={handleTasksChange}
        />
      </Box>
    </Dialog>
  );
};

export default EditRoutineDialog;
