import React, { useState } from 'react';
import {
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { db } from '../db';

const TaskItem = ({ task }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleComplete = () => {
    const isCompleting = !task.completed;
    db.tasks.update(task.id, { completed: isCompleting });

    // If the task is being marked as complete, trigger the global handler
    if (isCompleting && window.handleTaskComplete) {
      window.handleTaskComplete();
    }
  };

  const handleDelete = () => {
    db.tasks.delete(task.id);
    handleMenuClose();
  };

  const handleEdit = () => {
    // In a real app, this would open an edit dialog.
    console.log('Editing task:', task.id);
    handleMenuClose();
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const textVariants = {
    checked: {
      textDecoration: 'line-through',
      color: '#aaa',
      transition: { duration: 0.3 }
    },
    unchecked: {
      textDecoration: 'none',
      color: 'inherit',
      transition: { duration: 0.3 }
    }
  };

  return (
    <Box>
      <motion.div variants={itemVariants} initial="initial" animate="animate" exit="exit">
        <ListItem
          secondaryAction={
            <IconButton edge="end" aria-label="options" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          }
        >
          <Checkbox
            edge="start"
            checked={task.completed}
            onChange={handleToggleComplete}
            tabIndex={-1}
            disableRipple
          />
          <motion.div
            animate={task.completed ? 'checked' : 'unchecked'}
            variants={textVariants}
            style={{ flex: '1 1 auto' }}
          >
            <ListItemText
              primary={task.title}
              secondary={task.tags || null}
            />
          </motion.div>
        </ListItem>
      </motion.div>
      <Menu
        id="task-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskItem;