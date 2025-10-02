import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Button,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import { useAppStore } from '../store';
import { db } from '../db';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const SettingsScreen = () => {
  const {
    focusMode,
    setFocusMode,
    enableEncouragement,
    setEnableEncouragement,
  } = useAppStore();

  const handleExportData = async () => {
    try {
      const allTasks = await db.tasks.toArray();
      const allRoutines = await db.routines.toArray();
      const data = {
        tasks: allTasks,
        routines: allRoutines,
        // We don't export settings from the store, as they are device-specific
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = `neuronav-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Failed to export data:', error);
      // Here you might want to show a Snackbar with an error message
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.tasks && data.routines) {
            // This is a destructive action, so a confirmation dialog would be good in a real app
            await db.transaction('rw', db.tasks, db.routines, async () => {
              await db.tasks.clear();
              await db.routines.clear();
              await db.tasks.bulkAdd(data.tasks);
              await db.routines.bulkAdd(data.routines);
            });
            alert('Data imported successfully!'); // Simple feedback
          } else {
            throw new Error('Invalid data format');
          }
        } catch (error) {
          console.error('Failed to import data:', error);
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <List>
        {/* --- Focus Modes --- */}
        <ListItem>
          <FormControl component="fieldset">
            <FormLabel component="legend">Focus Modes</FormLabel>
            <RadioGroup
              aria-label="focus-mode"
              name="focus-mode-group"
              value={focusMode}
              onChange={(e) => setFocusMode(e.target.value)}
            >
              <FormControlLabel value="default" control={<Radio />} label="Default (Linear)" />
              <FormControlLabel value="mindmap" control={<Radio />} label="Mind Map (Simplified)" />
              <FormControlLabel value="lowstim" control={<Radio />} label="Low-Stimulation" />
              <FormControlLabel value="gamified" control={<Radio />} label="Gamified" />
            </RadioGroup>
          </FormControl>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        {/* --- Emotional Intelligence --- */}
        <ListItem>
          <ListItemIcon>
            <Switch
              edge="start"
              onChange={(e) => setEnableEncouragement(e.target.checked)}
              checked={enableEncouragement}
            />
          </ListItemIcon>
          <ListItemText id="switch-list-label-encouragement" primary="Enable Encouragement" />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        {/* --- Data Management --- */}
        <ListItem>
          <ListItemText primary="Data Management" secondary="Save or load your app data." />
        </ListItem>
        <ListItem>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportData}
            sx={{ mr: 2 }}
          >
            Export Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handleImportData}
          >
            Import Data
          </Button>
        </ListItem>
      </List>
    </Box>
  );
};

export default SettingsScreen;