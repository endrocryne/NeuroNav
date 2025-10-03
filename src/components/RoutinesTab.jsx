import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useAppStore } from '../store';

// --- Parser Logic ---
const parseRoutine = (text) => {
  const lines = text.split(/, |\n/).filter(line => line.trim() !== '');
  if (lines.length > 0) {
    const name = lines[0].replace(':', '').trim();
    const tasks = lines.slice(1).map(task => task.trim());
    return { name, tasks };
  }
  return null;
};

const RoutinesTab = () => {
  const [routineInput, setRoutineInput] = useState('');
  const allRoutines = useLiveQuery(() => db.routines.toArray(), []);
  const openEditRoutine = useAppStore((state) => state.openEditRoutine);

  const handleCreateRoutine = async () => {
    const parsed = parseRoutine(routineInput);
    if (parsed && parsed.tasks.length > 0) {
      try {
        await db.routines.add({ name: parsed.name, tasks: parsed.tasks });
        setRoutineInput(''); // Clear input on success
      } catch (error) {
        console.error('Failed to save routine:', error);
      }
    }
  };

  const handleAddToToday = async (routine) => {
    const today = new Date().toISOString().split('T')[0];
    const tasksToAdd = routine.tasks.map(taskText => ({
      title: taskText,
      date: today,
      completed: false,
      tags: `#${routine.name.toLowerCase()}`,
    }));

    try {
      await db.tasks.bulkAdd(tasksToAdd);
      // Optionally, provide feedback to the user (e.g., with a Snackbar)
      console.log(`Added ${routine.name} tasks to today.`);
    } catch (error) {
      console.error('Failed to add routine tasks to today:', error);
    }
  };

  const handleDeleteRoutine = async (id) => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      try {
        await db.routines.delete(id);
      } catch (error) {
        console.error('Failed to delete routine:', error);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Create a New Routine
      </Typography>
      <TextField
        label="e.g., Morning: take meds, brush teeth"
        multiline
        rows={3}
        fullWidth
        value={routineInput}
        onChange={(e) => setRoutineInput(e.target.value)}
        variant="outlined"
        placeholder="First line is the name, subsequent lines are tasks."
      />
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleCreateRoutine}
        disabled={!routineInput}
      >
        Create Routine from Text
      </Button>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Saved Routines
      </Typography>
      {allRoutines && allRoutines.length > 0 ? (
        allRoutines.map((routine) => (
          <Card key={routine.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {routine.name}
              </Typography>
              <List dense>
                {routine.tasks.map((task, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText primary={`- ${task}`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleAddToToday(routine)}>
                Add to My Day
              </Button>
              <Button size="small" onClick={() => openEditRoutine(routine)}>
                Edit
              </Button>
              <Button size="small" color="error" onClick={() => handleDeleteRoutine(routine.id)}>
                Delete
              </Button>
            </CardActions>
          </Card>
        ))
      ) : (
        <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          No routines created yet.
        </Typography>
      )}
    </Box>
  );
};

export default RoutinesTab;