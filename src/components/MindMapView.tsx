import { Box, Chip, Stack } from '@mui/material';
import { type Task } from '../services/db';

interface MindMapViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function MindMapView({ tasks, onTaskClick }: MindMapViewProps) {
  // Group tasks by parent task
  const taskGroups: { [key: string]: Task[] } = {};
  const mainTasks: Task[] = [];

  tasks.forEach(task => {
    if (task.parentTask) {
      if (!taskGroups[task.parentTask]) {
        taskGroups[task.parentTask] = [];
      }
      taskGroups[task.parentTask].push(task);
    } else {
      mainTasks.push(task);
    }
  });

  // If there are no parent tasks, just show all tasks as main tasks
  const groupKeys = Object.keys(taskGroups);
  const displayGroups = groupKeys.length > 0 ? groupKeys : mainTasks.map(t => t.text);

  return (
    <Box sx={{ p: 2, overflowX: 'auto' }}>
      {displayGroups.map((groupName) => {
        const groupTasks = taskGroups[groupName] || [mainTasks.find(t => t.text === groupName)].filter(Boolean) as Task[];
        
        return (
          <Stack key={groupName} direction="row" spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
            <Chip
              label={groupName}
              color="primary"
              sx={{ fontSize: '1rem', p: 2, height: 'auto', minHeight: 48 }}
            />
            <Box sx={{ borderTop: 2, borderColor: 'primary.main', width: 40 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {groupTasks.map((task) => (
                <Chip
                  key={task.id}
                  label={task.text}
                  onClick={() => onTaskClick?.(task)}
                  variant={task.completed ? 'filled' : 'outlined'}
                  color={task.completed ? 'default' : 'primary'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Stack>
        );
      })}
      {displayGroups.length === 0 && (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
          No tasks to display
        </Box>
      )}
    </Box>
  );
}
