import React from 'react';
import { List, Typography, Box } from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TaskItem from './TaskItem';

const AllTasksTab = () => {
  const allTasks = useLiveQuery(() => db.tasks.toArray(), []);

  if (!allTasks) {
    return <Typography>Loading tasks...</Typography>;
  }

  if (allTasks.length === 0) {
    return (
      <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
        No tasks yet. Add one from the "Today" screen!
      </Typography>
    );
  }

  return (
    <Box>
      <List>
        {allTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </List>
    </Box>
  );
};

export default AllTasksTab;