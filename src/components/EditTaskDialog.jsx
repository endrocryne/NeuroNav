import React, { useState, useEffect } from 'react';
import {
  Dialog, AppBar, Toolbar, IconButton, Typography, Button, TextField, Box, Slide, 
  FormControl, InputLabel, Select, MenuItem, Slider 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppStore } from '../store';
import { db } from '../db';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditTaskDialog = () => {
  const { isEditTaskOpen, closeEditTask, editingTask } = useAppStore();
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (editingTask) {
      setTask(editingTask);
    }
  }, [editingTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleSliderChange = (name) => (e, value) => {
    setTask(prevTask => ({ ...prevTask, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await db.tasks.update(task.id, task);
      handleClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleClose = () => {
    setTask(null);
    closeEditTask();
  };

  if (!task) return null;

  return (
    <Dialog
      fullScreen
      open={isEditTaskOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Edit Task
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
          name="title"
          label="Task Title"
          type="text"
          fullWidth
          variant="outlined"
          value={task.title}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="dueDate"
          label="Due Date"
          type="date"
          fullWidth
          variant="outlined"
          value={task.dueDate || ''}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Priority</InputLabel>
          <Select
            name="priority"
            value={task.priority || 'Medium'}
            onChange={handleChange}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>
        <Typography gutterBottom sx={{mt: 2}}>Energy Required</Typography>
        <Slider
          name="energy"
          value={task.energy || 3}
          onChange={handleSliderChange('energy')}
          defaultValue={3}
          step={1}
          marks
          min={1}
          max={5}
          valueLabelDisplay="auto"
        />
      </Box>
    </Dialog>
  );
};

export default EditTaskDialog;
