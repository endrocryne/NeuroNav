import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

const MindMapDisplay = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return null; // Don't render anything if there are no tasks
  }

  // Find a central task, or create a "Today" chip
  // For simplicity, we'll just use a central "Today's Tasks" chip.
  const centralNode = <Chip label="Today's Tasks" color="primary" size="large" />;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        py: 4,
      }}
    >
      {centralNode}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 2,
          mt: 4,
          maxWidth: '80%',
        }}
      >
        {tasks.map((task) => (
          <Chip
            key={task.id}
            label={task.title}
            variant={task.completed ? 'filled' : 'outlined'}
            color={task.completed ? 'success' : 'default'}
            sx={{
              textDecoration: task.completed ? 'line-through' : 'none',
              p: 1,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MindMapDisplay;