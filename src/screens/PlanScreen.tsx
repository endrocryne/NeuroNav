import { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  Stack,
} from '@mui/material';
import { type Task, type Routine, db } from '../services/db';
import { TaskItem } from '../components/TaskItem';

export function PlanScreen() {
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineInput, setRoutineInput] = useState('');
  const [routineName, setRoutineName] = useState('');

  const loadTasks = async () => {
    const allTasks = await db.tasks.toArray();
    setTasks(allTasks.sort((a, b) => b.createdAt - a.createdAt));
  };

  const loadRoutines = async () => {
    const allRoutines = await db.routines.toArray();
    setRoutines(allRoutines.sort((a, b) => b.createdAt - a.createdAt));
  };

  useEffect(() => {
    loadTasks();
    loadRoutines();
  }, []);

  const handleCreateRoutine = async () => {
    if (!routineInput.trim() || !routineName.trim()) return;

    // Parse the routine - split by commas or newlines
    const tasks = routineInput
      .split(/[,\n]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    await db.routines.add({
      name: routineName,
      tasks,
      createdAt: Date.now(),
    });

    setRoutineInput('');
    setRoutineName('');
    loadRoutines();
  };

  const handleAddRoutineToToday = async (routine: Routine) => {
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < routine.tasks.length; i++) {
      await db.tasks.add({
        text: routine.tasks[i],
        completed: false,
        date: today,
        tags: [],
        project: routine.name,
        order: i,
        createdAt: Date.now(),
      });
    }

    alert(`Added "${routine.name}" routine to today!`);
  };

  const groupTasksByDate = () => {
    const grouped: { [key: string]: Task[] } = {};
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    tasks.forEach(task => {
      let label = task.date;
      if (task.date === today) {
        label = 'Today';
      } else if (task.date === tomorrow) {
        label = 'Tomorrow';
      } else if (task.date < today) {
        label = 'Past';
      } else {
        label = 'Future';
      }

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(task);
    });

    return grouped;
  };

  return (
    <Box sx={{ pb: 10 }}>
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="All Tasks" />
        <Tab label="Routines" />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          {Object.entries(groupTasksByDate()).map(([label, groupTasks]) => (
            <Box key={label} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, px: 2 }}>
                {label}
              </Typography>
              <List>
                {groupTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onTaskChange={loadTasks} />
                ))}
              </List>
            </Box>
          ))}
          {tasks.length === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
              No tasks yet. Create some from the Today screen!
            </Typography>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Create Routine from Text
          </Typography>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <TextField
              label="Routine Name"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="e.g., Morning Routine"
              fullWidth
            />
            <TextField
              label="Tasks (comma or line separated)"
              value={routineInput}
              onChange={(e) => setRoutineInput(e.target.value)}
              placeholder="e.g., take meds, brush teeth, make coffee"
              multiline
              rows={4}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleCreateRoutine}
              disabled={!routineInput.trim() || !routineName.trim()}
            >
              Create Routine
            </Button>
          </Stack>

          <Typography variant="h6" gutterBottom>
            Saved Routines
          </Typography>
          {routines.map((routine) => (
            <Card key={routine.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {routine.name}
                </Typography>
                <List dense>
                  {routine.tasks.map((task, index) => (
                    <Typography key={index} variant="body2" component="li">
                      • {task}
                    </Typography>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleAddRoutineToToday(routine)}>
                  Add to Today
                </Button>
              </CardActions>
            </Card>
          ))}
          {routines.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No routines yet. Create one above!
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
