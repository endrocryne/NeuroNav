import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { breakdownTask } from '../utils/taskBreakdown';
import { db } from '../services/db';

interface TaskBreakdownDialogProps {
  open: boolean;
  onClose: () => void;
  onTasksAdded?: () => void;
}

export function TaskBreakdownDialog({ open, onClose, onTasksAdded }: TaskBreakdownDialogProps) {
  const [inputText, setInputText] = useState('');
  const [originalTask, setOriginalTask] = useState('');
  const [subtasks, setSubtasks] = useState<{ text: string; enabled: boolean }[]>([]);
  const [showReview, setShowReview] = useState(false);

  const handleBreakdown = () => {
    if (inputText.trim()) {
      setOriginalTask(inputText);
      const broken = breakdownTask(inputText);
      setSubtasks(broken.map(text => ({ text, enabled: true })));
      setShowReview(true);
    }
  };

  const handleToggleSubtask = (index: number) => {
    setSubtasks(prev => prev.map((task, i) => 
      i === index ? { ...task, enabled: !task.enabled } : task
    ));
  };

  const handleDeleteSubtask = (index: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0];
    const enabledTasks = subtasks.filter(t => t.enabled);
    
    for (let i = 0; i < enabledTasks.length; i++) {
      await db.tasks.add({
        text: enabledTasks[i].text,
        completed: false,
        date: today,
        tags: [],
        parentTask: originalTask,
        order: i,
        createdAt: Date.now(),
      });
    }

    onTasksAdded?.();
    handleClose();
  };

  const handleClose = () => {
    setInputText('');
    setOriginalTask('');
    setSubtasks([]);
    setShowReview(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen>
      <DialogTitle>
        {showReview ? originalTask : "What's on your mind?"}
      </DialogTitle>
      <DialogContent>
        {!showReview ? (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="e.g., 'Do science project' or 'Clean the kitchen'"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Review and edit your subtasks:
            </Typography>
            <List>
              {subtasks.map((subtask, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDeleteSubtask(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Checkbox
                    edge="start"
                    checked={subtask.enabled}
                    onChange={() => handleToggleSubtask(index)}
                  />
                  <ListItemText primary={subtask.text} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {!showReview ? (
          <Button onClick={handleBreakdown} variant="contained" disabled={!inputText.trim()}>
            Break it down
          </Button>
        ) : (
          <Button onClick={handleSave} variant="contained" disabled={subtasks.filter(t => t.enabled).length === 0}>
            Save to My Day
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
