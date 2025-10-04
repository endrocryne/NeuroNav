import { useState } from 'react';
import {
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { type Task, db } from '../services/db';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';

interface TaskItemProps {
  task: Task;
  onTaskChange?: () => void;
}

export function TaskItem({ task, onTaskChange }: TaskItemProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const { viewMode } = useAppStore();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleComplete = async () => {
    if (task.id) {
      await db.tasks.update(task.id, { completed: !task.completed });
      onTaskChange?.();
    }
  };

  const handleEdit = () => {
    setEditText(task.text);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (task.id && editText.trim()) {
      await db.tasks.update(task.id, { text: editText.trim() });
      onTaskChange?.();
    }
    setEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (task.id) {
      await db.tasks.delete(task.id);
      onTaskChange?.();
    }
    handleMenuClose();
  };

  const showIcons = viewMode !== 'lowstim';

  return (
    <>
      <ListItem
        component={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.2 }}
        secondaryAction={
          showIcons ? (
            <IconButton edge="end" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          ) : null
        }
      >
        <Checkbox
          edge="start"
          checked={task.completed}
          onChange={handleToggleComplete}
          sx={{
            '&.Mui-checked': {
              animation: viewMode === 'gamified' ? 'pulse 0.3s ease-in-out' : 'none',
            },
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.2)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        />
        <ListItemText
          primary={task.text}
          secondary={
            task.tags.length > 0 || task.project
              ? `${task.tags.join(' ')} ${task.project || ''}`
              : undefined
          }
          sx={{
            textDecoration: task.completed ? 'line-through' : 'none',
            opacity: task.completed ? 0.6 : 1,
            transition: 'all 0.3s ease',
          }}
        />
      </ListItem>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task"
            type="text"
            fullWidth
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
